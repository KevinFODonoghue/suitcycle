"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { SuitCondition } from "@prisma/client";
import { StepIndicator } from "@/components/sell/StepIndicator";
import { PhotoUploader, type PhotoFile } from "@/components/sell/PhotoUploader";
import { SuitScorePicker } from "@/components/sell/SuitScorePicker";
import { ArrowLeft, ArrowRight, Loader2, CheckCircle, Tag, ShieldCheck, Star, Ticket } from "lucide-react";
import {
  SELLER_PERK_PRIORITY_PERCENT,
  SELLER_PERK_AUTHENTICATION_PERCENT,
  SELLER_PERK_VERIFIED_SUITSCORE_PERCENT,
  PLATFORM_FEE_BPS,
  SELLER_PERK_PRIORITY_BPS,
  SELLER_PERK_AUTHENTICATION_BPS,
  SELLER_PERK_VERIFIED_SUITSCORE_BPS,
  formatPrice,
} from "@/lib/price";

const POPULAR_BRANDS = [
  "Arena", "Speedo", "TYR", "FINIS", "Nike", "Adidas",
  "BlueSeventy", "Mizuno", "Dolfin", "Other",
];

const SIZES_WOMENS = ["XSS", "XS", "XS/S", "S", "S/M", "M", "M/L", "L", "L/XL", "XL", "XXL", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "36", "38", "40"];
const SIZES_MENS = ["20", "22", "24", "26", "28", "30", "32", "34", "36", "38", "XS", "S", "M", "L", "XL", "XXL"];

type FormData = {
  // Step 1
  photos: PhotoFile[];
  // Step 2
  brand: string;
  model: string;
  size: string;
  genderFit: "male" | "female" | "unisex";
  suitType: "jammer" | "kneeskin" | "fullBody" | "openBack";
  ageCategory: "twelve_and_under" | "thirteen_and_over";
  strokeSuitability: "fly" | "free" | "breast" | "back" | "im";
  // Step 3
  condition: SuitCondition | null;
  // Step 4
  price: string;
  description: string;
  // Step 5 — seller perks
  sellerPerkPriority: boolean;
  sellerPerkAuthentication: boolean;
  sellerPerkVerifiedSuitscore: boolean;
};

type VoucherState = {
  expanded: boolean;
  code: string;
  applying: boolean;
  applied: boolean;
  appliedCode: string;
  error: string | null;
};

const INITIAL: FormData = {
  photos: [],
  brand: "",
  model: "",
  size: "",
  genderFit: "female",
  suitType: "kneeskin",
  ageCategory: "thirteen_and_over",
  strokeSuitability: "im",
  condition: null,
  price: "",
  description: "",
  sellerPerkPriority: false,
  sellerPerkAuthentication: false,
  sellerPerkVerifiedSuitscore: false,
};

const INIT_VOUCHER: VoucherState = {
  expanded: false, code: "", applying: false, applied: false, appliedCode: "", error: null,
};

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-[#1A1A2E] mb-1.5">
      {children}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-[#EF4444]">{msg}</p>;
}

function inputClass(hasError?: boolean) {
  return `w-full rounded-xl border px-4 py-2.5 text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 transition-colors ${
    hasError
      ? "border-red-300 focus:ring-red-200 bg-red-50"
      : "border-slate-200 focus:ring-[#00B4FF]/30 focus:border-[#00B4FF] bg-white"
  }`;
}

// Voucher type → seller perk mapping
const VOUCHER_TO_SELLER_PERK: Record<string, "sellerPerkPriority" | "sellerPerkAuthentication" | "sellerPerkVerifiedSuitscore"> = {
  priority_listing:   "sellerPerkPriority",
  authentication:     "sellerPerkAuthentication",
  verified_suitscore: "sellerPerkVerifiedSuitscore",
};
const VOUCHER_TO_SELLER_STATE: Record<string, "priority" | "auth" | "suitscore"> = {
  priority_listing:   "priority",
  authentication:     "auth",
  verified_suitscore: "suitscore",
};

export function SellForm({ initialVoucherCode }: { initialVoucherCode?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [priorityVoucher, setPriorityVoucher] = useState<VoucherState>(INIT_VOUCHER);
  const [authVoucher, setAuthVoucher] = useState<VoucherState>(INIT_VOUCHER);
  const [suitscoreVoucher, setSuitscoreVoucher] = useState<VoucherState>(INIT_VOUCHER);

  // Pre-fill voucher from URL param: validate on mount, auto-apply to correct perk slot.
  useEffect(() => {
    if (!initialVoucherCode) return;

    async function prefillVoucher() {
      try {
        const res = await fetch("/api/vouchers/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: initialVoucherCode }),
        });
        const data = await res.json();
        if (!data.valid) return;

        const perkKey = VOUCHER_TO_SELLER_PERK[data.type as string];
        const stateKey = VOUCHER_TO_SELLER_STATE[data.type as string];
        if (!perkKey || !stateKey) return;

        // Auto-check the perk and apply the voucher.
        set(perkKey, true);
        const applied: VoucherState = {
          expanded: false,
          code: initialVoucherCode!,
          applying: false,
          applied: true,
          appliedCode: initialVoucherCode!,
          error: null,
        };
        if (stateKey === "priority") setPriorityVoucher(applied);
        else if (stateKey === "auth") setAuthVoucher(applied);
        else setSuitscoreVoucher(applied);
      } catch {
        // Silently ignore — user can still apply manually on the perks step.
      }
    }

    prefillVoucher();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  // ─── Validation ────────────────────────────────────────────
  function validateStep(s: number): boolean {
    const errs: Partial<Record<keyof FormData, string>> = {};

    if (s === 1) {
      if (form.photos.length === 0) errs.photos = "At least one photo is required.";
    }
    if (s === 2) {
      if (!form.brand.trim()) errs.brand = "Brand is required.";
      if (!form.model.trim()) errs.model = "Model is required.";
      if (!form.size.trim()) errs.size = "Size is required.";
    }
    if (s === 3) {
      if (!form.condition) errs.condition = "Please select a SuitScore™ tier.";
    }
    if (s === 4) {
      const p = parseFloat(form.price);
      if (!form.price.trim()) errs.price = "Price is required.";
      else if (isNaN(p) || p <= 0) errs.price = "Enter a valid price.";
      else if (p > 50000) errs.price = "Price cannot exceed $50,000.";
    }
    // Step 5 (Perks) — all optional, no required fields

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function next() {
    if (validateStep(step)) setStep((s) => s + 1);
  }
  function back() {
    setStep((s) => s - 1);
  }

  // ─── Voucher apply ─────────────────────────────────────────
  async function applyVoucher(
    voucherType: "priority_listing" | "authentication" | "verified_suitscore",
    state: VoucherState,
    setState: React.Dispatch<React.SetStateAction<VoucherState>>,
  ) {
    const code = state.code.trim().toUpperCase();
    if (!code) return;
    setState((v) => ({ ...v, applying: true, error: null }));
    try {
      const res = await fetch("/api/vouchers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, type: voucherType }),
      });
      const data = await res.json();
      if (data.valid) {
        setState((v) => ({ ...v, applying: false, applied: true, appliedCode: code, error: null }));
      } else {
        setState((v) => ({ ...v, applying: false, error: data.reason ?? "Invalid voucher" }));
      }
    } catch {
      setState((v) => ({ ...v, applying: false, error: "Could not verify voucher" }));
    }
  }

  // ─── Submit ────────────────────────────────────────────────
  async function handleSubmit() {
    if (!validateStep(4)) return;
    setSubmitting(true);
    setServerError(null);

    try {
      const fd = new FormData();
      for (const photo of form.photos) fd.append("photos", photo.file);
      fd.append("brand", form.brand.trim());
      fd.append("model", form.model.trim());
      fd.append("size", form.size.trim());
      fd.append("genderFit", form.genderFit);
      fd.append("suitType", form.suitType);
      fd.append("ageCategory", form.ageCategory);
      fd.append("strokeSuitability", form.strokeSuitability);
      fd.append("condition", form.condition!);
      fd.append("price", String(Math.round(parseFloat(form.price) * 100)));
      fd.append("description", form.description.trim());
      // Seller perks
      fd.append("sellerPerkPriority", String(form.sellerPerkPriority));
      fd.append("sellerPerkAuthentication", String(form.sellerPerkAuthentication));
      fd.append("sellerPerkVerifiedSuitscore", String(form.sellerPerkVerifiedSuitscore));
      if (priorityVoucher.applied) fd.append("sellerPerkPriorityVoucherCode", priorityVoucher.appliedCode);
      if (authVoucher.applied) fd.append("sellerPerkAuthVoucherCode", authVoucher.appliedCode);
      if (suitscoreVoucher.applied) fd.append("sellerPerkSuitscoreVoucherCode", suitscoreVoucher.appliedCode);

      const res = await fetch("/api/listings/create", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Failed to create listing");

      router.push(`/listings/${data.id}?created=1`);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  // ─── Seller preview calculation ────────────────────────────
  function calcSellerPreview() {
    const p = parseFloat(form.price);
    if (isNaN(p) || p <= 0) return null;
    const basePrice = Math.round(p * 100);
    const platformFee = Math.round((basePrice * PLATFORM_FEE_BPS) / 10000);
    let perkBps = 0;
    if (form.sellerPerkPriority && !priorityVoucher.applied) perkBps += SELLER_PERK_PRIORITY_BPS;
    if (form.sellerPerkAuthentication && !authVoucher.applied) perkBps += SELLER_PERK_AUTHENTICATION_BPS;
    if (form.sellerPerkVerifiedSuitscore && !suitscoreVoucher.applied) perkBps += SELLER_PERK_VERIFIED_SUITSCORE_BPS;
    const perkFee = Math.round((basePrice * perkBps) / 10000);
    const payout = Math.max(0, basePrice - platformFee - perkFee);
    return { basePrice, platformFee, perkFee, payout };
  }

  const sizes = form.genderFit === "male" ? SIZES_MENS : SIZES_WOMENS;

  // ─── Steps ─────────────────────────────────────────────────
  const stepContent = (
    <>
      {step === 1 && (
        <div>
          <h2 className="text-xl font-bold text-[#1A1A2E] mb-1">Add photos</h2>
          <p className="text-sm text-[#64748B] mb-6">Good photos are the #1 factor in getting your suit sold.</p>
          <PhotoUploader photos={form.photos} onChange={(v) => set("photos", v)} />
          {errors.photos && <FieldError msg={errors.photos} />}
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-xl font-bold text-[#1A1A2E] mb-1">Suit details</h2>
          <p className="text-sm text-[#64748B] mb-6">Tell buyers exactly what they&apos;re getting.</p>

          <div className="space-y-5">
            {/* Brand */}
            <div>
              <FieldLabel required>Brand</FieldLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {POPULAR_BRANDS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => set("brand", b === "Other" ? "" : b)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      form.brand === b
                        ? "bg-[#00B4FF] text-white border-[#00B4FF]"
                        : "bg-white text-slate-600 border-slate-200 hover:border-[#00B4FF]"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
              <input
                className={inputClass(!!errors.brand)}
                placeholder="Or type a brand name…"
                value={form.brand}
                onChange={(e) => set("brand", e.target.value)}
              />
              <FieldError msg={errors.brand} />
            </div>

            {/* Model */}
            <div>
              <FieldLabel required>Model / product name</FieldLabel>
              <input
                className={inputClass(!!errors.model)}
                placeholder="e.g. Arena Carbon Air2, Speedo LZR Racer Elite"
                value={form.model}
                onChange={(e) => set("model", e.target.value)}
              />
              <FieldError msg={errors.model} />
            </div>

            {/* Gender + Suit Type row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel required>Gender fit</FieldLabel>
                <select
                  className={inputClass()}
                  value={form.genderFit}
                  onChange={(e) => { set("genderFit", e.target.value as FormData["genderFit"]); set("size", ""); }}
                >
                  <option value="female">Women&apos;s</option>
                  <option value="male">Men&apos;s</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>
              <div>
                <FieldLabel required>Suit type</FieldLabel>
                <select
                  className={inputClass()}
                  value={form.suitType}
                  onChange={(e) => set("suitType", e.target.value as FormData["suitType"])}
                >
                  <option value="kneeskin">Kneeskin</option>
                  <option value="jammer">Jammer</option>
                  <option value="openBack">Open Back</option>
                  <option value="fullBody">Full Body</option>
                </select>
              </div>
            </div>

            {/* Age Category */}
            <div>
              <FieldLabel required>Age category</FieldLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(
                  [
                    { value: "thirteen_and_over", label: "13 & Over (FINA-approved)" },
                    { value: "twelve_and_under", label: "12 & Under" },
                  ] as const
                ).map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => set("ageCategory", value)}
                    className={`px-4 py-3 rounded-xl text-sm border-2 text-left transition-colors ${
                      form.ageCategory === value
                        ? "bg-[#00B4FF] text-white border-[#00B4FF]"
                        : "bg-white text-slate-600 border-slate-200 hover:border-[#00B4FF]"
                    }`}
                  >
                    <span className="font-semibold block">{label}</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                12 & Under suits don&apos;t require FINA approval. 13 & Over suits must be FINA/World
                Aquatics approved for sanctioned meet competition.
              </p>
            </div>

            {/* Size */}
            <div>
              <FieldLabel required>Size</FieldLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set("size", s)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      form.size === s
                        ? "bg-[#00B4FF] text-white border-[#00B4FF]"
                        : "bg-white text-slate-600 border-slate-200 hover:border-[#00B4FF]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <input
                className={inputClass(!!errors.size)}
                placeholder="Or type your size…"
                value={form.size}
                onChange={(e) => set("size", e.target.value)}
              />
              <FieldError msg={errors.size} />
            </div>

            {/* Stroke */}
            <div>
              <FieldLabel required>Primary stroke suitability</FieldLabel>
              <select
                className={inputClass()}
                value={form.strokeSuitability}
                onChange={(e) => set("strokeSuitability", e.target.value as FormData["strokeSuitability"])}
              >
                <option value="im">Individual Medley (all strokes)</option>
                <option value="free">Freestyle</option>
                <option value="fly">Butterfly</option>
                <option value="back">Backstroke</option>
                <option value="breast">Breaststroke</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="text-xl font-bold text-[#1A1A2E] mb-1">SuitScore™ condition</h2>
          <p className="text-sm text-[#64748B] mb-6">
            Accurate grading builds trust and gets more offers.
          </p>
          <SuitScorePicker value={form.condition} onChange={(v) => set("condition", v)} />
          <FieldError msg={errors.condition} />
        </div>
      )}

      {step === 4 && (
        <div>
          <h2 className="text-xl font-bold text-[#1A1A2E] mb-1">Price & description</h2>
          <p className="text-sm text-[#64748B] mb-6">Set a fair price and add any extra details.</p>

          <div className="space-y-5">
            <div>
              <FieldLabel required>Asking price (USD)</FieldLabel>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                <input
                  className={`${inputClass(!!errors.price)} pl-8`}
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="e.g. 150"
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                />
              </div>
              <FieldError msg={errors.price} />
              <p className="mt-1 text-xs text-slate-400">
                SuitCycle charges a 10% platform fee on the final sale price.
              </p>
            </div>

            <div>
              <FieldLabel>Description (optional)</FieldLabel>
              <textarea
                className={`${inputClass()} resize-none`}
                rows={5}
                placeholder="Add any extra details: original purchase price, specific wear patterns, included bag/tags, reason for selling…"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                maxLength={2000}
              />
              <p className="mt-1 text-xs text-slate-400 text-right">
                {form.description.length}/2000
              </p>
            </div>
          </div>
        </div>
      )}

      {step === 5 && (
        <div>
          <h2 className="text-xl font-bold text-[#1A1A2E] mb-1">Premium perks</h2>
          <p className="text-sm text-[#64748B] mb-6">
            Boost your listing with optional upgrades. Perk fees are deducted from your payout at sale time.
          </p>

          {(() => {
            const preview = calcSellerPreview();
            const perks: {
              key: "sellerPerkPriority" | "sellerPerkAuthentication" | "sellerPerkVerifiedSuitscore";
              label: string;
              description: string;
              percent: number;
              icon: React.ElementType;
              voucherType: "priority_listing" | "authentication" | "verified_suitscore";
              voucher: VoucherState;
              setVoucher: React.Dispatch<React.SetStateAction<VoucherState>>;
            }[] = [
              {
                key: "sellerPerkPriority",
                label: "Priority Listing",
                description: "Appear at the top of search results for 30 days.",
                percent: SELLER_PERK_PRIORITY_PERCENT,
                icon: Tag,
                voucherType: "priority_listing",
                voucher: priorityVoucher,
                setVoucher: setPriorityVoucher,
              },
              {
                key: "sellerPerkAuthentication",
                label: "Brand Authentication",
                description: "SuitCycle verifies your suit is genuine.",
                percent: SELLER_PERK_AUTHENTICATION_PERCENT,
                icon: ShieldCheck,
                voucherType: "authentication",
                voucher: authVoucher,
                setVoucher: setAuthVoucher,
              },
              {
                key: "sellerPerkVerifiedSuitscore",
                label: "Verified SuitScore™",
                description: "We independently confirm your SuitScore™ grade.",
                percent: SELLER_PERK_VERIFIED_SUITSCORE_PERCENT,
                icon: Star,
                voucherType: "verified_suitscore",
                voucher: suitscoreVoucher,
                setVoucher: setSuitscoreVoucher,
              },
            ];

            return (
              <div className="space-y-4">
                {perks.map(({ key, label, description, percent, icon: Icon, voucherType, voucher, setVoucher }) => {
                  const checked = form[key] as boolean;
                  return (
                    <div
                      key={key}
                      className={`rounded-2xl border-2 p-4 transition-colors ${checked ? "border-[#00B4FF] bg-[#F0F9FF]" : "border-slate-100 bg-white"}`}
                    >
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => set(key, e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded border-slate-300 accent-[#00B4FF]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Icon size={15} className="text-[#00B4FF] shrink-0" />
                            <span className="text-sm font-bold text-[#1A1A2E]">{label}</span>
                            {voucher.applied ? (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800 flex items-center gap-1">
                                <Ticket size={11} /> Free (voucher applied)
                              </span>
                            ) : (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                {percent}% of sale
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#64748B] mt-0.5">{description}</p>
                          {/* Voucher inline */}
                          {!voucher.applied && (
                            <div className="mt-2">
                              {!voucher.expanded ? (
                                <button
                                  type="button"
                                  onClick={() => setVoucher((v) => ({ ...v, expanded: true }))}
                                  className="text-xs text-[#00B4FF] hover:underline"
                                >
                                  Have a voucher?
                                </button>
                              ) : (
                                <div className="flex gap-2 mt-1">
                                  <input
                                    className="flex-1 text-xs rounded-lg border border-slate-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/30 focus:border-[#00B4FF]"
                                    placeholder="Enter code"
                                    value={voucher.code}
                                    onChange={(e) => setVoucher((v) => ({ ...v, code: e.target.value, error: null }))}
                                    onKeyDown={(e) => e.key === "Enter" && applyVoucher(voucherType, voucher, setVoucher)}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => applyVoucher(voucherType, voucher, setVoucher)}
                                    disabled={voucher.applying}
                                    className="text-xs px-3 py-1.5 rounded-lg bg-[#00B4FF] text-white font-semibold hover:bg-[#0066AA] transition-colors disabled:opacity-60"
                                  >
                                    {voucher.applying ? <Loader2 size={12} className="animate-spin" /> : "Apply"}
                                  </button>
                                </div>
                              )}
                              {voucher.error && (
                                <p className="mt-1 text-xs text-red-500">{voucher.error}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  );
                })}

                {/* Seller payout preview */}
                {preview && (
                  <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 mt-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B] mb-2">
                      Estimated payout on a {formatPrice(preview.basePrice)} sale
                    </p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>Sale price</span>
                        <span>{formatPrice(preview.basePrice)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Platform fee (10%)</span>
                        <span>−{formatPrice(preview.platformFee)}</span>
                      </div>
                      {preview.perkFee > 0 && (
                        <div className="flex justify-between text-slate-500">
                          <span>Perk fees</span>
                          <span>−{formatPrice(preview.perkFee)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-[#1A1A2E] border-t border-slate-200 pt-1 mt-1">
                        <span>You receive</span>
                        <span>{formatPrice(preview.payout)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {step === 6 && (
        <div>
          <h2 className="text-xl font-bold text-[#1A1A2E] mb-1">Review & publish</h2>
          <p className="text-sm text-[#64748B] mb-6">Double-check everything before going live.</p>

          <div className="space-y-4">
            {/* Photo preview */}
            {form.photos.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {form.photos.map((p, i) => (
                  <div key={p.id} className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.preview} alt={`Photo ${i + 1}`} className="object-cover w-full h-full" />
                  </div>
                ))}
              </div>
            )}

            {/* Details summary */}
            <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-50">
              {[
                ["Brand", form.brand],
                ["Model", form.model],
                ["Size", form.size],
                ["Gender Fit", form.genderFit === "female" ? "Women's" : form.genderFit === "male" ? "Men's" : "Unisex"],
                ["Suit Type", { kneeskin: "Kneeskin", jammer: "Jammer", openBack: "Open Back", fullBody: "Full Body" }[form.suitType]],
                ["Age Category", form.ageCategory === "twelve_and_under" ? "12 & Under" : "13 & Over (FINA-approved)"],
                ["Stroke", { im: "IM", free: "Freestyle", fly: "Butterfly", back: "Backstroke", breast: "Breaststroke" }[form.strokeSuitability]],
                ["SuitScore™", form.condition ? form.condition.charAt(0).toUpperCase() + form.condition.slice(1) : ","],
                ["Price", form.price ? `$${parseFloat(form.price).toFixed(2)}` : ","],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-[#64748B]">{label}</span>
                  <span className="text-sm font-semibold text-[#1A1A2E]">{value}</span>
                </div>
              ))}
            </div>

            {form.description && (
              <div className="bg-white rounded-2xl border border-slate-100 p-4">
                <p className="text-xs font-semibold text-[#64748B] mb-1">Description</p>
                <p className="text-sm text-[#1A1A2E] whitespace-pre-wrap">{form.description}</p>
              </div>
            )}

            {/* Seller perks summary */}
            {(form.sellerPerkPriority || form.sellerPerkAuthentication || form.sellerPerkVerifiedSuitscore) && (
              <div className="bg-white rounded-2xl border border-slate-100 p-4">
                <p className="text-xs font-semibold text-[#64748B] mb-2">Selected perks</p>
                <div className="space-y-1">
                  {form.sellerPerkPriority && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#1A1A2E]">Priority Listing</span>
                      <span className="text-xs text-[#64748B]">
                        {priorityVoucher.applied ? "Free (voucher)" : `${SELLER_PERK_PRIORITY_PERCENT}% of sale`}
                      </span>
                    </div>
                  )}
                  {form.sellerPerkAuthentication && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#1A1A2E]">Brand Authentication</span>
                      <span className="text-xs text-[#64748B]">
                        {authVoucher.applied ? "Free (voucher)" : `${SELLER_PERK_AUTHENTICATION_PERCENT}% of sale`}
                      </span>
                    </div>
                  )}
                  {form.sellerPerkVerifiedSuitscore && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#1A1A2E]">Verified SuitScore™</span>
                      <span className="text-xs text-[#64748B]">
                        {suitscoreVoucher.applied ? "Free (voucher)" : `${SELLER_PERK_VERIFIED_SUITSCORE_PERCENT}% of sale`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {serverError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
                {serverError}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="space-y-8">
      {/* Step indicator */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <StepIndicator currentStep={step} />
      </div>

      {/* Step content */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8">
        {stepContent}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        {step > 1 ? (
          <button
            type="button"
            onClick={back}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        ) : (
          <div />
        )}

        {step < 6 ? (
          <button
            type="button"
            onClick={next}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00B4FF] text-white font-semibold hover:bg-[#0066AA] transition-colors shadow-sm shadow-[#00B4FF]/20 ml-auto"
          >
            Continue
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00B4FF] text-white font-semibold hover:bg-[#0066AA] transition-colors shadow-sm shadow-[#00B4FF]/20 ml-auto disabled:opacity-70"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Publishing…
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Publish listing
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
