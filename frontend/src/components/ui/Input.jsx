export default function Input({ label, hint, className = '', error, ...props }) {
  return (
    <label className={`field ${className}`.trim()}>
      {label ? <span className="field-label">{label}</span> : null}
      <input className={`input ${error ? 'input-error' : ''}`.trim()} {...props} />
      {hint ? <span className="field-hint">{hint}</span> : null}
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}
