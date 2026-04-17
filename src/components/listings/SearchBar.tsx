"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { Search, X } from "lucide-react";

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const [value, setValue] = useState(initialQ);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = (q: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (q.trim()) {
      params.set("q", q.trim());
    } else {
      params.delete("q");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const clear = () => {
    setValue("");
    inputRef.current?.focus();
    submit("");
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(value);
      }}
      className="relative mt-4 w-full max-w-xl"
    >
      <Search
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search brand, model, size…"
        className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-[#1A1A2E] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/40 focus:border-[#00B4FF] transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Clear search"
        >
          <X size={15} />
        </button>
      )}
    </form>
  );
}
