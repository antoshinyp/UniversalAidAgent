// Universal Aid Agent - Main React App
// This app provides a multi-lingual, accessible interface for reporting child protection incidents and getting country-specific recommendations.
//
// Key features:
//   - Multi-step incident reporting form with voice and geolocation support
//   - Country-specific guidelines and emergency contacts
//   - AI-powered recommendations (via backend)
//   - Accessibility and motivational support for children and adults
//   - Lazy-loaded sections for performance

import React, { useState, useEffect, lazy, Suspense } from "react";
import './App.css';
import { FaExclamationTriangle, FaUser, FaWheelchair, FaLanguage, FaMapMarkerAlt, FaPhone, FaPlus, FaMinus, FaArrowRight, FaArrowLeft, FaCheck, FaUsers, FaHome, FaInfoCircle, FaFileUpload } from "react-icons/fa";
import { reportIncident } from "./api";
import { COUNTRY_CONTACTS } from "./country_contacts";
import Select from "react-select";
import AsyncSelect from 'react-select/async';
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { useDropdownOptions } from "./hooks/useDropdownOptions";
import ErrorBoundary from "./ErrorBoundary";
import childProtectionLogo from './assets/Universal-Agent-Logo.jpeg';
import childCharacter from './assets/child-friendly.jpeg';
import ReactSelect from 'react-select';
import TransparencyNote from "./TransparencyNote";
import illustrationOne from './assets/Create a universal aid cartoon-style illustration suitable for children, teenagers, and adults. The  (1).jpeg';
import illustrationTwo from './assets/Create a universal aid cartoon-style illustration suitable for children, teenagers, and adults. The  (2).jpeg';
import illustrationThree from './assets/Create a universal aid cartoon-style illustration suitable for children, teenagers, and adults. The  (3).jpeg';
import teenSupportIllustration from './assets/A modern neutral illustration of a diverse group of teenagers and young adults in a supportive.jpeg';
import { login, logout, getAccount } from "./msal";
import adultSupportIllustration from './assets/A modern professional and inclusive illustration featuring a diverse group of adults.jpeg';
// Remove unused teen images imports if not used elsewhere
// import teenImage1 from './assets/Teen or Young Adult Image1.png';
// import teenImage2 from './assets/Teen or Young Adult Image2.png';
// import teenImage3 from './assets/Teen or Young Adult Image3.png';
// import teenImage4 from './assets/Teen or Young Adult Image4.png';

// Lazy load heavy components
const FamilySocialSection = lazy(() => import("./FamilySocialSection"));
const PerpetratorReportingSection = lazy(() => import("./PerpetratorReportingSection"));
const NeedsAttachmentsSection = lazy(() => import("./NeedsAttachmentsSection"));
const ImageGallery = lazy(() => import("./ImageGallery"));
const AccessibilityPanel = lazy(() => import("./AccessibilityPanel"));

// Translation resources
const resources = {
  en: {
    translation: {
      "Describe Your Situation": "Describe Your Situation",
      "Preferred Language": "Preferred Language",
      "Is the child in immediate danger?": "Is the child in immediate danger?",
      "Type of Incident/Concern": "Type of Incident/Concern",
      "Date/Time of Incident": "Date/Time of Incident",
      "How can we help you today?": "How can we help you today?",
      "Child's Gender": "Child's Gender",
      "Disability or Special Needs": "Disability or Special Needs",
      "Language Spoken by Child": "Language Spoken by Child",
      "Current Location (City/Region)": "Current Location (City/Region)",
      "Get Recommendation": "Get Recommendation",
      // ...add more keys as needed...
    }
  },
  hi: {
    translation: {
      "Describe Your Situation": "अपनी स्थिति का वर्णन करें",
      "Preferred Language": "पसंदीदा भाषा",
      "Is the child in immediate danger?": "क्या बच्चा तत्काल खतरे में है?",
      "Type of Incident/Concern": "घटना/चिंता का प्रकार",
      "Date/Time of Incident": "घटना की तिथि/समय",
      "How can we help you today?": "हम आज आपकी कैसे मदद कर सकते हैं?",
      "Child's Gender": "बच्चे का लिंग",
      "Disability or Special Needs": "विकलांगता या विशेष आवश्यकताएँ",
      "Language Spoken by Child": "बच्चे द्वारा बोली जाने वाली भाषा",
      "Current Location (City/Region)": "वर्तमान स्थान (शहर/क्षेत्र)",
      "Get Recommendation": "सिफारिश प्राप्त करें",
      // ...add more keys as needed...
    }
  },
  es: {
    translation: {
      "Describe Your Situation": "Describa su situación",
      "Preferred Language": "Idioma preferido",
      "Is the child in immediate danger?": "¿El niño está en peligro inmediato?",
      "Type of Incident/Concern": "Tipo de incidente/preocupación",
      "Date/Time of Incident": "Fecha/Hora del incidente",
      "How can we help you today?": "¿Cómo podemos ayudarle hoy?",
      "Child's Gender": "Género del niño",
      "Disability or Special Needs": "Discapacidad o necesidades especiales",
      "Language Spoken by Child": "Idioma hablado por el niño",
      "Current Location (City/Region)": "Ubicación actual (Ciudad/Región)",
      "Get Recommendation": "Obtener recomendación",
    }
  },
  fr: {
    translation: {
      "Describe Your Situation": "Décrivez votre situation",
      "Preferred Language": "Langue préférée",
      "Is the child in immediate danger?": "L'enfant est-il en danger immédiat?",
      "Type of Incident/Concern": "Type d'incident/préoccupation",
      "Date/Time of Incident": "Date/Heure de l'incident",
      "How can we help you today?": "Comment pouvons-nous vous aider aujourd'hui?",
      "Child's Gender": "Sexe de l'enfant",
      "Disability or Special Needs": "Handicap ou besoins spéciaux",
      "Language Spoken by Child": "Langue parlée par l'enfant",
      "Current Location (City/Region)": "Emplacement actuel (Ville/Région)",
      "Get Recommendation": "Obtenir une recommandation",
    }
  },
  ar: {
    translation: {
      "Describe Your Situation": "وصف حالتك",
      "Preferred Language": "اللغة المفضلة",
      "Is the child in immediate danger?": "هل الطفل في خطر فوري؟",
      "Type of Incident/Concern": "نوع الحادث/القلق",
      "Date/Time of Incident": "تاريخ/وقت الحادث",
      "How can we help you today?": "كيف يمكننا مساعدتك اليوم؟",
      "Child's Gender": "جنس الطفل",
      "Disability or Special Needs": "إعاقة أو احتياجات خاصة",
      "Language Spoken by Child": "اللغة التي يتحدث بها الطفل",
      "Current Location (City/Region)": "الموقع الحالي (المدينة/المنطقة)",
      "Get Recommendation": "احصل على توصية",
    }
  },
  zh: {
    translation: {
      "Describe Your Situation": "描述您的情况",
      "Preferred Language": "首选语言",
      "Is the child in immediate danger?": "孩子是否有立即危险？",
      "Type of Incident/Concern": "事件/关注类型",
      "Date/Time of Incident": "事件日期/时间",
      "How can we help you today?": "我们今天如何帮助您？",
      "Child's Gender": "孩子的性别",
      "Disability or Special Needs": "残疾或特殊需要",
      "Language Spoken by Child": "孩子说的语言",
      "Current Location (City/Region)": "当前位置（城市/地区）",
      "Get Recommendation": "获取建议",
    }
  },
  ru: {
    translation: {
      "Describe Your Situation": "Опишите вашу ситуацию",
      "Preferred Language": "Предпочтительный язык",
      "Is the child in immediate danger?": "Ребенок в непосредственной опасности?",
      "Type of Incident/Concern": "Тип инцидента/проблемы",
      "Date/Time of Incident": "Дата/время инцидента",
      "How can we help you today?": "Как мы можем вам помочь сегодня?",
      "Child's Gender": "Пол ребенка",
      "Disability or Special Needs": "Инвалидность или особые потребности",
      "Language Spoken by Child": "Язык, на котором говорит ребенок",
      "Current Location (City/Region)": "Текущее местоположение (город/регион)",
      "Get Recommendation": "Получить рекомендацию",
    }
  },
  he: {
    translation: {
      "Describe Your Situation": "תאר את מצבך",
      "Preferred Language": "שפה מועדפת",
      "Is the child in immediate danger?": "האם הילד בסכנה מיידית?",
      "Type of Incident/Concern": "סוג האירוע/הדאגה",
      "Date/Time of Incident": "תאריך/שעת האירוע",
      "How can we help you today?": "איך נוכל לעזור לך היום?",
      "Child's Gender": "מגדר הילד",
      "Disability or Special Needs": "נכות או צרכים מיוחדים",
      "Language Spoken by Child": "שפה מדוברת על ידי הילד",
      "Current Location (City/Region)": "מיקום נוכחי (עיר/אזור)",
      "Get Recommendation": "קבל המלצה",
    }
  },
  ta: {
    translation: {
      "Describe Your Situation": "உங்கள் நிலையை விவரிக்கவும்",
      "Preferred Language": "விருப்பமான மொழி",
      "Is the child in immediate danger?": "குழந்தை உடனடி ஆபத்தில் உள்ளதா?",
      "Type of Incident/Concern": "நிகழ்வு/கவலை வகை",
      "Date/Time of Incident": "நிகழ்வு தேதி/நேரம்",
      "How can we help you today?": "இன்று நாங்கள் எப்படி உதவலாம்?",
      "Child's Gender": "குழந்தையின் பாலினம்",
      "Disability or Special Needs": "ஊனமுற்ற அல்லது சிறப்பு தேவைகள்",
      "Language Spoken by Child": "குழந்தை பேசும் மொழி",
      "Current Location (City/Region)": "தற்போதைய இடம் (நகரம்/மண்டலம்)",
      "Get Recommendation": "பரிந்துரை பெறவும்",
      // ...add more keys as needed...
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

function Spinner() { return <span className="spinner" aria-label="Loading" />; }

function MotivationalMessage({ step }) {
  const messages = [
    "👋 Hi there! You're taking a brave first step. We're here to listen.",
    "🌟 Great job! Can you tell us what happened, in your own words?",
    "💬 You're doing amazing! Just a few more questions, answer as much as you like.",
    "🧸 Almost done! Every detail helps us help you.",
    "🎉 Thank you for sharing. You're not alone!",
    "💡 If you want, you can add more, or just finish up!",
    "✅ All done! Thank you for your courage."
  ];
  return (
    <div style={{display:'flex',alignItems:'center',gap:12,background:'#eaf6ff',borderRadius:10,padding:'0.75em 1em',margin:'16px 0',boxShadow:'0 1px 4px rgba(45,114,217,0.06)'}}>
      <img src={childCharacter} alt="Friendly character" style={{height:48}} />
      <span style={{fontWeight:600,color:'#2d72d9',fontSize:'1.1em'}}>{messages[step] || messages[0]}</span>
    </div>
  );
}

// VoiceInput component for text/textarea fields
function VoiceInput({ value, onChange, placeholder, as = 'textarea', rows = 4, ...props }) {
  const [listening, setListening] = React.useState(false);
  const recognitionRef = React.useRef(null);

  React.useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onChange({ target: { value: value ? value + ' ' + transcript : transcript } });
      setListening(false);
    };
    recognitionRef.current.onend = () => setListening(false);
    recognitionRef.current.onerror = () => setListening(false);
  }, [onChange, value]);

  const handleMicClick = (e) => {
    e.preventDefault();
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const InputTag = as;
  return (
    <div style={{position:'relative', display:'flex', alignItems:'center'}}>
      <InputTag
        {...props}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={as==='textarea'?rows:undefined}
        style={{width:'100%', borderRadius:8, padding:8, paddingRight:40, ...props.style}}
      />
      <button
        type="button"
        aria-label={listening ? "Stop voice input" : "Start voice input"}
        onClick={handleMicClick}
        style={{position:'absolute', right:8, top:as==='textarea'?8:2, background:'none', border:'none', cursor:'pointer', color:listening?'#e67e22':'#3949ab', fontSize:22}}
        tabIndex={0}
      >
        <span role="img" aria-label="microphone">{listening ? '🎤' : '🎙️'}</span>
      </button>
      {listening && <span style={{position:'absolute', right:40, top:as==='textarea'?8:2, color:'#e67e22', fontWeight:600, fontSize:12}}>Listening...</span>}
    </div>
  );
}

function VoiceInputWithGeo({ value, onChange, placeholder, as = 'input', ...props }) {
  const [listening, setListening] = React.useState(false);
  const [geoLoading, setGeoLoading] = React.useState(false);
  const recognitionRef = React.useRef(null);

  React.useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onChange({ target: { value: value ? value + ' ' + transcript : transcript } });
      setListening(false);
    };
    recognitionRef.current.onend = () => setListening(false);
    recognitionRef.current.onerror = () => setListening(false);
  }, [onChange, value]);

  const handleMicClick = (e) => {
    e.preventDefault();
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const handleGeoClick = async () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        const data = await resp.json();
        const address = data.address || {};
        // Compose a detailed address string
        const parts = [
          address.road,
          address.neighbourhood,
          address.suburb,
          address.city || address.town || address.village || address.hamlet,
          address.county,
          address.state,
          address.postcode,
          address.country
        ].filter(Boolean);
        const detailedLocation = parts.join(', ');
        if (detailedLocation) {
          onChange({ target: { value: detailedLocation } });
        } else {
          // fallback to display_name or city
          onChange({ target: { value: data.display_name || address.city || '' } });
        }
      } catch {
        // Error handling intentionally left blank (no-op)
      }
      setGeoLoading(false);
    }, () => setGeoLoading(false));
  };

  const InputTag = as;
  return (
    <div style={{position:'relative', display:'flex', alignItems:'center'}}>
      <InputTag
        {...props}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{width:'100%', borderRadius:8, padding:8, paddingRight:80, ...props.style}}
      />
      <button
        type="button"
        aria-label={listening ? "Stop voice input" : "Start voice input"}
        onClick={handleMicClick}
        style={{position:'absolute', right:40, top:2, background:'none', border:'none', cursor:'pointer', color:listening?'#e67e22':'#3949ab', fontSize:22}}
      >
        <span role="img" aria-label="microphone">{listening ? '🎤' : '🎙️'}</span>
      </button>
      <button
        type="button"
        aria-label="Use my location"
        onClick={handleGeoClick}
        style={{position:'absolute', right:8, top:2, background:'none', border:'none', cursor:'pointer', color:geoLoading?'#e67e22':'#3949ab', fontSize:22}}
        tabIndex={0}
        disabled={geoLoading}
      >
        <span role="img" aria-label="location">📍</span>
      </button>
      {listening && <span style={{position:'absolute', right:80, top:2, color:'#e67e22', fontWeight:600, fontSize:12}}>Listening...</span>}
      {geoLoading && <span style={{position:'absolute', right:60, top:2, color:'#e67e22', fontWeight:600, fontSize:12}}>Locating...</span>}
    </div>
  );
}

// Adult incident options for non-childish dropdown
const ADULT_INCIDENT_OPTIONS = [
  { value: '', label: 'Choose one...' },
  { value: 'abuse', label: 'Physical or emotional abuse' },
  { value: 'neglect', label: 'Neglect or abandonment' },
  { value: 'trafficking', label: 'Suspected trafficking or exploitation' },
  { value: 'abduction', label: 'Abduction or missing child' },
  { value: 'slavery', label: 'Forced labor or slavery' },
  { value: 'begging', label: 'Forced begging' },
  { value: 'sexual_exploitation', label: 'Sexual exploitation or abuse' },
  { value: 'terrorism', label: 'Involvement in criminal/terrorist activity' },
  { value: 'child_marriage', label: 'Child marriage' },
  { value: 'child_labour', label: 'Child labour' },
  { value: 'poverty', label: 'Extreme poverty' },
  { value: 'health', label: 'Serious health concern' },
  { value: 'education', label: 'Education barrier' },
  { value: 'missing', label: 'Missing child' },
  { value: 'other', label: 'Other concern' }
];

// Add this new enhanced AIResponse component with image support
function AIResponse({ response, isAlert = false }) {
  const responseRef = React.useRef(null);

  React.useEffect(() => {
    // Auto-scroll to recommendation when it appears
    if (response && responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [response]);

  if (!response) return null;
  
  // Select appropriate image based on content type
  const getImageForContent = () => {
    if (isAlert) {
      // For alerts, use a more attention-grabbing image
      return illustrationTwo;
    } else {
      // For recommendations, alternate between different illustrations
      // You can customize this logic based on the content of the response
      if (response.includes('immediate') || response.includes('urgent')) {
        return illustrationOne;
      } else if (response.includes('support') || response.includes('help')) {
        return illustrationThree;
      } else {
        return childCharacter;
      }
    }
  };
  
  return (
    <div ref={responseRef} className={`ai-response ${isAlert ? 'alert' : 'recommendation'}`}>
      <div className="ai-response-header">
        <span className="ai-icon">{isAlert ? '⚠️' : '🤖'}</span>
        <h3>{isAlert ? 'Alert' : 'AI Recommendation'}</h3>
      </div>
      <div className="ai-response-content">
        <div className="ai-response-with-image">
          <div className="ai-response-text">
            {response.split('\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
          <div className="ai-response-image">
            <img src={getImageForContent()} alt={isAlert ? "Alert illustration" : "Recommendation illustration"} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CombinedForm({ userType, setUserType, reportingFor }) {
  const { COUNTRY_OPTIONS, LANGUAGE_OPTIONS } = useDropdownOptions();
  const [groups, setGroups] = useState([
    { count: 1, ageFrom: '', ageTo: '', nationality: '', citizenship: '', residency: '', tourismCountry: '', gender: '', disability: '', language: '', location: '' }
  ]);
  
  // Check if the user is reporting for themselves or for a child
  const isReportingForSelf = (userType === 'adult' || userType === 'teen') && reportingFor === 'self';
  
  // Adding Universal Aid Agent header reference with appropriate text based on reporting type
  const FormHeaderReference = () => (
    <div className="form-header-reference">
      <img src={childProtectionLogo} alt="Universal Aid Agent Logo" className="form-header-logo" />
      <div className="form-header-text">
        <h2>Universal Aid Agent</h2>
        <p>{isReportingForSelf ? (userType === 'teen' ? 'Teen/Young Adult Support Reporting System' : 'Adult Support Reporting System') : userType === 'child' ? 'Helping you share what happened' : 'Universal humanitarian response and protection system'}</p>
      </div>
    </div>
  );

  const [description, setDescription] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [alert, setAlert] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [livingArrangement, setLivingArrangement] = useState("");
  const [parentSituation, setParentSituation] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [immediateDanger, setImmediateDanger] = useState(false);
  const [incidentDate, setIncidentDate] = useState("");
  const [perpetratorInfo, setPerpetratorInfo] = useState("");
  const [reportedBefore, setReportedBefore] = useState("");
  const [reportContact, setReportContact] = useState("");
  const [immediateNeeds, setImmediateNeeds] = useState("");
  const [agenciesInvolved, setAgenciesInvolved] = useState("");
  const [feedback, setFeedback] = useState("");
  const [feedbackRating, setFeedbackRating] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [step, setStep] = useState(0);
  const [incidentType, setIncidentType] = useState("");
  const steps = [
    "Urgency & Incident",
    "Incident Description",
    "Child Details & Groups",
    "Family & Social Context",
    "Person of Concern & Reporting",
    "Needs, Attachments & Contact",
    "Review & Submit"
  ];

  // Move isRequired and HIGH_RISK_TYPES here so they are defined before childSteps
  const HIGH_RISK_TYPES = ["abduction", "abuse", "trafficking"];
  const isRequired = (field) => {
    if (userType === 'child') {
      if (field === "location") {
        return HIGH_RISK_TYPES.includes(incidentType) || immediateDanger;
      }
      if (["description", "incidentType", "incidentDate", "immediateDanger"].includes(field)) return true;
      return false;
    }
    return true;
  };

  const isHighRisk = () => {
    return HIGH_RISK_TYPES.includes(incidentType) || immediateDanger;
  };

  // For children, show only 1-2 fields per step, with clear navigation
  const childSteps = [
    // Step 0: Urgency & Incident
    [
      {
        type: 'checkbox',
        label: 'Is this an emergency?',
        id: 'immediate-danger',
        value: immediateDanger,
        onChange: e => setImmediateDanger(e.target.checked),
        required: true
      },
      {
        type: 'select',
        label: 'What happened?',
        id: 'incident-type',
        value: incidentType,
        onChange: e => setIncidentType(e.target.value),
        options: [
          { value: '', label: 'Choose one...' },
          { value: 'abuse', label: 'Someone hurt me' },
          { value: 'neglect', label: 'No one is taking care of me' },
          { value: 'trafficking', label: 'Someone is making me go places I don\'t want' },
          { value: 'abduction', label: 'I was taken away' },
          { value: 'slavery', label: 'I\'m being forced to work' },
          { value: 'kidnap_begging', label: 'I\'m made to beg' },
          { value: 'porn', label: 'Someone is making me do things for photos/videos' },
          { value: 'terrorism', label: 'I\'m being made to do scary things' },
          { value: 'child_marriage', label: 'I\'m being made to marry' },
          { value: 'child_labour', label: 'I\'m made to work' },
          { value: 'poverty', label: 'I don\'t have enough to eat' },
          { value: 'health', label: 'I\'m sick or hurt' },
          { value: 'education', label: 'I can\'t go to school' },
          { value: 'missing', label: 'I\'m lost or missing' },
          { value: 'other', label: 'Something else' }
        ],
        required: true
      },
      {
        type: 'datetime',
        label: 'When did this happen?',
        id: 'incident-date',
        value: incidentDate,
        onChange: e => setIncidentDate(e.target.value),
        required: true
      }
    ],
    // Step 1: Incident Description
    [
      {
        type: 'textarea',
        label: 'Can you tell us what happened?',
        id: 'incident-desc',
        value: description,
        onChange: e => setDescription(e.target.value),
        required: true
      }
    ],
    // Step 2: Child Details & Groups
    [
      {
        type: 'group',
        label: 'About You',
        id: 'about-you'
      }
    ],
    // Step 3: Family & Social Context
    [
      {
        type: 'textarea',
        label: 'Who do you live with?',
        id: 'living-arrangement',
        value: livingArrangement,
        onChange: e => setLivingArrangement(e.target.value),
        required: false
      },
      {
        type: 'textarea',
        label: 'What is your parent or guardian\'s situation?',
        id: 'parent-situation',
        value: parentSituation,
        onChange: e => setParentSituation(e.target.value),
        required: false
      },
      {
        type: 'textarea',
        label: 'Anything else you want to tell us?',
        id: 'additional-context',
        value: additionalContext,
        onChange: e => setAdditionalContext(e.target.value),
        required: false
      }
    ],
    // Step 4: Person of Concern & Reporting
    [
      {
        type: 'textarea',
        label: 'Person who caused the problem',
        id: 'perpetrator-info',
        value: perpetratorInfo,
        onChange: e => setPerpetratorInfo(e.target.value),
        required: false
      },
      {
        type: 'textarea',
        label: 'Has this been reported before?',
        id: 'reported-before',
        value: reportedBefore,
        onChange: e => setReportedBefore(e.target.value),
        required: false
      },
      {
        type: 'textarea',
        label: 'How can we contact you?',
        id: 'report-contact',
        value: reportContact,
        onChange: e => setReportContact(e.target.value),
        required: false
      }
    ],
    // Step 5: Needs, Attachments & Contact
    [
      {
        type: 'textarea',
        label: 'What do you need right now?',
        id: 'immediate-needs',
        value: immediateNeeds,
        onChange: e => setImmediateNeeds(e.target.value),
        required: false
      },
      {
        type: 'textarea',
        label: 'Are there any agencies or people already helping you?',
        id: 'agencies-involved',
        value: agenciesInvolved,
        onChange: e => setAgenciesInvolved(e.target.value),
        required: false
      },
      {
        type: 'file',
        label: 'Upload any files or photos that might help',
        id: 'attachments',
        value: attachments,
        onChange: e => setAttachments([...attachments, ...e.target.files]),
        required: false
      }
    ],
    // Step 6: Review & Submit
    [
      {
        type: 'textarea',
        label: 'Is there anything else you want to tell us?',
        id: 'feedback',
        value: feedback,
        onChange: e => setFeedback(e.target.value),
        required: false
      },
      {
        type: 'select',
        label: 'How would you rate this form?',
        id: 'feedback-rating',
        value: feedbackRating ?? "",
        onChange: e => setFeedbackRating(e.target.value),
        options: [
          { value: '', label: 'Choose one...' },
          { value: '1', label: '1 - Very difficult' },
          { value: '2', label: '2 - Difficult' },
          { value: '3', label: '3 - Okay' },
          { value: '4', label: '4 - Easy' },
          { value: '5', label: '5 - Very easy' }
        ],
        required: false
      }
    ]
  ];

  // The adult steps (components to render at each step)
  const adultSteps = [
    // Step 0: Urgency & Incident
    [
      {
        type: 'checkbox',
        label: isReportingForSelf ? 'Are you in immediate danger?' : 'Is the child in immediate danger?',
        id: 'immediate-danger',
        value: immediateDanger,
        onChange: e => setImmediateDanger(e.target.checked),
        required: true
      },
      {
        type: 'select',
        label: 'Type of Incident/Concern',
        id: 'incident-type',
        value: incidentType ?? "",
        onChange: e => setIncidentType(e.target.value),
        options: ADULT_INCIDENT_OPTIONS,
        required: true
      },
      {
        type: 'datetime',
        label: 'Date/Time of Incident',
        id: 'incident-date',
        value: incidentDate,
        onChange: e => setIncidentDate(e.target.value),
        required: true
      }
    ],
    // Step 1: Incident Description
    [
      {
        type: 'textarea',
        label: 'Describe the incident or concern in detail',
        id: 'incident-desc',
        value: description,
        onChange: e => setDescription(e.target.value),
        required: true
      }
    ],
    // Step 2: Details & Groups
    [
      {
        type: 'group',
        label: isReportingForSelf ? 'Your Information' : 'Child Information',
        id: 'person-info'
      }
    ],
    // Step 3: Family & Social Context
    [
      {
        type: 'textarea',
        label: 'Living Arrangements',
        id: 'living-arrangement',
        value: livingArrangement,
        onChange: e => setLivingArrangement(e.target.value),
        required: false
      },
      {
        type: 'textarea',
        label: 'Parent/Guardian Situation',
        id: 'parent-situation',
        value: parentSituation,
        onChange: e => setParentSituation(e.target.value),
        required: false
      },
      {
        type: 'textarea',
        label: 'Additional Context',
        id: 'additional-context',
        value: additionalContext,
        onChange: e => setAdditionalContext(e.target.value),
        required: false
      }
    ],
    // Step 4: Person of Concern & Reporting
    [
      {
        type: 'textarea',
        label: isReportingForSelf ? 'Person responsible for harming you' : 'Person responsible for harming the child',
        id: 'perpetrator-info',
        value: perpetratorInfo,
        onChange: e => setPerpetratorInfo(e.target.value),
        required: false
      },
      {
        type: 'textarea',
        label: 'Has this been reported before?',
        id: 'reported-before',
        value: reportedBefore,
        onChange: e => setReportedBefore(e.target.value),
        required: false
      }
      // Removed 'Contact information for this report' field
    ],
    // Step 5: Needs, Attachments & Contact
    [
      {
        type: 'textarea',
        label: isReportingForSelf ? 'Your immediate needs' : 'Immediate needs of the child',
        id: 'immediate-needs',
        value: immediateNeeds,
        onChange: e => setImmediateNeeds(e.target.value),
        required: false
      },
      {
        type: 'textarea',
        label: 'Agencies or people already involved',
        id: 'agencies-involved',
        value: agenciesInvolved,
        onChange: e => setAgenciesInvolved(e.target.value),
        required: false
      },
      {
        type: 'file',
        label: 'Attachments (photos, documents, etc.)',
        id: 'attachments',
        value: attachments,
        onChange: e => setAttachments([...attachments, ...e.target.files]),
        required: false
      }
    ],
    // Step 6: Review & Submit
    [
      {
        type: 'textarea',
        label: 'Additional feedback or information',
        id: 'feedback',
        value: feedback,
        onChange: e => setFeedback(e.target.value),
        required: false
      },
      {
        type: 'select',
        label: 'Rate your experience with this form',
        id: 'feedback-rating',
        value: feedbackRating ?? "",
        onChange: e => setFeedbackRating(e.target.value),
        options: [
          { value: '', label: 'Choose one...' },
          { value: '1', label: '1 - Very difficult' },
          { value: '2', label: '2 - Difficult' },
          { value: '3', label: '3 - Okay' },
          { value: '4', label: '4 - Easy' },
          { value: '5', label: '5 - Very easy' }
        ],
        required: false
      }
    ]
  ];

  const handleGroupChange = (idx, field, value) => {
    const newGroups = [...groups];
    newGroups[idx][field] = value;
    setGroups(newGroups);
  };

  const handleAddGroup = () => {
    setGroups([...groups, { count: 1, ageFrom: '', ageTo: '', nationality: '', citizenship: '', residency: '', tourismCountry: '', gender: '', disability: '', language: '', location: '' }]);
  };

  const handleRemoveGroup = (idx) => {
    const newGroups = groups.filter((_, i) => i !== idx);
    setGroups(newGroups);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await reportIncident({
        userType,
        groups,
        description,
        recommendation,
        alert,
        livingArrangement,
        parentSituation,
        additionalContext,
        immediateDanger,
        incidentType,
        incidentDate,
        perpetratorInfo,
        reportedBefore,
        reportContact,
        immediateNeeds,
        agenciesInvolved,
      });
      setRecommendation(response.recommendation);
      setAlert(response.alert);
    } catch {
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = (step) => {
    const fields = userType === 'child' ? childSteps[step] : adultSteps[step];
    return fields.map((field, idx) => {
      if (field.type === 'group') {
        return (
          <div key={idx} style={{marginBottom:16}}>
            <label>{field.label}</label>
            {groups.map((group, gidx) => (
              <div key={gidx} style={{background:'#fff',borderRadius:12,boxShadow:'0 1px 4px rgba(45,114,217,0.06)',marginBottom:16,padding:'1em',position:'relative',border: '1.5px solid #e0e0e0', display:'flex', flexDirection:'column', gap:20}}>
                <label htmlFor={`group-citizenship-${gidx}`}>Country of Residency</label>
                <ReactSelect
                  inputId={`group-citizenship-${gidx}`}
                  value={COUNTRY_OPTIONS.find(opt => opt.value === group.citizenship) || null}
                  onChange={opt => handleGroupChange(gidx, 'citizenship', opt ? opt.value : '')}
                  options={COUNTRY_OPTIONS}
                  placeholder="Select country of residency..."
                  isClearable={true}
                  isSearchable={true}
                  aria-label="Country of Residency"
                />
                <div style={{marginBottom:24}}>
                  <label htmlFor={`group-location-${gidx}`}>
                    {isReportingForSelf ? 'Where are you now?' : 
                     userType === 'adult' ? 'Where is the child now?' : 
                     'Where are you now?'}
                    {isRequired("location") && <span style={{color:'#e74c3c'}}> *</span>}
                  </label>
                  {isHighRisk() ? (
                    <>
                      <VoiceInputWithGeo
                        as="input"
                        id={`group-location-${gidx}`}
                        value={group.location || ''}
                        onChange={e => handleGroupChange(gidx, 'location', e.target.value)}
                        placeholder="Enter full address or use the mic/location button"
                        required={isRequired("location")}
                      />
                      <div style={{fontSize:12, color:'#e67e22', marginTop:4}}>
                        For urgent/high-risk cases, a full address helps responders find you quickly. Only share if you feel safe.
                      </div>
                    </>
                  ) : (
                    <>
                      <VoiceInputWithGeo
                        as="input"
                        id={`group-location-${gidx}`}
                        value={group.location || ''}
                        onChange={e => handleGroupChange(gidx, 'location', e.target.value)}
                        placeholder="Enter city, region, or country only"
                        required={isRequired("location")}
                      />
                      <div style={{fontSize:12, color:'#e67e22', marginTop:4}}>
                        For privacy, do not enter your full address. City, region, or country is enough for most cases.
                      </div>
                    </>
                  )}
                </div>
                {groups.length > 1 && (
                  <button type="button" onClick={() => handleRemoveGroup(gidx)} style={{position:'absolute',top:8,right:8,background:'none',border:'none',cursor:'pointer',color:'#e74c3c',fontSize:22}} aria-label="Remove group">✖️</button>
                )}
              </div>
            ))}
            <button type="button" onClick={handleAddGroup} style={{marginTop:8,background:'#2d72d9',color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',cursor:'pointer'}}>Add Another Group</button>
          </div>
        );
      }
      switch (field.type) {
        case 'checkbox':
          return (
            <div key={idx} style={{marginBottom:16}}>
              <label htmlFor={field.id}>
                <input
                  type="checkbox"
                  id={field.id}
                  checked={field.value}
                  onChange={field.onChange}
                  required={field.required}
                />
                {field.label}
              </label>
            </div>
          );
        case 'select':
          return (
            <div key={idx} style={{marginBottom:16}}>
              <label htmlFor={field.id}>{field.label}{field.required && <span style={{color:'#e74c3c'}}> *</span>}</label>
              <select
                id={field.id}
                value={field.value ?? ''}
                onChange={field.onChange}
                required={field.required}
                style={{width:'100%',borderRadius:8,padding:8}}
                aria-label={field.label}
              >
                {field.options.map((option, idx) => (
                  <option key={idx} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          );
        case 'textarea':
          return (
            <div key={idx} style={{marginBottom:16}}>
              <label htmlFor={field.id}>{field.label}{field.required && <span style={{color:'#e74c3c'}}> *</span>}</label>
              <VoiceInput
                id={field.id}
                value={field.value}
                onChange={field.onChange}
                placeholder={field.placeholder}
                required={field.required}
                style={{marginBottom:8}}
              />
            </div>
          );
        case 'datetime':
          return (
            <div key={idx} style={{marginBottom:16}}>
              <label htmlFor={field.id}>{field.label}{field.required && <span style={{color:'#e74c3c'}}> *</span>}</label>
              <input
                type="datetime-local"
                id={field.id}
                value={field.value}
                onChange={field.onChange}
                required={field.required}
                style={{width:'100%',borderRadius:8,padding:8}}
              />
            </div>
          );
        case 'file':
          return (
            <div key={idx} style={{marginBottom:16}}>
              <label htmlFor={field.id}>{field.label}{field.required && <span style={{color:'#e74c3c'}}> *</span>}</label>
              <input
                type="file"
                id={field.id}
                onChange={field.onChange}
                multiple
                required={field.required}
                style={{width:'100%',borderRadius:8,padding:8}}
              />
            </div>
          );
        default:
          return null;
      }
    });
  };

  // Add a FormHeader component at the top of the form
  let user = null;
  try { user = getAccount && typeof getAccount === 'function' ? getAccount() : null; } catch { user = null; }
  return (
    <div className="app-container">
      <div className="form-header-reference">
        <img src={childProtectionLogo} alt="Universal Aid Agent logo" className="form-header-logo" />
        <div className="form-header-text">
          <h2>Universal Aid Agent</h2>
          <p>{isReportingForSelf ? (userType === 'teen' ? 'Teen/Young Adult Support Reporting System' : 'Adult Support Reporting System') : 
              userType === 'child' ? 'Helping you share what happened' : 
              'Universal humanitarian response and protection system'}</p>
        </div>
      </div>
      {/* Submission mode message */}
      <div style={{marginBottom:16,background:'#f6f8fa',padding:'10px 16px',borderRadius:8,border:'1px solid #e0e0e0',color:'#3949ab',fontWeight:500}}>
        {user ? (
          <>You are signed in as <b>{user.username}</b>. Your report will be submitted securely and can be tracked by professionals.</>
        ) : (
          <>You are submitting this report as a <b>guest</b>. You do not need to log in, but you can <span style={{color:'#2d72d9'}}>log in</span> for a more secure, trackable submission.</>
        )}
      </div>
      <h1>{
        isReportingForSelf ? (userType === 'teen' ? 'Teen/Young Adult Support Form' : 'Adult Support Form') :
        userType === 'child' ? 'Child Reporting Form' :
        userType === 'teen' ? 'Teen/Young Adult Reporting Form' :
        'Adult Reporting Form'
      }</h1>
      
      {/* Step indicators */}
      <div className="step-indicators">
        {steps.map((stepName, index) => (
          <div 
            key={index} 
            className={`step-indicator${index === step ? ' active' : ''}${index < step ? ' completed' : ''}`}
            onClick={() => index < step && setStep(index)}
          >
            {index < step ? <FaCheck /> : index + 1}
            <span className="step-name">{stepName}</span>
          </div>
        ))}
      </div>

      <MotivationalMessage step={step} />
      
      <form onSubmit={handleSubmit}>
        {renderStep(step)}
        <div style={{display:'flex',justifyContent:'space-between',marginTop:16}}>
          {step === 0 && (
            <button type="button" onClick={() => setUserType(null)} style={{background:'#e0e0e0',color:'#2d72d9',border:'none',borderRadius:8,padding:'8px 16px',cursor:'pointer',marginRight:8}}>Back</button>
          )}
          {step > 0 && <button type="button" onClick={() => setStep(step - 1)} style={{background:'#2d72d9',color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',cursor:'pointer'}}>Previous</button>}
          {step < (userType === 'child' ? childSteps.length : adultSteps.length) - 1 && <button type="button" onClick={() => setStep(step + 1)} style={{background:'#2d72d9',color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',cursor:'pointer'}}>Next</button>}
          {step === (userType === 'child' ? childSteps.length : adultSteps.length) - 1 && <button type="submit" style={{background:'#2d72d9',color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',cursor:'pointer'}} disabled={loading}>{loading ? "Submitting..." : "Submit"}</button>}
        </div>
        {loading && <Spinner />}
        {error && <div style={{color:'#e74c3c',marginTop:16}}>{error}</div>}
        {recommendation && <AIResponse response={recommendation} isAlert={false} />}
        {alert && <AIResponse response={alert} isAlert={true} />}
      </form>
    </div>
  );
}

// Add this new WelcomeHeader component
function WelcomeHeader() {
  return (
    <div className="welcome-header">
      <div className="welcome-header-content">
        <img src={childProtectionLogo} alt="Universal Aid Agent logo" className="welcome-logo" />
        <div className="welcome-text">
          <h1>Universal Aid Agent</h1>
          <p>A safe space to report concerns and get help for children, teens, young adults, and adults</p>
        </div>
      </div>
      <div className="welcome-image-row">
        <img src={illustrationOne} alt="Support illustration" className="welcome-image" />
        <img src={illustrationTwo} alt="Protection illustration" className="welcome-image" />
        <img src={illustrationThree} alt="Help illustration" className="welcome-image" />
      </div>
    </div>
  );
}

// Improved UserTypeSelector component with better UI and images
function UserTypeSelector({ userType, setUserType }) {
  const selectId = React.useId();

  return (
    <div className="user-type-selection-container">
      <WelcomeHeader />
      
      <div className="user-type-selector">
        <label htmlFor={selectId} className="user-type-label">I am a:</label>
        <select
          id={selectId}
          value={userType || ''}
          onChange={(e) => setUserType(e.target.value)}
          className="user-type-dropdown"
        >
          <option value="">Please select...</option>
          <option value="adult">Adult</option>
          <option value="teen">Teen or young adult (13-25)</option>
          <option value="child">Child reporting for myself</option>
        </select>
      </div>

      <div className="user-type-cards">
        {/* Adult card */}
        <div className={`user-type-card${userType === 'adult' ? ' selected' : ''}`}
             onClick={() => setUserType('adult')}>
          <img src={adultSupportIllustration} alt="Adult support" />
          <div className="card-label">
            <h3>I'm an adult</h3>
            <p>Report a concern about a child or self</p>
          </div>
        </div>
        {/* Teen/young adult card */}
        <div className={`user-type-card${userType === 'teen' ? ' selected' : ''}`}
             onClick={() => setUserType('teen')}>
          <img src={teenSupportIllustration} alt="Teen or young adult reporting" />
          <div className="card-label">
            <h3>I'm a teen/young adult</h3>
            <p>13-25 years old seeking help</p>
          </div>
        </div>
        {/* Child card */}
        <div className={`user-type-card${userType === 'child' ? ' selected' : ''}`}
             onClick={() => setUserType('child')}>
          <img src={illustrationThree} alt="Child reporting" />
          <div className="card-label">
            <h3>I'm a child</h3>
            <p>Reporting for myself</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrivacyPolicyModal({ show, onClose }) {
  const [policy, setPolicy] = useState("");
  useEffect(() => {
    if (show) {
      fetch("/privacy-policy.txt")
        .then(res => res.text())
        .then(setPolicy)
        .catch(() => setPolicy("Could not load privacy policy."));
    }
  }, [show]);
  if (!show) return null;
  return (
    <div role="dialog" aria-modal="true" tabIndex={-1} style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.45)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'#fff',borderRadius:12,maxWidth:600,width:'90vw',maxHeight:'80vh',overflowY:'auto',padding:32,boxShadow:'0 4px 24px rgba(0,0,0,0.18)',position:'relative'}}>
        <h2 style={{marginTop:0}}>Privacy Policy</h2>
        <pre style={{whiteSpace:'pre-wrap',fontFamily:'inherit',fontSize:16,marginBottom:24}}>{policy}</pre>
        <button onClick={onClose} style={{position:'absolute',top:16,right:16,background:'none',border:'none',fontSize:24,cursor:'pointer',color:'#3949ab'}} aria-label="Close privacy policy">✖️</button>
      </div>
    </div>
  );
}

// Main App component that will be rendered in main.jsx
function App() {
  // Only use state, no localStorage for reportingFor
  const [userType, setUserType] = useState("");
  const [reportingFor, setReportingFor] = useState(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [user, setUser] = useState(null);
  const [showJustificationModal, setShowJustificationModal] = useState(false);
  const [justificationEmail, setJustificationEmail] = useState("");
  const [justificationReason, setJustificationReason] = useState("");
  const [justificationError, setJustificationError] = useState("");
  const [justificationSuccess, setJustificationSuccess] = useState("");

  React.useEffect(() => {
    setUser(getAccount());
  }, []);

  // When userType changes, reset reportingFor
  useEffect(() => {
    setReportingFor(null);
  }, [userType]);

  const handleLogin = async () => {
    try {
      await login();
      setUser(getAccount());
    } catch (error) {
      // Ignore user_cancelled error (user closed popup)
      if (error && error.errorCode === 'user_cancelled') return;
      // Detect user not in tenant error
      if (error && error.errorMessage && error.errorMessage.includes('Selected user account does not exist in tenant')) {
        setShowJustificationModal(true);
        return;
      }
      alert("Login failed");
    }
  };

  async function handleJustificationSubmit(e) {
    e.preventDefault();
    setJustificationError("");
    setJustificationSuccess("");
    if (!justificationEmail || !justificationReason) {
      setJustificationError("Please provide your email and justification.");
      return;
    }
    try {
      // Send the justification to your email via a backend endpoint (to be implemented)
      await fetch('/api/guest-justification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: justificationEmail, reason: justificationReason })
      });
      setJustificationSuccess("Your request has been submitted. The admin will review and contact you if access is granted.");
      setJustificationEmail("");
      setJustificationReason("");
    } catch {
      setJustificationError("Failed to submit request. Please try again later.");
    }
  }

  // When user logs out, clear localStorage for userType/reportingFor
  const handleLogout = () => {
    logout();
    setUser(null);
    setUserType("");
    setReportingFor(null);
  };

  // Add a button to go back to the home page
  const handleGoHome = () => {
    setUserType("");
    setReportingFor(null);
  };

  // Show the user type selector if not chosen yet
  if (!userType) {
    return (
      <>
        <div style={{position:'absolute',top:10,right:10,zIndex:1000}}>
          {user ? (
            <>
              <span style={{marginRight:8}}>Signed in as: {user.username}</span>
              <button onClick={handleLogout} style={{background:'#e74c3c',color:'#fff',border:'none',borderRadius:8,padding:'6px 12px',cursor:'pointer'}}>Logout</button>
            </>
          ) : (
            <button onClick={handleLogin} style={{background:'#2d72d9',color:'#fff',border:'none',borderRadius:8,padding:'6px 12px',cursor:'pointer'}}>Login</button>
          )}
        </div>
        {/* Welcome message only, no logo/title */}
        <div style={{textAlign:'center',marginTop:40,marginBottom:24}}>
          <h1>Welcome!</h1>
          <p style={{fontSize:'1.2em',color:'#2d72d9',maxWidth:600,margin:'0 auto'}}>A safe space to report concerns and get help for children, teens, young adults, and adults</p>
        </div>
        {/* Important information with scroll bar */}
        <div style={{border:'1px solid #e0e0e0',borderRadius:8,padding:16,background:'#f9f9f9',margin:'0 auto 24px auto',maxWidth:600}}>
          <strong>Important information about this tool:</strong>
          <ul style={{textAlign:'left',marginTop:8}}>
            <li>This tool is for reporting and getting help for children, teens, and young adults.</li>
            <li>Your information is kept confidential and secure.</li>
            <li>If you are in immediate danger, please contact local emergency services.</li>
            <li>For privacy, do not share sensitive details unless you feel safe.</li>
            <li>Use the form to describe your situation and get recommendations.</li>
          </ul>
        </div>
        <UserTypeSelector userType={userType} setUserType={setUserType} />
        <TransparencyNote />
        <PrivacyPolicyModal show={showPrivacy} onClose={() => setShowPrivacy(false)} />
        {showJustificationModal && (
          <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.45)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <form onSubmit={handleJustificationSubmit} style={{background:'#fff',borderRadius:12,maxWidth:400,width:'90vw',padding:32,boxShadow:'0 4px 24px rgba(0,0,0,0.18)',position:'relative',display:'flex',flexDirection:'column',gap:16}}>
              <h2 style={{marginTop:0}}>Request Access</h2>
              <p style={{marginBottom:0}}>Your account is not in our system. Please provide your email and a brief justification for access. The admin will review your request.</p>
              <input type="email" placeholder="Your email" value={justificationEmail} onChange={e=>setJustificationEmail(e.target.value)} required style={{padding:8,borderRadius:6,border:'1px solid #ccc'}} />
              <textarea placeholder="Justification (why do you need access?)" value={justificationReason} onChange={e=>setJustificationReason(e.target.value)} required style={{padding:8,borderRadius:6,border:'1px solid #ccc',minHeight:80}} />
              {justificationError && <div style={{color:'#e74c3c'}}>{justificationError}</div>}
              {justificationSuccess && <div style={{color:'#27ae60'}}>{justificationSuccess}</div>}
              <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
                <button type="button" onClick={()=>setShowJustificationModal(false)} style={{background:'#e0e0e0',color:'#2d72d9',border:'none',borderRadius:8,padding:'8px 16px',cursor:'pointer'}}>Cancel</button>
                <button type="submit" style={{background:'#2d72d9',color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',cursor:'pointer'}}>Submit</button>
              </div>
            </form>
          </div>
        )}
      </>
    );
  }

  // If adult or teen, but not yet selected reportingFor, show the reportingFor selector
  if ((userType === 'adult' || userType === 'teen') && !reportingFor) {
    return (
      <div className="reporting-for-selector" style={{maxWidth:500,margin:'60px auto',padding:32,background:'#fff',borderRadius:12,boxShadow:'0 2px 12px rgba(45,114,217,0.08)'}}>
        <h2>Who are you reporting for?</h2>
        <div style={{display:'flex',gap:24,marginTop:24,justifyContent:'center'}}>
          <button onClick={() => setReportingFor('self')} style={{padding:'18px 32px',fontSize:18,borderRadius:8,border:'2px solid #2d72d9',background:'#eaf6ff',color:'#2d72d9',cursor:'pointer'}}>Myself</button>
          <button onClick={() => setReportingFor('child')} style={{padding:'18px 32px',fontSize:18,borderRadius:8,border:'2px solid #2d72d9',background:'#eaf6ff',color:'#2d72d9',cursor:'pointer'}}>A child</button>
        </div>
        <button onClick={() => setUserType("")} style={{marginTop:32,background:'#e0e0e0',color:'#2d72d9',border:'none',borderRadius:8,padding:'8px 16px',cursor:'pointer'}}>Back</button>
      </div>
    );
  }

  // Show the combined form for the selected user type
  return (
    <>
      <div style={{position:'absolute',top:10,right:10,zIndex:1000}}>
        {user ? (
          <>
            <span style={{marginRight:8}}>Signed in as: {user.username}</span>
            <button onClick={handleLogout} style={{background:'#e74c3c',color:'#fff',border:'none',borderRadius:8,padding:'6px 12px',cursor:'pointer'}}>Logout</button>
          </>
        ) : (
          <button onClick={handleLogin} style={{background:'#2d72d9',color:'#fff',border:'none',borderRadius:8,padding:'6px 12px',cursor:'pointer'}}>Login</button>
        )}
      </div>
      {/* Home button */}
      <button onClick={handleGoHome} style={{position:'absolute',top:10,left:10,zIndex:1000,background:'#e0e0e0',color:'#2d72d9',border:'none',borderRadius:8,padding:'6px 16px',cursor:'pointer'}}>Home</button>
      <CombinedForm userType={userType} setUserType={setUserType} reportingFor={reportingFor} />
      <TransparencyNote />
      <PrivacyPolicyModal show={showPrivacy} onClose={() => setShowPrivacy(false)} />
      {showJustificationModal && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.45)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <form onSubmit={handleJustificationSubmit} style={{background:'#fff',borderRadius:12,maxWidth:400,width:'90vw',padding:32,boxShadow:'0 4px 24px rgba(0,0,0,0.18)',position:'relative',display:'flex',flexDirection:'column',gap:16}}>
            <h2 style={{marginTop:0}}>Request Access</h2>
            <p style={{marginBottom:0}}>Your account is not in our system. Please provide your email and a brief justification for access. The admin will review your request.</p>
            <input type="email" placeholder="Your email" value={justificationEmail} onChange={e=>setJustificationEmail(e.target.value)} required style={{padding:8,borderRadius:6,border:'1px solid #ccc'}} />
            <textarea placeholder="Justification (why do you need access?)" value={justificationReason} onChange={e=>setJustificationReason(e.target.value)} required style={{padding:8,borderRadius:6,border:'1px solid #ccc',minHeight:80}} />
            {justificationError && <div style={{color:'#e74c3c'}}>{justificationError}</div>}
            {justificationSuccess && <div style={{color:'#27ae60'}}>{justificationSuccess}</div>}
            <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
              <button type="button" onClick={()=>setShowJustificationModal(false)} style={{background:'#e0e0e0',color:'#2d72d9',border:'none',borderRadius:8,padding:'8px 16px',cursor:'pointer'}}>Cancel</button>
              <button type="submit" style={{background:'#2d72d9',color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',cursor:'pointer'}}>Submit</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default App;