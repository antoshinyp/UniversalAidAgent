import React from "react";
import { FaHome, FaUser, FaInfoCircle } from "react-icons/fa";
import ReactSelect from "react-select";
import "./FamilySocialSection.css";

export default function FamilySocialSection({
  livingArrangement,
  setLivingArrangement,
  parentSituation,
  setParentSituation,
  additionalContext,
  setAdditionalContext,
  userType
}) {
  return (
    <div className="family-social-section">
      <label htmlFor="living-arrangement"><FaHome />Living Arrangement</label>
      <ReactSelect
        inputId="living-arrangement"
        value={[
          { value: '', label: 'Select...' },
          { value: 'with_parents', label: 'With parents' },
          { value: 'with_guardian', label: 'With guardian' },
          { value: 'with_relatives', label: 'With relatives' },
          { value: 'foster_care', label: 'Foster care' },
          { value: 'institution', label: 'Institution' },
          { value: 'street', label: 'Street' },
          { value: 'other', label: 'Other' }
        ].find(opt => opt.value === livingArrangement) || { value: '', label: 'Select...' }}
        onChange={opt => setLivingArrangement(opt ? opt.value : '')}
        options={[
          { value: '', label: 'Select...' },
          { value: 'with_parents', label: 'With parents' },
          { value: 'with_guardian', label: 'With guardian' },
          { value: 'with_relatives', label: 'With relatives' },
          { value: 'foster_care', label: 'Foster care' },
          { value: 'institution', label: 'Institution' },
          { value: 'street', label: 'Street' },
          { value: 'other', label: 'Other' }
        ]}
        placeholder="Search or select..."
        isClearable={true}
        isSearchable={true}
        aria-label="Living Arrangement"
      />
      <label htmlFor="parent-situation"><FaUser />Parent/Guardian Situation</label>
      <ReactSelect
        inputId="parent-situation"
        value={[
          { value: '', label: 'Select...' },
          { value: 'supportive', label: 'Supportive' },
          { value: 'absent', label: 'Absent' },
          { value: 'abusive', label: 'Abusive' },
          { value: 'drug_alcohol', label: 'Drug/Alcohol Influence' },
          { value: 'unknown', label: 'Unknown' },
          { value: 'other', label: 'Other' }
        ].find(opt => opt.value === parentSituation) || { value: '', label: 'Select...' }}
        onChange={opt => setParentSituation(opt ? opt.value : '')}
        options={[
          { value: '', label: 'Select...' },
          { value: 'supportive', label: 'Supportive' },
          { value: 'absent', label: 'Absent' },
          { value: 'abusive', label: 'Abusive' },
          { value: 'drug_alcohol', label: 'Drug/Alcohol Influence' },
          { value: 'unknown', label: 'Unknown' },
          { value: 'other', label: 'Other' }
        ]}
        placeholder="Search or select..."
        isClearable={true}
        isSearchable={true}
        aria-label="Parent or Guardian Situation"
      />
      <details>
        <summary>Additional Context (siblings, relatives, friends, etc.) <span>(optional)</span></summary>
        <label htmlFor="additional-context"><FaInfoCircle />Add any extra details about the child's family, siblings, relatives, or friends (optional)</label>
        <textarea id="additional-context" value={additionalContext} onChange={e => setAdditionalContext(e.target.value)} placeholder="Add any extra details..." rows={2} aria-label="Additional Context" />
      </details>
    </div>
  );
}
