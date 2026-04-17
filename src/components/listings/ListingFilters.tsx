"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";

const CONDITIONS = [
  { value: "gold", label: "Gold", color: "#EAB308" },
  { value: "podium", label: "Podium", color: "#6366F1" },
  { value: "prelim", label: "Prelim", color: "#22C55E" },
  { value: "backup", label: "Backup", color: "#F97316" },
  { value: "practice", label: "Practice", color: "#EF4444" },
] as const;

const GENDERS = [
  { value: "female", label: "Women's" },
  { value: "male", label: "Men's" },
  { value: "unisex", label: "Unisex" },
] as const;

const SUIT_TYPES = [
  { value: "kneeskin", label: "Kneeskin" },
  { value: "jammer", label: "Jammer" },
  { value: "openBack", label: "Open Back" },
  { value: "fullBody", label: "Full Body" },
] as const;

const AGE_CATEGORIES = [
  { value: "thirteen_and_over", label: "13 & Over (FINA-approved)" },
  { value: "twelve_and_under", label: "12 & Under" },
] as const;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "suitScore_desc", label: "Best condition first" },
] as const;

const POPULAR_BRANDS = [
  "Arena", "Speedo", "TYR", "FINIS", "Nike", "Adidas", "BlueSeventy", "Mizuno",
];

interface ActiveFilters {
  q?: string;
  brand?: string[];
  condition?: string[];
  gender?: string[];
  suitType?: string[];
  ageCategory?: string[];
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
}

function parseFilters(params: URLSearchParams): ActiveFilters {
  return {
    q: params.get("q") ?? undefined,
    brand: params.getAll("brand").flatMap((b) => b.split(",")).filter(Boolean),
    condition: params.getAll("condition").flatMap((c) => c.split(",")).filter(Boolean),
    gender: params.getAll("gender").flatMap((g) => g.split(",")).filter(Boolean),
    suitType: params.getAll("suitType").flatMap((s) => s.split(",")).filter(Boolean),
    ageCategory: params.getAll("ageCategory").flatMap((a) => a.split(",")).filter(Boolean),
    minPrice: params.get("minPrice") ?? undefined,
    maxPrice: params.get("maxPrice") ?? undefined,
    sort: params.get("sort") ?? undefined,
  };
}

function countActive(filters: ActiveFilters): number {
  let n = 0;
  if (filters.q) n++;
  if (filters.brand?.length) n += filters.brand.length;
  if (filters.condition?.length) n += filters.condition.length;
  if (filters.gender?.length) n += filters.gender.length;
  if (filters.suitType?.length) n += filters.suitType.length;
  if (filters.ageCategory?.length) n += filters.ageCategory.length;
  if (filters.minPrice || filters.maxPrice) n++;
  return n;
}

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full text-sm font-semibold text-[#1A1A2E] mb-3"
      >
        {title}
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && children}
    </div>
  );
}

export function ListingFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = parseFilters(searchParams);
  const activeCount = countActive(filters);

  const [mobileOpen, setMobileOpen] = useState(false);

  // Close when the nav drawer opens; fire an event when this drawer opens
  useEffect(() => {
    const handler = () => setMobileOpen(false);
    window.addEventListener("mobilenav:open", handler);
    return () => window.removeEventListener("mobilenav:open", handler);
  }, []);

  const openFilters = () => {
    window.dispatchEvent(new CustomEvent("mobilefilters:open"));
    setMobileOpen(true);
  };

  const update = useCallback(
    (key: string, value: string | null, multi = false) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");

      if (value === null) {
        params.delete(key);
      } else if (multi) {
        const current = params.getAll(key).flatMap((v) => v.split(",")).filter(Boolean);
        if (current.includes(value)) {
          const next = current.filter((v) => v !== value);
          params.delete(key);
          if (next.length) params.set(key, next.join(","));
        } else {
          params.delete(key);
          params.set(key, [...current, value].join(","));
        }
      } else {
        params.set(key, value);
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const clearAll = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  const isChecked = (key: string, value: string) => {
    const current = searchParams.getAll(key).flatMap((v) => v.split(","));
    return current.includes(value);
  };

  const filterPanel = (
    <div className="space-y-0">
      {/* Sort */}
      <FilterSection title="Sort by">
        <select
          value={filters.sort ?? "newest"}
          onChange={(e) => update("sort", e.target.value)}
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-[#1A1A2E] bg-white focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/30"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </FilterSection>

      {/* SuitScore */}
      <FilterSection title="SuitScore™ Tier">
        <div className="flex flex-col gap-2">
          {CONDITIONS.map((c) => (
            <label key={c.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={isChecked("condition", c.value)}
                onChange={() => update("condition", c.value, true)}
                className="w-4 h-4 rounded accent-[#00B4FF]"
              />
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: c.color }}
              />
              <span className="text-sm text-[#1A1A2E] group-hover:text-[#00B4FF] transition-colors">
                {c.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Gender */}
      <FilterSection title="Gender Fit">
        <div className="flex flex-wrap gap-2">
          {GENDERS.map((g) => (
            <button
              key={g.value}
              onClick={() => update("gender", g.value, true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isChecked("gender", g.value)
                  ? "bg-[#00B4FF] text-white border-[#00B4FF]"
                  : "bg-white text-slate-600 border-slate-200 hover:border-[#00B4FF]"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Suit Type */}
      <FilterSection title="Suit Type">
        <div className="flex flex-wrap gap-2">
          {SUIT_TYPES.map((s) => (
            <button
              key={s.value}
              onClick={() => update("suitType", s.value, true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isChecked("suitType", s.value)
                  ? "bg-[#00B4FF] text-white border-[#00B4FF]"
                  : "bg-white text-slate-600 border-slate-200 hover:border-[#00B4FF]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Age Category */}
      <FilterSection title="Age Category">
        <div className="flex flex-col gap-2">
          {AGE_CATEGORIES.map((a) => (
            <label key={a.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={isChecked("ageCategory", a.value)}
                onChange={() => update("ageCategory", a.value, true)}
                className="w-4 h-4 rounded accent-[#00B4FF]"
              />
              <span className="text-sm text-[#1A1A2E] group-hover:text-[#00B4FF] transition-colors">
                {a.label}
              </span>
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-400 leading-relaxed">
          12 & Under suits don&apos;t require FINA approval for competition.
        </p>
      </FilterSection>

      {/* Brand */}
      <FilterSection title="Brand" defaultOpen={false}>
        <div className="flex flex-col gap-2">
          {POPULAR_BRANDS.map((b) => (
            <label key={b} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={isChecked("brand", b)}
                onChange={() => update("brand", b, true)}
                className="w-4 h-4 rounded accent-[#00B4FF]"
              />
              <span className="text-sm text-[#1A1A2E] group-hover:text-[#00B4FF] transition-colors">
                {b}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price range */}
      <FilterSection title="Price Range" defaultOpen={false}>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
            <input
              type="number"
              placeholder="Min"
              defaultValue={filters.minPrice ?? ""}
              onBlur={(e) => update("minPrice", e.target.value || null)}
              className="w-full pl-6 pr-2 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/30"
            />
          </div>
          <span className="text-slate-400 text-sm">–</span>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
            <input
              type="number"
              placeholder="Max"
              defaultValue={filters.maxPrice ?? ""}
              onBlur={(e) => update("maxPrice", e.target.value || null)}
              className="w-full pl-6 pr-2 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/30"
            />
          </div>
        </div>
      </FilterSection>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 shrink-0">
        <div className="sticky top-24 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <span className="font-semibold text-[#1A1A2E] flex items-center gap-1.5">
              <SlidersHorizontal size={15} />
              Filters
              {activeCount > 0 && (
                <span className="ml-1 w-5 h-5 rounded-full bg-[#00B4FF] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </span>
            {activeCount > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-[#00B4FF] hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
          {filterPanel}
        </div>
      </aside>

      {/* Mobile filter button + drawer */}
      <div className="lg:hidden">
        <button
          onClick={openFilters}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-[#1A1A2E] hover:bg-slate-50 transition-colors"
        >
          <SlidersHorizontal size={15} />
          Filters
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#00B4FF] text-white text-[10px] font-bold flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>

        {/* Overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Drawer */}
        <div
          className={`fixed top-0 left-0 z-[300] h-full w-80 bg-white shadow-2xl overflow-y-auto transform transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <span className="font-semibold text-[#1A1A2E]">Filters</span>
            <div className="flex items-center gap-3">
              {activeCount > 0 && (
                <button onClick={clearAll} className="text-xs text-[#00B4FF] hover:underline">
                  Clear all
                </button>
              )}
              <button onClick={() => setMobileOpen(false)}>
                <X size={18} className="text-slate-400" />
              </button>
            </div>
          </div>
          <div className="p-5">{filterPanel}</div>
          <div className="p-5 border-t border-slate-100">
            <button
              onClick={() => setMobileOpen(false)}
              className="w-full py-3 rounded-xl bg-[#00B4FF] text-white font-semibold hover:bg-[#0066AA] transition-colors"
            >
              Show results
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
