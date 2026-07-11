"use client";

import { FormEvent, useMemo, useState } from "react";

const roleOptions = [
  "Consultant / specifier",
  "Contractor / buyer",
  "Regional partner",
  "Operator / facilities team",
  "Other",
];

type LaunchSubscribeProps = {
  compact?: boolean;
};

export function LaunchSubscribe({ compact = false }: LaunchSubscribeProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(roleOptions[0]);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "ready">("idle");
  const [error, setError] = useState("");
  const formState = error ? "error" : status;

  const mailtoHref = useMemo(() => {
    const subject = "ProcureSource early access";
    const body = [
      "Email: " + email,
      "Role: " + role,
      "What should ProcureSource understand first:",
      note || "Not specified yet.",
    ].join("\n");

    return `mailto:hello@procuresource.co?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [email, note, role]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Enter a valid work email.");
      setStatus("idle");
      return;
    }

    setEmail(normalizedEmail);
    setStatus("ready");
  }

  return (
    <section
      id="launch-updates"
      className={compact ? "stand-subscribe stand-subscribe--compact" : "stand-subscribe"}
      aria-labelledby="launch-updates-title"
    >
      <div className="stand-subscribe-copy">
        <p>Early access</p>
        <h2 id="launch-updates-title">Join the private launch list before accounts open.</h2>
        <span>
          Add a work email and one short note. We are prioritizing people close to
          UAE MEP buying work, not general product browsing.
        </span>
      </div>

      <form className="stand-subscribe-form" onSubmit={handleSubmit} noValidate>
        <label>
          <span>Work email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (error) {
                setError("");
              }
            }}
            placeholder="name@company.com"
            autoComplete="email"
            aria-invalid={Boolean(error)}
            aria-describedby="launch-updates-status"
            required
          />
        </label>

        <label>
          <span>Your role</span>
          <select value={role} onChange={(event) => setRole(event.target.value)}>
            {roleOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>

        <label className="stand-subscribe-wide">
          <span>What should ProcureSource understand first?</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Example: your role, UAE project context, or the MEP category that slows your team down..."
            rows={4}
          />
        </label>

        <div className="stand-subscribe-actions">
          <button type="submit">Join launch list</button>
          <a href="mailto:hello@procuresource.co">Send a note instead</a>
        </div>

        <p id="launch-updates-status" className="stand-form-status" data-state={formState} aria-live="polite">
          {error}
          {status === "ready" && !error ? (
            <>
              Request ready. <a href={mailtoHref}>Send it to ProcureSource.</a>
            </>
          ) : null}
        </p>
      </form>
    </section>
  );
}
