export const siteConfig = {
  name: "ProcureSource",
  legalName: "Grow Technology Services FZ LLC",
  url: "https://procuresource.co",
  description:
    "ProcureSource is a UAE-first MEP RFQ platform for contractors, consultants, and project procurement teams.",
  email: {
    general: "hello@procuresource.co",
    support: "support@procuresource.co",
  },
  publicRoutes: [
    { path: "/", label: "Home", changefreq: "weekly", priority: "1.0" },
    { path: "/about", label: "About", changefreq: "monthly", priority: "0.74" },
    { path: "/faq", label: "FAQ", changefreq: "monthly", priority: "0.70" },
    { path: "/contact", label: "Contact", changefreq: "monthly", priority: "0.60" },
    { path: "/privacy", label: "Privacy", changefreq: "yearly", priority: "0.36" },
    { path: "/terms", label: "Terms", changefreq: "yearly", priority: "0.36" },
  ],
} as const;
