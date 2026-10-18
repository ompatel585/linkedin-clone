import { useState } from "react";
import toast from "react-hot-toast";
import { LogOut, Monitor, Moon, Sun } from "lucide-react";
import { Card } from "../../components/ui/Feedback";
import { PasswordInput } from "../../components/ui/FormField";
import { useTheme } from "../../context/ThemeContext";
import { useCurrentUser } from "../../hooks/useAuth";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { cn } from "../../lib/utils";
import { useChangePassword, useLogout } from "../auth/api";
import { useUpdateProfile } from "../profile/api";

const THEME_OPTIONS = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Monitor },
];

const SettingsPage = () => {
    useDocumentTitle("Settings");
    const me = useCurrentUser();
    const { preference, setPreference } = useTheme();
    const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirm: "" });
    const changePassword = useChangePassword();
    const updateProfile = useUpdateProfile();
    const { mutate: logout } = useLogout();

    const submitPassword = (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirm) return toast.error("New passwords don't match");
        changePassword.mutate(
            { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword },
            {
                onSuccess: () => {
                    toast.success("Password updated");
                    setPasswords({ currentPassword: "", newPassword: "", confirm: "" });
                },
            }
        );
    };

    const bind = (field) => ({ value: passwords[field], onChange: (e) => setPasswords((p) => ({ ...p, [field]: e.target.value })) });

    return (
        <div className="max-w-2xl mx-auto space-y-3">
            <Card className="p-5">
                <h1 className="text-xl font-semibold">Settings</h1>
                <p className="text-sm text-muted">
                    Signed in as <span className="font-medium text-base-content">{me.email}</span>
                </p>
            </Card>

            <Card className="p-5">
                <h2 className="font-semibold mb-1">Appearance</h2>
                <p className="text-sm text-muted mb-4">Choose how UnLinked looks to you.</p>
                <div className="grid grid-cols-3 gap-2">
                    {THEME_OPTIONS.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            className={cn(
                                "flex flex-col items-center gap-2 rounded-box border p-4 transition-colors",
                                preference === id ? "border-primary bg-secondary text-secondary-content" : "border-base-300 hover:bg-base-200"
                            )}
                            onClick={() => setPreference(id)}
                            aria-pressed={preference === id}
                        >
                            <Icon className="size-6" />
                            <span className="text-sm font-medium">{label}</span>
                        </button>
                    ))}
                </div>
            </Card>

            <Card className="p-5">
                <h2 className="font-semibold mb-1">Job seeking</h2>
                <label className="flex items-center justify-between gap-4 cursor-pointer mt-3">
                    <span>
                        <span className="font-medium">Open to work</span>
                        <span className="block text-sm text-muted">Show recruiters you're looking with a green frame on your photo.</span>
                    </span>
                    <input
                        type="checkbox"
                        className="toggle toggle-success"
                        checked={me.openToWork}
                        disabled={updateProfile.isPending}
                        onChange={(e) =>
                            updateProfile.mutate(
                                { openToWork: e.target.checked },
                                { onSuccess: (user) => toast.success(user.openToWork ? "You're now open to work" : "Open to work turned off") }
                            )
                        }
                    />
                </label>
            </Card>

            <Card className="p-5">
                <h2 className="font-semibold mb-2">Change password</h2>
                <form onSubmit={submitPassword} className="space-y-1">
                    <PasswordInput label="Current password" autoComplete="current-password" {...bind("currentPassword")} required />
                    <PasswordInput label="New password" autoComplete="new-password" minLength={6} {...bind("newPassword")} required />
                    <PasswordInput label="Confirm new password" autoComplete="new-password" minLength={6} {...bind("confirm")} required />
                    <button type="submit" className="btn btn-primary mt-3" disabled={changePassword.isPending}>
                        {changePassword.isPending && <span className="loading loading-spinner loading-sm" />}
                        Update password
                    </button>
                </form>
            </Card>

            <Card className="p-5 flex items-center justify-between">
                <div>
                    <h2 className="font-semibold">Sign out</h2>
                    <p className="text-sm text-muted">Sign out of UnLinked on this device.</p>
                </div>
                <button className="btn btn-outline btn-error" onClick={() => logout()}>
                    <LogOut className="size-4" /> Sign out
                </button>
            </Card>
        </div>
    );
};

export default SettingsPage;
