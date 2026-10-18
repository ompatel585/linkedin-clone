import { useState } from "react";
import { Link } from "react-router";
import AuthLayout from "./AuthLayout";
import { PasswordInput, TextInput } from "../../components/ui/FormField";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useLogin } from "./api";

const LoginPage = () => {
    useDocumentTitle("Sign in");
    const [form, setForm] = useState({ username: "", password: "" });
    const { mutate: login, isPending } = useLogin();

    const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

    return (
        <AuthLayout
            title="Sign in"
            subtitle="Stay updated on your professional world"
            footer={
                <p>
                    New to UnLinked?{" "}
                    <Link to="/signup" className="link link-primary font-semibold">
                        Join now
                    </Link>
                </p>
            }
        >
            <form
                className="space-y-2"
                onSubmit={(e) => {
                    e.preventDefault();
                    login(form);
                }}
            >
                <TextInput
                    label="Username or email"
                    autoComplete="username"
                    value={form.username}
                    onChange={update("username")}
                    required
                    autoFocus
                />
                <PasswordInput
                    label="Password"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={update("password")}
                    required
                />
                <button type="submit" className="btn btn-primary w-full mt-4" disabled={isPending}>
                    {isPending && <span className="loading loading-spinner loading-sm" />}
                    Sign in
                </button>
            </form>
        </AuthLayout>
    );
};

export default LoginPage;
