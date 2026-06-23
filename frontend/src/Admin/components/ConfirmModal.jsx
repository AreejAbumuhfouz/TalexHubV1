/* ═══════════════════════════════════════════════════════════
   CONFIRM MODAL
═══════════════════════════════════════════════════════════ */
export const ConfirmModal = ({ open, onClose, onConfirm, message, danger = false, loading = false }) => (
  <AdminModal open={open} onClose={onClose} title="Confirm" width={380}
    footer={<>
      <button onClick={onClose} style={{ ...C.btn, ...C.btnGhost }}>Cancel</button>
      <button onClick={onConfirm} disabled={loading}
        style={{ ...C.btn, ...(danger ? C.btnDanger : C.btnPrimary), opacity: loading ? 0.7 : 1 }}>
        {loading ? 'Processing...' : 'Confirm'}
      </button>
    </>}>
    <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7 }}>{message}</p>
  </AdminModal>
);