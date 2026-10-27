'use client';

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { postPrintRequest, getSite } from "@/lib/api";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";

const DEFAULT_OPTIONS = [
  { size: "A4 · 210×297mm", price: "2,500" },
  { size: "A3 · 297×420mm", price: "4,500" },
  { size: "A2 · 420×594mm", price: "7,500" },
  { size: "A1 · 594×841mm (Museum)", price: "12,000" },
];

export const PrintRequestDialog = ({ open, onOpenChange, photo }) => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", city: "", message: "" });
  const [purpose, setPurpose] = useState("print");
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [currency, setCurrency] = useState("INR");
  const [sizeIdx, setSizeIdx] = useState(1); // Default to A3
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSite()
      .then((s) => {
        if (s.print_options && s.print_options.length > 0) {
          setOptions(s.print_options);
        }
        if (s.currency) setCurrency(s.currency);
      })
      .catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Please enter your name and email.");
      return;
    }
    setLoading(true);
    const chosen = purpose === "print" ? options[sizeIdx] : null;
    try {
      await postPrintRequest({
        photo_id: photo?.id,
        photo_title: photo?.title,
        purpose,
        print_size: chosen ? chosen.size : null,
        print_price: chosen ? `${currency} ${chosen.price}` : null,
        name: form.name.trim(),
        email: form.email.trim(),
        message: [
          form.phone ? `Phone / WhatsApp: ${form.phone}` : null,
          form.city ? `Delivery City: ${form.city}` : null,
          form.message ? `Notes: ${form.message}` : null,
        ].filter(Boolean).join(" | "),
      });
      toast.success("Print request sent successfully! Mihir will review and get in touch with you shortly.");
      setForm({ name: "", email: "", phone: "", city: "", message: "" });
      onOpenChange(false);
    } catch (err) {
      console.error("Print request submission error:", err);
      toast.error("Failed to send request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedOption = options[sizeIdx] || options[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="print-request-dialog"
        className="bg-[#0E0E0E] border border-white/20 rounded-lg w-[94vw] max-w-2xl text-white max-h-[92vh] overflow-y-auto overflow-x-hidden shadow-2xl p-4 sm:p-6 md:p-7 block box-border"
      >
        <DialogHeader className="pr-8 text-left pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <p className="font-mono-accent text-[11px] uppercase tracking-[0.25em] text-accent">
              Fine Art Prints &amp; Licensing
            </p>
          </div>
          <DialogTitle className="font-serif text-xl sm:text-2xl md:text-3xl font-medium text-white break-words leading-tight">
            {photo?.title ? `Acquire "${photo.title}"` : "Request a Collector Print"}
          </DialogTitle>
        </DialogHeader>

        {/* Selected Frame Preview */}
        {photo && (
          <div className="flex items-center gap-3.5 p-3 bg-white/[0.03] border border-white/10 rounded my-3 overflow-hidden">
            {photo.image_url && (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded overflow-hidden bg-black shrink-0 border border-white/10">
                <img src={photo.image_url} alt={photo.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{photo.title}</p>
              <p className="font-mono-accent text-[10px] sm:text-[11px] uppercase tracking-wider text-accent truncate mt-0.5">
                {photo.category} {photo.location ? `· ${photo.location}` : ""}
              </p>
              {purpose === "print" && selectedOption && (
                <p className="text-xs text-neutral-300 mt-1 truncate">
                  Selected: <strong className="text-white">{selectedOption.size}</strong> — <span className="text-accent font-semibold">{currency} {selectedOption.price}</span>
                </p>
              )}
            </div>
          </div>
        )}

        <form onSubmit={submit} className="space-y-4 mt-3">
          {/* Purpose Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-white/[0.04] border border-white/10 rounded">
            <button
              type="button"
              data-testid="purpose-print"
              onClick={() => setPurpose("print")}
              className={`w-full min-w-0 py-2.5 px-2 text-xs uppercase tracking-wider transition-all text-center font-medium rounded truncate ${
                purpose === "print"
                  ? "bg-accent text-black font-semibold shadow-md"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              Fine Art Print
            </button>
            <button
              type="button"
              data-testid="purpose-license"
              onClick={() => setPurpose("license")}
              className={`w-full min-w-0 py-2.5 px-2 text-xs uppercase tracking-wider transition-all text-center font-medium rounded truncate ${
                purpose === "license"
                  ? "bg-accent text-black font-semibold shadow-md"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              Commercial License
            </button>
          </div>

          {/* Print Size Selection with Live Price Display */}
          {purpose === "print" && options.length > 0 && (
            <div data-testid="print-sizes" className="space-y-2 pt-1">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <p className="font-mono-accent text-[11px] uppercase tracking-wider text-neutral-300">
                  Select Print Size &amp; Frame:
                </p>
                <span className="text-[11px] text-accent font-mono-accent">
                  Archival Fine Art Paper
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {options.map((o, i) => {
                  const isSelected = sizeIdx === i;
                  const parts = (o.size || "").split("·").map((s) => s.trim());
                  const code = parts[0] || o.size;
                  const dim = parts[1] || "";
                  return (
                    <button
                      key={i}
                      type="button"
                      data-testid={`print-size-${i}`}
                      onClick={() => setSizeIdx(i)}
                      className={`w-full min-w-0 p-3 sm:p-3.5 border text-left transition-all rounded flex items-center justify-between gap-2.5 box-border ${
                        isSelected
                          ? "border-accent bg-accent/15 text-white ring-1 ring-accent shadow-md"
                          : "border-white/15 bg-white/[0.02] hover:border-white/40 text-neutral-300"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="font-serif text-sm sm:text-base font-semibold text-white tracking-wide">
                            {code}
                          </span>
                          {dim && (
                            <span className="text-[10px] sm:text-[11px] text-neutral-400 font-mono">
                              {dim}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-neutral-400 block mt-0.5 uppercase tracking-wider font-mono-accent">
                          Museum Giclée
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono-accent text-xs sm:text-sm font-bold text-accent block whitespace-nowrap">
                          {currency} {o.price}
                        </span>
                        {isSelected ? (
                          <span className="inline-flex items-center text-[10px] text-emerald-400 font-mono-accent gap-0.5 mt-0.5 font-medium whitespace-nowrap">
                            <Check size={11} className="stroke-[3]" /> Selected
                          </span>
                        ) : (
                          <span className="text-[10px] text-neutral-400 font-mono-accent block mt-0.5">
                            Select
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-neutral-400 italic pt-1 leading-relaxed">
                Printed on 310gsm museum-grade 100% cotton-rag paper with archival mineral pigments. Includes signed certificate of authenticity.
              </p>
            </div>
          )}

          {/* Client Contact Details */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="min-w-0">
                <label className="text-[10px] font-mono-accent text-neutral-400 uppercase tracking-wider block mb-1">
                  Your Full Name *
                </label>
                <Input
                  data-testid="print-name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Vikram Patel"
                  className="w-full bg-white/[0.03] border-white/20 rounded h-10 text-xs text-white placeholder:text-neutral-600 focus:border-accent"
                />
              </div>
              <div className="min-w-0">
                <label className="text-[10px] font-mono-accent text-neutral-400 uppercase tracking-wider block mb-1">
                  Your Email Address *
                </label>
                <Input
                  data-testid="print-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@email.com"
                  className="w-full bg-white/[0.03] border-white/20 rounded h-10 text-xs text-white placeholder:text-neutral-600 focus:border-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="min-w-0">
                <label className="text-[10px] font-mono-accent text-neutral-400 uppercase tracking-wider block mb-1">
                  Phone / WhatsApp Number
                </label>
                <Input
                  data-testid="print-phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-white/[0.03] border-white/20 rounded h-10 text-xs text-white placeholder:text-neutral-600 focus:border-accent"
                />
              </div>
              <div className="min-w-0">
                <label className="text-[10px] font-mono-accent text-neutral-400 uppercase tracking-wider block mb-1">
                  Delivery City / Country
                </label>
                <Input
                  data-testid="print-city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="e.g. Mumbai, India"
                  className="w-full bg-white/[0.03] border-white/20 rounded h-10 text-xs text-white placeholder:text-neutral-600 focus:border-accent"
                />
              </div>
            </div>

            <div className="min-w-0">
              <label className="text-[10px] font-mono-accent text-neutral-400 uppercase tracking-wider block mb-1">
                {purpose === "print" ? "Custom Framing or Delivery Requirements" : "Licensing Usage & Platform Details"}
              </label>
              <Textarea
                data-testid="print-message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder={purpose === "print" ? "e.g. Teak wood frame, museum anti-reflective glass, delivery timeline..." : "e.g. Book cover, magazine editorial, advertising campaign, print run..."}
                rows={2}
                className="w-full bg-white/[0.03] border-white/20 rounded resize-none text-xs text-white placeholder:text-neutral-600 focus:border-accent"
              />
            </div>
          </div>

          <Button
            type="submit"
            data-testid="print-submit"
            disabled={loading}
            className="w-full rounded bg-accent text-black hover:bg-gold-hover h-11 uppercase tracking-[0.15em] font-semibold text-xs mt-3 shadow-lg transition-transform active:scale-[0.99] cursor-pointer"
          >
            {loading ? "Transmitting Request..." : `Send Request ${purpose === "print" && selectedOption ? `(${currency} ${selectedOption.price})` : ""}`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
