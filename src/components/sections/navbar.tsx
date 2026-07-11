"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Menu, X, User, LayoutDashboard, LogOut } from "lucide-react";
import LanguageSelector from "@/components/ui/language-selector";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import NotificationBell from "@/components/notifications/notification-bell";
import UnreadBadge from "@/components/messaging/unread-badge";

export default function Navbar() {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeFlyout, setActiveFlyout] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const isLoggedIn = !!user;
  const userRole = user?.role || null;

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const getDashboardLink = () => {
    switch (userRole) {
      case 'supplier':
        return '/supplier/dashboard';
      case 'purchase_manager':
        return '/pm/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/dashboard';
    }
  };

  const handleMouseEnter = (id: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setActiveFlyout(id);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setActiveFlyout(null);
    }, 150);
  };

      const navLinks = [
        { id: "brands", name: t("nav.brands"), href: "/manufacturers" },
        { id: "products", name: t("nav.products"), href: "/products" },
        { id: "suppliers", name: t("nav.agents"), href: "/agents" },
        { id: "advertise", name: "Advertise", href: "/advertise" },
      ];

  const megaMenuContent: Record<string, { title: string; items: { label: string; href: string }[] }[]> = {
    brands: [
      {
        title: "Browse by Category",
        items: [
          { label: "HVAC Manufacturers", href: "/manufacturers?category=hvac" },
          { label: "Electrical Manufacturers", href: "/manufacturers?category=electrical" },
          { label: "All Manufacturers", href: "/manufacturers" },
        ]
      },
    ],
    products: [
      {
        title: "Equipment Types",
        items: [
          { label: "Chillers", href: "/products?category=chillers" },
          { label: "Air Handling Units", href: "/products?category=ahu" },
          { label: "All Products", href: "/products" },
        ]
      },
    ],
    suppliers: [
      {
        title: "Find Suppliers",
        items: [
          { label: "UAE Suppliers", href: "/agents?country=AE" },
          { label: "Saudi Arabia", href: "/agents?country=SA" },
          { label: "All Regions", href: "/agents" },
        ]
      },
    ],
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[9999]" dir={dir}>
      <nav
        className={`w-full h-[88px] transition-colors duration-300 ${
          activeFlyout ? "bg-[#ffffff]" : "bg-[rgba(251,251,253,0.8)]"
        } backdrop-blur-[20px]`}
        onMouseLeave={handleMouseLeave}
      >
        <div className="max-w-[1200px] mx-auto px-3 min-[420px]:px-4 sm:px-[44px] h-full flex items-center justify-between gap-2">
          <Link
            href="/"
            className="text-[#1d1d1f] hover:opacity-80 transition-opacity flex items-center gap-2"
          >
            <Image
              src="/procuresource-logo-mark.svg"
              alt="ProcureSource"
              width={32}
              height={32}
              priority
              className="h-8 w-8"
            />
            <span className="hidden min-[420px]:inline text-[20px] font-bold tracking-normal text-[#1d1d1f]">ProcureSource</span>
          </Link>

          <ul className="hidden lg:flex flex-1 justify-center items-center list-none gap-8">
            {navLinks.map((link) => (
              <li key={link.id} className="relative">
                <Link
                  href={link.href}
                  className="text-[14px] font-medium text-[#1d1d1f] opacity-80 hover:opacity-100 transition-opacity whitespace-nowrap px-4 py-3"
                  onMouseEnter={() => megaMenuContent[link.id] && handleMouseEnter(link.id)}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-4 lg:gap-6">
            <LanguageSelector />
            <Link
              href="/search"
              className="text-[#1d1d1f] opacity-80 hover:opacity-100 transition-opacity relative group p-2"
              aria-label={t("nav.search")}
            >
              <Search className="w-[20px] h-[20px]" strokeWidth={1.8} />
            </Link>
            {isLoggedIn && <UnreadBadge />}
            {isLoggedIn && <NotificationBell />}
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link
                  href={getDashboardLink()}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#0066cc] text-white rounded-full text-[13px] font-semibold hover:bg-[#0077ed] transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {userRole === 'supplier' ? 'Supplier' : userRole === 'purchase_manager' ? 'PM' : 'Dashboard'}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-[#86868b] hover:text-[#ff3b30] transition-colors"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut className="w-[18px] h-[18px]" strokeWidth={1.8} />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-[#1d1d1f] opacity-80 hover:opacity-100 transition-opacity p-2"
                aria-label={t("nav.signIn")}
              >
                <User className="w-[20px] h-[20px]" strokeWidth={1.8} />
              </Link>
            )}
            <button
              className="lg:hidden text-[#1d1d1f] opacity-80 hover:opacity-100 p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-[22px] h-[22px]" /> : <Menu className="w-[22px] h-[22px]" />}
            </button>
          </div>
        </div>

        {activeFlyout && megaMenuContent[activeFlyout] && (
          <div
            className="absolute top-[88px] left-0 right-0 bg-[#ffffff] border-b border-[#d2d2d7] animate-in fade-in slide-in-from-top-1 duration-200"
            onMouseEnter={() => handleMouseEnter(activeFlyout)}
          >
            <div className="max-w-[980px] mx-auto px-[22px] py-10 flex gap-16">
              {megaMenuContent[activeFlyout].map((section, idx) => (
                <div key={idx} className={idx === 0 ? "flex-1" : "w-[200px]"}>
                  <h2 className="text-[11px] font-semibold text-[#86868b] mb-6 uppercase tracking-[0.05em]">
                    {section.title}
                  </h2>
                  <ul className="space-y-4">
                    {section.items.map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          className="text-[28px] font-semibold text-[#1d1d1f] hover:text-[#0066cc] transition-colors leading-tight block"
                          onClick={() => setActiveFlyout(null)}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>

      {activeFlyout && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md -z-10 h-screen mt-[88px]" />
      )}

      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#ffffff] border-b border-[#d2d2d7] max-h-[calc(100vh-88px)] overflow-y-auto">
          <div className="px-4 sm:px-[22px] py-4 sm:py-6 space-y-3 sm:space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block text-[15px] sm:text-[17px] font-normal text-[#1d1d1f] py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-[#d2d2d7] space-y-3">
              {isLoggedIn ? (
                <div className="space-y-3">
                  <Link
                    href={getDashboardLink()}
                    className="flex items-center justify-center gap-2 bg-[#0066cc] text-white py-3 rounded-full text-[14px] min-h-[44px] font-semibold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {userRole === 'supplier' ? 'Supplier Dashboard' : userRole === 'purchase_manager' ? 'PM Dashboard' : 'My Dashboard'}
                  </Link>
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-full text-[14px] min-h-[44px] font-medium text-[#ff3b30] border border-[#ff3b30]/20 hover:bg-[#ff3b30]/5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block text-[14px] text-[#0066cc]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("nav.signIn")}
                  </Link>
                  <Link
                    href="/register"
                    className="block bg-[#0066cc] text-white text-center py-3 rounded-full text-[14px] min-h-[44px] flex items-center justify-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("nav.createAccount")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
