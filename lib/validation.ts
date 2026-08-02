/* Request-access form: field definitions and one validator per field.
   Error text says what to fix, not that something is wrong. */

export type FieldName =
  | "fullName"
  | "email"
  | "company"
  | "role"
  | "whatsapp";

export interface FieldDef {
  name: FieldName;
  label: string;
  type: string;
  required: boolean;
  autoComplete?: string;
  inputMode?: "tel";
  placeholder?: string;
  /* Layout: a field that needs a whole row rather than half of one. */
  span?: "full";
}

export const fields: FieldDef[] = [
  {
    name: "fullName",
    label: "Full name",
    type: "text",
    required: true,
    autoComplete: "name",
  },
  {
    name: "company",
    label: "Company",
    type: "text",
    required: true,
    autoComplete: "organization",
  },
  {
    name: "email",
    label: "Work email",
    type: "email",
    required: true,
    autoComplete: "email",
    span: "full",
  },
  {
    name: "role",
    label: "Role",
    type: "text",
    required: true,
    autoComplete: "organization-title",
  },
  {
    name: "whatsapp",
    label: "WhatsApp number",
    type: "tel",
    required: false,
    autoComplete: "tel",
    inputMode: "tel",
    placeholder: "+971",
  },
];

export const fieldNames = fields.map((field) => field.name);

/* Work-email check. Delete this list (or empty it) to accept any address. */
const PERSONAL_EMAIL_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "me.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[\d\s()-]{7,20}$/;

/* Return an error string, or '' when valid. */
export const validators: Record<FieldName, (value: string) => string> = {
  fullName(value) {
    if (!value) return "Enter your full name.";
    if (value.length < 2) return "Enter your full name.";
    return "";
  },
  email(value) {
    if (!value) return "Enter your work email address.";
    if (!EMAIL_RE.test(value)) {
      return "Enter a valid email address, like name@company.ae";
    }
    const domain = value.split("@")[1].toLowerCase();
    if (PERSONAL_EMAIL_DOMAINS.includes(domain)) {
      return "Use your work email address rather than a personal one.";
    }
    return "";
  },
  company(value) {
    if (!value) return "Enter your company name.";
    return "";
  },
  role(value) {
    if (!value) return "Enter your role, for example Procurement Manager.";
    return "";
  },
  whatsapp(value) {
    if (!value) return ""; // optional
    if (!PHONE_RE.test(value)) {
      return "Enter a valid number including country code, like +971 50 123 4567.";
    }
    return "";
  },
};

export type FormValues = Record<FieldName, string>;

export const emptyValues: FormValues = {
  fullName: "",
  email: "",
  company: "",
  role: "",
  whatsapp: "",
};
