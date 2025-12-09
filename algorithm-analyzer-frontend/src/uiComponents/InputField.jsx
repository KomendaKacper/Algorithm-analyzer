import React from 'react';
import '../App.css'; 

export default function InputField({
  label,
  description,
  type = "text",
  value,
  onChange,
  error = "",
  step,
  min,
  max,
  // --- ZMIANA: Prop do obsługi checkboxa ---
  isCheckbox = false,
}) {
  return (
    // --- ZMIANA: Dynamiczna klasa dla grupy checkboxa ---
    <div className={`form-group ${isCheckbox ? 'checkbox-group' : ''}`}>
      <label>
        {label}
        {description && <span className="tooltip" data-tooltip={description}>?</span>}
      </label>
      
      {/* --- ZMIANA: Logika renderowania checkboxa --- */}
      {isCheckbox ? (
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          className="checkbox-input"
        />
      ) : type === "number" ? (
        <div className="number-input-wrapper">
          <input
            type="number"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className={`input ${error ? "input-error" : ""}`}
            step={step}
            min={min}
            max={max}
          />
          <div className="number-controls">
            <button 
              type="button"
              className="number-control-btn" 
              tabIndex="-1"
              onClick={() => {
                const currentVal = value === "" ? 0 : parseFloat(value);
                const stepVal = step ? parseFloat(step) : 1;
                // Fix floating point precision issues
                const precision = stepVal.toString().split('.')[1]?.length || 0;
                let newVal = currentVal + stepVal;
                if (precision > 0) newVal = parseFloat(newVal.toFixed(precision));
                
                if (max !== undefined && newVal > max) return;
                onChange(newVal);
              }}
            >▲</button>
            <button 
              type="button"
              className="number-control-btn" 
              tabIndex="-1"
              onClick={() => {
                const currentVal = value === "" ? 0 : parseFloat(value);
                const stepVal = step ? parseFloat(step) : 1;
                // Fix floating point precision issues
                const precision = stepVal.toString().split('.')[1]?.length || 0;
                let newVal = currentVal - stepVal;
                if (precision > 0) newVal = parseFloat(newVal.toFixed(precision));

                if (min !== undefined && newVal < min) return;
                onChange(newVal);
              }}
            >▼</button>
          </div>
        </div>
      ) : (
        <input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={`input ${error ? "input-error" : ""}`}
          step={step}
          min={min}
          max={max}
        />
      )}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

