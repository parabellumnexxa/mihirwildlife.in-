'use client';

import { useEffect } from "react";
import { toast } from "sonner";

/**
 * Best-effort studio content protection for live public deployment:
 * - Disables right-click context menu on images and public gallery items
 * - Prevents image dragging and direct saving
 * - Blocks inspection and save shortcuts (F12, Ctrl+S, Ctrl+U, Ctrl+P, DevTools)
 * - Restricts PrintScreen clipboard capture
 * - Automatically bypassed in /admin so administrative studio work is unrestricted
 * - Preserves standard context menu inside form inputs and textareas
 */
export default function useContentProtection() {
  useEffect(() => {
    // Unrestricted in admin studio
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
      return;
    }

    let lastNotice = 0;

    const onContextMenu = (e) => {
      // Allow text selection / right click inside form inputs and textareas
      if (e.target && ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) {
        return;
      }
      e.preventDefault();
      const now = Date.now();
      if (now - lastNotice > 2500) {
        lastNotice = now;
        toast("© Mihir Ranva — images protected", {
          id: "img-protected",
          description: "Please contact the studio for fine-art prints or licensing.",
        });
      }
      return false;
    };

    const onDragStart = (e) => {
      if (e.target && (e.target.tagName === "IMG" || e.target.closest("img"))) {
        e.preventDefault();
        return false;
      }
    };

    const onKeyDown = (e) => {
      // Allow typing and editing in form inputs
      if (e.target && ["INPUT", "TEXTAREA"].includes(e.target.tagName)) {
        return;
      }
      const key = (e.key || "").toLowerCase();
      // Block F12 (DevTools)
      if (e.keyCode === 123 || e.key === "F12") {
        e.preventDefault();
        return false;
      }
      // Block Ctrl/Cmd + S (Save), U (View Source), P (Print)
      if ((e.ctrlKey || e.metaKey) && ["s", "u", "p"].includes(key)) {
        e.preventDefault();
        return false;
      }
      // Block Ctrl/Cmd + Shift + I/J/C (DevTools inspect)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ["i", "j", "c"].includes(key)) {
        e.preventDefault();
        return false;
      }
    };

    const clearClipboard = async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText("");
        }
      } catch (_) {}
    };

    const onKeyUp = (e) => {
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        clearClipboard();
        toast("© Mihir Ranva — screen capture restricted", {
          id: "screenshot-restricted",
          description: "High-resolution frames are protected by studio copyright.",
        });
      }
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("dragstart", onDragStart);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("dragstart", onDragStart);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, []);
}
