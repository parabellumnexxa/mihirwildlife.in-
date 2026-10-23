import { useState, useEffect } from "react";
import { toast } from "sonner";
import { postPrintRequest, getSite } from "@/lib/api";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const PrintRequestDialog = ({ open, onOpenChange, photo }) => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [purpose, setPurpose] = useState("print");
  const [options, setOptions] = useState([]);
  const [currency, setCurrency] = useState("INR");
  const [sizeIdx, setSizeIdx] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSite()
      .then((s) => {
        setOptions(s.print_options || []);
        setCurrency(s.currency || "INR");
      })
      .catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error("Name and email are required.");
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
        ...form,
      });
      toast.success("Request sent — Mihir will be in touch shortly.");
      setForm({ name: "", email: "", message: "" });
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="print-request-dialog"
        className="bg-[#0A0A0A] border-white/15 rounded-none max-w-lg text-white max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <p className="font-mono-accent text-xs uppercase tracking-[0.25em] text-accent mb-1">
            Prints & Licensing
          </p>
          <DialogTitle className="font-serif text-3xl font-medium">
            {photo?.title ? `Request "${photo.title}"` : "Request a Print"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-5 mt-2">
          <div className="flex gap-2">
            {[
              { v: "print", label: "Buy a Print" },
              { v: "license", label: "License Image" },
            ].map((o) => (
              <button
                key={o.v}
                type="button"
                data-testid={`purpose-${o.v}`}
                onClick={() => setPurpose(o.v)}
                className={`flex-1 py-3 text-xs uppercase tracking-[0.15em] border transition-colors duration-300 ${
                  purpose === o.v
                    ? "bg-accent border-accent text-black"
                    : "border-white/20 text-neutral-400 hover:border-white/50"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>

          {purpose === "print" && options.length > 0 && (
            <div data-testid="print-sizes">
              <p className="font-mono-accent text-[11px] uppercase tracking-[0.2em] text-neutral-500 mb-3">
                Choose a size
              </p>
              <div className="space-y-2">
                {options.map((o, i) => (
                  <button
                    key={i}
                    type="button"
                    data-testid={`print-size-${i}`}
                    onClick={() => setSizeIdx(i)}
                    className={`w-full flex items-center justify-between px-4 py-3 border text-left transition-colors duration-300 ${
                      sizeIdx === i
                        ? "border-accent bg-accent/10"
                        : "border-white/15 hover:border-white/40"
                    }`}
                  >
                    <span className="text-sm text-white">{o.size}</span>
                    <span className="font-mono-accent text-sm text-accent">{currency} {o.price}</span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-neutral-500 mt-2">
                Archival giclée on fine art paper. Final quote confirmed by email.
              </p>
            </div>
          )}

          <Input
            data-testid="print-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your name"
            className="bg-transparent border-white/20 rounded-none h-11"
          />
          <Input
            data-testid="print-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@email.com"
            className="bg-transparent border-white/20 rounded-none h-11"
          />
          <Textarea
            data-testid="print-message"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder={purpose === "print" ? "Framing, quantity, delivery city..." : "Intended use, platform, duration..."}
            rows={3}
            className="bg-transparent border-white/20 rounded-none resize-none"
          />
          <Button
            type="submit"
            data-testid="print-submit"
            disabled={loading}
            className="w-full rounded-none bg-accent text-black hover:bg-gold-hover h-11 uppercase tracking-[0.15em] text-sm"
          >
            {loading ? "Sending..." : "Send Request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
