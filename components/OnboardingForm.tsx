"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";

import { buttonClass } from "@/components/ui/button";
import {
  cleanSource,
  emptyOnboardingValues,
  onboardingFields,
  onboardingValidators,
  type OnboardingField,
  type OnboardingType,
} from "@/lib/onboarding";

const FORM_ENDPOINT =
  process.env.NEXT_PUBLIC_FORM_ENDPOINT ?? "https://formspree.io/f/mwlvbboz";

type Errors = Partial<Record<OnboardingField, string>>;

export default function OnboardingForm({ type }: { type: OnboardingType }) {
  const [values, setValues] = useState(emptyOnboardingValues);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isDone, setIsDone] = useState(false);
  /* A ref, not state: a fast double tap fires before state has re-rendered. */
  const inFlight = useRef(false);
  const honeypot = useRef<HTMLInputElement>(null);
  const inputs = useRef<Partial<Record<OnboardingField, HTMLInputElement | HTMLTextAreaElement | null>>>(
    {},
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inFlight.current) return;
    setFormError("");

    const next: Errors = {};
    let firstInvalid: OnboardingField | null = null;
    for (const { name } of onboardingFields) {
      const message = onboardingValidators[name](values[name].trim());
      next[name] = message;
      if (message && !firstInvalid) firstInvalid = name;
    }
    setErrors(next);
    if (firstInvalid) {
      inputs.current[firstInvalid]?.focus();
      return;
    }

    /* Bots fill the hidden field; pretend it worked and send nothing. */
    if (honeypot.current?.value) {
      setIsDone(true);
      return;
    }

    inFlight.current = true;
    setIsSending(true);

    const payload = {
      full_name: values.full_name.trim(),
      company_name: values.company_name.trim(),
      mobile: values.mobile.trim(),
      email: values.email.trim(),
      designation: values.designation.trim(),
      region: values.region.trim(),
      notes: values.notes.trim(),
      type,
      source: cleanSource(new URLSearchParams(window.location.search).get("source")),
      created_at: new Date().toISOString(),
      _subject: `Onboarding: ${type}`,
    };

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("status " + response.status);
      setIsDone(true);
    } catch (error) {
      console.error("[ProcureSource] onboarding submit failed", error);
      setFormError("That did not send. Please check your connection and try again.");
      inFlight.current = false;
      setIsSending(false);
    }
  };

  if (isDone) {
    return (
      <p
        className="rounded-panel border border-rule bg-surface p-panel font-display text-form-title font-semibold leading-title tracking-heading shadow-panel"
        role="status"
      >
        Thanks for filling out the form. Our team will get back to you soon, and you&apos;ll receive updates once the supplier portal is live.
      </p>
    );
  }

  return (
    <form
      className="rounded-panel border border-rule bg-surface p-panel shadow-panel"
      noValidate
      onSubmit={handleSubmit}
    >
      <div className="grid gap-5">
        {onboardingFields.map((field) => {
          const message = errors[field.name] ?? "";
          return (
            <div key={field.name}>
              <label className="mb-1.5 block text-small font-medium" htmlFor={field.name}>
                {field.label}
                {!field.required && (
                  <span className="text-micro font-normal text-ink-muted"> optional</span>
                )}
              </label>
              {/* text-body is 17px: above the 16px iOS zoom threshold. */}
              {(() => {
                const shared = {
                  className:
                    "block min-h-14 w-full rounded-inner border border-rule bg-paper px-4 py-3.5 text-body transition-[border-color,box-shadow] duration-200 ease-standard hover:border-rule-hover focus:border-accent focus:shadow-focus focus:outline-none aria-[invalid=true]:border-error",
                  id: field.name,
                  name: field.name,
                  autoComplete: field.autoComplete,
                  required: field.required,
                  "aria-describedby": `${field.name}-error`,
                  "aria-invalid": message ? (true as const) : undefined,
                  value: values[field.name],
                  onChange: (
                    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
                  ) => {
                    const value = e.target.value;
                    setValues((c) => ({ ...c, [field.name]: value }));
                    setErrors((c) =>
                      c[field.name] ? { ...c, [field.name]: "" } : c,
                    );
                  },
                };
                return field.type === "textarea" ? (
                  <textarea
                    {...shared}
                    rows={4}
                    ref={(el) => {
                      inputs.current[field.name] = el;
                    }}
                  />
                ) : (
                  <input
                    {...shared}
                    type={field.type}
                    inputMode={field.inputMode}
                    ref={(el) => {
                      inputs.current[field.name] = el;
                    }}
                  />
                );
              })()}
              <p
                className="mt-1.75 text-micro text-error"
                id={`${field.name}-error`}
                role="alert"
                hidden={!message}
              >
                {message}
              </p>
            </div>
          );
        })}
      </div>

      {/* Honeypot: off-screen, skipped by keyboard and screen readers. */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" ref={honeypot} />
      </div>

      <p className="mt-5 text-micro text-error" role="alert" hidden={!formError}>
        {formError}
      </p>

      <div className="mt-6">
        <button
          className={buttonClass("primary", "md", "min-h-14 w-full text-body")}
          type="submit"
          disabled={isSending}
        >
          {isSending ? "Sending…" : "Submit"}
        </button>
      </div>
    </form>
  );
}
