"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import PageLayout from "@/components/page-layout";
import Link from "next/link";
import { 
  MapPin, Star, Shield, Clock, Phone, Mail, FileText, Check, Share2, Heart, 
  Download, ChevronRight, Copy, ExternalLink, CheckCircle, AlertCircle, 
  XCircle, Package, Truck, ShoppingCart, BarChart3, Zap, ThermometerSun,
  Gauge, Award, Globe, Calendar, Building2, ArrowRight, Loader2, Info,
  Plus, Minus, CreditCard, Wrench, BookOpen, HelpCircle, MessageSquare,
  ThumbsUp, ThumbsDown, PlayCircle, Image, FileSpreadsheet, File, ChevronDown,
  ChevronUp, Scale, History, Bookmark, Users, Timer, Settings, AlertTriangle,
  Lightbulb, RefreshCw
} from "lucide-react";

interface Certification {
  id: string;
  certification_name: string;
  standard_code: string | null;
  issuing_authority: string | null;
  is_mandatory: boolean;
  applies_in: string | null;
  notes: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  notes: string | null;
  specifications: Record<string, string> | null;
  brand: { id: string; name: string; slug: string; description: string | null } | null;
  category: { id: string; name: string; slug: string } | null;
  equipment_type: { id: string; name: string; slug: string } | null;
  certifications: Certification[];
}

interface SpecAnalysis {
  overallScore: number;
  efficiencyRating: string;
  complianceStatus: string;
  recommendations: string[];
  strengths: string[];
  considerations: string[];
}

interface StockInfo {
  available: boolean;
  quantity: number;
  location: string;
  leadTime: string;
  price: { min: number; max: number } | null;
}

interface Review {
  id: string;
  author: string;
  company: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  helpful: number;
  verified: boolean;
}

interface QAItem {
  id: string;
  question: string;
  answer: string;
  askedBy: string;
  answeredBy: string;
  date: string;
  helpful: number;
}

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  price?: string;
}

interface Document {
  id: string;
  name: string;
  type: "pdf" | "dwg" | "revit" | "spec" | "manual" | "video";
  size: string;
  date: string;
}

type TabType = "overview" | "certifications" | "spec-analysis" | "stock-order" | "documents" | "reviews" | "qa" | "support";

const BrandLogo = ({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) => {
  const letter = name.charAt(0).toUpperCase();
  const colors = [
    "bg-gradient-to-br from-[#0066cc] to-[#004999]",
    "bg-gradient-to-br from-[#30d158] to-[#248a3d]",
    "bg-gradient-to-br from-[#ff9500] to-[#cc7700]",
    "bg-gradient-to-br from-[#5856d6] to-[#3634a3]",
    "bg-gradient-to-br from-[#ff453a] to-[#cc362e]",
    "bg-gradient-to-br from-[#00c7be] to-[#009f98]",
  ];
  const colorIndex = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  
  const sizeClasses = {
    sm: "w-8 h-8 text-[14px]",
    md: "w-12 h-12 text-[18px]",
    lg: "w-16 h-16 text-[24px]",
  };
  
  return (
    <div className={`${sizeClasses[size]} ${colors[colorIndex]} rounded-[12px] flex items-center justify-center text-white font-bold shadow-lg`}>
      {letter}
    </div>
  );
};

const mockReviews: Review[] = [
  { id: "1", author: "Ahmed Al-Rashid", company: "Emirates Construction", rating: 5, date: "2025-01-10", title: "Excellent performance in Dubai heat", content: "We've installed this unit in our commercial project and it performs exceptionally well even during peak summer. Energy efficiency is as advertised.", helpful: 24, verified: true },
  { id: "2", author: "Sarah Hassan", company: "Gulf MEP Solutions", rating: 4, date: "2024-12-15", title: "Good product, fast delivery", content: "Quality product with good specifications. Delivery was faster than expected. Only minor issue was documentation in Arabic was missing.", helpful: 18, verified: true },
  { id: "3", author: "Mohammed Khan", company: "Al Futtaim Engineering", rating: 5, date: "2024-11-20", title: "Best in class for GCC projects", content: "We've been specifying this equipment for years. Reliability and after-sales support are excellent. Highly recommended for commercial projects.", helpful: 32, verified: true },
];

const mockQA: QAItem[] = [
  { id: "1", question: "What is the minimum ambient temperature for operation?", answer: "The unit can operate in ambient temperatures from -10°C to 52°C, making it ideal for GCC climate conditions. For extreme conditions, please contact our technical team.", askedBy: "Eng. Ahmad", answeredBy: "Technical Team", date: "2025-01-05", helpful: 15 },
  { id: "2", question: "Is this product compatible with BMS integration?", answer: "Yes, this product supports BACnet, Modbus, and LonWorks protocols for seamless BMS integration. We provide detailed integration guides upon request.", askedBy: "Project Manager", answeredBy: "Product Specialist", date: "2024-12-28", helpful: 22 },
  { id: "3", question: "What is the warranty coverage in UAE?", answer: "Standard warranty is 2 years for parts and 5 years for compressor. Extended warranty packages are available. Warranty is valid across all GCC countries.", askedBy: "Procurement Dept", answeredBy: "Sales Team", date: "2024-12-20", helpful: 28 },
];

const mockDocuments: Document[] = [
  { id: "1", name: "Technical Datasheet", type: "pdf", size: "2.4 MB", date: "2025-01" },
  { id: "2", name: "Installation Manual", type: "manual", size: "8.1 MB", date: "2024-12" },
  { id: "3", name: "CAD Drawings (DWG)", type: "dwg", size: "15.3 MB", date: "2024-11" },
  { id: "4", name: "Revit Family", type: "revit", size: "22.7 MB", date: "2024-11" },
  { id: "5", name: "Submittal Package", type: "spec", size: "5.2 MB", date: "2025-01" },
  { id: "6", name: "Product Overview Video", type: "video", size: "45 MB", date: "2024-10" },
];

const mockRelatedProducts: RelatedProduct[] = [
  { id: "1", name: "VFD Drive Controller", slug: "vfd-drive-controller", brand: "Danfoss", category: "Controllers", price: "AED 8,500" },
  { id: "2", name: "Heat Recovery Unit", slug: "heat-recovery-unit", brand: "Carrier", category: "Heat Recovery", price: "AED 12,000" },
  { id: "3", name: "Smart Thermostat Pro", slug: "smart-thermostat-pro", brand: "Honeywell", category: "Controls", price: "AED 2,800" },
  { id: "4", name: "Air Handling Unit", slug: "air-handling-unit", brand: "Trane", category: "AHU", price: "AED 45,000" },
];

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const [specAnalysis, setSpecAnalysis] = useState<SpecAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [isCheckingStock, setIsCheckingStock] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [selectedRegion, setSelectedRegion] = useState("UAE");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [certVerificationStatus, setCertVerificationStatus] = useState<Record<string, "verified" | "pending" | "expired">>({});
  
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [questionSubmitted, setQuestionSubmitted] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<"all" | "5" | "4" | "3">("all");
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [selectedCompareProducts, setSelectedCompareProducts] = useState<string[]>([]);

  const [quoteForm, setQuoteForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    quantity: "",
    message: "",
  });

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setIsLoading(false);
        if (data.certifications) {
          const statuses: Record<string, "verified" | "pending" | "expired"> = {};
          data.certifications.forEach((cert: Certification) => {
            const rand = Math.random();
            statuses[cert.id] = rand > 0.3 ? "verified" : rand > 0.1 ? "pending" : "expired";
          });
          setCertVerificationStatus(statuses);
        }
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [slug]);

  const runSpecAnalysis = () => {
    if (!product) return;
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const specs = product.specifications || {};
      const hasEfficiency = !!specs.efficiency || !!specs.eer || !!specs.cop;
      const hasCapacity = !!specs.capacity;
      
      setSpecAnalysis({
        overallScore: Math.floor(Math.random() * 15) + 85,
        efficiencyRating: hasEfficiency ? "A+" : "A",
        complianceStatus: "GCC Compliant",
        recommendations: [
          "Consider pairing with VFD for optimal energy savings",
          "Recommended for projects requiring LEED certification",
          "Ideal for high-rise commercial buildings",
        ],
        strengths: [
          hasCapacity ? `High capacity rating (${specs.capacity})` : "Versatile capacity range",
          hasEfficiency ? `Excellent efficiency (${specs.efficiency || specs.eer || specs.cop})` : "Energy efficient design",
          "Low maintenance requirements",
          "Proven reliability in GCC climate",
        ],
        considerations: [
          "Ensure adequate electrical supply capacity",
          "Professional installation recommended",
          "Regular filter maintenance required",
        ],
      });
      setIsAnalyzing(false);
    }, 1500);
  };

  const checkStockAvailability = () => {
    setIsCheckingStock(true);
    
    setTimeout(() => {
      const available = Math.random() > 0.3;
      setStockInfo({
        available,
        quantity: available ? Math.floor(Math.random() * 20) + 5 : 0,
        location: selectedRegion === "UAE" ? "Dubai, UAE" : selectedRegion === "KSA" ? "Riyadh, KSA" : "Doha, Qatar",
        leadTime: available ? "3-5 business days" : "2-3 weeks (import)",
        price: available ? { min: 15000, max: 25000 } : null,
      });
      setIsCheckingStock(false);
    }, 1200);
  };

  const handlePlaceOrder = () => {
    setOrderPlaced(true);
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteSubmitted(true);
  };

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
  };

  const handleCopyLink = async () => {
    const url = window.location.href;
    
    // First, try the modern clipboard API with safety checks
    if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      try {
        await navigator.clipboard.writeText(url);
        setCopySuccess(true);
        setTimeout(() => {
          setCopySuccess(false);
          setShowShareMenu(false);
        }, 2000);
        return; // Success
      } catch (err) {
        console.warn("Clipboard API failed, trying fallback", err);
      }
    }

    // Fallback for when Clipboard API is blocked or unavailable
    try {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      
      if (successful) {
        setCopySuccess(true);
        setTimeout(() => {
          setCopySuccess(false);
          setShowShareMenu(false);
        }, 2000);
      }
    } catch (err) {
      console.error("Fallback copy failed", err);
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleDownloadDatasheet = () => {
    if (!product) return;
    
    const specs = product.specifications || {};
    let content = `PRODUCT DATASHEET\n${"=".repeat(50)}\n\n`;
    content += `Product: ${product.name}\n`;
    if (product.brand) content += `Manufacturer: ${product.brand.name}\n`;
    if (product.category) content += `Category: ${product.category.name}\n`;
    if (product.equipment_type) content += `Equipment Type: ${product.equipment_type.name}\n`;
    content += `\nDescription:\n${product.description || "N/A"}\n`;
    
    if (Object.keys(specs).length > 0) {
      content += `\nTECHNICAL SPECIFICATIONS\n${"-".repeat(30)}\n`;
      Object.entries(specs).forEach(([key, value]) => {
        content += `${key.replace(/_/g, " ").toUpperCase()}: ${value}\n`;
      });
    }
    
    if (product.certifications && product.certifications.length > 0) {
      content += `\nCERTIFICATIONS\n${"-".repeat(30)}\n`;
      product.certifications.forEach((cert) => {
        content += `- ${cert.certification_name}`;
        if (cert.standard_code) content += ` (${cert.standard_code})`;
        if (cert.issuing_authority) content += ` - ${cert.issuing_authority}`;
        content += "\n";
      });
    }
    
    if (product.notes) {
      content += `\nIMPORTANT NOTES\n${"-".repeat(30)}\n${product.notes}\n`;
    }
    
    content += `\n${"=".repeat(50)}\nGenerated from ProcureSource\nDate: ${new Date().toLocaleDateString()}\n`;
    
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${product.slug}-datasheet.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setQuestionSubmitted(true);
    setNewQuestion("");
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "pdf": return <FileText className="w-5 h-5 text-[#ff453a]" />;
      case "dwg": return <Image className="w-5 h-5 text-[#0066cc]" />;
      case "revit": return <FileSpreadsheet className="w-5 h-5 text-[#30d158]" />;
      case "spec": return <File className="w-5 h-5 text-[#ff9500]" />;
      case "manual": return <BookOpen className="w-5 h-5 text-[#5856d6]" />;
      case "video": return <PlayCircle className="w-5 h-5 text-[#ff2d55]" />;
      default: return <File className="w-5 h-5 text-[#86868b]" />;
    }
  };

  if (isLoading) {
    return (
      <PageLayout title="Loading..." subtitle="">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#0066cc]" />
        </div>
      </PageLayout>
    );
  }

  if (error || !product) {
    return (
      <PageLayout title="Product Not Found" subtitle="">
        <div className="text-center py-12">
          <p className="text-[#ff453a] mb-4">{error || "Product not found"}</p>
          <Link href="/products" className="text-[#0066cc] hover:underline">
            Back to Products
          </Link>
        </div>
      </PageLayout>
    );
  }

  const specs = product.specifications || {};
  const avgRating = mockReviews.reduce((acc, r) => acc + r.rating, 0) / mockReviews.length;

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: FileText },
    { id: "documents" as const, label: "Documents", icon: Download },
    { id: "certifications" as const, label: "Certifications", icon: Shield },
    { id: "spec-analysis" as const, label: "Analysis", icon: BarChart3 },
    { id: "stock-order" as const, label: "Stock", icon: Package },
    { id: "reviews" as const, label: "Reviews", icon: Star },
    { id: "qa" as const, label: "Q&A", icon: HelpCircle },
    { id: "support" as const, label: "Support", icon: Wrench },
  ];

  return (
    <PageLayout 
      title={product.name} 
      subtitle={product.brand?.name || "HVAC Equipment"}
    >
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center text-[13px] text-[#86868b] flex-wrap gap-1">
        <Link href="/products" className="hover:text-[#0066cc]">Products</Link>
        <ChevronRight className="w-4 h-4" />
        {product.category && (
          <>
            <Link href={`/products?category=${product.category.id}`} className="hover:text-[#0066cc]">{product.category.name}</Link>
            <ChevronRight className="w-4 h-4" />
          </>
        )}
        <span className="text-[#1d1d1f]">{product.name}</span>
      </div>

      {/* Product Header Card */}
      <div className="bg-white rounded-[20px] overflow-hidden border border-[#e8e8ed] mb-6">
        <div className="flex flex-col lg:flex-row">
          {/* Product Image / Brand Logo */}
          <div className="w-full lg:w-80 h-64 lg:h-auto bg-gradient-to-br from-[#f5f5f7] to-[#e8e8ed] flex flex-col items-center justify-center flex-shrink-0 p-8">
            {product.brand ? (
              <BrandLogo name={product.brand.name} size="lg" />
            ) : (
              <div className="w-16 h-16 rounded-[16px] bg-[#86868b] flex items-center justify-center text-white text-[24px] font-bold">
                {product.name.charAt(0)}
              </div>
            )}
            <p className="text-[13px] text-[#86868b] mt-3">{product.brand?.name || "Product"}</p>
          </div>
          
          <div className="p-6 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {product.category && (
                <span className="text-[12px] bg-[#e8f4ff] text-[#0066cc] px-3 py-1 rounded-full">
                  {product.category.name}
                </span>
              )}
              {product.equipment_type && (
                <span className="text-[12px] bg-[#f5f5f7] text-[#424245] px-3 py-1 rounded-full">
                  {product.equipment_type.name}
                </span>
              )}
              {specs.origin && (
                <span className="flex items-center gap-1 text-[12px] text-[#86868b] bg-[#f5f5f7] px-3 py-1 rounded-full">
                  <MapPin className="w-3 h-3" />
                  Made in {specs.origin}
                </span>
              )}
              <span className="flex items-center gap-1 text-[12px] text-[#ff9500] bg-[#fff7ed] px-3 py-1 rounded-full">
                <Star className="w-3 h-3 fill-current" />
                {avgRating.toFixed(1)} ({mockReviews.length} reviews)
              </span>
            </div>

            <h1 className="text-[28px] font-bold text-[#1d1d1f] mb-2">{product.name}</h1>
            
            {product.brand && (
              <Link 
                href={`/manufacturers/${product.brand.slug}`} 
                className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity mb-4"
              >
                <BrandLogo name={product.brand.name} size="sm" />
                <span className="text-[#0066cc] text-[17px]">{product.brand.name}</span>
                <ChevronRight className="w-4 h-4 text-[#0066cc]" />
              </Link>
            )}
            
            {product.description && (
              <p className="text-[15px] text-[#424245] leading-relaxed line-clamp-3">{product.description}</p>
            )}

            {/* Quick Actions */}
            <div className="flex items-center gap-4 mt-6 pt-5 border-t border-[#e8e8ed] relative flex-wrap">
              <div className="relative">
                <button 
                  onClick={handleShare}
                  className="flex items-center gap-2 text-[13px] text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
                {showShareMenu && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-[12px] shadow-lg border border-[#e8e8ed] p-2 min-w-[180px] z-10">
                    <button
                      onClick={handleCopyLink}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[14px] text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-lg transition-colors"
                    >
                      {copySuccess ? <Check className="w-4 h-4 text-[#30d158]" /> : <Copy className="w-4 h-4" />}
                      {copySuccess ? "Copied!" : "Copy Link"}
                    </button>
                    <button
                      onClick={() => {
                        const url = encodeURIComponent(window.location.href);
                        const text = encodeURIComponent(`Check out ${product.name} on ProcureSource`);
                        window.parent.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url: `https://wa.me/?text=${text}%20${url}` } }, "*");
                        setShowShareMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[14px] text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" /> WhatsApp
                    </button>
                    <button
                      onClick={() => {
                        const url = encodeURIComponent(window.location.href);
                        const subject = encodeURIComponent(`${product.name} - ProcureSource`);
                        window.location.href = `mailto:?subject=${subject}&body=${url}`;
                        setShowShareMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[14px] text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-lg transition-colors"
                    >
                      <Mail className="w-4 h-4" /> Email
                    </button>
                  </div>
                )}
              </div>
              <button 
                onClick={handleSave}
                className={`flex items-center gap-2 text-[13px] transition-colors ${isSaved ? 'text-[#ff453a]' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} /> {isSaved ? 'Saved' : 'Save'}
              </button>
              <button 
                onClick={handleDownloadDatasheet}
                className="flex items-center gap-2 text-[13px] text-[#86868b] hover:text-[#1d1d1f] transition-colors"
              >
                <Download className="w-4 h-4" /> Datasheet
              </button>
              <button 
                onClick={() => setShowCompareModal(true)}
                className="flex items-center gap-2 text-[13px] text-[#86868b] hover:text-[#1d1d1f] transition-colors"
              >
                <Scale className="w-4 h-4" /> Compare
              </button>
              <button className="flex items-center gap-2 text-[13px] text-[#86868b] hover:text-[#1d1d1f] transition-colors">
                <History className="w-4 h-4" /> Price History
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-[16px] border border-[#e8e8ed] p-1.5 mb-6 flex gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13px] font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[#0066cc] text-white"
                  : "text-[#424245] hover:bg-[#f5f5f7]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <>
              {product.notes && (
                <div className="bg-[#fffbeb] border border-[#fcd34d] rounded-[18px] p-6">
                  <h3 className="text-[17px] font-semibold text-[#92400e] mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Important Notes
                  </h3>
                  <p className="text-[14px] text-[#78350f] leading-relaxed">{product.notes}</p>
                </div>
              )}

              {/* Specifications Table */}
              {Object.keys(specs).length > 0 && (
                <div className="bg-white rounded-[20px] p-6 border border-[#e8e8ed]">
                  <h2 className="text-[21px] font-semibold text-[#1d1d1f] mb-6 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#0066cc]" />
                    Technical Specifications
                  </h2>
                  <div className="overflow-hidden rounded-[12px] border border-[#e8e8ed]">
                    <table className="w-full">
                      <tbody>
                        {Object.entries(specs).map(([key, value], idx) => (
                          <tr key={key} className={idx % 2 === 0 ? "bg-[#fafafa]" : "bg-white"}>
                            <td className="px-4 py-3 text-[14px] text-[#86868b] font-medium w-1/3 capitalize border-r border-[#e8e8ed]">
                              {key.replace(/_/g, " ")}
                            </td>
                            <td className="px-4 py-3 text-[14px] text-[#1d1d1f]">
                              {value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Key Features */}
              <div className="bg-[#f0f9ff] rounded-[20px] p-6 border border-[#bfdbfe]">
                <h2 className="text-[19px] font-semibold text-[#1d1d1f] mb-4">Key Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {specs.capacity && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0066cc] flex items-center justify-center flex-shrink-0">
                        <Gauge className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-[#1d1d1f]">Capacity</p>
                        <p className="text-[13px] text-[#86868b]">{specs.capacity}</p>
                      </div>
                    </div>
                  )}
                  {(specs.efficiency || specs.eer || specs.cop) && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#30d158] flex items-center justify-center flex-shrink-0">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-[#1d1d1f]">Efficiency</p>
                        <p className="text-[13px] text-[#86868b]">{specs.efficiency || specs.eer || specs.cop}</p>
                      </div>
                    </div>
                  )}
                  {specs.warranty && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#ff9500] flex items-center justify-center flex-shrink-0">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-[#1d1d1f]">Warranty</p>
                        <p className="text-[13px] text-[#86868b]">{specs.warranty}</p>
                      </div>
                    </div>
                  )}
                  {specs.refrigerant && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#5856d6] flex items-center justify-center flex-shrink-0">
                        <ThermometerSun className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-[#1d1d1f]">Refrigerant</p>
                        <p className="text-[13px] text-[#86868b]">{specs.refrigerant}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Related Products */}
              <div className="bg-white rounded-[20px] p-6 border border-[#e8e8ed]">
                <h2 className="text-[19px] font-semibold text-[#1d1d1f] mb-6 flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-[#0066cc]" />
                  Related Products
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {mockRelatedProducts.map((rp) => (
                    <Link
                      key={rp.id}
                      href={`/products/${rp.slug}`}
                      className="group p-4 rounded-[14px] border border-[#e8e8ed] hover:border-[#0066cc] hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <BrandLogo name={rp.brand} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-medium text-[#1d1d1f] truncate group-hover:text-[#0066cc]">{rp.name}</p>
                          <p className="text-[12px] text-[#86868b]">{rp.brand}</p>
                          {rp.price && (
                            <p className="text-[13px] font-semibold text-[#30d158] mt-1">{rp.price}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Documents Tab */}
          {activeTab === "documents" && (
            <div className="space-y-6">
              <div className="bg-white rounded-[20px] p-6 border border-[#e8e8ed]">
                <h2 className="text-[21px] font-semibold text-[#1d1d1f] mb-6 flex items-center gap-2">
                  <Download className="w-5 h-5 text-[#0066cc]" />
                  Downloads & Documents
                </h2>
                <div className="space-y-3">
                  {mockDocuments.map((doc) => (
                    <div 
                      key={doc.id}
                      className="flex items-center justify-between p-4 rounded-[12px] border border-[#e8e8ed] hover:border-[#0066cc] hover:bg-[#f5f5f7] transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        {getDocumentIcon(doc.type)}
                        <div>
                          <p className="text-[15px] font-medium text-[#1d1d1f] group-hover:text-[#0066cc]">{doc.name}</p>
                          <p className="text-[12px] text-[#86868b]">{doc.size} • Updated {doc.date}</p>
                        </div>
                      </div>
                      <button className="p-2 rounded-full hover:bg-[#e8e8ed] transition-colors">
                        <Download className="w-5 h-5 text-[#0066cc]" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* BIM / CAD Info */}
              <div className="bg-gradient-to-br from-[#1d1d1f] to-[#3a3a3c] rounded-[20px] p-6 text-white">
                <h3 className="text-[19px] font-semibold mb-4 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5" />
                  BIM & CAD Resources
                </h3>
                <p className="text-[14px] text-white/80 mb-4">
                  Download Revit families, AutoCAD blocks, and IFC files for seamless integration with your design software.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <button className="bg-white/10 hover:bg-white/20 rounded-[10px] p-3 text-center transition-colors">
                    <p className="text-[13px] font-medium">Revit 2024</p>
                    <p className="text-[11px] text-white/60">.rfa</p>
                  </button>
                  <button className="bg-white/10 hover:bg-white/20 rounded-[10px] p-3 text-center transition-colors">
                    <p className="text-[13px] font-medium">AutoCAD</p>
                    <p className="text-[11px] text-white/60">.dwg</p>
                  </button>
                  <button className="bg-white/10 hover:bg-white/20 rounded-[10px] p-3 text-center transition-colors">
                    <p className="text-[13px] font-medium">IFC</p>
                    <p className="text-[11px] text-white/60">.ifc</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Certifications Tab */}
          {activeTab === "certifications" && (
            <div className="space-y-6">
              <div className="bg-white rounded-[20px] p-6 border border-[#e8e8ed]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[21px] font-semibold text-[#1d1d1f] flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#30d158]" />
                    Product Certifications
                  </h2>
                  <Link 
                    href="/certifications/verify" 
                    className="text-[13px] text-[#0066cc] hover:underline flex items-center gap-1"
                  >
                    Verify a certificate <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {product.certifications && product.certifications.length > 0 ? (
                  <div className="space-y-4">
                    {product.certifications.map((cert) => {
                      const status = certVerificationStatus[cert.id] || "pending";
                      return (
                        <div 
                          key={cert.id} 
                          className={`rounded-[16px] p-5 border ${
                            status === "verified" 
                              ? "bg-[#f0fdf4] border-[#86efac]" 
                              : status === "expired"
                              ? "bg-[#fef2f2] border-[#fecaca]"
                              : "bg-[#fffbeb] border-[#fde68a]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {status === "verified" && <CheckCircle className="w-5 h-5 text-[#22c55e]" />}
                                {status === "pending" && <AlertCircle className="w-5 h-5 text-[#f59e0b]" />}
                                {status === "expired" && <XCircle className="w-5 h-5 text-[#ef4444]" />}
                                <h3 className="text-[17px] font-semibold text-[#1d1d1f]">
                                  {cert.certification_name}
                                </h3>
                                {cert.is_mandatory && (
                                  <span className="text-[10px] bg-[#dc2626] text-white px-2 py-0.5 rounded-full font-medium">
                                    MANDATORY
                                  </span>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3 text-[13px]">
                                {cert.standard_code && (
                                  <div>
                                    <span className="text-[#86868b]">Standard:</span>
                                    <span className="ml-2 font-mono text-[#0066cc]">{cert.standard_code}</span>
                                  </div>
                                )}
                                {cert.issuing_authority && (
                                  <div>
                                    <span className="text-[#86868b]">Authority:</span>
                                    <span className="ml-2 text-[#1d1d1f]">{cert.issuing_authority}</span>
                                  </div>
                                )}
                                {cert.applies_in && (
                                  <div>
                                    <span className="text-[#86868b]">Region:</span>
                                    <span className="ml-2 text-[#1d1d1f]">{cert.applies_in}</span>
                                  </div>
                                )}
                                <div>
                                  <span className="text-[#86868b]">Status:</span>
                                  <span className={`ml-2 font-medium ${
                                    status === "verified" ? "text-[#22c55e]" : 
                                    status === "expired" ? "text-[#ef4444]" : "text-[#f59e0b]"
                                  }`}>
                                    {status === "verified" ? "Verified" : status === "expired" ? "Expired" : "Pending"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <button 
                              className="text-[12px] text-[#0066cc] hover:underline whitespace-nowrap"
                              onClick={() => {
                                const newStatus = { ...certVerificationStatus };
                                newStatus[cert.id] = "verified";
                                setCertVerificationStatus(newStatus);
                              }}
                            >
                              {status !== "verified" ? "Verify" : "View"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-[#86868b]">
                    <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No certifications listed</p>
                  </div>
                )}
              </div>

              {/* GCC Compliance */}
              <div className="bg-gradient-to-br from-[#1d1d1f] to-[#3a3a3c] rounded-[20px] p-6 text-white">
                <h3 className="text-[19px] font-semibold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  GCC Compliance
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {["UAE", "KSA", "Qatar", "Kuwait"].map((country) => (
                    <div key={country} className="bg-white/10 rounded-[12px] p-4 text-center">
                      <p className="text-[14px] font-medium mb-1">{country}</p>
                      <CheckCircle className="w-6 h-6 text-[#30d158] mx-auto" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Spec Analysis Tab */}
          {activeTab === "spec-analysis" && (
            <div className="space-y-6">
              {!specAnalysis ? (
                <div className="bg-white rounded-[20px] p-8 border border-[#e8e8ed] text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0066cc] to-[#5ac8fa] flex items-center justify-center mx-auto mb-5">
                    <BarChart3 className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-[24px] font-bold text-[#1d1d1f] mb-3">AI Spec Analysis</h2>
                  <p className="text-[15px] text-[#86868b] mb-6 max-w-md mx-auto">
                    Get AI-powered insights about specifications, efficiency, and project recommendations.
                  </p>
                  <button
                    onClick={runSpecAnalysis}
                    disabled={isAnalyzing}
                    className="inline-flex items-center gap-2 bg-[#0066cc] text-white px-8 py-4 rounded-full text-[17px] font-medium hover:bg-[#0055b3] transition-colors disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Run Analysis
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-white rounded-[20px] p-6 border border-[#e8e8ed]">
                    <h2 className="text-[21px] font-semibold text-[#1d1d1f] mb-6">Analysis Results</h2>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-[#f0fdf4] rounded-[14px]">
                        <div className="text-[36px] font-bold text-[#22c55e]">{specAnalysis.overallScore}</div>
                        <p className="text-[12px] text-[#86868b]">Score</p>
                      </div>
                      <div className="text-center p-4 bg-[#eff6ff] rounded-[14px]">
                        <div className="text-[36px] font-bold text-[#0066cc]">{specAnalysis.efficiencyRating}</div>
                        <p className="text-[12px] text-[#86868b]">Efficiency</p>
                      </div>
                      <div className="text-center p-4 bg-[#faf5ff] rounded-[14px]">
                        <CheckCircle className="w-8 h-8 text-[#8b5cf6] mx-auto" />
                        <p className="text-[12px] text-[#86868b] mt-1">{specAnalysis.complianceStatus}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#f0fdf4] rounded-[20px] p-6 border border-[#86efac]">
                    <h3 className="text-[17px] font-semibold text-[#166534] mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" /> Strengths
                    </h3>
                    <ul className="space-y-2">
                      {specAnalysis.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-[14px] text-[#15803d]">
                          <Check className="w-4 h-4 mt-0.5" />{s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[#eff6ff] rounded-[20px] p-6 border border-[#93c5fd]">
                    <h3 className="text-[17px] font-semibold text-[#1e40af] mb-4 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" /> Recommendations
                    </h3>
                    <ul className="space-y-2">
                      {specAnalysis.recommendations.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-[14px] text-[#1e40af]">
                          <ArrowRight className="w-4 h-4 mt-0.5" />{r}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button onClick={() => setSpecAnalysis(null)} className="text-[14px] text-[#0066cc] hover:underline">
                    <RefreshCw className="w-4 h-4 inline mr-1" /> Run again
                  </button>
                </>
              )}
            </div>
          )}

          {/* Stock & Order Tab */}
          {activeTab === "stock-order" && (
            <div className="space-y-6">
              <div className="bg-white rounded-[20px] p-6 border border-[#e8e8ed]">
                <h2 className="text-[21px] font-semibold text-[#1d1d1f] mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#0066cc]" />
                  Check Availability
                </h2>
                <div className="flex flex-wrap gap-2 mb-6">
                  {["UAE", "KSA", "Qatar", "Kuwait", "Oman", "Bahrain"].map((region) => (
                    <button
                      key={region}
                      onClick={() => { setSelectedRegion(region); setStockInfo(null); }}
                      className={`px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
                        selectedRegion === region ? "bg-[#0066cc] text-white" : "bg-[#f5f5f7] text-[#424245] hover:bg-[#e8e8ed]"
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={checkStockAvailability}
                  disabled={isCheckingStock}
                  className="w-full bg-[#1d1d1f] text-white py-4 rounded-full text-[15px] font-medium hover:bg-[#3a3a3c] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCheckingStock ? <Loader2 className="w-5 h-5 animate-spin" /> : <Package className="w-5 h-5" />}
                  {isCheckingStock ? "Checking..." : `Check Stock in ${selectedRegion}`}
                </button>
              </div>

              {stockInfo && (
                <div className={`rounded-[20px] p-6 border ${stockInfo.available ? "bg-[#f0fdf4] border-[#86efac]" : "bg-[#fef2f2] border-[#fecaca]"}`}>
                  <div className="flex items-center gap-2 mb-4">
                    {stockInfo.available ? <CheckCircle className="w-6 h-6 text-[#22c55e]" /> : <XCircle className="w-6 h-6 text-[#ef4444]" />}
                    <h3 className="text-[19px] font-semibold">{stockInfo.available ? `${stockInfo.quantity} In Stock` : "Out of Stock"}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/60 rounded-[12px] p-4">
                      <p className="text-[12px] text-[#86868b] flex items-center gap-1"><MapPin className="w-3 h-3" />Location</p>
                      <p className="text-[14px] font-medium">{stockInfo.location}</p>
                    </div>
                    <div className="bg-white/60 rounded-[12px] p-4">
                      <p className="text-[12px] text-[#86868b] flex items-center gap-1"><Truck className="w-3 h-3" />Lead Time</p>
                      <p className="text-[14px] font-medium">{stockInfo.leadTime}</p>
                    </div>
                  </div>
                  {stockInfo.price && (
                    <div className="bg-white/60 rounded-[12px] p-4 mb-4">
                      <p className="text-[12px] text-[#86868b]">Price Range</p>
                      <p className="text-[24px] font-bold">AED {stockInfo.price.min.toLocaleString()} - {stockInfo.price.max.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              )}

              {stockInfo?.available && !orderPlaced && (
                <div className="bg-white rounded-[20px] p-6 border border-[#e8e8ed]">
                  <h3 className="text-[19px] font-semibold mb-4 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-[#0066cc]" /> Place Order
                  </h3>
                  <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))} className="w-10 h-10 rounded-full bg-[#f5f5f7] flex items-center justify-center">
                      <Minus className="w-4 h-4" />
                    </button>
                    <input type="number" value={orderQuantity} onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="w-20 h-10 text-center text-[18px] font-semibold border rounded-[10px]" />
                    <button onClick={() => setOrderQuantity(orderQuantity + 1)} className="w-10 h-10 rounded-full bg-[#f5f5f7] flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button onClick={handlePlaceOrder} className="w-full bg-[#0066cc] text-white py-4 rounded-full font-medium">
                    Request to Order
                  </button>
                </div>
              )}

              {orderPlaced && (
                <div className="bg-[#f0fdf4] rounded-[20px] p-8 text-center border border-[#86efac]">
                  <Check className="w-16 h-16 text-[#22c55e] mx-auto mb-4" />
                  <h3 className="text-[21px] font-bold text-[#166534] mb-2">Order Submitted!</h3>
                  <p className="text-[14px] text-[#15803d]">Reference: ORD-{Date.now().toString().slice(-8)}</p>
                  <button onClick={() => { setOrderPlaced(false); setStockInfo(null); }} className="mt-4 text-[#0066cc] text-[14px]">Place another</button>
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              <div className="bg-white rounded-[20px] p-6 border border-[#e8e8ed]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[21px] font-semibold text-[#1d1d1f] flex items-center gap-2">
                    <Star className="w-5 h-5 text-[#ff9500]" />
                    Customer Reviews
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="text-[32px] font-bold text-[#1d1d1f]">{avgRating.toFixed(1)}</div>
                    <div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-4 h-4 ${s <= avgRating ? "text-[#ff9500] fill-current" : "text-[#e8e8ed]"}`} />
                        ))}
                      </div>
                      <p className="text-[12px] text-[#86868b]">{mockReviews.length} reviews</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mb-6">
                  {(["all", "5", "4", "3"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setReviewFilter(f)}
                      className={`px-4 py-2 rounded-full text-[13px] font-medium ${reviewFilter === f ? "bg-[#0066cc] text-white" : "bg-[#f5f5f7] text-[#424245]"}`}
                    >
                      {f === "all" ? "All" : `${f} Stars`}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {mockReviews.filter(r => reviewFilter === "all" || r.rating === parseInt(reviewFilter)).map((review) => (
                    <div key={review.id} className="p-5 rounded-[14px] bg-[#f5f5f7]">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0066cc] to-[#5856d6] flex items-center justify-center text-white font-bold">
                            {review.author.charAt(0)}
                          </div>
                          <div>
                            <p className="text-[14px] font-medium text-[#1d1d1f]">{review.author}</p>
                            <p className="text-[12px] text-[#86868b]">{review.company}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`w-4 h-4 ${s <= review.rating ? "text-[#ff9500] fill-current" : "text-[#d2d2d7]"}`} />
                          ))}
                        </div>
                      </div>
                      <h4 className="text-[15px] font-semibold text-[#1d1d1f] mb-2">{review.title}</h4>
                      <p className="text-[14px] text-[#424245] mb-3">{review.content}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] text-[#86868b]">{review.date}</span>
                        <div className="flex items-center gap-4">
                          {review.verified && (
                            <span className="text-[11px] text-[#30d158] flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Verified Purchase
                            </span>
                          )}
                          <button className="flex items-center gap-1 text-[12px] text-[#86868b] hover:text-[#0066cc]">
                            <ThumbsUp className="w-3 h-3" /> {review.helpful}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Q&A Tab */}
          {activeTab === "qa" && (
            <div className="space-y-6">
              <div className="bg-white rounded-[20px] p-6 border border-[#e8e8ed]">
                <h2 className="text-[21px] font-semibold text-[#1d1d1f] mb-6 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#0066cc]" />
                  Questions & Answers
                </h2>

                {!questionSubmitted ? (
                  <form onSubmit={handleQuestionSubmit} className="mb-6">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="Ask a question about this product..."
                        className="flex-1 px-4 py-3 rounded-[12px] border border-[#d2d2d7] focus:border-[#0066cc] focus:outline-none text-[14px]"
                      />
                      <button type="submit" className="px-6 py-3 bg-[#0066cc] text-white rounded-full text-[14px] font-medium hover:bg-[#0055b3]">
                        Ask
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="mb-6 p-4 bg-[#f0fdf4] rounded-[12px] border border-[#86efac]">
                    <p className="text-[14px] text-[#166534] flex items-center gap-2">
                      <Check className="w-4 h-4" /> Your question has been submitted!
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {mockQA.map((qa) => (
                    <div key={qa.id} className="border border-[#e8e8ed] rounded-[14px] overflow-hidden">
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === qa.id ? null : qa.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-[#f5f5f7] transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <HelpCircle className="w-5 h-5 text-[#0066cc] mt-0.5" />
                          <span className="text-[15px] font-medium text-[#1d1d1f]">{qa.question}</span>
                        </div>
                        {expandedFaq === qa.id ? <ChevronUp className="w-5 h-5 text-[#86868b]" /> : <ChevronDown className="w-5 h-5 text-[#86868b]" />}
                      </button>
                      {expandedFaq === qa.id && (
                        <div className="px-4 pb-4 pt-0">
                          <div className="pl-8 border-l-2 border-[#e8e8ed] ml-2">
                            <p className="text-[14px] text-[#424245] mb-3">{qa.answer}</p>
                            <div className="flex items-center justify-between text-[12px] text-[#86868b]">
                              <span>Answered by {qa.answeredBy} • {qa.date}</span>
                              <button className="flex items-center gap-1 hover:text-[#0066cc]">
                                <ThumbsUp className="w-3 h-3" /> Helpful ({qa.helpful})
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Support Tab */}
          {activeTab === "support" && (
            <div className="space-y-6">
              {/* Installation Guide */}
              <div className="bg-white rounded-[20px] p-6 border border-[#e8e8ed]">
                <h2 className="text-[21px] font-semibold text-[#1d1d1f] mb-6 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-[#0066cc]" />
                  Installation Guide
                </h2>
                <div className="space-y-4">
                  {[
                    { step: 1, title: "Site Preparation", desc: "Ensure adequate space, ventilation, and power supply" },
                    { step: 2, title: "Foundation Setup", desc: "Install anti-vibration mounts and level the base" },
                    { step: 3, title: "Electrical Connection", desc: "Connect to dedicated circuit with proper breaker" },
                    { step: 4, title: "Piping & Ductwork", desc: "Connect refrigerant lines and air ducts" },
                    { step: 5, title: "Commissioning", desc: "System startup, testing, and optimization" },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-4 p-4 bg-[#f5f5f7] rounded-[12px]">
                      <div className="w-8 h-8 rounded-full bg-[#0066cc] flex items-center justify-center text-white font-bold text-[14px]">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="text-[15px] font-medium text-[#1d1d1f]">{item.title}</h4>
                        <p className="text-[13px] text-[#86868b]">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Maintenance Tips */}
              <div className="bg-[#eff6ff] rounded-[20px] p-6 border border-[#93c5fd]">
                <h3 className="text-[19px] font-semibold text-[#1d1d1f] mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#0066cc]" />
                  Maintenance Schedule
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { freq: "Monthly", tasks: "Filter cleaning, visual inspection" },
                    { freq: "Quarterly", tasks: "Coil cleaning, belt check, refrigerant levels" },
                    { freq: "Annually", tasks: "Full service, compressor test, electrical check" },
                    { freq: "As Needed", tasks: "Replace worn parts, recalibrate controls" },
                  ].map((item) => (
                    <div key={item.freq} className="bg-white/60 rounded-[12px] p-4">
                      <p className="text-[14px] font-semibold text-[#1e40af] mb-1">{item.freq}</p>
                      <p className="text-[13px] text-[#424245]">{item.tasks}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warranty Info */}
              <div className="bg-gradient-to-br from-[#30d158] to-[#248a3d] rounded-[20px] p-6 text-white">
                <h3 className="text-[19px] font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Warranty Coverage
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-white/20 rounded-[12px] p-4 text-center">
                    <p className="text-[28px] font-bold">2</p>
                    <p className="text-[12px] text-white/80">Years Parts</p>
                  </div>
                  <div className="bg-white/20 rounded-[12px] p-4 text-center">
                    <p className="text-[28px] font-bold">5</p>
                    <p className="text-[12px] text-white/80">Years Compressor</p>
                  </div>
                  <div className="bg-white/20 rounded-[12px] p-4 text-center">
                    <p className="text-[28px] font-bold">GCC</p>
                    <p className="text-[12px] text-white/80">Coverage</p>
                  </div>
                </div>
                <p className="text-[13px] text-white/80">Extended warranty packages available. Contact support for details.</p>
              </div>

              {/* Troubleshooting */}
              <div className="bg-[#fffbeb] rounded-[20px] p-6 border border-[#fde68a]">
                <h3 className="text-[19px] font-semibold text-[#92400e] mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Common Issues
                </h3>
                <div className="space-y-3">
                  {[
                    { issue: "Unit not starting", solution: "Check power supply and circuit breaker" },
                    { issue: "Insufficient cooling", solution: "Clean filters, check refrigerant levels" },
                    { issue: "Unusual noise", solution: "Inspect fan bearings and mounting bolts" },
                    { issue: "Error codes", solution: "Refer to manual or contact support" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-white/60 rounded-[10px]">
                      <AlertCircle className="w-4 h-4 text-[#f59e0b] mt-0.5" />
                      <div>
                        <p className="text-[14px] font-medium text-[#92400e]">{item.issue}</p>
                        <p className="text-[13px] text-[#78350f]">{item.solution}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Request Quote Card */}
          <div className="bg-white rounded-[20px] p-6 border border-[#e8e8ed] sticky top-24">
            <h3 className="text-[19px] font-semibold text-[#1d1d1f] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0066cc]" />
              Request a Quote
            </h3>
            
            {quoteSubmitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-[#e8f5e9] flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-[#30d158]" />
                </div>
                <h4 className="text-[17px] font-semibold text-[#1d1d1f] mb-2">Quote Requested!</h4>
                <p className="text-[14px] text-[#86868b]">We&apos;ll contact you within 24 hours.</p>
              </div>
            ) : showQuoteForm ? (
              <form onSubmit={handleQuoteSubmit} className="space-y-3">
                <input type="text" placeholder="Your Name *" required value={quoteForm.name} onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value })} className="w-full px-4 py-3 rounded-[10px] border border-[#d2d2d7] focus:border-[#0066cc] focus:outline-none text-[14px]" />
                <input type="email" placeholder="Email *" required value={quoteForm.email} onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })} className="w-full px-4 py-3 rounded-[10px] border border-[#d2d2d7] focus:border-[#0066cc] focus:outline-none text-[14px]" />
                <input type="tel" placeholder="Phone *" required value={quoteForm.phone} onChange={(e) => setQuoteForm({ ...quoteForm, phone: e.target.value })} className="w-full px-4 py-3 rounded-[10px] border border-[#d2d2d7] focus:border-[#0066cc] focus:outline-none text-[14px]" />
                <input type="text" placeholder="Company" value={quoteForm.company} onChange={(e) => setQuoteForm({ ...quoteForm, company: e.target.value })} className="w-full px-4 py-3 rounded-[10px] border border-[#d2d2d7] focus:border-[#0066cc] focus:outline-none text-[14px]" />
                <input type="text" placeholder="Quantity" value={quoteForm.quantity} onChange={(e) => setQuoteForm({ ...quoteForm, quantity: e.target.value })} className="w-full px-4 py-3 rounded-[10px] border border-[#d2d2d7] focus:border-[#0066cc] focus:outline-none text-[14px]" />
                <button type="submit" className="w-full bg-[#0066cc] text-white py-3 rounded-full font-medium hover:bg-[#0055b3]">Submit</button>
                <button type="button" onClick={() => setShowQuoteForm(false)} className="w-full text-[#86868b] text-[14px]">Cancel</button>
              </form>
            ) : (
              <>
                <p className="text-[14px] text-[#86868b] mb-4">Get competitive pricing from verified suppliers.</p>
                <button onClick={() => setShowQuoteForm(true)} className="w-full bg-[#0066cc] text-white py-4 rounded-full font-medium hover:bg-[#0055b3] mb-3">Get Quote</button>
                <div className="flex items-center gap-2 text-[13px] text-[#86868b] justify-center">
                  <Clock className="w-4 h-4" /> Usually responds within 24 hours
                </div>
              </>
            )}
          </div>

          {/* Contact */}
          <div className="bg-[#fbfbfd] rounded-[20px] p-6 border border-[#e8e8ed]">
            <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-4">Contact</h3>
            <div className="space-y-3">
              <a href="tel:+97144441234" className="flex items-center gap-3 text-[14px] text-[#424245] hover:text-[#0066cc]">
                <div className="w-10 h-10 rounded-full bg-[#e8f4ff] flex items-center justify-center">
                  <Phone className="w-5 h-5 text-[#0066cc]" />
                </div>
                <div>
                  <p className="font-medium">Call Now</p>
                  <p className="text-[12px] text-[#86868b]">+971 4 444 1234</p>
                </div>
              </a>
              <a href="mailto:info@procuresource.ae" className="flex items-center gap-3 text-[14px] text-[#424245] hover:text-[#0066cc]">
                <div className="w-10 h-10 rounded-full bg-[#e8f4ff] flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#0066cc]" />
                </div>
                <div>
                  <p className="font-medium">Email Us</p>
                  <p className="text-[12px] text-[#86868b]">info@procuresource.ae</p>
                </div>
              </a>
            </div>
          </div>

          {/* Quick Certifications */}
          {product.certifications && product.certifications.length > 0 && (
            <div className="bg-white rounded-[20px] p-6 border border-[#e8e8ed]">
              <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#30d158]" />
                Certifications
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.certifications.slice(0, 4).map((cert) => (
                  <span key={cert.id} className="text-[12px] bg-[#f0fdf4] text-[#166534] px-3 py-1.5 rounded-full border border-[#86efac]">
                    {cert.certification_name}
                  </span>
                ))}
              </div>
              <button onClick={() => setActiveTab("certifications")} className="w-full mt-4 text-[13px] text-[#0066cc] hover:underline flex items-center justify-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Brand Info */}
          {product.brand && (
            <div className="bg-[#f5f5f7] rounded-[20px] p-6">
              <div className="flex items-center gap-3 mb-3">
                <BrandLogo name={product.brand.name} size="md" />
                <div>
                  <h3 className="text-[17px] font-semibold text-[#1d1d1f]">{product.brand.name}</h3>
                  <p className="text-[12px] text-[#86868b]">Manufacturer</p>
                </div>
              </div>
              <p className="text-[14px] text-[#86868b] mb-4">
                {product.brand.description || "Leading manufacturer of HVAC equipment"}
              </p>
              <Link href={`/manufacturers/${product.brand.slug}`} className="text-[#0066cc] text-[14px] font-medium hover:underline inline-flex items-center gap-1">
                View all products <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-white rounded-[20px] p-6 border border-[#e8e8ed]">
            <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#5856d6]" />
              Product Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-[#f5f5f7] rounded-[10px]">
                <p className="text-[20px] font-bold text-[#0066cc]">2.4k</p>
                <p className="text-[11px] text-[#86868b]">Views</p>
              </div>
              <div className="text-center p-3 bg-[#f5f5f7] rounded-[10px]">
                <p className="text-[20px] font-bold text-[#30d158]">156</p>
                <p className="text-[11px] text-[#86868b]">Inquiries</p>
              </div>
              <div className="text-center p-3 bg-[#f5f5f7] rounded-[10px]">
                <p className="text-[20px] font-bold text-[#ff9500]">89</p>
                <p className="text-[11px] text-[#86868b]">Orders</p>
              </div>
              <div className="text-center p-3 bg-[#f5f5f7] rounded-[10px]">
                <p className="text-[20px] font-bold text-[#5856d6]">4.8</p>
                <p className="text-[11px] text-[#86868b]">Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compare Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[20px] p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[19px] font-semibold">Compare Products</h3>
              <button onClick={() => setShowCompareModal(false)} className="p-2 hover:bg-[#f5f5f7] rounded-full">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[14px] text-[#86868b] mb-4">Select products to compare with {product.name}</p>
            <div className="space-y-3">
              {mockRelatedProducts.map((rp) => (
                <label key={rp.id} className="flex items-center gap-3 p-3 rounded-[12px] border border-[#e8e8ed] hover:border-[#0066cc] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCompareProducts.includes(rp.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCompareProducts([...selectedCompareProducts, rp.id]);
                      } else {
                        setSelectedCompareProducts(selectedCompareProducts.filter(id => id !== rp.id));
                      }
                    }}
                    className="w-4 h-4 accent-[#0066cc]"
                  />
                  <BrandLogo name={rp.brand} size="sm" />
                  <div>
                    <p className="text-[14px] font-medium">{rp.name}</p>
                    <p className="text-[12px] text-[#86868b]">{rp.brand}</p>
                  </div>
                </label>
              ))}
            </div>
            <button
              onClick={() => setShowCompareModal(false)}
              disabled={selectedCompareProducts.length === 0}
              className="w-full mt-6 bg-[#0066cc] text-white py-3 rounded-full font-medium disabled:opacity-50"
            >
              Compare {selectedCompareProducts.length > 0 ? `(${selectedCompareProducts.length + 1})` : ""}
            </button>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
