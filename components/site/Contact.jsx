'use client';

import { useState } from "react";
import { toast } from "sonner";
import { postContact } from "@/lib/api";
import { Reveal, RevealLinesInView } from "./Reveal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SocialLinks } from "./SocialLinks";

export const Contact = ({ email, socials = {} }) => {
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
    <section id="contact" data-testid="contact-section" className="relative z-10 py-24 md:py-32 bg-[#0A0A0A] border-t border-white/10 scroll-mt-20">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 md:gap-24">
        <div className="space-y-4">
          <div>
            <p className="font-mono-accent text-xs uppercase tracking-[0.25em] text-accent mb-1.5">
              Get in Touch
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl tracking-tight text-white leading-tight mb-3" data-testid="contact-heading">
              Let&apos;s tell a story
            </h2>

            {/* Connect Directly on Social Media */}
            <div className="mb-4">
              <p className="font-mono-accent text-[11px] uppercase tracking-[0.2em] text-neutral-400 mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Connect Directly on Social Media
              </p>
              <SocialLinks socials={socials} variant="contact" />
            </div>

            <p className="text-neutral-400 text-sm md:text-base leading-relaxed max-w-lg mb-2.5">
              For workshops, exhibitions, prints, conservation collaborations or licensing
              enquiries — reach out and let&apos;s create something meaningful.
            </p>
            <a
              href={`mailto:${email}`}
              data-testid="contact-email-link"
              className="font-serif text-xl md:text-2xl text-accent hover:text-white transition-colors inline-block hover-underline"
            >
              {email}
            </a>
          </div>
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
            <button
              type="submit"
              data-testid="contact-submit"
              disabled={loading}
              className="inline-flex items-center justify-center h-12 px-10 rounded-none bg-[#C9A25E] text-[#050505] font-semibold hover:bg-[#E3BA74] uppercase tracking-[0.15em] text-sm transition-all duration-300 shadow-[0_0_20px_rgba(201,162,94,0.35)] hover:shadow-[0_0_30px_rgba(201,162,94,0.55)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
};
