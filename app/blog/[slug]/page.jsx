'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Share2, Clock, Calendar } from "lucide-react";
import { getBlogPost, getSite } from "@/lib/api";
import { toast } from "sonner";

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug;
  const [post, setPost] = useState(null);
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    window.scrollTo(0, 0);
    setLoading(true);
    Promise.all([
      getBlogPost(slug).catch(() => null),
      getSite().catch(() => ({})),
    ])
      .then(([p, s]) => {
        setPost(p);
        setSite(s);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const title = post ? post.title : "Mihir Ranva Field Journal";
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Article link copied to clipboard!");
    } catch {
      toast.info("Could not copy link automatically.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center px-6">
        <h1 className="font-serif text-4xl mb-4">Article Not Found</h1>
        <p className="text-neutral-400 mb-8 max-w-md text-center">
          The journal entry you are looking for may have been moved or updated.
        </p>
        <Link
          href="/blog"
          className="border border-white/20 px-6 py-3 text-xs uppercase tracking-[0.2em] text-white hover:bg-white hover:text-black transition-colors"
        >
          ← Return to Field Journal
        </Link>
      </div>
    );
  }

  return (
    <div className="grain bg-[#050505] min-h-screen text-white pb-24">
      {/* Top Header Bar */}
      <header className="border-b border-white/10 bg-black/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-6 h-18 flex items-center justify-between">
          <Link
            href="/blog"
            className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-neutral-400 hover:text-white transition-colors py-4 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Field Journal</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs uppercase tracking-[0.15em] text-neutral-400 hover:text-accent transition-colors"
            >
              Portfolio
            </Link>
            <button
              onClick={handleShare}
              className="p-2 text-neutral-400 hover:text-white transition-colors"
              title="Share Article"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Universal Blog Post Template */}
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="blog-wrapper"
      >
        <div className="blog-meta flex flex-wrap items-center gap-2">
          <span>Published: {post.published_date || "Recent"}</span>
          <span>•</span>
          <span>{post.category || "Conservation & Fieldwork"}</span>
          {post.reading_time && (
            <>
              <span>•</span>
              <span className="text-neutral-400 normal-case">{post.reading_time}</span>
            </>
          )}
        </div>

        <h1 className="blog-main-title">{post.title}</h1>

        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-16 pt-10 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="font-mono-accent text-xs uppercase tracking-[0.2em] text-accent mb-1">
              Field Author & Researcher
            </p>
            <p className="font-serif text-2xl text-white">Mihir Ranva</p>
            <p className="text-sm text-neutral-400 mt-1 max-w-md">
              IT Professional, wildlife photographer & birding educator documenting Gujarat&apos;s ecosystems.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 border border-white/20 px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-white hover:bg-white hover:text-black transition-colors"
            >
              <Share2 size={14} />
              <span>Share</span>
            </button>
            <Link
              href="/#contact"
              className="flex items-center gap-2 border border-accent/40 bg-accent/10 px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-accent hover:bg-accent hover:text-black transition-colors"
            >
              <span>Connect</span>
            </Link>
          </div>
        </div>
      </motion.article>
    </div>
  );
}
