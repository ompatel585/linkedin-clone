import { useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import AuthLayout from "./AuthLayout";
import { PasswordInput, TextInput } from "../../components/ui/FormField";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useSignup } from "./api";

const fieldErrors = (error) =>
    Object.fromEntries((error?.response?.data?.details || []).map((d) => [d.path, d.message]));

const SignUpPage = () => {
    useDocumentTitle("Join");
    const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
    const { mutate: signup, isPending, error } = useSignup();
    const errors = fieldErrors(error);

    const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

    return (
        <AuthLayout
            title="Join UnLinked"
            subtitle="Make the most of your professional life"
            footer={
                <p>
                    Already on UnLinked?{" "}
                    <Link to="/login" className="link link-primary font-semibold">
                        Sign in
                    </Link>
                </p>
            }
        >
            <form
                className="space-y-1"
                onSubmit={(e) => {
                    e.preventDefault();
                    signup(form, { onSuccess: () => toast.success("Welcome to UnLinked!") });
                }}
            >
                <TextInput label="Full name" autoComplete="name" value={form.name} onChange={update("name")} error={errors.name} required />
                <TextInput
                    label="Username"
                    autoComplete="username"
                    value={form.username}
                    onChange={update("username")}
                    error={errors.username}
                    hint="Your profile will live at /profile/username"
                    required
                />
                <TextInput
                    label="Email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={update("email")}
                    error={errors.email}
                    required
                />
                <PasswordInput
                    label="Password (6+ characters)"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={update("password")}
                    error={errors.password}
                    minLength={6}
                    required
                />
                <p className="text-xs text-muted pt-2">
                    By clicking Agree &amp; Join, you agree to the UnLinked User Agreement and Privacy Policy.
                </p>
                <button type="submit" className="btn btn-primary w-full mt-3" disabled={isPending}>
                    {isPending && <span className="loading loading-spinner loading-sm" />}
                    Agree &amp; Join
                </button>
            </form>
        </AuthLayout>
    );
};

export default SignUpPage;
