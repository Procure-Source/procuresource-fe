type ProcureSourceMarkProps = {
  className?: string;
  title?: string;
};

export function ProcureSourceMark({ className, title = "ProcureSource" }: ProcureSourceMarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="64" height="64" fill="#0071e3" />
      <path d="M19 23c7.8-9 18.2-9 26 0" fill="none" stroke="#ffffff" strokeLinecap="round" strokeWidth="4" />
      <path d="M32 21v5.5" stroke="#ffffff" strokeLinecap="round" strokeWidth="4" />
      <path d="M24.5 39.5l-5.2 4.8" stroke="#ffffff" strokeLinecap="round" strokeWidth="4" />
      <path d="M39.5 39.5l5.2 4.8" stroke="#ffffff" strokeLinecap="round" strokeWidth="4" />
      <circle cx="32" cy="34" r="10.5" fill="none" stroke="#ffffff" strokeWidth="4.8" />
      <circle cx="32" cy="34" r="3.2" fill="#ffffff" />
      <circle cx="32" cy="15.5" r="3.8" fill="#ffffff" />
      <circle cx="16.5" cy="47" r="3.8" fill="#ffffff" />
      <circle cx="47.5" cy="47" r="3.8" fill="#ffffff" />
    </svg>
  );
}
