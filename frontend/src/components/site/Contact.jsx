import { useState } from "react";
import { toast } from "sonner";
import { postContact } from "@/lib/api";
import { Reveal, RevealLinesInView } from "./Reveal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const Contact = ({ email }) => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      await postContact(form);
      toast.success("Message sent — thank you, I'll be in touch.");
      setForm({ name: "", email: "", message: "" });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" data-testid="contact-section" className="relative z-10 py-24 md:py-32 bg-[#0A0A0A] border-t border-white/10">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 md:gap-24">
        <div>
          <p className="font-mono-accent text-xs uppercase tracking-[0.3em] text-accent mb-4">
            Get in Touch
          </p>
          <h2 className="font-serif text-5xl md:text-7xl tracking-tight text-white leading-[0.9] mb-8">
            <RevealLinesInView lines={["Let's tell", "a story"]} testId="contact-heading" />
          </h2>
          <Reveal delay={0.1}>
            <p className="text-neutral-400 text-lg leading-relaxed max-w-md mb-8">
              For workshops, exhibitions, prints, conservation collaborations or licensing
              enquiries — reach out and let's create something meaningful.
            </p>
            <a
              href={`mailto:${email}`}
              data-testid="contact-email-link"
              className="font-serif text-2xl md:text-3xl text-white hover-underline"
            >
              {email}
            </a>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <form onSubmit={submit} data-testid="contact-form" className="space-y-6">
            <div>
              <label className="font-mono-accent text-xs uppercase tracking-[0.2em] text-neutral-500 block mb-2">Name</label>
              <Input
                data-testid="contact-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                className="bg-transparent border-0 border-b border-white/20 rounded-none px-0 h-12 text-lg text-white focus-visible:ring-0 focus-visible:border-accent"
              />
            </div>
            <div>
              <label className="font-mono-accent text-xs uppercase tracking-[0.2em] text-neutral-500 block mb-2">Email</label>
              <Input
                data-testid="contact-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@email.com"
                className="bg-transparent border-0 border-b border-white/20 rounded-none px-0 h-12 text-lg text-white focus-visible:ring-0 focus-visible:border-accent"
              />
            </div>
            <div>
              <label className="font-mono-accent text-xs uppercase tracking-[0.2em] text-neutral-500 block mb-2">Message</label>
              <Textarea
                data-testid="contact-message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Tell me about your project..."
                rows={4}
                className="bg-transparent border-0 border-b border-white/20 rounded-none px-0 text-lg text-white focus-visible:ring-0 focus-visible:border-accent resize-none"
              />
            </div>
            <Button
              type="submit"
              data-testid="contact-submit"
              disabled={loading}
              className="rounded-none bg-accent text-black hover:bg-gold-hover h-12 px-10 uppercase tracking-[0.15em] text-sm font-medium transition-colors"
            >
              {loading ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </Reveal>
      </div>
    </section>
  );
};
