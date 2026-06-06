export default function Select({ label, hint, className = '', error, children, ...props }) {
  return (
    <label className={`field ${className}`.trim()}>
      {label ? <span className="field-label">{label}</span> : null}
      <select className={`input select ${error ? 'input-error' : ''}`.trim()} {...props}>
        {children}
      </select>
      {hint ? <span className="field-hint">{hint}</span> : null}
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}
