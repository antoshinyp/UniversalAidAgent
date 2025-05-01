import os
import json
from fastapi import FastAPI, HTTPException, Query, File, UploadFile, Form, Request, Depends, Security, status, Body
import requests as http_requests  # Rename to avoid conflicts
from typing import Optional, List
from fastapi.middleware.cors import CORSMiddleware
import shutil
from fastapi.responses import JSONResponse
import datetime
import logging
from jose import jwt, JWTError
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import requests as pyrequests
from pydantic import BaseModel, ValidationError, Field
import html
import re
from fastapi.security.utils import get_authorization_scheme_param
import sendgrid
from sendgrid.helpers.mail import Mail

# NOTE: If you are running on Windows and have set AZURE_TENANT_ID and AZURE_CLIENT_ID as environment variables, you do NOT need a .env file. The app will read them directly from your system environment.

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Get API key securely
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    logger.warning("OPENAI_API_KEY is not set")

# Get Azure OpenAI credentials from environment
azure_openai_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
azure_openai_key = os.getenv("AZURE_OPENAI_KEY")
azure_openai_deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT")
if not azure_openai_endpoint or not azure_openai_key or not azure_openai_deployment:
    logger.warning("Azure OpenAI environment variables are not set correctly.")

# Azure OpenAI API URL format
azure_api_version = "2024-02-15-preview"
azure_openai_api_url = f"{azure_openai_endpoint}/openai/deployments/{azure_openai_deployment}/chat/completions?api-version={azure_api_version}"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Official guidelines for grounding (example, replace with real data)
GUIDELINES = "If a child is in immediate danger, contact local authorities. For abuse or terrorism threats, escalate to the appropriate agency and ensure the child's safety. Maintain confidentiality and follow legal reporting requirements."

# Load country guidelines from generated JSON
try:
    with open(os.path.join(os.path.dirname(__file__), "country_guidelines.json"), encoding="utf-8") as f:
        COUNTRY_GUIDELINES = json.load(f)
except Exception as e:
    logger.error(f"Failed to load country guidelines: {e}")
    COUNTRY_GUIDELINES = {}

def get_guidelines(nationality: Optional[str], citizenship: Optional[str], residency: Optional[str], tourism_country: Optional[str]):
    # Priority: residency > citizenship > nationality > tourism_country
    for country in [residency, citizenship, nationality, tourism_country]:
        if country and country in COUNTRY_GUIDELINES:
            return COUNTRY_GUIDELINES[country]
    return GUIDELINES  # fallback to default

openai_api_url = "https://api.openai.com/v1/chat/completions"
openai_model = "gpt-4-turbo"  # Upgraded to GPT-4 Turbo for improved language and context handling

RESOURCE_GUIDANCE = (
    "When providing recommendations, always refer to the relevant government agencies, child protection hotlines, charity organizations, NGOs, schools, hospitals, clinics, police, law enforcement, and rescue services in the child's country. "
    "If the situation involves child sex trafficking, abduction, slavery, abuse, kidnapping for begging, child marriage, child labor, or child involvement in terrorism, provide clear steps to report and prevent these crimes, referencing the appropriate authorities and laws for the selected country. "
    "If the child's parents or guardians are under the influence of drugs or alcohol, or if the child is in poverty, recommend support services and reporting options available in their country. "
    "Reference country-specific helplines, agencies, and laws (such as Childline, national child protection agencies, and relevant legal acts) where possible. "
    "If a report to authorities is needed, generate a sample email or message that the user can send to the appropriate agency in their country, including all relevant details. Do NOT send the report automatically."
)

FORBIDDEN_TOPICS = [
    "abortion", "egg freezing", "ivf", "in vitro fertilization", "contraception", "family planning", "birth control", "pregnancy termination",
    "transgender", "gender change", "gender reassignment", "lgbt", "homosexuality", "gay", "lesbian", "bisexual", "queer", "nonbinary", "non-binary",
    "divorce", "illegal relationship", "adultery", "extramarital", "affair", "polyamory", "open relationship"
]

def contains_forbidden_topic(text):
    if not text:
        return False
    lower = text.lower()
    return any(topic in lower for topic in FORBIDDEN_TOPICS)

def filter_forbidden_content(text):
    if contains_forbidden_topic(text):
        return "[Content removed: This topic is not supported by this service.]"
    return text

@app.post("/generate-recommendation")
async def generate_recommendation(data: dict):
    try:
        headers = {
            "Content-Type": "application/json",
            "api-key": azure_openai_key
        }
        user_content = f"Provide recommendations based on the following data: {data}"
        payload = {
            "messages": [
                {"role": "system", "content": "You are a helpful assistant for child safety recommendations. You must NEVER suggest, discuss, or mention abortion, egg freezing, IVF, contraception, family planning, birth control, gender change, transgender, LGBT, homosexuality, divorce, illegal relationships, or any related topics. If asked, politely state that this service cannot provide information or advice on those topics."},
                {"role": "user", "content": user_content}
            ],
            "max_tokens": 512
        }
        response = http_requests.post(azure_openai_api_url, json=payload, headers=headers)
        response.raise_for_status()
        result = response.json()
        recommendation = result["choices"][0]["message"]["content"].strip()
        # Filter forbidden topics from AI output
        recommendation = filter_forbidden_content(recommendation)
        return {"recommendation": recommendation}
    except Exception as e:
        print(f"Error in /generate-recommendation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- Address redaction utility ---
import re
HIGH_RISK_TYPES = ["abduction", "trafficking", "abuse"]
def is_high_risk(incident_type, immediate_danger):
    return (incident_type or "").lower() in HIGH_RISK_TYPES or (str(immediate_danger).lower() == "true")

def redact_address(address):
    # Remove street, house number, postal code, keeping only city/region/country
    if not address:
        return address
    # Split by comma, keep last 2-3 parts (city, region, country)
    parts = [p.strip() for p in address.split(",") if p.strip()]
    if len(parts) >= 3:
        return ", ".join(parts[-3:])
    elif len(parts) >= 2:
        return ", ".join(parts[-2:])
    else:
        return parts[-1] if parts else address

# Azure AD config (replace with your values)
AZURE_TENANT_ID = os.getenv("AZURE_TENANT_ID")
AZURE_CLIENT_ID = os.getenv("AZURE_CLIENT_ID")
if not AZURE_TENANT_ID or not AZURE_CLIENT_ID:
    raise RuntimeError("AZURE_TENANT_ID and AZURE_CLIENT_ID must be set as environment variables.")
AZURE_OPENID_CONFIG_URL = f"https://login.microsoftonline.com/{AZURE_TENANT_ID}/v2.0/.well-known/openid-configuration"

# Fetch JWKS keys from Azure AD
_jwks = None
_issuer = None

def get_jwks_and_issuer():
    global _jwks, _issuer
    if _jwks and _issuer:
        return _jwks, _issuer
    resp = pyrequests.get(AZURE_OPENID_CONFIG_URL)
    resp.raise_for_status()
    data = resp.json()
    jwks_uri = data["jwks_uri"]
    _issuer = data["issuer"]
    jwks_resp = pyrequests.get(jwks_uri)
    jwks_resp.raise_for_status()
    _jwks = jwks_resp.json()
    return _jwks, _issuer

bearer_scheme = HTTPBearer()

def verify_jwt_token(credentials: HTTPAuthorizationCredentials = Security(bearer_scheme)):
    token = credentials.credentials
    jwks, issuer = get_jwks_and_issuer()
    try:
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header["kid"]
        key = next((k for k in jwks["keys"] if k["kid"] == kid), None)
        if not key:
            raise HTTPException(status_code=401, detail="Invalid token key.")
        payload = jwt.decode(
            token,
            key,
            algorithms=[key["alg"]],
            audience=AZURE_CLIENT_ID,
            issuer=issuer
        )
        return payload
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Token validation error: {str(e)}")

def sanitize_text(text, max_length=1000):
    if not text:
        return ""
    text = html.escape(str(text))  # Escape HTML
    text = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', text)  # Remove control chars
    text = text.strip()
    return text[:max_length]

def sanitize_group(group):
    # Sanitize all fields in a group dict
    return {
        k: sanitize_text(v, 200) if isinstance(v, str) else v
        for k, v in group.items()
    }

class IncidentInput(BaseModel):
    description: str = Field(..., min_length=1, max_length=2000)
    livingArrangement: Optional[str] = Field(None, max_length=200)
    parentSituation: Optional[str] = Field(None, max_length=200)
    additionalContext: Optional[str] = Field(None, max_length=500)
    childGender: Optional[str] = Field(None, max_length=50)
    childDisability: Optional[str] = Field(None, max_length=100)
    childLocation: Optional[str] = Field(None, max_length=300)
    immediateDanger: Optional[str] = Field(None, max_length=10)
    incidentType: Optional[str] = Field(None, max_length=100)
    incidentDate: Optional[str] = Field(None, max_length=50)
    perpetratorInfo: Optional[str] = Field(None, max_length=500)
    reportedBefore: Optional[str] = Field(None, max_length=100)
    reportContact: Optional[str] = Field(None, max_length=200)
    childLanguage: Optional[str] = Field(None, max_length=50)
    immediateNeeds: Optional[str] = Field(None, max_length=500)
    agenciesInvolved: Optional[str] = Field(None, max_length=500)
    language: Optional[str] = Field('en', max_length=10)
    userType: Optional[str] = Field(None, max_length=20)
    groups: list = Field(default_factory=list)

# Example: protect /report-incident endpoint
@app.post("/report-incident")
async def report_incident(
    description: str = Form(...),
    livingArrangement: str = Form(None),
    parentSituation: str = Form(None),
    additionalContext: str = Form(None),
    childGender: str = Form(None),
    childDisability: str = Form(None),
    childLocation: str = Form(None),
    immediateDanger: str = Form(None),
    incidentType: str = Form(None),
    incidentDate: str = Form(None),
    perpetratorInfo: str = Form(None),
    reportedBefore: str = Form(None),
    reportContact: str = Form(None),
    childLanguage: str = Form(None),
    immediateNeeds: str = Form(None),
    agenciesInvolved: str = Form(None),
    language: str = Form('en'),
    groups: str = Form(...),
    userType: str = Form(None),  # <-- NEW: userType from frontend
    attachments: List[UploadFile] = File([]),
    request: Request = None,
):
    # Try to get Authorization header for optional authentication
    user = None
    auth_header = request.headers.get("authorization") if request else None
    if auth_header:
        scheme, param = get_authorization_scheme_param(auth_header)
        if scheme.lower() == "bearer" and param:
            try:
                credentials = HTTPAuthorizationCredentials(scheme=scheme, credentials=param)
                user = verify_jwt_token(credentials)
            except Exception:
                user = None  # Invalid token, treat as anonymous
    # Sanitize and validate input
    try:
        groups_data = [sanitize_group(g) for g in __import__('json').loads(groups)]
        incident_data = IncidentInput(
            description=sanitize_text(description, 2000),
            livingArrangement=sanitize_text(livingArrangement, 200),
            parentSituation=sanitize_text(parentSituation, 200),
            additionalContext=sanitize_text(additionalContext, 500),
            childGender=sanitize_text(childGender, 50),
            childDisability=sanitize_text(childDisability, 100),
            childLocation=sanitize_text(childLocation, 300),
            immediateDanger=sanitize_text(immediateDanger, 10),
            incidentType=sanitize_text(incidentType, 100),
            incidentDate=sanitize_text(incidentDate, 50),
            perpetratorInfo=sanitize_text(perpetratorInfo, 500),
            reportedBefore=sanitize_text(reportedBefore, 100),
            reportContact=sanitize_text(reportContact, 200),
            childLanguage=sanitize_text(childLanguage, 50),
            immediateNeeds=sanitize_text(immediateNeeds, 500),
            agenciesInvolved=sanitize_text(agenciesInvolved, 500),
            language=sanitize_text(language, 10),
            userType=sanitize_text(userType, 20),
            groups=groups_data
        )
    except (ValidationError, Exception) as e:
        raise HTTPException(status_code=422, detail=f"Invalid input: {str(e)}")
    # Process attachments in memory only
    saved_files = []
    attachment_contents = []
    for file in attachments:
        if file.filename:
            content = await file.read()
            attachment_contents.append({
                'filename': file.filename,
                'content': content
            })
            saved_files.append(file.filename)
    # Parse groups JSON
    import json as _json
    groups_data = _json.loads(groups)
    # --- In-memory address redaction logic ---
    # Only keep full address for high-risk, redact for others
    for g in groups_data:
        loc = g.get('location', '')
        if not is_high_risk(incidentType, immediateDanger):
            g['location'] = redact_address(loc)

    # For guidelines, use the first group for country context
    nationality = groups_data[0]["nationality"] if groups_data and "nationality" in groups_data[0] else None
    citizenship = groups_data[0]["citizenship"] if groups_data and "citizenship" in groups_data[0] else None
    residency = groups_data[0]["residency"] if groups_data and "residency" in groups_data[0] else None
    tourism_country = groups_data[0]["tourismCountry"] if groups_data and "tourismCountry" in groups_data[0] else None
    guidelines = get_guidelines(nationality, citizenship, residency, tourism_country)

    # --- SerpAPI integration for latest info ---
    serpapi_key = os.getenv("SERPAPI_KEY")
    serp_snippets = ""
    if serpapi_key and description:
        try:
            serp_endpoint = "https://serpapi.com/search"
            serp_params = {
                "q": description,
                "api_key": serpapi_key,
                "engine": "google",
                "num": 3
            }
            serp_response = http_requests.get(serp_endpoint, params=serp_params)
            if serp_response.status_code == 200:
                serp_data = serp_response.json()
                results = serp_data.get("organic_results", [])
                if results:
                    serp_snippets = "\n".join(f"- {r.get('title', '')}: {r.get('snippet', '')}" for r in results if r.get('snippet'))
                    if serp_snippets:
                        serp_snippets = f"\nLatest Web Info:\n{serp_snippets}"
        except Exception as e:
            print(f"SerpAPI error: {e}")
    # --- End SerpAPI integration ---

    # --- Location to country mapping (expand with geocoding API fallback) ---
    city_to_country = {
        'london': 'United Kingdom',
        'paris': 'France',
        'new york': 'United States of America',
        'delhi': 'India',
        'mumbai': 'India',
        'sydney': 'Australia',
        'toronto': 'Canada',
        'berlin': 'Germany',
        'tokyo': 'Japan',
        'manchester': 'United Kingdom',
        'birmingham': 'United Kingdom',
        'edinburgh': 'United Kingdom',
        'glasgow': 'United Kingdom',
        'liverpool': 'United Kingdom',
        'belfast': 'United Kingdom',
        'dublin': 'Ireland',
        'los angeles': 'United States of America',
        'chicago': 'United States of America',
        'houston': 'United States of America',
        'san francisco': 'United States of America',
        'washington': 'United States of America',
        'beijing': 'People\'s Republic of China',
        'shanghai': 'People\'s Republic of China',
        'moscow': 'Russia',
        'rome': 'Italy',
        'madrid': 'Spain',
        'barcelona': 'Spain',
        'amsterdam': 'Netherlands',
        'brussels': 'Belgium',
        'vienna': 'Austria',
        'zurich': 'Switzerland',
        'geneva': 'Switzerland',
        'cape town': 'South Africa',
        'johannesburg': 'South Africa',
        'nairobi': 'Kenya',
        'lagos': 'Nigeria',
        'cairo': 'Egypt',
        'istanbul': 'Turkey',
        'ankara': 'Turkey',
        'karachi': 'Pakistan',
        'lahore': 'Pakistan',
        'dhaka': 'Bangladesh',
        'singapore': 'Singapore',
        'bangkok': 'Thailand',
        'kuala lumpur': 'Malaysia',
        'jakarta': 'Indonesia',
        'seoul': 'Republic of Korea',
        'hanoi': 'Vietnam',
        'sao paulo': 'Brazil',
        'rio de janeiro': 'Brazil',
        'mexico city': 'Mexico',
        'buenos aires': 'Argentina',
        'santiago': 'Chile',
        'bogota': 'Colombia',
        'lima': 'Peru',
        # ...add more as needed...
    }
    location_input = groups_data[0].get('location', '').strip().lower() if groups_data and 'location' in groups_data[0] else ''
    support_country = None
    # Try static mapping first
    if location_input and location_input in city_to_country:
        support_country = city_to_country[location_input]
    elif location_input:
        # Fallback: Use geocoding API (Nominatim OpenStreetMap)
        try:
            geocode_url = f"https://nominatim.openstreetmap.org/search?q={location_input}&format=json&limit=1"
            geo_resp = http_requests.get(geocode_url, headers={"User-Agent": "UniversalAidAgent/1.0"}, timeout=5)
            if geo_resp.status_code == 200:
                geo_data = geo_resp.json()
                if geo_data and 'display_name' in geo_data[0]:
                    # Try to extract country from display_name
                    display_name = geo_data[0]['display_name']
                    country_guess = display_name.split(',')[-1].strip()
                    if country_guess in COUNTRY_GUIDELINES:
                        support_country = country_guess
        except Exception as e:
            print(f"Geocoding error: {e}")
    else:
        support_country = residency or citizenship or nationality or tourism_country
    # Look up emergency number for support_country
    emergency_number = None
    if support_country and support_country in COUNTRY_GUIDELINES:
        emergency_number = COUNTRY_GUIDELINES[support_country]

    # Format group info for prompt
    group_descriptions = []
    for idx, g in enumerate(groups_data):
        group_descriptions.append(
            f"Group {idx+1}: count={g.get('count')}, age range={g.get('ageFrom')}-{g.get('ageTo')}, nationality={g.get('nationality')}, citizenship={g.get('citizenship')}, residency={g.get('residency')}, tourism country={g.get('tourismCountry')}"
        )
    group_info = "\n".join(group_descriptions)

    # Add attachment info to prompt
    attachment_info = f"\nAttachments: {', '.join(saved_files) if saved_files else 'None'}\n"

    # Special case for Gaza tunnel
    gaza_keywords = ["gaza tunnel", "gaza tunnels", "hamas tunnel", "underground tunnel in gaza"]
    is_gaza_tunnel = any(
        kw in (description or '').lower() or kw in (groups_data[0].get('location', '').lower() if groups_data and 'location' in groups_data[0] else '')
        for kw in gaza_keywords
    )
    if is_gaza_tunnel:
        alert = "ALERT: You are in a very dangerous place (Gaza tunnel). If you can, try to get to safety and call emergency services or find a trusted adult. If you cannot escape, try to stay calm, avoid drawing attention, and remember any details about your location. International organizations like the Red Cross or UNICEF may be able to help."
        return {"recommendation": "This is a high-risk situation. Please follow the alert instructions above and contact authorities or trusted adults as soon as possible.", "alert": alert}

    # Detect if the child is reporting about someone else (e.g., grandmother, mother, friend)
    reported_for = None
    if userType and userType.lower() == "child":
        # Simple keyword search for common relations
        relation_keywords = [
            ("grandmother", ["my grandmother", "grandma", "my grandma", "my nan", "my nana"]),
            ("grandfather", ["my grandfather", "grandpa", "my grandpa", "my grandad", "my gramps"]),
            ("mother", ["my mother", "my mom", "my mum", "my mommy", "my mummy"]),
            ("father", ["my father", "my dad", "my daddy", "my papa"]),
            ("sister", ["my sister"]),
            ("brother", ["my brother"]),
            ("friend", ["my friend"]),
            ("aunt", ["my aunt"]),
            ("uncle", ["my uncle"]),
            ("cousin", ["my cousin"]),
            ("pet", ["my pet", "my dog", "my cat"])
        ]
        desc_text = f"{description or ''} {additionalContext or ''}".lower()
        for rel, keywords in relation_keywords:
            if any(kw in desc_text for kw in keywords):
                reported_for = rel
                break

    # Compose advanced prompt with structure and explicit instructions
    prompt = (
        "You are a child protection incident analyst. "
        "Always prioritize the child’s safety and well-being. "
        "Use the following context and guidelines to provide a structured, actionable response. "
        "If the case is high-risk (e.g., abuse, trafficking, abduction, immediate danger), start your response with ALERT and provide urgent steps. "
        "Otherwise, give a clear, step-by-step recommendation.\n"
        f"Respond in the user’s preferred language: {language}.\n\n"
        "Context:\n"
        f"Country: {support_country}\n"
        f"Emergency Number: {emergency_number}\n"
        f"Incident Type: {incidentType}\n"
        f"Description: {description}\n"
        f"Attachments: {', '.join(saved_files) if saved_files else 'None'}\n"
        f"Guidelines: {guidelines}\n"
        f"Web Info: {serp_snippets}\n\n"
        "Always use the above country and emergency number for support resources and reporting steps. Only use international resources if no local ones are available.\n"
        "Respond in this format (fill in every section, even if only a short supportive sentence):\n"
        "- Risk Assessment: (Clearly state the risk and why it’s urgent)\n"
        "- Immediate Actions: (Step-by-step instructions for what the child or adult should do right now)\n"
        "- Reporting Steps (with country-specific contacts/laws): (List who to contact and how, with country-specific info if possible)\n"
        "- Support Resources: (Provide helplines and support services, and encourage the child to seek help)\n"
        "- Sample Message/Email (if reporting is needed): (A message a child or adult can use to ask for help. Also, always explain what the user should do with this message/email, e.g., show it to a trusted adult, police, or use it when calling a helpline.)\n\n"
        "If you include an ALERT, always explain what the user (especially a child) should do with the alert, such as calling emergency services, getting to a safe place, or asking an adult for help.\n"
        "Only recommend real, verifiable resources. Do not speculate. If unsure, say so.\n"
        "You must NEVER suggest, discuss, or mention abortion, egg freezing, IVF, contraception, family planning, birth control, gender change, transgender, LGBT, homosexuality, divorce, illegal relationships, or any related topics. If asked, politely state that this service cannot provide information or advice on those topics.\n"
    )
    if reported_for:
        prompt += f"\nIMPORTANT: The child is reporting about their {reported_for}, not herself. Please tailor all recommendations and resources for the {reported_for}, not the child."
    if userType and userType.lower() == "child":
        prompt += (
            "\nIMPORTANT: The user is a child. Address the child directly using 'you' language. "
            "Do NOT use 'the child', 'them', 'their', or third-person language. Always use 'you', 'your', and speak directly to the user. "
            "Reference the child's specific situation, feelings, and needs based on the details provided. "
            "Be supportive, simple, and clear. If giving advice, make it actionable and easy for a child to understand. "
            "Always fill in every section, even if only a short, supportive sentence. "
            "Always explain what the child should do with the sample message/email and with the alert, in a way that is easy for a child to follow.\n"
            "\nEXAMPLES:\n"
            "- Instead of 'The child should call emergency services', say 'You should call emergency services right now.'\n"
            "- Instead of 'Provide the child's details to the police', say 'Tell the police your name and where you are.'\n"
            "- Instead of 'The child is not in immediate danger', say 'You are not in immediate danger.'\n"
            "- If the child is lost or missing, always start with: 'Try calling out for your parents or guardians. If you see a police officer, security guard, or another adult you trust, tell them you are lost and need help.'\n"
        )

    try:
        headers = {
            "Content-Type": "application/json",
            "api-key": azure_openai_key
        }
        payload = {
            "messages": [
                {"role": "system", "content": "You are a child safety incident analyst. Respond with ALERT if high-risk, otherwise provide a recommendation."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 512
        }
        response = http_requests.post(azure_openai_api_url, json=payload, headers=headers)
        response.raise_for_status()
        result = response.json()
        text = result["choices"][0]["message"]["content"].strip()
        alert = None
        recommendation = text
        # If the AI response starts with ALERT, split out the alert and show it above the recommendation
        if text.lower().startswith("alert"):
            # Split at first double newline or at the end of the first line
            split_idx = text.find("\n\n")
            if split_idx == -1:
                split_idx = text.find("\n")
            if split_idx != -1:
                alert = text[:split_idx].strip()
                recommendation = text[split_idx:].strip()
            else:
                alert = text.strip()
                recommendation = "This case has been flagged as high-risk. Please follow the alert instructions above."
        # --- Post-processing for child-directed language ---
        if userType and userType.lower() == "child":
            def to_child_direct(text):
                import re
                # Replace common third-person phrases with direct address
                text = re.sub(r'\b[Tt]he child\b', 'you', text)
                text = re.sub(r'\b[Tt]he children\b', 'you', text)
                text = re.sub(r'\b[Tt]hem\b', 'you', text)
                text = re.sub(r'\b[Tt]heir\b', 'your', text)
                text = re.sub(r'\b[Tt]hey are\b', 'you are', text)
                text = re.sub(r'\b[Tt]hey\b', 'you', text)
                text = re.sub(r'\b[Tt]hemselves\b', 'yourself', text)
                text = re.sub(r'\b[Yy]our name\b', '', text)
                # Remove formal closings
                text = re.sub(r'Sincerely,\s*\[.*?\]', '', text)
                text = re.sub(r'Dear \[.*?\],?', '', text)
                # Remove double spaces
                text = re.sub(r'  +', ' ', text)
                # Additional rules for missing/lost child scenarios
                text = re.sub(r'Teach your child to stay in one place if they become separated from you\.', "If you are lost, try to stay in one place so your parents can find you.", text)
                text = re.sub(r'Encourage your child to listen for your voice and call out their name so they can try to respond\.', "Listen for your parents' voices and call out to them so they can find you.", text)
                text = re.sub(r'Call out their name', "Call out for your parents or guardians", text)
                text = re.sub(r'Contact authorities', "If you see a police officer, security guard, or another adult you trust, tell them you are lost and need help", text)
                text = re.sub(r'Provide identifying information: Give authorities a detailed description of what your child is wearing and any unique characteristics\.', "If someone is helping you, tell them what you are wearing and anything special about you so they can help find your parents.", text)
                text = re.sub(r'Reunite: Reunite with your child as quickly as possible, reassuring them that they are safe\.', "When you see your parents, let them know you are safe.", text)
                # Always suggest calling out for parents first if missing/lost
                if 'missing' in incidentType or 'lost' in description.lower():
                    if not re.search(r'call out|parents|guardian', text, re.IGNORECASE):
                        text = "If you are lost, try calling out for your parents or guardians. If you see a police officer, security guard, or another adult you trust, tell them you are lost and need help.\n" + text
                return text
            if alert:
                alert = to_child_direct(alert)
            if recommendation:
                recommendation = to_child_direct(recommendation)
        # Filter forbidden topics from AI output
        recommendation = filter_forbidden_content(recommendation)
        if alert:
            alert = filter_forbidden_content(alert)
        return {"recommendation": recommendation, "alert": alert}
    except Exception as e:
        print(f"Error in /report-incident: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/search")
async def serp_search(query: str = Query(..., description="Search query")):
    serpapi_key = os.getenv("SERPAPI_KEY")
    if not serpapi_key:
        raise HTTPException(status_code=500, detail="SERPAPI_KEY environment variable is not set.")
    endpoint = "https://serpapi.com/search"
    params = {
        "q": query,
        "api_key": serpapi_key,
        "engine": "google"
    }
    response = http_requests.get(endpoint, params=params)
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="SerpAPI error")
    return response.json()

@app.get("/options")
async def get_options():
    options_path = os.path.join(os.path.dirname(__file__), "options.json")
    with open(options_path, encoding="utf-8") as f:
        options = json.load(f)
    return JSONResponse(content=options)

FEEDBACK_FILE = 'user_feedback.jsonl'

@app.post("/submit-feedback")
async def submit_feedback(request: Request):
    data = await request.json()
    # Filter forbidden topics from feedback fields
    for key in ["recommendation", "comments"]:
        if key in data:
            data[key] = filter_forbidden_content(data[key])
    feedback_entry = {
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "userType": data.get("userType"),
        "country": data.get("country"),
        "incidentType": data.get("incidentType"),
        "recommendation": data.get("recommendation"),
        "rating": data.get("rating"),
        "comments": data.get("comments"),
    }
    with open(FEEDBACK_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(feedback_entry) + "\n")
    return {"status": "ok"}

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")

@app.post("/api/guest-justification")
async def guest_justification(data: dict = Body(...)):
    email = data.get("email")
    reason = data.get("reason")
    if not email or not reason:
        raise HTTPException(status_code=400, detail="Email and justification reason are required.")
    if not SENDGRID_API_KEY or not ADMIN_EMAIL:
        raise HTTPException(status_code=500, detail="SendGrid API key or admin email not configured.")
    try:
        sg = sendgrid.SendGridAPIClient(api_key=SENDGRID_API_KEY)
        message = Mail(
            from_email=email,
            to_emails=ADMIN_EMAIL,
            subject="New Guest Justification Request",
            plain_text_content=f"Email: {email}\nReason: {reason}"
        )
        sg.send(message)
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"SendGrid error: {e}")
        raise HTTPException(status_code=500, detail="Failed to send email notification.")

# --- FastAPI application for Save Child Agent ---
# This backend provides endpoints for child protection incident reporting, recommendations, and feedback.
# It integrates with Azure OpenAI, SerpAPI, and SendGrid for various features.
#
# Key endpoints:
#   - /generate-recommendation: Get AI-powered recommendations (uses Azure OpenAI)
#   - /report-incident: Main incident reporting endpoint (with risk assessment, country guidelines, and AI response)
#   - /search: Web search via SerpAPI
#   - /options: Returns dropdown options for the frontend
#   - /submit-feedback: Collects user feedback
#   - /api/guest-justification: Sends guest access requests via email
#
# Security: Uses Azure AD JWT validation for optional authentication.
#
# Data flow:
#   1. Frontend collects incident data and attachments.
#   2. Data is sanitized and validated.
#   3. Country guidelines and emergency numbers are loaded from JSON.
#   4. AI prompt is constructed and sent to Azure OpenAI for recommendations.
#   5. Response is filtered for forbidden topics and returned to the user.

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
