type ConfirmExitModalProps = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmExitModal = ({
  title,
  message,
  confirmLabel,
  cancelLabel = 'Continua a giocare',
  onConfirm,
  onCancel,
}: ConfirmExitModalProps) => (
  <div className="modal-backdrop" role="presentation">
    <section className="result-modal confirm-exit-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-exit-title">
      <p className="eyebrow">Pausa</p>
      <h2 id="confirm-exit-title">{title}</h2>
      <p>{message}</p>
      <div className="modal-actions">
        <button className="ghost-action wide" type="button" onClick={onCancel}>
          {cancelLabel}
        </button>
        <button className="danger-action wide" type="button" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </section>
  </div>
);
