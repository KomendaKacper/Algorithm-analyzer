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
    <div className="input-group">
      <label>{label}</label>

      {checkbox ? (
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          className="input-field"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
