import { getShareCard } from "@/lib/api";
import { toast } from "sonner";

// Generates a branded Cloudinary share card and shares/opens it.
export async function sharePhotoCard(photo) {
  if (!photo?.id) return;
  toast.loading("Building your share card...", { id: "share" });
  try {
    const { url } = await getShareCard(photo.id);
    toast.dismiss("share");
    if (navigator.share) {
      try {
        await navigator.share({
          title: photo.title,
          text: `${photo.title} — Mihir Ranva Photography`,
          url,
        });
        return;
      } catch (e) {
        if (e && e.name === "AbortError") return;
      }
    }
    window.open(url, "_blank", "noopener");
    try { await navigator.clipboard?.writeText(url); } catch {}
    toast.success("Share card opened — link copied. Save & post to Instagram or WhatsApp.");
  } catch {
    toast.dismiss("share");
    toast.error("Couldn't build the share card. Please try again.");
  }
}
