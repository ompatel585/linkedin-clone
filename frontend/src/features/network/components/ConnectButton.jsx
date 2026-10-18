import { useState } from "react";
import toast from "react-hot-toast";
import { Check, Clock, UserCheck, UserPlus } from "lucide-react";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { cn } from "../../../lib/utils";
import {
    useAcceptRequest,
    useConnectionStatus,
    useRejectRequest,
    useRemoveConnection,
    useSendRequest,
    useWithdrawRequest,
} from "../api";

// Status-aware connect button: Connect → Pending (withdraw) → Accept/Ignore → Connected (remove)
const ConnectButton = ({ userId, initialStatus, size = "sm", className }) => {
    const { data, isPending } = useConnectionStatus(userId, !initialStatus);
    // Local result of the last action, so the button updates before refetches land
    const [override, setOverride] = useState(null);
    const status = override ?? (initialStatus ? { status: initialStatus } : data);
    const [confirmRemove, setConfirmRemove] = useState(false);
    const settle = (next, message) => () => {
        setOverride({ status: next });
        if (message) toast.success(message);
    };

    const send = useSendRequest();
    const withdraw = useWithdrawRequest();
    const accept = useAcceptRequest();
    const reject = useRejectRequest();
    const remove = useRemoveConnection();

    const busy = send.isPending || withdraw.isPending || accept.isPending || reject.isPending || remove.isPending;
    const btn = (variant) => cn("btn", `btn-${size}`, variant, className);

    if (!status && isPending) return <span className={cn(btn("btn-ghost"), "btn-disabled")}>…</span>;

    switch (status?.status) {
        case "connected":
            return (
                <>
                    <button className={btn("btn-outline")} onClick={() => setConfirmRemove(true)} disabled={busy}>
                        <UserCheck className="size-4" /> Connected
                    </button>
                    <ConfirmDialog
                        open={confirmRemove}
                        onClose={() => setConfirmRemove(false)}
                        title="Remove connection?"
                        message="They won't be notified. You can always reconnect later."
                        confirmLabel="Remove"
                        loading={remove.isPending}
                        onConfirm={() =>
                            remove.mutate(userId, {
                                onSuccess: () => {
                                    setConfirmRemove(false);
                                    settle("not_connected", "Connection removed")();
                                },
                            })
                        }
                    />
                </>
            );
        case "pending":
            return (
                <button
                    className={btn("btn-outline btn-neutral")}
                    title="Withdraw request"
                    onClick={() => withdraw.mutate(userId, { onSuccess: settle("not_connected", "Request withdrawn") })}
                    disabled={busy}
                >
                    <Clock className="size-4" /> Pending
                </button>
            );
        case "received":
            return (
                <span className="flex gap-2">
                    <button className={btn("btn-ghost")} onClick={() => reject.mutate(status.requestId, { onSuccess: settle("not_connected") })} disabled={busy}>
                        Ignore
                    </button>
                    <button
                        className={btn("btn-primary btn-outline")}
                        onClick={() => accept.mutate(status.requestId, { onSuccess: settle("connected", "You're now connected") })}
                        disabled={busy}
                    >
                        <Check className="size-4" /> Accept
                    </button>
                </span>
            );
        default:
            return (
                <button
                    className={btn("btn-primary btn-outline")}
                    onClick={() => send.mutate(userId, { onSuccess: settle("pending", "Invitation sent") })}
                    disabled={busy}
                >
                    {send.isPending ? <span className="loading loading-spinner loading-xs" /> : <UserPlus className="size-4" />}
                    Connect
                </button>
            );
    }
};

export default ConnectButton;
