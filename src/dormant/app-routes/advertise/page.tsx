"use client";

import { useState } from "react";
import PageLayout from "@/components/page-layout";
import { Check, Star, Zap, TrendingUp, Users, Globe, Award, Phone, Mail, Building } from "lucide-react";

export default function AdvertisePage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const plans = [
    {
      id: "basic",
      name: "Basic Listing",
      price: "Free",
      period: "",
      description: "Get started with a basic company profile",
      features: [
        "Company profile page",
        "Up to 5 product listings",
        "Contact information display",
        "Basic search visibility",
      ],
      highlighted: false,
    },
    {
      id: "premium",
      name: "Premium",
      price: "AED 2,500",
      period: "/month",
      description: "Enhanced visibility and features",
      features: [
        "Everything in Basic",
        "Unlimited product listings",
        "Priority search ranking",
        "Featured on homepage",
        "Lead generation dashboard",
        "Analytics & reporting",
        "Direct RFQ notifications",
      ],
      highlighted: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "Full-service partnership",
      features: [
        "Everything in Premium",
        "Dedicated account manager",
        "Custom integrations",
        "API access",
        "White-label options",
        "Co-branded content",
        "Trade show support",
        "Priority support 24/7",
      ],
      highlighted: false,
    },
  ];

  const benefits = [
    {
      icon: Users,
      title: "Reach Decision Makers",
      description: "Connect with MEP engineers, consultants, and procurement managers across the GCC region",
    },
    {
      icon: TrendingUp,
      title: "Qualified Leads",
      description: "Receive RFQs from verified buyers actively searching for your products",
    },
    {
      icon: Globe,
      title: "Regional Presence",
      description: "Establish your brand in UAE, Saudi Arabia, Qatar, and other GCC markets",
    },
    {
      icon: Award,
      title: "Credibility",
      description: "Showcase certifications, compliance data, and case studies to build trust",
    },
  ];

  const stats = [
    { value: "50,000+", label: "Monthly visitors" },
    { value: "2,500+", label: "Active buyers" },
    { value: "500+", label: "Listed products" },
    { value: "15+", label: "GCC countries" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <PageLayout
      title="Advertise With Us"
      subtitle="Reach thousands of MEP professionals and procurement decision-makers across the GCC"
    >
      <div className="space-y-16">
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center p-6 bg-gradient-to-br from-[#f5f5f7] to-[#e8e8ed] rounded-[18px]">
              <div className="text-[32px] font-bold text-[#0066cc]">{stat.value}</div>
              <div className="text-[14px] text-[#86868b]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div>
          <h2 className="text-[28px] font-semibold text-[#1d1d1f] text-center mb-8">Why Advertise on ProcureSource?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="bg-[#fbfbfd] rounded-[18px] p-6 border border-[#e8e8ed] hover:border-[#0066cc] transition-colors">
                <div className="w-12 h-12 rounded-full bg-[#e8f4ff] flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-[#0066cc]" />
                </div>
                <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-2">{benefit.title}</h3>
                <p className="text-[14px] text-[#86868b]">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Plans */}
        <div>
          <h2 className="text-[28px] font-semibold text-[#1d1d1f] text-center mb-3">Advertising Plans</h2>
          <p className="text-[15px] text-[#86868b] text-center mb-8">Choose the plan that fits your business needs</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative rounded-[20px] p-6 cursor-pointer transition-all ${
                  plan.highlighted
                    ? "bg-gradient-to-br from-[#0066cc] to-[#0055b3] text-white scale-105 shadow-xl"
                    : selectedPlan === plan.id
                    ? "bg-[#f0f9ff] border-2 border-[#0066cc]"
                    : "bg-[#fbfbfd] border border-[#e8e8ed] hover:border-[#0066cc]"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#ff9500] text-white text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" /> Most Popular
                    </span>
                  </div>
                )}
                
                <h3 className={`text-[21px] font-semibold mb-1 ${plan.highlighted ? "text-white" : "text-[#1d1d1f]"}`}>
                  {plan.name}
                </h3>
                <p className={`text-[13px] mb-4 ${plan.highlighted ? "text-white/80" : "text-[#86868b]"}`}>
                  {plan.description}
                </p>
                
                <div className="mb-6">
                  <span className={`text-[36px] font-bold ${plan.highlighted ? "text-white" : "text-[#1d1d1f]"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-[14px] ${plan.highlighted ? "text-white/70" : "text-[#86868b]"}`}>
                    {plan.period}
                  </span>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className={`w-5 h-5 flex-shrink-0 ${plan.highlighted ? "text-[#30d158]" : "text-[#30d158]"}`} />
                      <span className={`text-[14px] ${plan.highlighted ? "text-white" : "text-[#424245]"}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <button
                  className={`w-full py-3 rounded-full text-[15px] font-medium transition-colors ${
                    plan.highlighted
                      ? "bg-white text-[#0066cc] hover:bg-[#f5f5f7]"
                      : "bg-[#0066cc] text-white hover:bg-[#0055b3]"
                  }`}
                >
                  {plan.id === "enterprise" ? "Contact Us" : "Get Started"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-[#fbfbfd] rounded-[20px] p-8 border border-[#e8e8ed]">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-[28px] font-semibold text-[#1d1d1f] text-center mb-2">Get In Touch</h2>
            <p className="text-[15px] text-[#86868b] text-center mb-8">
              Fill out the form below and our team will contact you within 24 hours
            </p>

            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#e8f5e9] flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-[#30d158]" />
                </div>
                <h3 className="text-[21px] font-semibold text-[#1d1d1f] mb-2">Thank You!</h3>
                <p className="text-[15px] text-[#86868b]">
                  We&apos;ve received your inquiry and will get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">
                      <Building className="w-4 h-4 inline mr-2" />
                      Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full px-4 py-3 rounded-[12px] border border-[#d2d2d7] focus:border-[#0066cc] focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20"
                      placeholder="Your company name"
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="w-full px-4 py-3 rounded-[12px] border border-[#d2d2d7] focus:border-[#0066cc] focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20"
                      placeholder="Your name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-[12px] border border-[#d2d2d7] focus:border-[#0066cc] focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-[12px] border border-[#d2d2d7] focus:border-[#0066cc] focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20"
                      placeholder="+971 XX XXX XXXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-3 rounded-[12px] border border-[#d2d2d7] focus:border-[#0066cc] focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20"
                    placeholder="https://yourcompany.com"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-[12px] border border-[#d2d2d7] focus:border-[#0066cc] focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 resize-none"
                    placeholder="Tell us about your advertising goals..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0066cc] text-white py-4 rounded-full text-[17px] font-medium hover:bg-[#0055b3] transition-colors flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  Submit Inquiry
                </button>
              </form>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-[#1d1d1f] to-[#424245] rounded-[20px] p-8 md:p-12 text-center">
          <h2 className="text-[32px] font-bold text-white mb-4">Ready to Grow Your Business?</h2>
          <p className="text-[17px] text-white/80 mb-8 max-w-2xl mx-auto">
            Join hundreds of manufacturers and suppliers who are already reaching thousands of MEP professionals through ProcureSource.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+97144441234"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#1d1d1f] px-8 py-4 rounded-full text-[17px] font-medium hover:bg-[#f5f5f7] transition-colors"
            >
              <Phone className="w-5 h-5" />
              Call Us Now
            </a>
            <a
              href="mailto:advertise@procuresource.ae"
              className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-full text-[17px] font-medium hover:bg-white/10 transition-colors"
            >
              <Mail className="w-5 h-5" />
              Email Us
            </a>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
