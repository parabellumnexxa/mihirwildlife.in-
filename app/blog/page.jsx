'use client';

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Calendar, Clock, BookOpen } from "lucide-react";
import { getBlogPosts } from "@/lib/api";

export default function BlogIndexPage() {
  const [posts, setPosts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    getBlogPosts()
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set(["All"]);
    posts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (activeCategory === "All") return posts;
    return posts.filter((p) => p.category === activeCategory);
  }, [posts, activeCategory]);

  return (
    <div className="grain bg-[#050505] min-h-screen text-white pb-32">
      {/* Header Bar */}
      <header className="border-b border-white/10 bg-black/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-neutral-400 hover:text-white transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Mihir Ranva Portfolio</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/#gallery"
              className="text-xs uppercase tracking-[0.15em] text-neutral-400 hover:text-accent transition-colors hidden sm:block"
            >
              Gallery
            </Link>
            <Link
              href="/#contact"
              className="text-xs uppercase tracking-[0.15em] text-neutral-400 hover:text-accent transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-16 md:pt-24 pb-12">
        <div className="max-w-3xl">
          <p className="font-mono-accent text-xs uppercase tracking-[0.3em] text-accent mb-4">
            Fieldwork · IT Diaries · Conservation
          </p>
          <h1 className="font-serif text-5xl md:text-7xl text-white tracking-tight leading-[0.95]">
            The Field Journal
          </h1>
          <p className="text-neutral-400 text-base md:text-lg mt-6 leading-relaxed max-w-2xl font-light">
            In-depth field logs, behavioral studies of Gujarat&apos;s avifauna, and insights connecting modern IT analytics with active wildlife preservation.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 mt-12 border-b border-white/10 pb-6">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-4 py-2 text-xs uppercase tracking-[0.15em] border transition-all duration-300 ${
                activeCategory === c
                  ? "bg-accent border-accent text-black font-medium"
                  : "border-white/15 text-neutral-400 hover:border-white/40 hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Posts List */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-20 text-center text-neutral-500">
            <p className="font-serif text-2xl">No articles found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <article
                key={post.id || post.slug}
                className="group border border-white/10 bg-[#0A0A0A] hover:border-accent/50 transition-all duration-500 flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {post.cover_image && (
                    <div className="aspect-[16/10] overflow-hidden bg-neutral-900 border-b border-white/10 relative">
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-8">
                    <div className="flex items-center justify-between text-xs font-mono-accent text-accent mb-4">
                      <span>{post.category || "Field Note"}</span>
                      <span className="text-neutral-500 flex items-center gap-1">
                        <Clock size={12} /> {post.reading_time || "4 min read"}
                      </span>
                    </div>
                    <h2 className="font-serif text-2xl md:text-3xl text-white group-hover:text-accent transition-colors leading-snug mb-3">
                      <Link href={`/blog/${post.slug || post.id}`}>
                        {post.title}
                      </Link>
                    </h2>
                    {post.excerpt && (
                      <p className="text-neutral-400 text-sm leading-relaxed line-clamp-3 font-light mb-6">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-8 pt-0 border-t border-white/5 mt-auto flex items-center justify-between text-xs text-neutral-500">
                  <div className="flex items-center gap-2">
                    <Calendar size={13} />
                    <span>{post.published_date}</span>
                  </div>
                  <Link
                    href={`/blog/${post.slug || post.id}`}
                    className="flex items-center gap-1 text-accent hover:underline uppercase tracking-wider font-medium"
                  >
                    <span>Read Article</span>
                    <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
