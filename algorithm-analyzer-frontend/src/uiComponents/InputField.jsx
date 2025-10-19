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

