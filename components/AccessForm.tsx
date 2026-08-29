"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import { buttonClass } from "@/components/ui/button";
import {
  emptyValues,
  fields,
  validators,
  type FieldName,
  type FormValues,
} from "@/lib/validation";

/* Set NEXT_PUBLIC_FORM_ENDPOINT to the request-access endpoint once one exists.
   While it is empty, submit validates, logs the payload to the console, and
   shows the success state without sending anything anywhere. */
const FORM_ENDPOINT = process.env.NEXT_PUBLIC_FORM_ENDPOINT ?? "";

type Errors = Partial<Record<FieldName, string>>;

async function send(payload: FormValues & { submittedAt: string }) {
  if (!FORM_ENDPOINT) {
    console.log("[ProcureSource] request-access payload", payload);
    return;
  }
  const response = await fetch(FORM_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Request failed with status " + response.status);
  }
}

export default function AccessForm() {
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const inputRefs = useRef<Partial<Record<FieldName, HTMLInputElement | null>>>(
    {},
  );
  const successRef = useRef<HTMLDivElement>(null);

  /* The success panel replaces the form in place, so move focus to it. */
  useEffect(() => {
    if (isDone) successRef.current?.focus();
  }, [isDone]);

  /* Clear a field's error as soon as the person starts fixing it. */
  const handleChange = (name: FieldName, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => (current[name] ? { ...current, [name]: "" } : current));
  };

  const handleBlur = (name: FieldName) => {
    const value = values[name].trim();
    if (!value) return;
    setErrors((current) => ({ ...current, [name]: validators[name](value) }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const nextErrors: Errors = {};
    let firstInvalid: FieldName | null = null;

    for (const field of fields) {
      const message = validators[field.name](values[field.name].trim());
      nextErrors[field.name] = message;
      if (message && !firstInvalid) firstInvalid = field.name;
    }

    setErrors(nextErrors);

    if (firstInvalid) {
      inputRefs.current[firstInvalid]?.focus();
      return;
    }

    setIsSending(true);

    const payload = { ...emptyValues, submittedAt: new Date().toISOString() };
    for (const field of fields) {
      payload[field.name] = values[field.name].trim();
    }

    try {
      await send(payload);
      setIsDone(true);
    } catch (error) {
      console.error("[ProcureSource] submit failed", error);
      setFormError(
        "That did not send. Please try again, or email hello@procuresource.co.",
      );
      setIsSending(false);
    }
  };

  return (
    <div className="rounded-panel border border-rule bg-surface p-panel shadow-panel">
      <form
        id="access-form"
        className="@container"
        noValidate
        onSubmit={handleSubmit}
        hidden={isDone}
      >
        <h3 className="mb-6 font-display text-form-title font-semibold leading-title tracking-heading">
          Request early access
        </h3>

        {/* Pairs share a row once the panel is wide enough. Container-based,
            not viewport-based: this form sits in a half-width column on a wide
            screen and full width on a phone.

            24rem, not 28rem: inside the panel's padding the form only gets
            about 436px in the desktop split, so a 448px gate never fires. */}
        <div className="grid grid-cols-1 gap-x-4 gap-y-5 @sm:grid-cols-2">
          {fields.map((field) => {
          const errorId = `${field.name}-error`;
          const message = errors[field.name] ?? "";

          return (
            <div
              className={field.span === "full" ? "@sm:col-span-2" : undefined}
              key={field.name}
            >
              <label
                className="mb-1.5 block text-small font-medium"
                htmlFor={field.name}
              >
                {field.label}
                {!field.required && (
                  <>
                    {" "}
                    <span className="text-micro font-normal text-ink-muted">
                      optional
                    </span>
                  </>
                )}
              </label>
              <input
                className="block w-full rounded-inner border border-rule bg-paper px-3.5 py-2.5 text-body transition-[border-color,box-shadow] duration-200 ease-standard placeholder:text-placeholder hover:border-rule-hover focus:border-accent focus:shadow-focus focus:outline-none aria-[invalid=true]:border-error"
                type={field.type}
                id={field.name}
                name={field.name}
                autoComplete={field.autoComplete}
                inputMode={field.inputMode}
                placeholder={field.placeholder}
                required={field.required}
                aria-describedby={errorId}
                aria-invalid={message ? true : undefined}
                value={values[field.name]}
                ref={(element) => {
                  inputRefs.current[field.name] = element;
                }}
                onChange={(event) =>
                  handleChange(field.name, event.target.value)
                }
                onBlur={() => handleBlur(field.name)}
              />
              <p
                className="mt-1.75 text-micro text-error"
                id={errorId}
                role="alert"
                hidden={!message}
              >
                {message}
              </p>
              </div>
            );
          })}
        </div>

        <p
          className="mt-5 text-micro text-error"
          id="form-error"
          role="alert"
          hidden={!formError}
        >
          {formError}
        </p>

        {/* The parent owns the spacing above the button, not the button. */}
        <div className="mt-6">
          <button
            className={buttonClass("primary", "md", "w-full")}
            type="submit"
            disabled={isSending}
          >
            {isSending ? "Sending…" : "Request early access"}
          </button>
        </div>
      </form>

      {/* Replaces the form in place on success. */}
      <div
        className="py-2"
        id="form-success"
        role="status"
        tabIndex={-1}
        hidden={!isDone}
        ref={successRef}
      >
        <h3 className="font-display text-form-title font-semibold leading-title tracking-heading">
          Request received.
        </h3>
        <p className="mt-3 max-w-measure text-ink-muted">
          Thank you — someone from ProcureSource will reply within one business
          day.
        </p>
      </div>
    </div>
  );
}
