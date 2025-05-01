import React, { useState, useEffect } from 'react';
import './AccessibilityPanel.css';

/**
 * AccessibilityPanel Component
 * 
 * This component provides accessibility controls to enhance the user experience
 * for people with various needs, supporting inclusive design principles.
 */
function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const [simpleUI, setSimpleUI] = useState(false);
  const [readAloud, setReadAloud] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState(1);
  
  // Speech synthesis setup
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Apply font size changes
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);
  
  // Apply high contrast mode
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast]);
  
  // Apply simplified UI
  useEffect(() => {
    if (simpleUI) {
      document.body.classList.add('simple-ui');
    } else {
      document.body.classList.remove('simple-ui');
    }
  }, [simpleUI]);
  
  // Screen reader functionality
  const handleReadAloud = (startReading) => {
    if (!synth) return;
    
    if (startReading) {
      // Stop any current speech
      synth.cancel();
      
      // Get main content text
      const mainContent = document.querySelector('main') || document.body;
      const textToRead = mainContent.textContent || '';
      
      // Create utterance
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = voiceSpeed;
      
      // Start speaking
      synth.speak(utterance);
      setIsSpeaking(true);
      
      // Set up event for when speaking finishes
      utterance.onend = () => {
        setIsSpeaking(false);
        setReadAloud(false);
      };
    } else {
      // Stop speaking
      synth.cancel();
      setIsSpeaking(false);
    }
  };
  
  // Update read aloud state
  useEffect(() => {
    handleReadAloud(readAloud);
    return () => {
      if (synth) synth.cancel();
    };
  }, [readAloud, voiceSpeed]);
  
  return (
    <div className={`accessibility-panel ${isOpen ? 'open' : ''}`}>
      <button 
        className="accessibility-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Accessibility options"
      >
        <span role="img" aria-hidden="true">♿</span>
        <span className="sr-only">Accessibility Options</span>
      </button>
      
      {isOpen && (
        <div className="accessibility-controls">
          <h3>Accessibility Options</h3>
          
          <div className="control-group">
            <label htmlFor="font-size">Text Size</label>
            <div className="control-buttons">
              <button 
                onClick={() => setFontSize(Math.max(80, fontSize - 10))}
                aria-label="Decrease text size"
              >
                A-
              </button>
              <span>{fontSize}%</span>
              <button 
                onClick={() => setFontSize(Math.min(150, fontSize + 10))}
                aria-label="Increase text size"
              >
                A+
              </button>
            </div>
          </div>
          
          <div className="control-group">
            <label htmlFor="high-contrast">
              <input
                type="checkbox"
                id="high-contrast"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
              />
              High Contrast
            </label>
          </div>
          
          <div className="control-group">
            <label htmlFor="simple-ui">
              <input
                type="checkbox"
                id="simple-ui"
                checked={simpleUI}
                onChange={(e) => setSimpleUI(e.target.checked)}
              />
              Simplified Interface
            </label>
          </div>
          
          <div className="control-group">
            <label htmlFor="read-aloud">
              <input
                type="checkbox"
                id="read-aloud"
                checked={readAloud}
                onChange={(e) => setReadAloud(e.target.checked)}
              />
              Read Page Aloud {isSpeaking && "(Speaking...)"}
            </label>
            
            {readAloud && (
              <div className="voice-speed">
                <label htmlFor="voice-speed">Reading Speed</label>
                <input
                  type="range"
                  id="voice-speed"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={voiceSpeed}
                  onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                />
                <span>{voiceSpeed}x</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AccessibilityPanel;