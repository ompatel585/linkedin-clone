import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../../lib/utils";

export const Field = ({ label, hint, error, children, className }) => (
    <fieldset className={cn("fieldset py-1", className)}>
        {label && <legend className="fieldset-legend text-sm font-medium pb-1">{label}</legend>}
        {children}
        {error ? <p className="text-error text-xs">{error}</p> : hint && <p className="text-xs text-muted">{hint}</p>}
    </fieldset>
);

export const TextInput = ({ label, hint, error, className, ...props }) => (
    <Field label={label} hint={hint} error={error}>
        <input className={cn("input w-full", error && "input-error", className)} {...props} />
    </Field>
);

export const TextArea = ({ label, hint, error, className, ...props }) => (
    <Field label={label} hint={hint} error={error}>
        <textarea className={cn("textarea w-full", error && "textarea-error", className)} {...props} />
    </Field>
);

export const SelectInput = ({ label, options, className, ...props }) => (
    <Field label={label}>
        <select className={cn("select w-full", className)} {...props}>
            {Object.entries(options).map(([value, text]) => (
                <option key={value} value={value}>
                    {text}
                </option>
            ))}
        </select>
    </Field>
);

export const PasswordInput = ({ label, error, ...props }) => {
    const [visible, setVisible] = useState(false);
    return (
        <Field label={label} error={error}>
            <label className={cn("input w-full", error && "input-error")}>
                <input type={visible ? "text" : "password"} className="grow" {...props} />
                <button
                    type="button"
                    className="text-muted hover:text-base-content"
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? "Hide password" : "Show password"}
                >
                    {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
            </label>
        </Field>
    );
};
