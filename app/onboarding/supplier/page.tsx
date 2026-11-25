import OnboardingForm from "@/components/OnboardingForm";

export default function SupplierOnboardingPage() {
  return (
    <section className="py-strip">
      <div className="mx-auto w-full max-w-md px-gutter">
        <h1 className="font-display text-form-title font-semibold leading-title tracking-heading">
          Join the ProcureSource supplier marketplace
        </h1>
        <p className="mt-3 mb-6 text-small leading-body text-ink-muted">
          ProcureSource is live for procurers to collaborate with their trusted
          suppliers and share BOQs. We are now onboarding suppliers to the
          marketplace.
        </p>
        <OnboardingForm type="supplier" />
      </div>
    </section>
  );
}
