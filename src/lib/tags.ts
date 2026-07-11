// Supply-side tags (for role: "supplier")
export const SUPPLY_TAGS = [
  "manufacturer",
  "distributor",
  "dealer_agent",
  "service_provider",
  "rental_company",
  "freight_logistics",
  "inspection_agency",
  "certification_body",
] as const;

export const USER_ROLES = [
  "supplier",
  "manufacturer",
  "agent",
  "purchase_manager",
  "consultant",
  "admin",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const SUPPLY_SIDE_ROLES = ["supplier", "manufacturer", "agent"] as const;
export const DEMAND_SIDE_ROLES = ["purchase_manager", "consultant"] as const;

// Demand-side tags (for role: "purchase_manager")
export const DEMAND_TAGS = [
  "contractor",
  "consultant",
  "developer_owner",
  "facility_manager",
  "procurement_team",
  "project_manager",
  "trader",
  "government_buyer",
] as const;

// Platform team tags (for role: "admin")
export const PLATFORM_TAGS = [
  "super_admin",
  "category_manager",
  "verification_team",
  "support_team",
  "sales_team",
  "finance_team",
  "marketing_team",
  "content_team",
] as const;

export const ALL_TAGS = [...SUPPLY_TAGS, ...DEMAND_TAGS, ...PLATFORM_TAGS] as const;
export type SupplyTag = (typeof SUPPLY_TAGS)[number];
export type DemandTag = (typeof DEMAND_TAGS)[number];
export type PlatformTag = (typeof PLATFORM_TAGS)[number];
export type UserTag = (typeof ALL_TAGS)[number];

export function isValidUserRole(role: unknown): role is UserRole {
  return typeof role === "string" && USER_ROLES.includes(role as UserRole);
}

export function isSupplySideRole(role: string): boolean {
  return (SUPPLY_SIDE_ROLES as readonly string[]).includes(role);
}

export function isDemandSideRole(role: string): boolean {
  return (DEMAND_SIDE_ROLES as readonly string[]).includes(role);
}

export function getDefaultTagsForRole(role: string): string[] {
  switch (role) {
    case "manufacturer":
      return ["manufacturer"];
    case "agent":
      return ["dealer_agent"];
    case "consultant":
      return ["consultant"];
    default:
      return [];
  }
}

export function getDashboardPathForRole(role: string): string {
  switch (role) {
    case "manufacturer":
      return "/manufacturer/dashboard";
    case "agent":
      return "/agent/dashboard";
    case "supplier":
      return "/supplier/dashboard";
    case "purchase_manager":
      return "/pm/dashboard";
    case "consultant":
      return "/consultant/dashboard";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/";
  }
}

export function getTagsForRole(role: string): readonly string[] {
  switch (role) {
    case "supplier":
    case "manufacturer":
    case "agent":
      return SUPPLY_TAGS;
    case "purchase_manager":
    case "consultant":
      return DEMAND_TAGS;
    case "admin":
      return PLATFORM_TAGS;
    default:
      return [];
  }
}

export function hasTag(tags: string[], tag: string): boolean {
  return tags.includes(tag);
}

export function hasAnyTag(tags: string[], required: string[]): boolean {
  return required.some((t) => tags.includes(t));
}

export const TAG_LABELS: Record<string, string> = {
  // Supply
  manufacturer: "Manufacturer",
  distributor: "Distributor",
  dealer_agent: "Dealer / Agent",
  service_provider: "Service Provider",
  rental_company: "Rental Company",
  freight_logistics: "Freight & Logistics",
  inspection_agency: "Inspection Agency",
  certification_body: "Certification Body",
  // Demand
  contractor: "Contractor",
  consultant: "Consultant",
  developer_owner: "Developer / Owner",
  facility_manager: "Facility Manager",
  procurement_team: "Procurement Team",
  project_manager: "Project Manager",
  trader: "Trader",
  government_buyer: "Government Buyer",
  // Platform
  super_admin: "Super Admin",
  category_manager: "Category Manager",
  verification_team: "Verification Team",
  support_team: "Support Team",
  sales_team: "Sales Team",
  finance_team: "Finance Team",
  marketing_team: "Marketing Team",
  content_team: "Content Team",
};

export function getTagLabel(tag: string): string {
  return TAG_LABELS[tag] || tag.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
