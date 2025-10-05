import React from "react";

export default function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  error = "",
  step,
  min,
  max,
  checkbox = false,
}) {
  return (
    <div className="controls-input-group">
      <label className="controls-label">{label}</label>

      {checkbox ? (
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          className="controls-checkbox"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="controls-input"
          step={step}
          min={min}
          max={max}
        />
      )}

      {error && <p className="controls-error">{error}</p>}
    </div>
  );
}
