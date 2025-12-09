import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import '../../App.css';

export default function TourGuide({ steps, isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [targetRect, setTargetRect] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const step = steps[currentStep];
    const element = document.querySelector(step.selector);

    // Scroll to element once when step changes
    if (element) {
      // Use setTimeout to allow layout to stabilize and ensure scroll happens
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      }, 100);
    }

    const updatePosition = () => {
      const element = document.querySelector(step.selector);

      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
        
        // Calculate position for the tooltip (default to right, fallback to bottom/left)
        // Simple positioning: to the right of the element if space permits, else bottom
        const spaceRight = window.innerWidth - rect.right;
        const spaceBottom = window.innerHeight - rect.bottom;
        
        let top = rect.top + window.scrollY;
        let left = rect.right + window.scrollX + 20; // 20px gap

        // Vertical adjustment for elements near the bottom
        const tooltipHeight = 300; // Estimated max height of tooltip
        if (rect.top + tooltipHeight > window.innerHeight) {
             // Shift up to align bottom of tooltip with bottom of element (or slightly higher)
             // This prevents the tooltip from being cut off at the bottom of the screen
             top = Math.max(10, rect.bottom + window.scrollY - tooltipHeight);
        }

        // If not enough space on right, move to bottom (unless we just shifted up because of bottom edge)
        // Only move to bottom if there is actually space at the bottom
        if (spaceRight < 320 && spaceBottom > 250) {
             top = rect.bottom + window.scrollY + 20;
             left = rect.left + window.scrollX;
        }
        
        // Ensure it doesn't go off screen horizontally
        if (left + 320 > window.innerWidth) {
            left = window.innerWidth - 340; // 320 width + 20 padding
            if (left < 10) left = 10;
        }

        setPosition({ top, left });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true); // Capture to detect scroll in containers

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [currentStep, isOpen, steps]);

  if (!isOpen) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  return createPortal(
    <>
      <div className="tour-overlay" />
      
      {/* Highlight effect */}
      {targetRect && (
        <div 
          className="tour-highlight"
          style={{
            top: targetRect.top + window.scrollY - 4,
            left: targetRect.left + window.scrollX - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
        />
      )}

      <div 
        className="tour-tooltip"
        style={{
          top: position.top,
          left: position.left,
        }}
      >
        <div className="tour-header">
          <span className="tour-step-badge">{currentStep + 1} / {steps.length}</span>
          <button className="tour-close" onClick={onClose}>&times;</button>
        </div>
        <h3 className="tour-title">{step.title}</h3>
        <p className="tour-content">{step.content}</p>
        <div className="tour-footer">
          <button 
            className="tour-btn secondary" 
            onClick={handlePrev} 
            disabled={currentStep === 0}
          >
            Wstecz
          </button>
          <button 
            className="tour-btn primary" 
            onClick={handleNext}
          >
            {isLastStep ? 'Zakończ' : 'Dalej'}
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}
