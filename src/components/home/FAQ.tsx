"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

const faqs = [
  {
    q: "What is a tech suit?",
    a: "A tech suit (technical racing suit) is a high-performance competitive swimsuit made from advanced materials that compress the body, reduce drag, and enhance buoyancy. Brands like Arena, Speedo, FINIS, and TYR make some of the most popular tech suits. They're worn exclusively for competition and have a limited lifespan, which is exactly why a resale market makes sense.",
  },
  {
    q: "How does SuitScore™ work?",
    a: "SuitScore™ is our standardized 5-tier condition system. Sellers choose one tier when creating a listing: Gold (0–2 races, 100% performance), Podium (3–6 races, 90%), Prelim (7–10 races, 70–80%), Backup (11–14 races, 40–60%), or Practice (15+ races, minimal compression). Each tier has detailed criteria covering logo/label condition, elasticity, and water repellency, so buyers know exactly what to expect.",
  },
  {
    q: "How does shipping work?",
    a: "Sellers ship directly to buyers using a carrier of their choice. Tracking information is uploaded to the order so you can follow your suit's journey. We recommend USPS First Class or Priority Mail for domestic shipments. Sellers are responsible for packaging suits safely.",
  },
  {
    q: "What if my suit doesn't match the listing?",
    a: "If your suit arrives in worse condition than the listed SuitScore™ tier, or if it's not the item described, you can open a dispute within 48 hours of confirming delivery. To submit: go to our Contact page (Help Center → Contact & Support), select \"Dispute\" as your reason, and include your order ID, a description of the issue, and photo evidence. Our team reviews disputes within 3 business days and issues refunds for valid claims. This is backed by our Buyer Protection policy.",
  },
  {
    q: "How do I know what size to buy?",
    a: "Each listing includes the manufacturer's size label (e.g., 24, 26, 28 for women's kneeskins, or S/M/L for jammers). We recommend checking the brand's official size chart before purchasing, as sizing varies significantly between brands like Speedo, Arena, and TYR. When in doubt, size up, tech suits are intentionally tight.",
  },
  {
    q: "Is SuitCycle only for elite swimmers?",
    a: "Not at all. SuitCycle is for anyone who swims competitively, high school swimmers, club athletes, masters competitors, and parents buying for their kids. Many of our best deals are Practice-tier suits that are perfect for training or a swimmer's first tech suit experience.",
  },
];

export function FAQ() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-[#00B4FF] mb-3">
            FAQ
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-[#1A1A2E]">
            Common questions
          </h2>
        </motion.div>

        <Accordion.Root type="single" collapsible className="flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.q}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <Accordion.Item
                value={`item-${i}`}
                className="rounded-xl border border-slate-200 bg-[#F0F7FF] overflow-hidden"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="group flex w-full items-center justify-between px-6 py-5 text-left text-[#1A1A2E] font-semibold hover:bg-slate-50/80 transition-colors data-[state=open]:bg-white">
                    <span className="pr-4 text-sm sm:text-base">{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className="shrink-0 text-[#00B4FF] transition-transform duration-200 group-data-[state=open]:rotate-180"
                    />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                  <div className="px-6 pb-5 pt-2 text-sm text-[#64748B] leading-relaxed bg-white">
                    {faq.a}
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            </motion.div>
          ))}
        </Accordion.Root>

        <div className="mt-10 text-center text-sm text-slate-500">
          Still have questions?{" "}
          <a href="/help" className="text-[#00B4FF] font-semibold hover:underline">
            Visit our Help Center
          </a>
        </div>
      </div>
    </section>
  );
}
