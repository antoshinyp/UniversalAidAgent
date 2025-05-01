import { useMemo } from "react";
import { COUNTRY_CONTACTS } from "../country_contacts";

/**
 * Provides dropdown options while ensuring cultural and geographic diversity
 * with bias-mitigated options for reporting across different regions.
 */
export function useDropdownOptions() {
  const COUNTRY_OPTIONS = useMemo(() => [
    // Major regions representation with diverse geographic distribution
    { value: 'us', label: 'United States' },
    { value: 'gb', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' },
    { value: 'au', label: 'Australia' },
    { value: 'in', label: 'India' },
    { value: 'ng', label: 'Nigeria' },
    { value: 'za', label: 'South Africa' },
    { value: 'br', label: 'Brazil' },
    { value: 'mx', label: 'Mexico' },
    { value: 'fr', label: 'France' },
    { value: 'de', label: 'Germany' },
    { value: 'eg', label: 'Egypt' },
    { value: 'ke', label: 'Kenya' },
    { value: 'cn', label: 'China' },
    { value: 'jp', label: 'Japan' },
    { value: 'kr', label: 'South Korea' },
    { value: 'sa', label: 'Saudi Arabia' },
    { value: 'ae', label: 'United Arab Emirates' },
    { value: 'ru', label: 'Russia' },
    { value: 'pk', label: 'Pakistan' },
    { value: 'bd', label: 'Bangladesh' },
    { value: 'id', label: 'Indonesia' },
    { value: 'th', label: 'Thailand' },
    { value: 'vn', label: 'Vietnam' },
    { value: 'ph', label: 'Philippines' },
    { value: 'il', label: 'Israel' },
    { value: 'ps', label: 'Palestine' },
    { value: 'tr', label: 'Turkey' },
    { value: 'ir', label: 'Iran' },
    { value: 'ua', label: 'Ukraine' },
    // Add more diverse countries from all continents
  ].sort((a, b) => a.label.localeCompare(b.label)), []);
  
  const LANGUAGE_OPTIONS = useMemo(() => [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish (Español)' },
    { value: 'fr', label: 'French (Français)' },
    { value: 'ar', label: 'Arabic (العربية)' },
    { value: 'zh', label: 'Chinese (中文)' },
    { value: 'ru', label: 'Russian (Русский)' },
    { value: 'hi', label: 'Hindi (हिन्दी)' },
    { value: 'bn', label: 'Bengali (বাংলা)' },
    { value: 'pt', label: 'Portuguese (Português)' },
    { value: 'de', label: 'German (Deutsch)' },
    { value: 'ja', label: 'Japanese (日本語)' },
    { value: 'tr', label: 'Turkish (Türkçe)' },
    { value: 'ko', label: 'Korean (한국어)' },
    { value: 'ur', label: 'Urdu (اردو)' },
    { value: 'fa', label: 'Persian (فارسی)' },
    { value: 'vi', label: 'Vietnamese (Tiếng Việt)' },
    { value: 'ta', label: 'Tamil (தமிழ்)' },
    { value: 'sw', label: 'Swahili (Kiswahili)' },
    { value: 'he', label: 'Hebrew (עברית)' },
    { value: 'th', label: 'Thai (ไทย)' },
    // Ensure representation across major world languages
  ].sort((a, b) => a.label.localeCompare(b.label)), []);

  // Static religion options
  const RELIGIONS = useMemo(() => [
    { value: '', label: 'Select...' },
    { value: 'christianity', label: 'Christianity' },
    { value: 'islam', label: 'Islam' },
    { value: 'hinduism', label: 'Hinduism' },
    { value: 'buddhism', label: 'Buddhism' },
    { value: 'sikhism', label: 'Sikhism' },
    { value: 'judaism', label: 'Judaism' },
    { value: 'folk', label: 'Folk/Traditional' },
    { value: 'other', label: 'Other' },
    { value: 'none', label: 'None/Prefer not to say' }
  ], []);

  return { COUNTRY_OPTIONS, LANGUAGE_OPTIONS, RELIGIONS };
}
