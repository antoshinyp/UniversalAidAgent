import React from "react";
import { FaUser } from "react-icons/fa";
import ReactSelect from "react-select";
import VoiceInput from "./App.jsx";

export default function PerpetratorReportingSection({
  perpetratorInfo,
  setPerpetratorInfo,
  reportedBefore,
  setReportedBefore,
  agenciesInvolved,
  setAgenciesInvolved,
  userType
}) {
  // Clean, minimal section with child-friendly language
  return (
    <div style={{background:'#fff', borderRadius:12, boxShadow:'0 1px 4px rgba(45,114,217,0.06)', marginBottom:16, padding:'1.5em', border:'1.5px solid #e0e0e0', display:'flex', flexDirection:'column', gap:20}}>
      <label htmlFor="perpetrator-info">
        <FaUser style={{marginRight:4}}/>
        {userType === 'child' 
          ? 'The person who caused the problem' 
          : 'Person responsible for harming the child'}
        <span style={{color:'#888', fontWeight:400, marginLeft:4}}>(optional)</span>
      </label>
      <VoiceInput
        as="input"
        id="perpetrator-info"
        value={perpetratorInfo}
        onChange={e => setPerpetratorInfo(e.target.value)}
        placeholder={userType === 'child' 
          ? 'Tell us about the person who hurt you or made you feel unsafe (you can skip this)' 
          : 'Name, relationship to the child, or any identifying information (optional)'}
        aria-label={userType === 'child' 
          ? 'The person who caused the problem (optional)' 
          : 'Person responsible for harming the child (optional)'}
        aria-required={false}
        style={{marginBottom:8}}
      />
      <label htmlFor="reported-before">
        {userType === 'child' 
          ? 'Did you tell anyone about this before?' 
          : 'Has this been reported before?'} 
        <span style={{color:'#888', fontWeight:400}}>(optional)</span>
      </label>
      <ReactSelect
        inputId="reported-before"
        value={[
          { value: '', label: 'Select...' },
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'unknown', label: userType === 'child' ? 'I\'m not sure' : 'Unknown' }
        ].find(opt => opt.value === reportedBefore) || { value: '', label: 'Select...' }}
        onChange={opt => setReportedBefore(opt ? opt.value : '')}
        options={[
          { value: '', label: 'Select...' },
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'unknown', label: userType === 'child' ? 'I\'m not sure' : 'Unknown' }
        ]}
        placeholder="Search or select..."
        isClearable={true}
        isSearchable={true}
        aria-label={userType === 'child' 
          ? 'Did you tell anyone about this before? (optional)' 
          : 'Has this been reported before? (optional)'}
        aria-required={false}
      />
      <label htmlFor="agencies-involved">
        {userType === 'child' 
          ? 'Are there any helpers or groups already helping you?' 
          : 'Organizations or people already involved'} 
        <span style={{color:'#888', fontWeight:400}}>(optional)</span>
      </label>
      <input 
        id="agencies-involved" 
        type="text" 
        value={agenciesInvolved} 
        onChange={e => setAgenciesInvolved(e.target.value)} 
        placeholder={userType === 'child' ? "Like police, teachers, or doctors (you can skip this)" : "Type or skip"} 
        aria-label={userType === 'child' 
          ? 'Are there any helpers or groups already helping you? (optional)' 
          : 'Organizations or people already involved (optional)'} 
        aria-required={false} 
      />
    </div>
  );
}
