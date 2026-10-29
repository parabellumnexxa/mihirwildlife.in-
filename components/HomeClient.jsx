'use client';

import useLenis from "@/hooks/useLenis";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { Conservation } from "@/components/site/Conservation";
import { Gallery } from "@/components/site/Gallery";
import { Series } from "@/components/site/Series";
import { Manifesto } from "@/components/site/Manifesto";
import { Achievements } from "@/components/site/Achievements";
import { Works } from "@/components/site/Works";
import { EditorialMarquee } from "@/components/site/EditorialMarquee";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import CustomCursor from "@/components/site/CustomCursor";

export default function HomeClient({ site }) {
  useLenis();

  const siteData = site || {};
  const socials = {
    instagram: siteData.instagram,
    facebook: siteData.facebook,
    threads: siteData.threads,
    linkedin: siteData.linkedin,
    x: siteData.x,
    email: siteData.contact_email,
  };

  return (
    <div className="grain bg-[#050505] min-h-screen" data-testid="home-page">
      <CustomCursor />
      <Nav
        logoUrl={siteData.logo_url}
        blogUrl={siteData.blog_url}
        showBlog={siteData.show_blog !== false}
        socials={socials}
      />
      <Hero
        heroImage={siteData.hero_image_url}
        heroImages={siteData.hero_images || []}
      />
      <About aboutImage={siteData.about_image_url} />
      <Manifesto />
      <Gallery categories={siteData.categories} />
      <Series collections={siteData.collections || {}} />
      <Conservation />
      <Achievements />
      <Works />
      <EditorialMarquee />
      <Contact email={siteData.contact_email} socials={socials} />
      <Footer logoUrl={siteData.logo_url} socials={socials} instagram={siteData.instagram} />
    </div>
  );
}
