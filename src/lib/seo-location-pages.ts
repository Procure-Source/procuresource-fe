import { marketPages } from "@/lib/footer-pages";

export type SeoEquipmentCategory = {
  slug: string;
  name: string;
  shortName: string;
  primaryStandard: string;
  buyerIntent: string;
  verificationFocus: string[];
  rfqChecklist: string[];
};

export const seoEquipmentCategories: SeoEquipmentCategory[] = [
  {
    slug: "water-cooled-chillers",
    name: "Water-Cooled Chillers",
    shortName: "chillers",
    primaryStandard: "AHRI 550/590",
    buyerIntent: "district cooling, hotel, hospital, mall, and high-rise HVAC packages",
    verificationFocus: ["AHRI certificate number", "IPLV and refrigerant evidence", "authorized local agent", "lead-time reality"],
    rfqChecklist: ["cooling capacity in TR and kW", "IPLV / kW per ton target", "refrigerant", "voltage and starter type"],
  },
  {
    slug: "air-handling-units",
    name: "Air Handling Units",
    shortName: "AHUs",
    primaryStandard: "Eurovent / AHRI performance evidence",
    buyerIntent: "commercial HVAC air-side packages and consultant submittals",
    verificationFocus: ["fan performance", "coil data", "filter class", "local fabrication or import path"],
    rfqChecklist: ["airflow", "external static pressure", "coil rows", "filtration and casing class"],
  },
  {
    slug: "cooling-towers",
    name: "Cooling Towers",
    shortName: "cooling towers",
    primaryStandard: "CTI / thermal performance evidence",
    buyerIntent: "central plant heat rejection packages",
    verificationFocus: ["thermal rating", "materials of construction", "water treatment compatibility", "site logistics"],
    rfqChecklist: ["flow rate", "entering and leaving water temperature", "wet bulb", "noise limit"],
  },
  {
    slug: "pumps",
    name: "HVAC And Utility Pumps",
    shortName: "pumps",
    primaryStandard: "ISO / Hydraulic Institute performance evidence",
    buyerIntent: "chilled water, condenser water, booster, and transfer pump packages",
    verificationFocus: ["pump curve", "motor efficiency", "NPSH", "authorized service support"],
    rfqChecklist: ["flow", "head", "motor kW", "duty / standby arrangement"],
  },
  {
    slug: "fire-pumps",
    name: "Fire Pumps",
    shortName: "fire pumps",
    primaryStandard: "UL / FM / Civil Defense acceptance",
    buyerIntent: "fire protection packages that require authority approval",
    verificationFocus: ["UL/FM listing", "controller listing", "diesel or electric driver", "local authority acceptance"],
    rfqChecklist: ["rated flow", "rated pressure", "driver type", "controller and jockey pump requirements"],
  },
  {
    slug: "switchgear",
    name: "LV Switchgear",
    shortName: "switchgear",
    primaryStandard: "IEC 61439 / local utility requirements",
    buyerIntent: "electrical distribution packages for MEP and industrial projects",
    verificationFocus: ["type-tested assembly", "short-circuit rating", "busbar rating", "utility approval path"],
    rfqChecklist: ["rated current", "fault level", "form of separation", "IP rating"],
  },
  {
    slug: "generators",
    name: "Diesel Generators",
    shortName: "generators",
    primaryStandard: "ISO 8528 / emissions and authority requirements",
    buyerIntent: "standby and prime power packages for critical facilities",
    verificationFocus: ["engine origin", "alternator model", "rating basis", "after-sales support"],
    rfqChecklist: ["kVA rating", "standby or prime duty", "voltage", "acoustic enclosure limit"],
  },
  {
    slug: "valves",
    name: "Industrial And HVAC Valves",
    shortName: "valves",
    primaryStandard: "API / ISO / project specification compliance",
    buyerIntent: "MEP, district cooling, water, and industrial piping packages",
    verificationFocus: ["pressure class", "material certificates", "actuator compatibility", "country of origin"],
    rfqChecklist: ["valve type", "size and pressure rating", "body material", "end connection"],
  },
  {
    slug: "building-management-systems",
    name: "Building Management Systems",
    shortName: "BMS",
    primaryStandard: "BACnet / Modbus / project integration requirements",
    buyerIntent: "controls, integration, and energy monitoring packages",
    verificationFocus: ["protocol support", "local integrator authorization", "cybersecurity posture", "handover documentation"],
    rfqChecklist: ["point count", "protocols", "front-end requirements", "integration scope"],
  },
  {
    slug: "heat-exchangers",
    name: "Plate Heat Exchangers",
    shortName: "heat exchangers",
    primaryStandard: "AHRI / ASME / PED evidence as applicable",
    buyerIntent: "district cooling energy transfer stations and industrial heat-transfer packages",
    verificationFocus: ["thermal sizing", "plate material", "pressure drop", "certified duty point"],
    rfqChecklist: ["primary and secondary flow", "temperatures", "approach", "design pressure"],
  },
];

export function getSeoMarket(slug: string) {
  return marketPages.find((market) => market.slug === slug);
}

export function getSeoEquipmentCategory(slug: string) {
  return seoEquipmentCategories.find((category) => category.slug === slug);
}

export function getSeoLocationPageParams() {
  return marketPages.flatMap((market) =>
    seoEquipmentCategories.map((category) => ({
      market: market.slug,
      category: category.slug,
    }))
  );
}

export function buildSeoLocationPageUrl(marketSlug: string, categorySlug: string) {
  return `/mep-procurement/${marketSlug}/${categorySlug}`;
}
