import React from "react";
import { FaExclamationTriangle, FaPhone, FaFileUpload, FaInfoCircle } from "react-icons/fa";

export default function NeedsAttachmentsSection({
  immediateNeeds,
  setImmediateNeeds,
  reportContact,
  setReportContact,
  attachments,
  setAttachments,
  setShowPrivacy
}) {
  return (
    <div style={{background:'#fff', borderRadius:12, boxShadow:'0 1px 4px rgba(45,114,217,0.06)', marginBottom:16, padding:'1.5em', border:'1.5px solid #e0e0e0', display:'flex', flexDirection:'column', gap:20}}>
      <label htmlFor="immediate-needs"><FaExclamationTriangle style={{marginRight:4}}/>Any Immediate Needs? (optional)</label>
      <input id="immediate-needs" type="text" value={immediateNeeds} onChange={e => setImmediateNeeds(e.target.value)} placeholder="Medical, shelter, food, legal, etc." aria-label="Any Immediate Needs (optional)" aria-required={false} />
      <label htmlFor="report-contact"><FaPhone style={{marginRight:4}}/>Contact Information for Follow-up (optional)</label>
      <input id="report-contact" type="text" value={reportContact} onChange={e => setReportContact(e.target.value)} placeholder="Phone or email (optional)" aria-label="Contact Information for Follow-up (optional)" aria-required={false} />
      <details style={{marginBottom:12}}>
        <summary style={{fontWeight:600, cursor:'pointer'}}>Attachments <span style={{color:'#888',fontWeight:400}}>(optional)</span></summary>
        <label htmlFor="attachments"><FaFileUpload style={{marginRight:4}}/>Upload images, screenshots, or documents that help explain what happened (e.g., photos of injuries, screenshots of messages, or other evidence). Max 5MB each, up to 3 files.</label>
        <input id="attachments" type="file" accept="image/*,application/pdf" multiple onChange={e => { const files = Array.from(e.target.files).slice(0, 3); setAttachments(files); }} aria-label="Attachments (optional)" aria-required={false} />
      </details>
      <div style={{marginBottom:12}}>
        <input id="privacy-consent" type="checkbox" required={false} aria-required={false} style={{marginRight:8}} />
        <label htmlFor="privacy-consent"><FaInfoCircle style={{marginRight:4}}/>I have read and agree to the <button type="button" style={{color:'#3949ab', textDecoration:'underline', background:'none', border:'none', cursor:'pointer', padding:0}} onClick={() => setShowPrivacy(true)}>privacy policy</button>.</label>
      </div>
    </div>
  );
}
