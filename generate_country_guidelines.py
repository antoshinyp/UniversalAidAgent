import requests
import json
from bs4 import BeautifulSoup

# Wikipedia URLs
AGENCIES_URL = "https://en.wikipedia.org/wiki/List_of_child_protection_agencies"
EMERGENCY_URL = "https://en.wikipedia.org/wiki/List_of_emergency_telephone_numbers"

# Fetch child protection agencies
agency_resp = requests.get(AGENCIES_URL)
agency_soup = BeautifulSoup(agency_resp.text, "html.parser")

country_guidelines = {}

# Parse agency tables
for ul in agency_soup.select("h2 ~ ul"):
    prev = ul.find_previous_sibling()
    while prev and prev.name != 'h2':
        prev = prev.find_previous_sibling()
    if prev and prev.name == 'h2':
        country = prev.text.replace('[edit]', '').strip()
        agencies = [li.get_text(strip=True) for li in ul.find_all('li')]
        if agencies:
            country_guidelines[country] = f"Child protection agencies: {', '.join(agencies)}."

# Fetch emergency numbers
emerg_resp = requests.get(EMERGENCY_URL)
emerg_soup = BeautifulSoup(emerg_resp.text, "html.parser")
for table in emerg_soup.find_all("table", {"class": "wikitable"}):
    for row in table.find_all("tr")[1:]:
        cols = row.find_all(["td", "th"])
        if len(cols) < 2:
            continue
        country = cols[0].get_text(strip=True).split("[")[0].strip()
        numbers = cols[1].get_text(" ", strip=True)
        if country and numbers:
            if country in country_guidelines:
                country_guidelines[country] += f" Emergency number(s): {numbers}."
            else:
                country_guidelines[country] = f"Emergency number(s): {numbers}."

# Save as Python dict for main.py
with open("country_guidelines.json", "w", encoding="utf-8") as f:
    json.dump(country_guidelines, f, ensure_ascii=False, indent=2)

print(f"Generated guidelines for {len(country_guidelines)} countries in country_guidelines.json")
