import React, { useState } from 'react';
import './TransparencyNote.css';

/**
 * TransparencyNote Component
 * 
 * This component presents important information about the app's purpose, data handling,
 * and limitations in an accessible, collapsible format.
 */
function TransparencyNote() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="transparency-note">
      <div className="transparency-header" onClick={() => setIsOpen(!isOpen)}>
        <h3>
          Important Information About This Tool
          <span>{isOpen ? '▲' : '▼'}</span>
        </h3>
      </div>
      
      {isOpen && (
        <div className="transparency-content">
          <section>
            <h4>Purpose and Intended Use</h4>
            <p>Universal Aid Agent is designed to help children, teens, and adults report concerns about child welfare and safety. 
            This tool provides guidance based on input information but does not replace professional human intervention.</p>
          </section>
          
          <section>
            <h4>Data Collection and Privacy</h4>
            <p>Information you provide is used only to generate appropriate recommendations and connect you with relevant resources. Your privacy is paramount:</p>
            <ul>
              <li>We collect only information necessary to assist you</li>
              <li>All data is encrypted and stored securely</li>
              <li>Personal identifiers are handled according to international child protection standards</li>
              <li>We follow GDPR, COPPA, and other relevant privacy regulations</li>
            </ul>
          </section>

          <section>
            <h4>Limitations</h4>
            <p>While we strive to provide relevant assistance, please be aware:</p>
            <ul>
              <li>This is not an emergency response system - in emergencies, contact local emergency services immediately</li>
              <li>Recommendations are generated based on available information and may not account for all factors in complex situations</li>
              <li>This tool connects you with resources but cannot intervene directly in situations</li>
              <li>Information may not be fully accurate in all regions or for all circumstances</li>
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}

export default TransparencyNote;