export type UserFlowStep = {
  screen: string;
  route: string;
  job: string;
  primaryAction: string;
  next: string;
  states: string[];
};

export type UserFlowGroup = {
  id: "purchaser" | "purchaser-admin" | "supplier" | "supplier-admin" | "verification";
  audience: string;
  title: string;
  summary: string;
  entryRoute: string;
  dashboardRoute: string;
  accent: string;
  steps: UserFlowStep[];
};

export const userFlowGroups: UserFlowGroup[] = [
  {
    id: "purchaser",
    audience: "Purchaser",
    title: "Raise, compare, and award",
    summary: "Role choice, RFQ, supplier link, quote review, award export.",
    entryRoute: "/register?role=purchase_manager",
    dashboardRoute: "/pm/dashboard",
    accent: "Buyer lane",
    steps: [
      {
        screen: "Role choice",
        route: "/",
        job: "Choose purchaser path.",
        primaryAction: "Start as purchaser",
        next: "Open the split sign-up flow.",
        states: ["Loading: public skeleton", "Error: friendly recovery page", "Empty: no account needed to choose a role"],
      },
      {
        screen: "Sign up or log in",
        route: "/register?role=purchase_manager",
        job: "Capture purchaser account details.",
        primaryAction: "Create purchaser account",
        next: "Enter the purchaser dashboard.",
        states: ["Loading: auth split skeleton", "Error: keep user on form with clear guidance", "Empty: blank fields with role selected"],
      },
      {
        screen: "Purchaser dashboard",
        route: "/pm/dashboard",
        job: "Show next RFQ action and review queue.",
        primaryAction: "Upload BOQ",
        next: "Turn BOQ text into clean line items.",
        states: ["Loading: dashboard skeleton", "Error: dashboard recovery", "Empty: no draft RFQs yet"],
      },
      {
        screen: "RFQ workspace",
        route: "/pm/dashboard/rfqs",
        job: "Prepare lines and create quote link.",
        primaryAction: "Read BOQ",
        next: "Share the controlled supplier link.",
        states: ["Loading: dashboard skeleton", "Error: BOQ could not be read", "Empty: paste or upload the first BOQ"],
      },
      {
        screen: "Quote review",
        route: "/pm/dashboard/review",
        job: "Compare price, exceptions, lead time, proof.",
        primaryAction: "Review quote table",
        next: "Select the winning supplier.",
        states: ["Loading: dashboard skeleton", "Error: comparison unavailable", "Empty: no supplier replies yet"],
      },
      {
        screen: "Awards",
        route: "/pm/dashboard/awards",
        job: "Export award summary.",
        primaryAction: "Export award record",
        next: "Keep the RFQ record available for audit and repeat buying.",
        states: ["Loading: dashboard skeleton", "Error: export unavailable", "Empty: no awarded RFQs yet"],
      },
    ],
  },
  {
    id: "purchaser-admin",
    audience: "Purchaser admin",
    title: "Govern buyer teams and approvals",
    summary: "Buyer seats, RFQ templates, approval gates, audit boundaries.",
    entryRoute: "/register?role=purchaser_admin",
    dashboardRoute: "/pm/admin/dashboard",
    accent: "Buyer admin lane",
    steps: [
      {
        screen: "Role choice",
        route: "/",
        job: "Choose purchaser admin path.",
        primaryAction: "Start as purchaser admin",
        next: "Open the split sign-up flow with buyer-admin role selected.",
        states: ["Loading: public skeleton", "Error: friendly recovery page", "Empty: no account needed to choose a role"],
      },
      {
        screen: "Sign up or log in",
        route: "/register?role=purchaser_admin",
        job: "Capture organization admin account details.",
        primaryAction: "Create purchaser admin account",
        next: "Enter the purchaser organization admin dashboard.",
        states: ["Loading: auth split skeleton", "Error: keep user on form with clear guidance", "Empty: blank fields with role selected"],
      },
      {
        screen: "Purchaser admin dashboard",
        route: "/pm/admin/dashboard",
        job: "Manage buyer users, RFQ templates, approval gates, and access reviews.",
        primaryAction: "Review buyer admin tasks",
        next: "Open buyer workspace pages when action is needed.",
        states: ["Loading: dashboard skeleton", "Error: dashboard recovery", "Empty: no admin tasks due"],
      },
      {
        screen: "Buyer RFQ controls",
        route: "/pm/dashboard/rfqs",
        job: "Keep RFQ creation rules and unit-basis templates consistent.",
        primaryAction: "Lock RFQ template",
        next: "Return to admin overview or review queue.",
        states: ["Loading: dashboard skeleton", "Error: RFQ controls unavailable", "Empty: no RFQ templates yet"],
      },
      {
        screen: "Buyer review queue",
        route: "/pm/dashboard/review",
        job: "Monitor quote exceptions and award approvals before export.",
        primaryAction: "Review buyer queue",
        next: "Approve, hold, or request clarification.",
        states: ["Loading: dashboard skeleton", "Error: review queue unavailable", "Empty: no buyer approvals waiting"],
      },
    ],
  },
  {
    id: "supplier",
    audience: "Supplier",
    title: "Receive, quote, and track",
    summary: "RFQ alert, quote link, line pricing, documents, award status.",
    entryRoute: "/register?role=supplier",
    dashboardRoute: "/supplier/dashboard",
    accent: "Supplier lane",
    steps: [
      {
        screen: "Role choice",
        route: "/",
        job: "Choose supplier path.",
        primaryAction: "Start as supplier",
        next: "Open supplier sign-up.",
        states: ["Loading: public skeleton", "Error: friendly recovery page", "Empty: no invitation required to preview"],
      },
      {
        screen: "Sign up or log in",
        route: "/register?role=supplier",
        job: "Capture supplier account details.",
        primaryAction: "Create supplier account",
        next: "Enter the supplier dashboard.",
        states: ["Loading: auth split skeleton", "Error: keep user on form with clear guidance", "Empty: blank fields with supplier role selected"],
      },
      {
        screen: "Supplier dashboard",
        route: "/supplier/dashboard",
        job: "Show alerts, drafts, documents, awards.",
        primaryAction: "Open RFQ alert",
        next: "Open the shared quote link.",
        states: ["Loading: dashboard skeleton", "Error: dashboard recovery", "Empty: no matching RFQs yet"],
      },
      {
        screen: "RFQ alerts",
        route: "/supplier/dashboard/alerts",
        job: "Show RFQ feed cards.",
        primaryAction: "Open and quote",
        next: "Submit a line-item quote.",
        states: ["Loading: dashboard skeleton", "Error: alert feed unavailable", "Empty: no new alerts"],
      },
      {
        screen: "Quote link",
        route: "/rfqs",
        job: "Price exact line items.",
        primaryAction: "Submit quote",
        next: "Return to supplier tracking.",
        states: ["Loading: quote skeleton", "Error: link cannot be opened", "Empty: link missing or expired"],
      },
      {
        screen: "Documents",
        route: "/supplier/dashboard/readiness",
        job: "Keep supplier documents ready.",
        primaryAction: "Review readiness",
        next: "Track quote status and award signals.",
        states: ["Loading: dashboard skeleton", "Error: documents unavailable", "Empty: no documents uploaded"],
      },
    ],
  },
  {
    id: "supplier-admin",
    audience: "Supplier admin",
    title: "Govern supplier teams and proof",
    summary: "Supplier seats, RFQ routing, quote gates, document readiness.",
    entryRoute: "/register?role=supplier_admin",
    dashboardRoute: "/supplier/admin/dashboard",
    accent: "Supplier admin lane",
    steps: [
      {
        screen: "Role choice",
        route: "/",
        job: "Choose supplier admin path.",
        primaryAction: "Start as supplier admin",
        next: "Open the split sign-up flow with supplier-admin role selected.",
        states: ["Loading: public skeleton", "Error: friendly recovery page", "Empty: no invitation required to preview"],
      },
      {
        screen: "Sign up or log in",
        route: "/register?role=supplier_admin",
        job: "Capture supplier organization admin account details.",
        primaryAction: "Create supplier admin account",
        next: "Enter the supplier organization admin dashboard.",
        states: ["Loading: auth split skeleton", "Error: keep user on form with clear guidance", "Empty: blank fields with supplier role selected"],
      },
      {
        screen: "Supplier admin dashboard",
        route: "/supplier/admin/dashboard",
        job: "Manage supplier users, RFQ alert routing, quote gates, and proof readiness.",
        primaryAction: "Review supplier admin tasks",
        next: "Open alerts, quote controls, or document readiness.",
        states: ["Loading: dashboard skeleton", "Error: dashboard recovery", "Empty: no supplier admin tasks due"],
      },
      {
        screen: "RFQ alert routing",
        route: "/supplier/dashboard/alerts",
        job: "Assign RFQ alerts by team, category, region, and urgency.",
        primaryAction: "Route alert",
        next: "Move to quote control or document readiness.",
        states: ["Loading: dashboard skeleton", "Error: alert routing unavailable", "Empty: no alerts to route"],
      },
      {
        screen: "Proof readiness",
        route: "/supplier/dashboard/readiness",
        job: "Keep trade license, VAT, agency letters, and certifications current.",
        primaryAction: "Review readiness",
        next: "Return to supplier admin overview.",
        states: ["Loading: dashboard skeleton", "Error: proof records unavailable", "Empty: no proof documents uploaded"],
      },
    ],
  },
  {
    id: "verification",
    audience: "Verification team",
    title: "Review, protect, and approve",
    summary: "Documents, role boundaries, flagged RFQs, supplier evidence.",
    entryRoute: "/admin/dashboard",
    dashboardRoute: "/admin/dashboard",
    accent: "Trust lane",
    steps: [
      {
        screen: "Verification dashboard",
        route: "/admin/dashboard",
        job: "See pending and flagged records.",
        primaryAction: "Review evidence",
        next: "Open the document queue.",
        states: ["Loading: dashboard skeleton", "Error: dashboard recovery", "Empty: no pending reviews"],
      },
      {
        screen: "Documents",
        route: "/admin/dashboard/documents",
        job: "Check identity, expiry, authorization.",
        primaryAction: "Open document review",
        next: "Confirm or escalate the evidence.",
        states: ["Loading: dashboard skeleton", "Error: document review unavailable", "Empty: no documents waiting"],
      },
      {
        screen: "Access control",
        route: "/admin/dashboard/access",
        job: "Keep role access separated.",
        primaryAction: "Review role map",
        next: "Close role gaps before sensitive actions are exposed.",
        states: ["Loading: dashboard skeleton", "Error: access map unavailable", "Empty: no access changes due"],
      },
      {
        screen: "Review queue",
        route: "/admin/dashboard/review",
        job: "Move unclear records to review.",
        primaryAction: "Open review queue",
        next: "Approve, hold, or escalate the record.",
        states: ["Loading: dashboard skeleton", "Error: queue unavailable", "Empty: no flagged records"],
      },
    ],
  },
];

export const crossProductStates = [
  {
    title: "Loading",
    body: "Light skeletons keep screens from going blank.",
  },
  {
    title: "Error",
    body: "Recovery paths stay visible.",
  },
  {
    title: "Not found",
    body: "Unknown links route users back.",
  },
  {
    title: "Empty",
    body: "Empty states point to the next action.",
  },
];
