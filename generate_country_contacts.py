import requests
import json
from bs4 import BeautifulSoup

# Fetch Wikipedia page with emergency numbers
URL = "https://en.wikipedia.org/wiki/List_of_emergency_telephone_numbers"
response = requests.get(URL)
soup = BeautifulSoup(response.text, "html.parser")

country_contacts = {}
tables = soup.find_all("table", {"class": "wikitable"})

for table in tables:
    for row in table.find_all("tr")[1:]:
        cols = row.find_all(["td", "th"])
        if len(cols) < 2:
            continue
        country = cols[0].get_text(strip=True)
        numbers = cols[1].get_text(" ", strip=True)
        # Clean up country name (remove footnotes)
        country = country.split("[")[0].strip()
        # Only add if country and numbers are valid
        if country and numbers:
            country_contacts[country] = numbers

# Save as JS object for React
with open("frontend/src/country_contacts.js", "w", encoding="utf-8") as f:
    f.write("// Auto-generated country emergency contacts\n")
    f.write("export const COUNTRY_CONTACTS = ")
    json.dump(country_contacts, f, ensure_ascii=False, indent=2)
    f.write(";\n")

print(f"Generated {len(country_contacts)} country contacts in frontend/src/country_contacts.js")
