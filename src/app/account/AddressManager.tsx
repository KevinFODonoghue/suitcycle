"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Check, Loader2, X } from "lucide-react";

interface Address {
  id: string;
  type: "shipping" | "returns";
  recipientName: string;
  phone: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

interface FormState {
  type: "shipping" | "returns";
  recipientName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

const emptyForm = (type: "shipping" | "returns"): FormState => ({
  type,
  recipientName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
  isDefault: false,
});

interface AddressManagerProps {
  initialAddresses: Address[];
}

export function AddressManager({ initialAddresses }: AddressManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<"shipping" | "returns" | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm("shipping"));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startAdd(type: "shipping" | "returns") {
    setEditingId(null);
    setForm(emptyForm(type));
    setShowForm(type);
    setError(null);
  }

  function startEdit(addr: Address) {
    setShowForm(null);
    setEditingId(addr.id);
    setForm({
      type: addr.type,
      recipientName: addr.recipientName,
      phone: addr.phone ?? "",
      line1: addr.line1,
      line2: addr.line2 ?? "",
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      isDefault: addr.isDefault,
    });
    setError(null);
  }

  function cancelForm() {
    setShowForm(null);
    setEditingId(null);
    setError(null);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const url = editingId
        ? `/api/account/addresses/${editingId}`
        : "/api/account/addresses";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save address.");
        return;
      }
      startTransition(() => router.refresh());
      const saved: Address = await res.json();
      setAddresses((prev) => {
        if (editingId) {
          return prev.map((a) => (a.id === editingId ? saved : a));
        }
        // If new default, unset others of same type
        return [
          ...prev.map((a) =>
            a.type === saved.type && saved.isDefault ? { ...a, isDefault: false } : a
          ),
          saved,
        ];
      });
      cancelForm();
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this address?")) return;
    const res = await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      startTransition(() => router.refresh());
    }
  }

  const shipping = addresses.filter((a) => a.type === "shipping");
  const returns = addresses.filter((a) => a.type === "returns");

  return (
    <div className="space-y-6">
      {(["shipping", "returns"] as const).map((type) => {
        const group = type === "shipping" ? shipping : returns;
        const isAdding = showForm === type;

        return (
          <div key={type}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-[#1A1A2E] capitalize">{type} addresses</p>
              {!isAdding && (
                <button
                  onClick={() => startAdd(type)}
                  className="flex items-center gap-1 text-xs text-[#00B4FF] hover:underline font-semibold"
                >
                  <Plus size={13} /> Add
                </button>
              )}
            </div>

            {group.length === 0 && !isAdding && (
              <p className="text-xs text-slate-400 italic">No {type} addresses saved.</p>
            )}

            <div className="space-y-2">
              {group.map((addr) => (
                <div
                  key={addr.id}
                  className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  {editingId === addr.id ? (
                    <AddressForm
                      form={form}
                      setForm={setForm}
                      onSave={handleSave}
                      onCancel={cancelForm}
                      saving={saving}
                      error={error}
                    />
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-xs text-[#374151] leading-relaxed">
                        <p className="font-semibold text-[#1A1A2E]">{addr.recipientName}</p>
                        <p>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                        <p>{addr.city}, {addr.state} {addr.postalCode} · {addr.country}</p>
                        {addr.phone && <p className="text-slate-400">{addr.phone}</p>}
                        {addr.isDefault && (
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-[#00B4FF]">
                            <Check size={10} /> Default
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => startEdit(addr)} className="text-slate-400 hover:text-[#00B4FF] transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(addr.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isAdding && (
                <div className="rounded-xl border border-[#00B4FF]/30 bg-[#F0F7FF] px-4 py-4">
                  <AddressForm
                    form={form}
                    setForm={setForm}
                    onSave={handleSave}
                    onCancel={cancelForm}
                    saving={saving}
                    error={error}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AddressForm({
  form,
  setForm,
  onSave,
  onCancel,
  saving,
  error,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  error: string | null;
}) {
  function field(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  const inputCls =
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/30 focus:border-[#00B4FF] bg-white";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-[10px] font-semibold text-[#64748B] mb-1 uppercase tracking-wide">Recipient name</label>
          <input className={inputCls} value={form.recipientName} onChange={field("recipientName")} placeholder="Full name" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[10px] font-semibold text-[#64748B] mb-1 uppercase tracking-wide">Address line 1</label>
          <input className={inputCls} value={form.line1} onChange={field("line1")} placeholder="Street address" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[10px] font-semibold text-[#64748B] mb-1 uppercase tracking-wide">Address line 2 (optional)</label>
          <input className={inputCls} value={form.line2} onChange={field("line2")} placeholder="Apt, suite, unit…" />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-[#64748B] mb-1 uppercase tracking-wide">City</label>
          <input className={inputCls} value={form.city} onChange={field("city")} placeholder="City" />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-[#64748B] mb-1 uppercase tracking-wide">State</label>
          <select className={inputCls} value={form.state} onChange={field("state")}>
            <option value="">Select state</option>
            {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-[#64748B] mb-1 uppercase tracking-wide">ZIP code</label>
          <input className={inputCls} value={form.postalCode} onChange={field("postalCode")} placeholder="12345" />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-[#64748B] mb-1 uppercase tracking-wide">Phone (optional)</label>
          <input className={inputCls} value={form.phone} onChange={field("phone")} placeholder="+1 (555) 000-0000" />
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs text-[#374151] cursor-pointer">
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
          className="rounded"
        />
        Set as default {form.type} address
      </label>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={saving || !form.recipientName || !form.line1 || !form.city || !form.state || !form.postalCode}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00B4FF] text-white text-xs font-semibold hover:bg-[#0066AA] transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
          Save address
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 text-xs text-[#64748B] hover:bg-slate-50 transition-colors"
        >
          <X size={12} /> Cancel
        </button>
      </div>
    </div>
  );
}
