import Modal from "./Modal";

const ConfirmDialog = ({ open, onClose, onConfirm, title, message, confirmLabel = "Delete", danger = true, loading }) => (
    <Modal
        open={open}
        onClose={onClose}
        title={title}
        size="sm"
        footer={
            <>
                <button className="btn btn-ghost" onClick={onClose}>
                    Cancel
                </button>
                <button className={`btn ${danger ? "btn-error" : "btn-primary"}`} onClick={onConfirm} disabled={loading}>
                    {loading && <span className="loading loading-spinner loading-sm" />}
                    {confirmLabel}
                </button>
            </>
        }
    >
        <p className="text-muted">{message}</p>
    </Modal>
);

export default ConfirmDialog;
