import { useState, useEffect } from "react";
import useLenis from "@/hooks/useLenis";
import { getSite } from "@/lib/api";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Gallery } from "@/components/site/Gallery";
import { Series } from "@/components/site/Series";
import { Manifesto } from "@/components/site/Manifesto";
import { About } from "@/components/site/About";
import { Achievements } from "@/components/site/Achievements";
import { Works } from "@/components/site/Works";
import { EditorialMarquee } from "@/components/site/EditorialMarquee";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";

export default function Home() {
  useLenis();
  const [site, setSite] = useState(null);

  useEffect(() => {
    getSite().then(setSite).catch(() => setSite({}));
  }, []);

  if (!site) {
    return <div className="min-h-screen bg-[#050505]" data-testid="home-loading" />;
  }

  return (
    <div className="grain bg-[#050505] min-h-screen" data-testid="home-page">
      <Nav logoUrl={site.logo_url} />
      <Hero heroImage={site.hero_image_url} />
      <Gallery />
      <Series collections={site.collections || {}} />
      <Manifesto />
      <About aboutImage={site.about_image_url} />
      <Achievements />
      <Works />
      <EditorialMarquee />
      <Contact email={site.contact_email} />
      <Footer logoUrl={site.logo_url} instagram={site.instagram} />
    </div>
  );
}
