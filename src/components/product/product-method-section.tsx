"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ArrowLeft, ArrowRight, ClipboardCheck, FileCheck2, Link2, Scale } from "lucide-react";

const methodCards = [
  {
    number: "Step 1",
    title: "Read the BOQ",
    body: "Upload once. Get quote-ready lines.",
    icon: ClipboardCheck,
    image: "/assets/product/method-01-boq-parse.png",
    meta: "Purchaser",
    rows: ["BOQ upload", "Line items"],
  },
  {
    number: "Step 2",
    title: "Share one RFQ link",
    body: "Suppliers quote from the same basis.",
    icon: Link2,
    image: "/assets/product/method-02-rfq-link.png",
    meta: "RFQ",
    rows: ["Metric basis", "Supplier link"],
  },
  {
    number: "Step 3",
    title: "Compare replies",
    body: "Price, lead time, proof, exceptions.",
    icon: Scale,
    image: "/assets/product/method-03-compare.png",
    meta: "Review",
    rows: ["Price", "Lead time"],
  },
  {
    number: "Step 4",
    title: "Award and keep record",
    body: "Choose the winner and export.",
    icon: FileCheck2,
    image: "/assets/product/method-04-award-export.png",
    meta: "Award",
    rows: ["Award reason", "Export record"],
  },
];

export function ProductMethodSection() {
  const carouselRef = useRef<HTMLDivElement>(null);

  function scrollCards(direction: "left" | "right") {
    carouselRef.current?.scrollBy({
      left: direction === "left" ? -420 : 420,
      behavior: "smooth",
    });
  }

  return (
    <section className="bg-[#f7f7f1] text-[#111827]">
      <div className="mx-auto max-w-[1240px] px-4 py-12 sm:px-6 lg:py-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[760px]">
            <p className="text-[12px] font-semibold text-[#0066cc]">How it works</p>
            <h2 className="mt-4 text-[32px] font-medium leading-[1.08] sm:text-[46px] lg:text-[58px]">
              From BOQ to award.
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => scrollCards("left")}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#c9c2b8] bg-white/72 text-[#352a24] hover:bg-white"
              aria-label="Show previous step"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollCards("right")}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#c9c2b8] bg-white/72 text-[#352a24] hover:bg-white"
              aria-label="Show next step"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          ref={carouselRef}
          className="mt-10 flex snap-x gap-5 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="ProcureSource workflow steps"
        >
          {methodCards.map((card) => (
            <article
              key={card.number}
              className="relative w-[84vw] max-w-[410px] shrink-0 snap-start overflow-hidden bg-[#efefed] p-4 sm:w-[390px]"
            >
              <div className="absolute right-0 top-0 h-12 w-12 bg-[#f7f7f1] [clip-path:polygon(100%_0,0_0,100%_100%)]" aria-hidden="true" />
              <p className="border-b border-[#9ca3af] pb-3 text-[12px] font-semibold text-[#81786f]">{card.number}</p>
              <div className="mt-4 flex items-center justify-between border-b border-[#9ca3af] pb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0066cc]">
                  <card.icon className="h-4 w-4" />
                </div>
                <span className="rounded-full bg-white/76 px-3 py-1 text-[11px] font-semibold text-[#0066cc]">
                  {card.meta}
                </span>
              </div>

              <div className="pt-5">
                <h3 className="text-[18px] font-semibold leading-tight text-[#352a24]">{card.title}</h3>
                <p className="mt-2 min-h-10 text-[13px] leading-5 text-[#6c6258]">{card.body}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {card.rows.map((row) => (
                    <span key={row} className="rounded-full bg-white/76 px-3 py-1.5 text-[11px] font-semibold text-[#5d5148]">
                      {row}
                    </span>
                  ))}
                </div>
                <div className="relative mt-7 aspect-[1.62] overflow-hidden bg-[#eef7ff]">
                  <Image
                    src={card.image}
                    alt=""
                    fill
                    sizes="410px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-black/5" />
                </div>
                <Link href="/product" className="mt-5 inline-flex items-center gap-2 text-[13px] font-semibold text-[#352a24] hover:text-[#0066cc]">
                  Open workspace
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
