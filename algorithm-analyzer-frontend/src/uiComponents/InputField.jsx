import "../App.css";

export default function InputField({
  label,
  type = "text",
  value,
  onChange,
  error = "",
  step,
  min,
  max,
  checkbox = false,
}) {
  return (
    <div>
      <div className="input-group">
        <label>{label}</label>

        {checkbox ? (
          <input
            type="checkbox"
            checked={!!value} // zawsze boolean
            onChange={(e) => onChange(e.target.checked)}
            className="input-field"
          />
        ) : (
          <input
            type={type}
            value={value ?? ""} // jeśli undefined, ustaw ""
            onChange={(e) => onChange(e.target.value)}
            className={`controls-input ${error ? "input-error" : ""}`}
            step={step}
            min={min}
            max={max}
          />
        )}
      </div>

      {error && <p className="input-error-text">{error}</p>}
    </div>
  );
}
