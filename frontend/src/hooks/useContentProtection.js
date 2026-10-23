import { useEffect } from "react";
import { toast } from "sonner";

// Best-effort content protection: disables right-click, image dragging/saving,
// and common save/inspect keyboard shortcuts. Also attempts to clear the
// clipboard on PrintScreen. NOTE: OS-level screenshots cannot be fully blocked
// by any website — this is a strong deterrent, not a guarantee.
export default function useContentProtection() {
  useEffect(() => {
    let lastNotice = 0;
    const onContextMenu = (e) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastNotice > 2000) {
        lastNotice = now;
        toast("© Mihir Ranva — images protected", {
          id: "img-protected",
          description: "Please contact the studio for prints or licensing.",
        });
      }
      return false;
    };

    const onDragStart = (e) => {
      if (e.target && e.target.tagName === "IMG") {
        e.preventDefault();
        return false;
      }
    };

    const onKeyDown = (e) => {
      const key = (e.key || "").toLowerCase();
      // Block DevTools + View Source + Save + Print
      if (e.keyCode === 123) { e.preventDefault(); return false; } // F12
      if ((e.ctrlKey || e.metaKey) && ["s", "u", "p"].includes(key)) {
        e.preventDefault();
        return false;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ["i", "j", "c"].includes(key)) {
        e.preventDefault();
        return false;
      }
    };

    const clearClipboard = async () => {
      try { await navigator.clipboard.writeText(""); } catch (_) {}
    };
    const onKeyUp = (e) => {
      if (e.key === "PrintScreen" || e.keyCode === 44) clearClipboard();
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
