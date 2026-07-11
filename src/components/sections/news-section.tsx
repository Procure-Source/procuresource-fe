"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const newsItems = [
  {
    id: 1,
    title: "The Future of Sustainable HVAC Systems in 2026",
    category: "Innovation",
    date: "Jan 15, 2026",
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=800",
    excerpt: "New regulatory standards are driving a shift toward low-GWP refrigerants and hybrid energy-recovery systems."
  },
  {
    id: 2,
    title: "Global Supply Chain Resilience for Infrastructure",
    category: "Market News",
    date: "Jan 12, 2026",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800",
    excerpt: "How procurement leaders are leveraging real-time data to mitigate logistical risks in major construction projects."
  },
  {
    id: 3,
    title: "Breakthrough in Industrial Pump Efficiency",
    category: "Technology",
    date: "Jan 08, 2026",
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800",
    excerpt: "Introducing the next generation of smart pumps with integrated predictive maintenance and AI optimization."
  }
];

export default function NewsSection() {
  return (
    <section className="py-24 bg-[#fbfbfd]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div className="max-w-[600px]">
            <span className="text-[#0066cc] font-semibold text-[14px] uppercase tracking-[0.1em] mb-4 block">
              Industry Insights
            </span>
            <h2 className="text-[40px] md:text-[56px] font-semibold tracking-tight text-[#1d1d1f] leading-[1.1]">
              Latest News & <br /> Innovations
            </h2>
          </div>
          <Link 
            href="/blog" 
            className="text-[#0066cc] hover:underline flex items-center gap-1 text-[17px] font-medium"
          >
            View all articles <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {newsItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-[20px] mb-6 bg-gray-200">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#86868b] bg-white border border-[#d2d2d7] px-2 py-0.5 rounded-md">
                  {item.category}
                </span>
                <span className="text-[13px] text-[#86868b]">{item.date}</span>
              </div>
              <h3 className="text-[22px] font-semibold text-[#1d1d1f] leading-tight mb-3 group-hover:text-[#0066cc] transition-colors">
                {item.title}
              </h3>
              <p className="text-[16px] text-[#424245] leading-relaxed line-clamp-2">
                {item.excerpt}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
