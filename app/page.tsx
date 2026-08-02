import BackedBy from "@/components/BackedBy";
import Faq from "@/components/Faq";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import RequestAccess from "@/components/RequestAccess";

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <RequestAccess />
      <BackedBy />
      <Faq />
    </>
  );
}
