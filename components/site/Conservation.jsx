'use client';

import { Reveal, RevealLinesInView } from "./Reveal";
import { Camera, HeartHandshake, Users, Shield, GraduationCap, Building2, Trees } from "lucide-react";

export const Conservation = () => {
  return (
    <section
      id="initiatives"
      data-testid="conservation-section"
      className="relative z-10 py-16 md:py-24 bg-[#050505] border-t border-white/10 scroll-mt-20"
    >
      <div id="conservation" className="sr-only" />
      <div id="workshops" className="sr-only" />
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        {/* Section Heading */}
        <div className="max-w-3xl mb-10 md:mb-12">
          <p className="font-mono-accent text-xs uppercase tracking-[0.25em] text-accent mb-2">
            Environmental Leadership & Field Work
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl tracking-tight text-white leading-tight">
            <RevealLinesInView lines={["Conservation &", "Workshops"]} testId="conservation-heading" />
          </h2>
          <p className="text-neutral-400 text-base md:text-lg mt-3 leading-relaxed max-w-2xl font-light">
            Bridging technical precision, community-rooted activism, and hands-on field biology to safeguard Gujarat&apos;s wildlife ecosystems.
          </p>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {/* Pillar 1: Education & Workshops */}
          <Reveal
            delay={0.05}
            className="flex flex-col justify-between p-8 md:p-10 bg-[#0A0A0A] border border-white/10 hover:border-accent/40 transition-all duration-500 rounded-sm group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-all pointer-events-none" />
            <div>
              <div className="w-12 h-12 rounded-full border border-white/15 flex items-center justify-center text-accent mb-6 bg-white/[0.02]">
                <Camera size={22} />
              </div>
              <p className="font-mono-accent text-[11px] uppercase tracking-[0.2em] text-accent mb-2">
                Outreach & Capacity
              </p>
              <h3 className="font-serif text-3xl text-white mb-6 leading-tight">
                Education & Workshops
              </h3>

              <div className="space-y-6 text-sm text-neutral-300 leading-relaxed">
                <div>
                  <div className="flex items-center gap-2 text-white font-medium mb-1">
                    <Building2 size={15} className="text-accent shrink-0" />
                    <span>Corporate & Brand Partnerships</span>
                  </div>
                  <p className="text-neutral-400 pl-5">
                    Led certified wildlife awareness programs and specialized photography workshops in collaboration with <strong className="text-neutral-200">Canon India</strong> and <strong className="text-neutral-200">SBI RSETI</strong>.
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-white font-medium mb-1">
                    <GraduationCap size={15} className="text-accent shrink-0" />
                    <span>Educational & Civic Outreach</span>
                  </div>
                  <p className="text-neutral-400 pl-5">
                    Conducted ecological awareness campaigns and training sessions for <strong className="text-neutral-200">Podar International School</strong> and the historic <strong className="text-neutral-200">Sakkarbaug Zoological Garden</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-2 text-xs font-mono-accent text-accent uppercase tracking-[0.15em]">
              <span>Field Education</span>
            </div>
          </Reveal>

          {/* Pillar 2: Grassroots Conservation & Rescue */}
          <Reveal
            delay={0.12}
            className="flex flex-col justify-between p-8 md:p-10 bg-[#0A0A0A] border border-white/10 hover:border-accent/40 transition-all duration-500 rounded-sm group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-all pointer-events-none" />
            <div>
              <div className="w-12 h-12 rounded-full border border-white/15 flex items-center justify-center text-accent mb-6 bg-white/[0.02]">
                <HeartHandshake size={22} />
              </div>
              <p className="font-mono-accent text-[11px] uppercase tracking-[0.2em] text-accent mb-2">
                Field Emergency Response
              </p>
              <h3 className="font-serif text-3xl text-white mb-6 leading-tight">
                Grassroots Conservation & Rescue
              </h3>

              <div className="space-y-6 text-sm text-neutral-300 leading-relaxed">
                <div>
                  <div className="flex items-center gap-2 text-white font-medium mb-1">
                    <Shield size={15} className="text-accent shrink-0" />
                    <span>Active Field Responder</span>
                  </div>
                  <p className="text-neutral-400 pl-5">
                    Dedicated responder on the ground for avian and wildlife emergency rescue operations across Junagadh and regional habitats.
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-white font-medium mb-1">
                    <Trees size={15} className="text-accent shrink-0" />
                    <span>Conflict Mitigation & Rehab</span>
                  </div>
                  <p className="text-neutral-400 pl-5">
                    Working on the front lines to mitigate human-wildlife conflict and rehabilitate distressed regional species back into their natural habitats.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-2 text-xs font-mono-accent text-accent uppercase tracking-[0.15em]">
              <span>Wildlife Rescue</span>
            </div>
          </Reveal>

          {/* Pillar 3: Memberships & Networks */}
          <Reveal
            delay={0.18}
            className="flex flex-col justify-between p-8 md:p-10 bg-[#0A0A0A] border border-white/10 hover:border-accent/40 transition-all duration-500 rounded-sm group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-all pointer-events-none" />
            <div>
              <div className="w-12 h-12 rounded-full border border-white/15 flex items-center justify-center text-accent mb-6 bg-white/[0.02]">
                <Users size={22} />
              </div>
              <p className="font-mono-accent text-[11px] uppercase tracking-[0.2em] text-accent mb-2">
                Institutions & Alliances
              </p>
              <h3 className="font-serif text-3xl text-white mb-6 leading-tight">
                Memberships & Networks
              </h3>

              <div className="space-y-5 text-sm leading-relaxed">
                <div className="p-3 bg-white/[0.03] border border-white/5 rounded-sm">
                  <p className="text-white font-medium">Founder &amp; CEO — Parabellum Nexxa Pvt Ltd</p>
                  <p className="text-neutral-400 text-xs mt-1">Driving visual technology, digital media innovations, and creative production bridging IT excellence and conservation.</p>
                </div>

                <div className="p-3 bg-white/[0.03] border border-white/5 rounded-sm">
                  <p className="text-white font-medium">Bombay Natural History Society (BNHS)</p>
                  <p className="text-neutral-400 text-xs mt-1">Contributing member aligned with national research, field surveys, and species preservation standards.</p>
                </div>

                <div className="p-3 bg-white/[0.03] border border-white/5 rounded-sm">
                  <p className="text-white font-medium">Club JPG — Co-Founder (Est. 2012)</p>
                  <p className="text-neutral-400 text-xs mt-1">Established regional photography network fostering youth mentorship, ethical field ethics, and creative visual training.</p>
                </div>

                <div className="p-3 bg-white/[0.03] border border-white/5 rounded-sm">
                  <p className="text-white font-medium">Regional Alliances</p>
                  <p className="text-neutral-400 text-xs mt-1">Active member of the <strong className="text-neutral-200">Vasundhara Nature Club</strong> and <strong className="text-neutral-200">Nisarg Nature Club</strong>, protecting regional ecosystems in Gujarat.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-2 text-xs font-mono-accent text-accent uppercase tracking-[0.15em]">
              <span>Affiliations</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
