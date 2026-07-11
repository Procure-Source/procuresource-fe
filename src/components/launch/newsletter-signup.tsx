"use client";

import { FormEvent, useMemo, useState } from "react";

const regionOptions = [
  "UAE / Dubai",
  "UAE / Abu Dhabi",
  "Saudi Arabia",
  "Qatar",
  "Oman",
  "Kuwait",
  "Bahrain",
  "Wider GCC",
];

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [region, setRegion] = useState(regionOptions[0]);
  const [status, setStatus] = useState<"idle" | "ready">("idle");
  const [error, setError] = useState("");

  const mailtoHref = useMemo(() => {
    const subject = "ProcureSource weekly MEP newsletter";
    const body = [
      "Please add me to the weekly ProcureSource MEP newsletter.",
      "",
      "Email: " + email,
      "Region: " + region,
    ].join("\n");

    return `mailto:hello@procuresource.co?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [email, region]);

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
    <form className="news-newsletter-card" onSubmit={handleSubmit}>
      <div>
        <p>Weekly brief</p>
        <h2>Get the MEP procurement watchlist.</h2>
        <span>
          One weekly note on UAE, Dubai, and GCC MEP signals: projects, utilities,
          facilities management, regulations, and policy changes worth tracking.
        </span>
      </div>

      <label>
        <span>Work email</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@company.com"
          autoComplete="email"
          required
        />
      </label>

      <label>
        <span>Primary region</span>
        <select value={region} onChange={(event) => setRegion(event.target.value)}>
          {regionOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>

      <button type="submit">Prepare signup</button>

      <p className="news-newsletter-status" aria-live="polite">
        {error}
        {status === "ready" && !error ? (
          <>
            Request ready. <a href={mailtoHref}>Send it to ProcureSource.</a>
          </>
        ) : null}
      </p>
    </form>
  );
}
