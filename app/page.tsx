import BackedBy from "@/components/BackedBy";
import Faq from "@/components/Faq";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import LaunchCredibility from "@/components/LaunchCredibility";
import Problem from "@/components/Problem";
import ProcurementTransformationSection from "@/components/ProcurementTransformationSection";
import RequestAccess from "@/components/RequestAccess";
import UaeMep from "@/components/UaeMep";
import WhyProcureSource from "@/components/WhyProcureSource";

export default function Home() {
  return (
    <>
      <Hero />
      <LaunchCredibility>
        <BackedBy />
      </LaunchCredibility>
      <ProcurementTransformationSection />
      <Problem />
      <HowItWorks />
      <WhyProcureSource />
      <UaeMep />
      <Faq />
      <RequestAccess />
    </>
  );
}
