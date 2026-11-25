/* Expo onboarding form: field definitions, validators and the source tag. */

export type OnboardingType = "supplier";

export type OnboardingField =
  | "full_name"
  | "company_name"
  | "mobile"
  | "email"
  | "designation"
  | "region"
  | "notes";

export interface OnboardingFieldDef {
  name: OnboardingField;
  label: string;
  type: string;
  autoComplete: string;
  inputMode?: "tel" | "email";
  required: boolean;
}

export const onboardingFields: OnboardingFieldDef[] = [
  { name: "full_name", label: "Full name", type: "text", autoComplete: "name", required: true },
  {
    name: "company_name",
    label: "Company name",
    type: "text",
    autoComplete: "organization",
    required: true,
  },
  {
    name: "mobile",
    label: "Mobile number",
    type: "tel",
    autoComplete: "tel",
    inputMode: "tel",
    required: true,
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    autoComplete: "email",
    inputMode: "email",
    required: true,
  },
  {
    name: "designation",
    label: "Designation",
    type: "text",
    autoComplete: "organization-title",
    required: true,
  },
  {
    name: "region",
    label: "Region",
    type: "text",
    autoComplete: "address-level1",
    required: true,
  },
  {
    name: "notes",
    label: "Any further details",
    type: "textarea",
    autoComplete: "off",
    required: false,
  },
];

export type OnboardingValues = Record<OnboardingField, string>;

/* Mobile starts at the UAE code; people can overwrite it for another country. */
export const DEFAULT_COUNTRY_CODE = "+971 ";

export const emptyOnboardingValues: OnboardingValues = {
  full_name: "",
  company_name: "",
  mobile: DEFAULT_COUNTRY_CODE,
  email: "",
  designation: "",
  region: "",
  notes: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MOBILE_RE = /^\+?[\d\s()-]+$/;

export const onboardingValidators: Record<
  OnboardingField,
  (value: string) => string
> = {
  full_name: (v) => (v ? "" : "Enter your full name."),
  company_name: (v) => (v ? "" : "Enter your company name."),
  mobile(v) {
    const digits = v.replace(/\D/g, "");
    if (!MOBILE_RE.test(v) || digits.length < 8) {
      return "Enter a valid mobile number with at least 8 digits.";
    }
    return "";
  },
  email: (v) =>
    EMAIL_RE.test(v) ? "" : "Enter a valid email address, like name@company.ae",
  designation: (v) => (v ? "" : "Enter your designation."),
  region: (v) => (v ? "" : "Enter your region."),
  notes: () => "",
};

/* Source comes from ?source=… (e.g. big5-day1). Anything missing or odd
   becomes "direct". */
export function cleanSource(raw: string | string[] | null | undefined) {
  const value = (Array.isArray(raw) ? raw[0] : raw)?.trim().toLowerCase() ?? "";
  return /^[a-z0-9_-]{1,64}$/.test(value) ? value : "direct";
}
