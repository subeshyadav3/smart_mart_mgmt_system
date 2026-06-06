export default function Modal({ open, title, description, onClose, children, footer }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 id="modal-title" className="modal-title">{title}</h3>
            {description ? <p className="modal-description">{description}</p> : null}
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>
        <div className="modal-content">{children}</div>
        {footer ? <div className="modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
}
