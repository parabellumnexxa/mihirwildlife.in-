'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import exifr from "exifr";
import {
  adminLogin, getPhotos, createPhoto, updatePhoto, deletePhoto, reorderPhotos,
  getSite, updateSite, getMessages, deleteContactMessage, getPrintRequests, updatePrintRequest, deletePrintRequest, uploadToCloudinary,
  getBlogPosts, getBlogPost, createBlogPost, updateBlogPost, deleteBlogPost,
  importFromCloudinary,
} from "@/lib/api";
import { CATEGORIES } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  Trash2, Upload, LogOut, Loader2, ArrowLeft, GripVertical, Frame, Pencil, X, Plus,
  FileText, ExternalLink, Eye, BookOpen, Quote, Heading, Sparkles, Check, Copy, Image as ImageIcon,
  CloudDownload, Mail
} from "lucide-react";

export const MIHIR_CAMERAS = [
  "Canon EOS 7D Mark II",
  "Canon EOS 550D",
];

export const MIHIR_LENSES = [
  "Sigma 150-600mm f/5-6.3 Sports",
  "Canon EF 70-300mm",
  "Canon EF 100-400mm",
  "Canon EF-S 55-250mm",
  "Canon EF-S 18-135mm",
  "Canon EF-S 10-18mm",
  "Canon EF 50mm",
];

function matchGear(rawCamera, rawLens) {
  let camera = rawCamera || "";
  let lens = rawLens || "";

  const camLower = camera.toLowerCase();
  if (camLower.includes("7d") && (camLower.includes("mark ii") || camLower.includes("mk ii") || camLower.includes("mark 2"))) {
    camera = "Canon EOS 7D Mark II";
  } else if (camLower.includes("7d")) {
    camera = "Canon EOS 7D Mark II";
  } else if (camLower.includes("550d") || camLower.includes("t2i")) {
    camera = "Canon EOS 550D";
  }

  const lensLower = lens.toLowerCase();
  if (lensLower.includes("150-600")) {
    lens = "Sigma 150-600mm f/5-6.3 Sports";
  } else if (lensLower.includes("70-300") || lensLower.includes("70-30")) {
    lens = "Canon EF 70-300mm";
  } else if (lensLower.includes("100-400")) {
    lens = "Canon EF 100-400mm";
  } else if (lensLower.includes("55-250")) {
    lens = "Canon EF-S 55-250mm";
  } else if (lensLower.includes("18-135")) {
    lens = "Canon EF-S 18-135mm";
  } else if (lensLower.includes("10-18")) {
    lens = "Canon EF-S 10-18mm";
  } else if (lensLower.includes("50mm") || (lensLower.includes("50") && lensLower.includes("1.8"))) {
    lens = "Canon EF 50mm";
  }

  return { camera, lens };
}

export const MIHIR_SETTINGS_PRESETS = [
  { label: "Flight Action", value: "1/2500s · f/5.6 · ISO 640 · 400mm" },
  { label: "Perched Raptor", value: "1/1600s · f/6.3 · ISO 800 · 600mm" },
  { label: "Open Sunlight", value: "1/2000s · f/7.1 · ISO 320 · 550mm" },
  { label: "Golden Hour", value: "1/1000s · f/6.3 · ISO 500 · 600mm" },
  { label: "Canopy Shade", value: "1/1000s · f/6.3 · ISO 800 · 450mm" },
  { label: "Portrait 50mm", value: "1/500s · f/2.8 · ISO 200 · 50mm" },
];

export function generateSmartSettings(title = "", category = "") {
  const t = ((title || "") + " " + (category || "")).toLowerCase();
  if (t.includes("flight") || t.includes("fly") || t.includes("buzzard") || t.includes("action") || t.includes("hunting") || t.includes("wing") || t.includes("takeoff")) {
    return {
      camera: "Canon EOS 7D Mark II",
      lens: "Canon EF 100-400mm",
      settings: "1/2500s · f/5.6 · ISO 400 · 400mm",
    };
  }
  if (t.includes("owl") || t.includes("shikra") || t.includes("canopy") || t.includes("shade") || t.includes("forest") || t.includes("dense")) {
    return {
      camera: "Canon EOS 7D Mark II",
      lens: "Sigma 150-600mm f/5-6.3 Sports",
      settings: "1/1000s · f/6.3 · ISO 800 · 450mm",
    };
  }
  if (t.includes("tawny") || t.includes("desert") || t.includes("grassland") || t.includes("sun")) {
    return {
      camera: "Canon EOS 7D Mark II",
      lens: "Sigma 150-600mm f/5-6.3 Sports",
      settings: "1/2000s · f/7.1 · ISO 320 · 550mm",
    };
  }
  if (t.includes("kite") || t.includes("eagle") || t.includes("raptor") || t.includes("harrier") || t.includes("serpent")) {
    return {
      camera: "Canon EOS 7D Mark II",
      lens: "Sigma 150-600mm f/5-6.3 Sports",
      settings: "1/1600s · f/6.3 · ISO 800 · 600mm",
    };
  }
  if (t.includes("portrait") || t.includes("macro") || t.includes("close")) {
    return {
      camera: "Canon EOS 7D Mark II",
      lens: "Canon EF 50mm",
      settings: "1/500s · f/2.8 · ISO 200 · 50mm",
    };
  }
  return {
    camera: "Canon EOS 7D Mark II",
    lens: "Sigma 150-600mm f/5-6.3 Sports",
    settings: "1/1250s · f/6.3 · ISO 640 · 600mm",
  };
}

export function getSettingsForLens(lensName = "", title = "", category = "") {
  const l = (lensName || "").toLowerCase();
  const t = ((title || "") + " " + (category || "")).toLowerCase();
  const isAction = t.includes("flight") || t.includes("action") || t.includes("fly") || t.includes("hunting") || t.includes("wing") || t.includes("buzzard");

  if (l.includes("150-600")) {
    return isAction
      ? "1/2500s · f/6.3 · ISO 800 · 600mm"
      : "1/1600s · f/6.3 · ISO 640 · 600mm";
  }
  if (l.includes("100-400")) {
    return isAction
      ? "1/2500s · f/5.6 · ISO 500 · 400mm"
      : "1/2000s · f/5.6 · ISO 400 · 400mm";
  }
  if (l.includes("70-300") || l.includes("70-30")) {
    return isAction
      ? "1/2000s · f/5.6 · ISO 500 · 300mm"
      : "1/1250s · f/5.6 · ISO 400 · 300mm";
  }
  if (l.includes("55-250")) {
    return "1/1000s · f/5.6 · ISO 400 · 250mm";
  }
  if (l.includes("18-135")) {
    return "1/800s · f/5.6 · ISO 250 · 135mm";
  }
  if (l.includes("10-18")) {
    return "1/250s · f/8.0 · ISO 100 · 14mm";
  }
  if (l.includes("50mm") || l.includes("50")) {
    return "1/500s · f/2.8 · ISO 200 · 50mm";
  }
  return "1/1600s · f/6.3 · ISO 640 · 600mm";
}

async function extractExif(file) {
  try {
    const d = await exifr.parse(file, ["Make", "Model", "LensModel", "LensMake", "FNumber", "ExposureTime", "ISO", "ISOSpeedRatings", "FocalLength"]);
    if (!d) return {};
    const rawCamera = [d.Make, d.Model].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
    const rawLens = (d.LensModel || d.LensMake || "").trim();
    const { camera, lens } = matchGear(rawCamera, rawLens);
    const iso = d.ISO || d.ISOSpeedRatings;
    const parts = [];
    if (d.FNumber) parts.push(`f/${d.FNumber}`);
    if (d.ExposureTime) {
      const s = d.ExposureTime >= 1 ? `${d.ExposureTime}s` : `1/${Math.round(1 / d.ExposureTime)}s`;
      parts.push(s);
    }
    if (d.FocalLength) parts.push(`${Math.round(d.FocalLength)}mm`);
    if (iso) parts.push(`ISO ${iso}`);
    return { camera, lens, settings: parts.join(" · ") };
  } catch {
    return {};
  }
}

function Login({ onLogin }) {
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token } = await adminLogin(pw);
      if (typeof window !== "undefined") { localStorage.setItem("admin_token", token); }
      onLogin();
      toast.success("Welcome back, Mihir.");
    } catch {
      toast.error("Invalid password.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6" data-testid="admin-login">
      <form onSubmit={submit} className="w-full max-w-sm">
        <Link href="/" className="text-neutral-500 text-sm flex items-center gap-2 mb-10 hover:text-accent">
          <ArrowLeft size={16} /> Back to site
        </Link>
        <p className="font-mono-accent text-xs uppercase tracking-[0.3em] text-accent mb-3">Studio Access</p>
        <h1 className="font-serif text-4xl text-white mb-8">Admin Panel</h1>
        <Input
          data-testid="admin-password"
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Enter password"
          className="bg-transparent border-white/20 rounded-none h-12 text-white mb-4"
        />
        <Button data-testid="admin-login-btn" disabled={loading} type="submit" className="w-full rounded-none bg-accent text-black hover:bg-gold-hover h-12 uppercase tracking-[0.15em]">
          {loading ? <Loader2 className="animate-spin" size={18} /> : "Enter"}
        </Button>
      </form>
    </div>
  );
}

function PhotosTab({ site: propSite, setSite: propSetSite, prefilledSeries, clearPrefilledSeries }) {
  const [internalSite, setInternalSite] = useState(null);
  const site = propSite || internalSite;
  const setSite = propSetSite || setInternalSite;

  const [photos, setPhotos] = useState([]);
  const [form, setForm] = useState({ title: "", title_gu: "", category: "Wildlife", location: "", collection: "", story: "", camera: "", lens: "", settings: "" });
  const [uploading, setUploading] = useState(false);
  const [importingCloudinary, setImportingCloudinary] = useState(false);
  const [dragId, setDragId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [replacingPhoto, setReplacingPhoto] = useState(false);
  const [aiUpdatingAll, setAiUpdatingAll] = useState(false);
  const [showCatManage, setShowCatManage] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [showSeriesManage, setShowSeriesManage] = useState(false);
  const [newSeriesName, setNewSeriesName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const fileRef = useRef();
  const editFileRef = useRef();

  const handleCloudinaryImport = async () => {
    setImportingCloudinary(true);
    try {
      const res = await importFromCloudinary();
      toast.success(res.message || `Successfully synced ${res.imported_count} photos from Cloudinary.`);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Cloudinary import failed. Check credentials.");
    } finally {
      setImportingCloudinary(false);
    }
  };

  const load = () => {
    getPhotos().then(setPhotos);
    if (!propSite) getSite().then(setInternalSite).catch(() => {});
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const categories = (site?.categories && site.categories.length > 0)
    ? site.categories
    : CATEGORIES.filter((c) => c !== "All");

  const siteSeries = Object.keys(site?.collections || {});
  const photoSeries = Array.from(new Set(photos.map((p) => p.collection).filter(Boolean)));
  const allSeriesList = Array.from(new Set([...siteSeries, ...photoSeries])).sort();

  useEffect(() => {
    if (prefilledSeries) {
      setForm((f) => ({ ...f, collection: prefilledSeries }));
      clearPrefilledSeries?.();
      toast.info(`Series set to "${prefilledSeries}" for upload.`);
    }
  }, [prefilledSeries, clearPrefilledSeries]);

  useEffect(() => {
    if (categories.length > 0 && !categories.includes(form.category)) {
      setForm((f) => ({ ...f, category: categories[0] }));
    }
  }, [categories, form.category]);

  const addCategory = async () => {
    const name = newCatName.trim();
    if (!name) return;
    if (categories.some((c) => c.toLowerCase() === name.toLowerCase())) {
      toast.error(`Category "${name}" already exists.`);
      return;
    }
    const nextCats = [...categories, name];
    try {
      const updated = await updateSite({ categories: nextCats });
      setSite(updated);
      setForm((f) => ({ ...f, category: name }));
      setNewCatName("");
      toast.success(`Category "${name}" added.`);
    } catch {
      toast.error("Failed to add category.");
    }
  };

  const promptRemoveCategory = (catName) => {
    const count = photos.filter((p) => p.category === catName).length;
    setDeleteConfirm({ type: "category", name: catName, count, reassign: true });
  };

  const confirmDeleteCategory = async () => {
    if (!deleteConfirm || deleteConfirm.type !== "category") return;
    const { name, count, reassign } = deleteConfirm;
    if (categories.length <= 1) {
      toast.error("At least one category is required.");
      setDeleteConfirm(null);
      return;
    }
    const nextCats = categories.filter((c) => c !== name);
    try {
      const updated = await updateSite({ categories: nextCats });
      setSite(updated);
      if (form.category === name) {
        setForm((f) => ({ ...f, category: nextCats[0] || "Wildlife" }));
      }
      if (reassign && count > 0) {
        const fallback = nextCats[0] || "Wildlife";
        const affected = photos.filter((p) => p.category === name);
        await Promise.all(affected.map((p) => updatePhoto(p.id, { category: fallback })));
        load();
      }
      toast.success(`Category "${name}" removed.`);
      setDeleteConfirm(null);
    } catch {
      toast.error("Failed to remove category.");
    }
  };

  const addSeries = async () => {
    const name = newSeriesName.trim();
    if (!name) return;
    const collections = { ...(site?.collections || {}) };
    if (collections[name]) {
      setForm((f) => ({ ...f, collection: name }));
      setNewSeriesName("");
      toast.info(`Series "${name}" selected.`);
      return;
    }
    collections[name] = { caption: "", cover_public_id: "" };
    try {
      const updated = await updateSite({ collections });
      setSite(updated);
      setForm((f) => ({ ...f, collection: name }));
      setNewSeriesName("");
      toast.success(`Series "${name}" created and selected.`);
    } catch {
      toast.error("Failed to add series.");
    }
  };

  const promptRemoveSeries = (seriesName) => {
    const count = photos.filter((p) => p.collection === seriesName).length;
    setDeleteConfirm({ type: "series", name: seriesName, count, unassignPhotos: count > 0 });
  };

  const confirmDeleteSeries = async () => {
    if (!deleteConfirm || deleteConfirm.type !== "series") return;
    const { name, count, unassignPhotos } = deleteConfirm;
    try {
      const collections = { ...(site?.collections || {}) };
      delete collections[name];
      const updated = await updateSite({ collections });
      setSite(updated);
      if (form.collection === name) {
        setForm((f) => ({ ...f, collection: "" }));
      }
      if (unassignPhotos && count > 0) {
        const affected = photos.filter((p) => p.collection === name);
        await Promise.all(affected.map((p) => updatePhoto(p.id, { collection: "" })));
        load();
      }
      toast.success(`Series "${name}" removed.`);
      setDeleteConfirm(null);
    } catch {
      toast.error("Failed to remove series.");
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSavingEdit(true);
    try {
      await updatePhoto(editing.id, {
        title: editing.title || "",
        title_gu: editing.title_gu || "",
        category: editing.category || "Wildlife",
        location: editing.location || "",
        collection: editing.collection || "",
        story: editing.story || "",
        camera: editing.camera || "",
        lens: editing.lens || "",
        settings: editing.settings || "",
        image_url: editing.image_url,
        public_id: editing.public_id,
        order: editing.order,
        featured: editing.featured,
      });
      toast.success("Photo updated successfully.");
      setEditing(null);
      await load();
    } catch (err) {
      console.error("Save edit error:", err);
      toast.error(err?.message || "Update failed.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleReplacePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setReplacingPhoto(true);
    try {
      const exif = await extractExif(file);
      const res = await uploadToCloudinary(file, "portfolio/photos");
      setEditing((prev) => ({
        ...prev,
        image_url: res.url,
        public_id: res.public_id,
        width: res.width || prev.width,
        height: res.height || prev.height,
        camera: prev.camera || exif.camera || "",
        lens: prev.lens || exif.lens || "",
        settings: prev.settings || exif.settings || "",
      }));
      toast.success("New photo image uploaded! Click 'Save changes' to commit.");
    } catch (err) {
      console.error("Replace photo error:", err);
      toast.error("Failed to upload replacement image.");
    } finally {
      setReplacingPhoto(false);
      if (editFileRef.current) editFileRef.current.value = "";
    }
  };

  const handleAiPopulateAllPhotos = async () => {
    if (photos.length === 0) return;
    setAiUpdatingAll(true);
    try {
      let updatedCount = 0;
      for (const p of photos) {
        const smart = generateSmartSettings(p.title, p.category);
        const newCamera = p.camera || smart.camera;
        const newLens = p.lens || smart.lens;
        const newSettings = p.settings || smart.settings;
        if (p.camera !== newCamera || p.lens !== newLens || p.settings !== newSettings) {
          await updatePhoto(p.id, {
            ...p,
            camera: newCamera,
            lens: newLens,
            settings: newSettings,
          });
          updatedCount++;
        }
      }
      toast.success(`✨ AI Settings successfully applied to ${updatedCount > 0 ? updatedCount : 'all'} photos!`);
      await load();
    } catch (err) {
      console.error("AI populate error:", err);
      toast.error("Failed to generate AI settings for photos.");
    } finally {
      setAiUpdatingAll(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const cleanFileName = file.name ? file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") : "Untitled Frame";
    const titleToUse = form.title.trim() || cleanFileName;
    setUploading(true);
    try {
      // Auto-read camera/lens/settings from EXIF when the user left them blank
      const exif = await extractExif(file);
      const camera = form.camera || exif.camera || "";
      const lens = form.lens || exif.lens || "";
      const settings = form.settings || exif.settings || "";
      if (!form.camera && (exif.camera || exif.settings)) {
        toast.success("Camera details read from photo EXIF.");
      }
      const res = await uploadToCloudinary(file, "portfolio/photos");
      await createPhoto({
        title: titleToUse,
        title_gu: form.title_gu,
        category: form.category || categories[0] || "Wildlife",
        location: form.location,
        collection: form.collection || "",
        story: form.story,
        camera,
        lens,
        settings,
        image_url: res.secure_url,
        public_id: res.public_id,
        width: res.width,
        height: res.height,
        order: photos.length + 1,
      });
      toast.success("Photo uploaded.");
      setForm({ title: "", title_gu: "", category: form.category || categories[0] || "Wildlife", location: "", collection: "", story: "", camera: "", lens: "", settings: "" });
      load();
    } catch (err) {
      toast.error("Upload failed. Check Cloudinary keys.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const remove = async (id) => {
    try {
      await deletePhoto(id);
      toast.success("Photo removed.");
      load();
    } catch {
      toast.error("Delete failed.");
    }
  };

  const onDrop = async (targetId) => {
    if (!dragId || dragId === targetId) { setDragId(null); return; }
    const current = [...photos];
    const from = current.findIndex((p) => p.id === dragId);
    const to = current.findIndex((p) => p.id === targetId);
    const [moved] = current.splice(from, 1);
    current.splice(to, 0, moved);
    setPhotos(current);
    setDragId(null);
    try {
      await reorderPhotos(current.map((p) => p.id));
      toast.success("Order saved.");
    } catch {
      toast.error("Reorder failed.");
      load();
    }
  };

  return (
    <div className="space-y-8">
      <Card className="bg-[#0A0A0A] border-white/10 p-6 rounded-none">
        <h3 className="font-serif text-2xl text-white mb-5">Upload a new frame</h3>
        
        {/* Row 1: Title EN, Title GU, Location */}
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <Input
            data-testid="photo-title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Title (English)"
            className="bg-transparent border-white/20 rounded-none text-white"
          />
          <Input
            data-testid="photo-title-gu"
            value={form.title_gu}
            onChange={(e) => setForm({ ...form, title_gu: e.target.value })}
            placeholder="Title (ગુજરાતી)"
            className="bg-transparent border-white/20 rounded-none text-white"
          />
          <Input
            data-testid="photo-location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Location (optional)"
            className="bg-transparent border-white/20 rounded-none text-white"
          />
        </div>

        {/* Row 2: Category and Series/Collection with Add / Remove options */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* Category Selector with Add/Remove */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] text-neutral-400 uppercase tracking-wider font-mono-accent">
                Category (Wildlife, Birds, etc.)
              </label>
              <button
                type="button"
                data-testid="toggle-category-manage"
                onClick={() => setShowCatManage((v) => !v)}
                className="text-[10px] text-accent hover:text-gold-hover uppercase font-mono-accent tracking-wider transition-colors"
              >
                {showCatManage ? "Close" : "+ Add / Remove Option"}
              </button>
            </div>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger data-testid="photo-category" className="bg-transparent border-white/20 rounded-none text-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-white/20 text-white">
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* In-place Category Add / Remove drawer */}
            {showCatManage && (
              <div className="mt-2 p-3 bg-neutral-950 border border-accent/30 space-y-2.5">
                <p className="text-[10px] text-accent uppercase tracking-wider font-mono-accent">
                  Add or Remove Categories
                </p>
                <div className="flex gap-2">
                  <Input
                    data-testid="new-category-name"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCategory();
                      }
                    }}
                    placeholder="New category name (e.g. Reptiles, Macro)"
                    className="bg-transparent border-white/20 rounded-none text-white text-xs h-8"
                  />
                  <Button
                    type="button"
                    data-testid="add-category-btn"
                    onClick={addCategory}
                    className="h-8 rounded-none bg-accent text-black hover:bg-gold-hover uppercase tracking-wider text-xs px-2.5"
                  >
                    <Plus size={13} className="mr-1" /> Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {categories.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1.5 text-[11px] bg-white/5 border border-white/15 px-2 py-0.5 text-neutral-300"
                    >
                      <span>{c}</span>
                      <button
                        type="button"
                        data-testid={`remove-category-${c.toLowerCase()}`}
                        onClick={() => promptRemoveCategory(c)}
                        title={`Remove category "${c}"`}
                        className="text-neutral-400 hover:text-red-400 transition-colors"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Series / Collection Selector with Add/Remove */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] text-neutral-400 uppercase tracking-wider font-mono-accent">
                Series / Collection
              </label>
              <button
                type="button"
                data-testid="toggle-series-manage"
                onClick={() => setShowSeriesManage((v) => !v)}
                className="text-[10px] text-accent hover:text-gold-hover uppercase font-mono-accent tracking-wider transition-colors"
              >
                {showSeriesManage ? "Close" : "+ Add / Remove Option"}
              </button>
            </div>
            <Select
              value={form.collection || "__NONE__"}
              onValueChange={(v) => setForm({ ...form, collection: v === "__NONE__" ? "" : v })}
            >
              <SelectTrigger data-testid="photo-collection" className="bg-transparent border-white/20 rounded-none text-white">
                <SelectValue placeholder="Series / collection" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-white/20 text-white max-h-60">
                <SelectItem value="__NONE__">— No Series (Standalone frame) —</SelectItem>
                {allSeriesList.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* In-place Series Add / Remove drawer */}
            {showSeriesManage && (
              <div className="mt-2 p-3 bg-neutral-950 border border-accent/30 space-y-2.5">
                <p className="text-[10px] text-accent uppercase tracking-wider font-mono-accent">
                  Add or Remove Series
                </p>
                <div className="flex gap-2">
                  <Input
                    data-testid="photo-new-series-name"
                    value={newSeriesName}
                    onChange={(e) => setNewSeriesName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSeries();
                      }
                    }}
                    placeholder="New series name (e.g. Monsoon)"
                    className="bg-transparent border-white/20 rounded-none text-white text-xs h-8"
                  />
                  <Button
                    type="button"
                    data-testid="photo-add-series-btn"
                    onClick={addSeries}
                    className="h-8 rounded-none bg-accent text-black hover:bg-gold-hover uppercase tracking-wider text-xs px-2.5"
                  >
                    <Plus size={13} className="mr-1" /> Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {allSeriesList.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 text-[11px] bg-white/5 border border-white/15 px-2 py-0.5 text-neutral-300"
                    >
                      <span>{s}</span>
                      <button
                        type="button"
                        onClick={() => promptRemoveSeries(s)}
                        title={`Remove series "${s}"`}
                        className="text-neutral-400 hover:text-red-400 transition-colors"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Row 3: Field story */}
        <div className="mb-4">
          <Input
            data-testid="photo-story"
            value={form.story}
            onChange={(e) => setForm({ ...form, story: e.target.value })}
            placeholder="One-line field story (shown in lightbox)"
            className="bg-transparent border-white/20 rounded-none text-white"
          />
        </div>

        {/* Row 4: Camera EXIF & Mihir's Gear Quick Select */}
        <div className="space-y-4 mb-4">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Camera Body Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] text-neutral-400 uppercase tracking-wider font-mono-accent">
                  Camera Body
                </label>
                <span className="text-[10px] text-accent/80 font-mono-accent">Auto / Select</span>
              </div>
              <Input
                data-testid="photo-camera"
                value={form.camera}
                onChange={(e) => setForm({ ...form, camera: e.target.value })}
                placeholder="e.g. Canon EOS 7D Mark II"
                className="bg-transparent border-white/20 rounded-none text-white h-10"
              />
              {/* Quick Camera Body Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {MIHIR_CAMERAS.map((cam) => (
                  <button
                    key={cam}
                    type="button"
                    onClick={() => setForm({ ...form, camera: cam })}
                    className={`text-[11px] px-2.5 py-1 border transition-colors cursor-pointer ${
                      form.camera === cam
                        ? "bg-accent text-black border-accent font-medium"
                        : "bg-white/5 border-white/15 text-neutral-300 hover:border-accent/60 hover:text-white"
                    }`}
                  >
                    {cam}
                  </button>
                ))}
              </div>
            </div>

            {/* Lens Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] text-neutral-400 uppercase tracking-wider font-mono-accent">
                  Lens
                </label>
                <span className="text-[10px] text-accent/80 font-mono-accent">Auto / Select</span>
              </div>
              <Input
                data-testid="photo-lens"
                value={form.lens}
                onChange={(e) => setForm({ ...form, lens: e.target.value })}
                placeholder="e.g. Sigma 150-600mm f/5-6.3 Sports"
                className="bg-transparent border-white/20 rounded-none text-white h-10"
              />
              {/* Quick Lens Dropdown */}
              <div className="mt-2">
                <Select
                  value={MIHIR_LENSES.includes(form.lens) ? form.lens : ""}
                  onValueChange={(val) => {
                    const autoSettings = getSettingsForLens(val, form.title, form.category);
                    setForm({
                      ...form,
                      lens: val,
                      camera: form.camera || "Canon EOS 7D Mark II",
                      settings: autoSettings,
                    });
                    toast.success(`Lens: ${val} · Settings AI generated: ${autoSettings}`);
                  }}
                >
                  <SelectTrigger className="bg-white/5 border-white/15 rounded-none text-xs text-neutral-300 h-8">
                    <SelectValue placeholder="Quick Pick Lens from Bag..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121212] border-white/15 text-white">
                    {MIHIR_LENSES.map((l) => (
                      <SelectItem key={l} value={l} className="text-xs">{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Exposure Settings Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] text-neutral-400 uppercase tracking-wider font-mono-accent">
                  Settings / Exposure
                </label>
                <span className="text-[10px] text-accent/90 font-mono-accent">Auto-generated with Lens</span>
              </div>
              <Input
                data-testid="photo-settings"
                value={form.settings}
                onChange={(e) => setForm({ ...form, settings: e.target.value })}
                placeholder="f/6.3 · 1/1600s · 600mm · ISO 800"
                className="bg-transparent border-white/20 rounded-none text-white h-10"
              />
              <p className="text-[10px] text-neutral-500 mt-2">
                Auto-fills with optimal settings when you pick a lens, or read from EXIF.
              </p>
            </div>
          </div>

          {/* Quick Lens Pill Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-white/5">
            <span className="text-[10px] font-mono-accent text-neutral-500 uppercase tracking-wider mr-1">
              Your Lenses (Auto-Generates Settings):
            </span>
            {MIHIR_LENSES.map((lens) => (
              <button
                key={lens}
                type="button"
                onClick={() => {
                  const autoSettings = getSettingsForLens(lens, form.title, form.category);
                  setForm({
                    ...form,
                    lens,
                    camera: form.camera || "Canon EOS 7D Mark II",
                    settings: autoSettings,
                  });
                  toast.success(`Lens: ${lens} · Settings AI generated: ${autoSettings}`);
                }}
                className={`text-[10px] px-2 py-0.5 border transition-colors cursor-pointer ${
                  form.lens === lens
                    ? "bg-accent text-black border-accent font-medium"
                    : "bg-white/5 border-white/15 text-neutral-400 hover:border-accent/60 hover:text-white"
                }`}
              >
                {lens}
              </button>
            ))}
          </div>
        </div>
        {/* Dedicated Photo Upload Space / Drop Zone */}
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleUpload({ target: { files: e.dataTransfer.files } });
            }
          }}
          className="border-2 border-dashed border-white/20 hover:border-accent/60 bg-white/[0.02] hover:bg-white/[0.04] transition-all p-7 text-center cursor-pointer mb-5 flex flex-col items-center justify-center gap-2 group"
        >
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 group-hover:text-accent group-hover:scale-110 transition-all">
            <Upload size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-200 group-hover:text-accent transition-colors">
              Click to select a photo, or drag and drop image here
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              PNG, JPG, WEBP · Title & EXIF camera, lens and settings read automatically
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleUpload} data-testid="photo-file-input" />
          <Button
            data-testid="photo-upload-btn"
            disabled={uploading || importingCloudinary}
            onClick={() => fileRef.current?.click()}
            className="rounded-none bg-accent text-black hover:bg-gold-hover uppercase tracking-[0.15em] gap-2"
          >
            {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
            {uploading ? "Uploading..." : "Select Image from Computer"}
          </Button>
          <Button
            type="button"
            data-testid="cloudinary-sync-btn"
            disabled={importingCloudinary || uploading}
            onClick={handleCloudinaryImport}
            variant="outline"
            className="rounded-none border-accent/40 text-accent hover:bg-accent hover:text-black uppercase tracking-[0.15em] gap-2 transition-colors"
          >
            {importingCloudinary ? <Loader2 className="animate-spin" size={16} /> : <CloudDownload size={16} />}
            {importingCloudinary ? "Importing from Cloudinary..." : "Import All from Cloudinary"}
          </Button>
        </div>
      </Card>

      <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
        <p className="font-mono-accent text-xs uppercase tracking-[0.2em] text-neutral-500">
          Drag frames to reorder the gallery
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={handleAiPopulateAllPhotos}
            disabled={aiUpdatingAll}
            className="rounded-none bg-accent/15 border border-accent/40 text-accent hover:bg-accent hover:text-black font-mono-accent text-xs uppercase tracking-wider h-8"
          >
            <Sparkles size={13} className="mr-1.5" />
            {aiUpdatingAll ? "Generating AI Settings..." : "✨ AI Auto-Settings For All"}
          </Button>
          <span className="font-mono-accent text-xs px-2.5 py-1 bg-white/5 border border-white/10 text-accent">
            Active Portfolio: {photos.length} frames
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="admin-photo-grid">
        {photos.map((p) => (
          <div
            key={p.id}
            draggable
            onDragStart={() => setDragId(p.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(p.id)}
            data-testid={`admin-photo-${p.id}`}
            className={`relative group border cursor-move transition-opacity ${
              dragId === p.id ? "opacity-40 border-accent" : "border-white/10"
            }`}
          >
            <div className="absolute top-2 left-2 z-10 bg-black/70 p-1.5 text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical size={16} />
            </div>
            <img src={p.image_url} alt={p.title} className="w-full h-40 object-cover pointer-events-none" />
            <div className="p-3">
              <p className="text-white text-sm truncate">{p.title}</p>
              <p className="font-mono-accent text-[10px] uppercase tracking-wider text-accent">{p.category}{p.collection ? ` · ${p.collection}` : " · No series"}</p>
            </div>
            <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                title="Add to Hero 10s Rotator"
                onClick={async () => {
                  try {
                    const currentList = site?.hero_images || [];
                    if (currentList.includes(p.image_url)) {
                      toast.info("Already in Hero Rotator.");
                      return;
                    }
                    const updatedList = [...currentList, p.image_url];
                    const updated = await updateSite({ hero_images: updatedList });
                    setSite(updated);
                    toast.success(`"${p.title}" added to Hero 10s Rotator!`);
                  } catch {
                    toast.error("Failed to add to Hero.");
                  }
                }}
                className="bg-black/75 p-2 text-white hover:text-accent transition-colors"
              >
                <Sparkles size={15} />
              </button>
              <button
                data-testid={`edit-photo-${p.id}`}
                onClick={() => setEditing({ ...p })}
                className="bg-black/75 p-2 text-white hover:text-accent transition-colors"
              >
                <Pencil size={15} />
              </button>
              <button
                data-testid={`delete-photo-${p.id}`}
                onClick={() => remove(p.id)}
                className="bg-black/75 p-2 text-white hover:text-red-400 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent data-testid="edit-photo-dialog" className="bg-[#0A0A0A] border-white/15 rounded-none max-w-xl text-white max-h-[92vh] flex flex-col p-0 overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-6 pb-4 border-b border-white/10 shrink-0">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Edit frame</DialogTitle>
            </DialogHeader>

            {editing && (
              <div className="mt-3 flex items-center gap-4 p-3 bg-white/[0.03] border border-white/10">
                <div className="relative w-16 h-16 rounded overflow-hidden bg-black shrink-0 border border-white/10">
                  <img src={editing.image_url} alt={editing.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{editing.title || "Untitled Frame"}</p>
                  <p className="text-xs text-neutral-400 truncate">{editing.category || "Uncategorized"} {editing.collection ? `· ${editing.collection}` : ""}</p>
                  <input
                    ref={editFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleReplacePhoto}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => editFileRef.current?.click()}
                      disabled={replacingPhoto}
                      className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-gold-hover border border-accent/40 hover:border-accent px-2.5 py-1 transition-colors"
                    >
                      <Upload size={12} />
                      <span>{replacingPhoto ? "Uploading image..." : "Replace / Change Image"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const smart = generateSmartSettings(editing.title, editing.category);
                        setEditing({
                          ...editing,
                          camera: smart.camera,
                          lens: smart.lens,
                          settings: smart.settings,
                        });
                        toast.success("✨ AI Settings generated for this frame!");
                      }}
                      className="inline-flex items-center gap-1 text-xs text-amber-300 hover:text-amber-200 border border-amber-400/40 px-2.5 py-1 transition-colors bg-amber-500/10"
                    >
                      <Sparkles size={12} />
                      <span>AI Settings</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Scrollable Body */}
          {editing && (
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono-accent block">
                  Title (English)
                </label>
                <Input data-testid="edit-title" value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Title (English)" className="bg-transparent border-white/20 rounded-none text-white" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono-accent block">
                  Title (ગુજરાતી)
                </label>
                <Input data-testid="edit-title-gu" value={editing.title_gu || ""} onChange={(e) => setEditing({ ...editing, title_gu: e.target.value })} placeholder="Title (ગુજરાતી)" className="bg-transparent border-white/20 rounded-none text-white" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono-accent block mb-1">
                    Category
                  </label>
                  <Select modal={false} value={editing.category} onValueChange={(v) => setEditing({ ...editing, category: v })}>
                    <SelectTrigger data-testid="edit-category" className="bg-transparent border-white/20 rounded-none text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-white/20 text-white z-[99999]">
                      {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono-accent block mb-1">
                    Location
                  </label>
                  <Input data-testid="edit-location" value={editing.location || ""} onChange={(e) => setEditing({ ...editing, location: e.target.value })} placeholder="Location" className="bg-transparent border-white/20 rounded-none text-white" />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono-accent block mb-1">
                  Series / Collection
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  <Select
                    modal={false}
                    value={editing.collection || "__NONE__"}
                    onValueChange={(v) => setEditing({ ...editing, collection: v === "__NONE__" ? "" : v })}
                  >
                    <SelectTrigger className="bg-transparent border-white/20 rounded-none text-white">
                      <SelectValue placeholder="Choose Series" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-white/20 text-white max-h-56 z-[99999]">
                      <SelectItem value="__NONE__">— No Series —</SelectItem>
                      {allSeriesList.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input
                    data-testid="edit-collection"
                    list="known-collections"
                    value={editing.collection || ""}
                    onChange={(e) => setEditing({ ...editing, collection: e.target.value })}
                    placeholder="Or type custom series"
                    className="bg-transparent border-white/20 rounded-none text-white"
                  />
                </div>
                <datalist id="known-collections">
                  {allSeriesList.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono-accent block mb-1">
                  One-line field story (shown in lightbox)
                </label>
                <Textarea data-testid="edit-story" value={editing.story || ""} onChange={(e) => setEditing({ ...editing, story: e.target.value })} rows={2} placeholder="One-line field story" className="bg-transparent border-white/20 rounded-none resize-none text-white" />
              </div>

              <div className="space-y-4 pt-3 border-t border-white/10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono-accent block mb-1">Camera Body</label>
                    <Input data-testid="edit-camera" value={editing.camera || ""} onChange={(e) => setEditing({ ...editing, camera: e.target.value })} placeholder="e.g. Canon EOS 7D Mark II" className="bg-transparent border-white/20 rounded-none h-10 text-xs text-white" />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono-accent block mb-1">Lens</label>
                    <Input data-testid="edit-lens" value={editing.lens || ""} onChange={(e) => setEditing({ ...editing, lens: e.target.value })} placeholder="e.g. Sigma 150-600mm f/5-6.3 Sports" className="bg-transparent border-white/20 rounded-none h-10 text-xs text-white" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono-accent block mb-1">Settings / Exposure</label>
                  <Input data-testid="edit-settings" value={editing.settings || ""} onChange={(e) => setEditing({ ...editing, settings: e.target.value })} placeholder="e.g. 1/1600s · f/6.3 · ISO 800 · 600mm" className="bg-transparent border-white/20 rounded-none h-10 text-xs text-white" />
                </div>

                {/* Settings Presets Chips */}
                <div>
                  <span className="text-[10px] text-neutral-400 font-mono-accent uppercase tracking-wider block mb-1.5">Settings Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {MIHIR_SETTINGS_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setEditing({ ...editing, settings: p.value })}
                        className={`text-[10px] px-2 py-0.5 border transition-all ${
                          editing.settings === p.value ? "bg-accent text-black border-accent font-medium shadow-sm" : "bg-white/5 border-white/15 text-neutral-400 hover:text-white"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Edit Camera Quick Chips */}
                <div>
                  <span className="text-[10px] text-neutral-400 font-mono-accent uppercase tracking-wider block mb-1.5">Quick Select Camera:</span>
                  <div className="flex flex-wrap gap-2">
                    {MIHIR_CAMERAS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setEditing({ ...editing, camera: c })}
                        className={`text-xs px-3 py-1 border transition-all ${
                          editing.camera === c ? "bg-accent text-black border-accent font-semibold shadow-sm" : "bg-white/5 border-white/15 text-neutral-300 hover:text-white hover:border-white/30"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Edit Lens Quick Chips */}
                <div>
                  <span className="text-[10px] text-neutral-400 font-mono-accent uppercase tracking-wider block mb-1.5">Quick Select Lens (Auto-Generates Settings):</span>
                  <div className="flex flex-wrap gap-2">
                    {MIHIR_LENSES.map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => {
                          const autoSettings = getSettingsForLens(l, editing.title, editing.category);
                          setEditing({
                            ...editing,
                            lens: l,
                            camera: editing.camera || "Canon EOS 7D Mark II",
                            settings: autoSettings,
                          });
                          toast.success(`Lens: ${l} · Settings AI generated: ${autoSettings}`);
                        }}
                        className={`text-xs px-2.5 py-1 border transition-all ${
                          editing.lens === l ? "bg-accent text-black border-accent font-semibold shadow-sm" : "bg-white/5 border-white/15 text-neutral-300 hover:text-white hover:border-white/30"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sticky Footer with prominent Save & Cancel buttons */}
          {editing && (
            <div className="p-4 bg-[#0A0A0A] border-t border-white/15 flex items-center justify-end gap-3 shrink-0 z-20">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(null)}
                className="rounded-none border-white/20 text-neutral-300 hover:text-white hover:bg-white/10 text-xs uppercase tracking-wider"
              >
                Cancel
              </Button>
              <Button
                data-testid="edit-save-btn"
                onClick={saveEdit}
                disabled={savingEdit || replacingPhoto}
                className="rounded-none bg-accent text-black hover:bg-gold-hover uppercase tracking-[0.15em] font-semibold text-xs px-6"
              >
                {savingEdit ? "Saving changes..." : "Save changes"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal for Category / Series in Photos tab */}
      <Dialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <DialogContent className="bg-[#0A0A0A] border-white/15 rounded-none max-w-md text-white">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-red-400">
              {deleteConfirm?.type === "category" ? "Remove Category Option" : "Remove Series Option"}
            </DialogTitle>
          </DialogHeader>
          {deleteConfirm && (
            <div className="space-y-4 mt-2">
              <p className="text-neutral-300 text-sm">
                Are you sure you want to remove{" "}
                {deleteConfirm.type === "category" ? "the category option " : "the series option "}
                <span className="font-semibold text-white">"{deleteConfirm.name}"</span>?
              </p>

              {deleteConfirm.type === "category" && deleteConfirm.count > 0 && (
                <label className="flex items-start gap-3 p-3 bg-neutral-900 border border-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deleteConfirm.reassign}
                    onChange={(e) =>
                      setDeleteConfirm({ ...deleteConfirm, reassign: e.target.checked })
                    }
                    className="mt-1 accent-accent"
                  />
                  <span className="text-xs text-neutral-300">
                    Reassign <strong>{deleteConfirm.count} photo(s)</strong> currently in "{deleteConfirm.name}" to{" "}
                    <strong>"{categories.find((c) => c !== deleteConfirm.name) || "Wildlife"}"</strong>.
                  </span>
                </label>
              )}

              {deleteConfirm.type === "series" && deleteConfirm.count > 0 && (
                <label className="flex items-start gap-3 p-3 bg-neutral-900 border border-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deleteConfirm.unassignPhotos}
                    onChange={(e) =>
                      setDeleteConfirm({ ...deleteConfirm, unassignPhotos: e.target.checked })
                    }
                    className="mt-1 accent-accent"
                  />
                  <span className="text-xs text-neutral-300">
                    Also unassign this series from all <strong>{deleteConfirm.count} photo(s)</strong>.
                  </span>
                </label>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setDeleteConfirm(null)}
                  className="rounded-none border border-white/20 text-neutral-300 hover:text-white"
                >
                  Cancel
                </Button>
                {deleteConfirm.type === "category" ? (
                  <Button
                    type="button"
                    onClick={confirmDeleteCategory}
                    className="rounded-none bg-red-600 hover:bg-red-700 text-white gap-2 uppercase tracking-wider text-xs"
                  >
                    <Trash2 size={14} /> Remove Category
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={confirmDeleteSeries}
                    className="rounded-none bg-red-600 hover:bg-red-700 text-white gap-2 uppercase tracking-wider text-xs"
                  >
                    <Trash2 size={14} /> Remove Series
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SiteTab({ site: propSite, setSite: propSetSite, onUploadToSeries }) {
  const [internalSite, setInternalSite] = useState(null);
  const site = propSite || internalSite;
  const setSite = propSetSite || setInternalSite;
  const [saving, setSaving] = useState({});
  const [allPhotos, setAllPhotos] = useState([]);
  const [newColl, setNewColl] = useState("");
  const [newCat, setNewCat] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedGalleryPhoto, setSelectedGalleryPhoto] = useState("");
  const logoRef = useRef();
  const heroRef = useRef();
  const heroMultiRef = useRef();
  const aboutRef = useRef();

  const heroImages = (site?.hero_images && site.hero_images.length > 0)
    ? site.hero_images
    : [
        site?.hero_image_url || "https://res.cloudinary.com/uq0zgy3i/image/upload/v1793089356/portfolio/brand/zbzkn3hwd1j05ihagzqv.jpg",
        "https://res.cloudinary.com/uq0zgy3i/image/upload/q_auto,f_auto,w_2200/lion_pride_9_de9akv.jpg",
        "https://res.cloudinary.com/uq0zgy3i/image/upload/q_auto,f_auto,w_2200/070A1006_ncv8gi.jpg",
        "https://res.cloudinary.com/uq0zgy3i/image/upload/q_auto,f_auto,w_2200/lion_pride_3_jwn89m.jpg",
        "https://res.cloudinary.com/uq0zgy3i/image/upload/q_auto,f_auto,w_1600/lion_pride_13_q5bwgp.jpg"
      ];

  const addHeroPhotoFromUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving((s) => ({ ...s, hero_upload: true }));
    try {
      const res = await uploadToCloudinary(file, "portfolio/hero");
      const currentList = site.hero_images && site.hero_images.length > 0 ? site.hero_images : heroImages;
      const updatedList = [...currentList, res.secure_url];
      const updated = await updateSite({ hero_images: updatedList, hero_image_url: updatedList[0] });
      setSite(updated);
      toast.success("Added photo to Hero 10s Rotator.");
    } catch {
      toast.error("Upload failed.");
    } finally {
      setSaving((s) => ({ ...s, hero_upload: false }));
    }
  };

  const addHeroPhotoFromGallery = async (url) => {
    if (!url) return;
    const currentList = site.hero_images && site.hero_images.length > 0 ? site.hero_images : heroImages;
    if (currentList.includes(url)) {
      toast.error("Photo is already in Hero Rotator.");
      return;
    }
    const updatedList = [...currentList, url];
    setSaving((s) => ({ ...s, hero_gallery: true }));
    try {
      const updated = await updateSite({ hero_images: updatedList });
      setSite(updated);
      setSelectedGalleryPhoto("");
      toast.success("Added photo to Hero Rotator.");
    } catch {
      toast.error("Failed to add photo.");
    } finally {
      setSaving((s) => ({ ...s, hero_gallery: false }));
    }
  };

  const removeHeroPhoto = async (index) => {
    const currentList = site.hero_images && site.hero_images.length > 0 ? site.hero_images : heroImages;
    if (currentList.length <= 1) {
      toast.error("Keep at least one Hero photo.");
      return;
    }
    const updatedList = currentList.filter((_, i) => i !== index);
    setSaving((s) => ({ ...s, hero_remove: true }));
    try {
      const updated = await updateSite({
        hero_images: updatedList,
        hero_image_url: updatedList[0] || site.hero_image_url,
      });
      setSite(updated);
      toast.success("Removed from Hero Rotator.");
    } catch {
      toast.error("Failed to remove photo.");
    } finally {
      setSaving((s) => ({ ...s, hero_remove: false }));
    }
  };

  useEffect(() => {
    if (!propSite) getSite().then(setInternalSite);
    getPhotos().then(setAllPhotos);
  }, [propSite]);

  const uploadFor = async (e, field, folder) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving((s) => ({ ...s, [field]: true }));
    try {
      const res = await uploadToCloudinary(file, folder);
      const patch = { [`${field}_url`]: res.secure_url, [`${field}_public_id`]: res.public_id };
      const updated = await updateSite(patch);
      setSite(updated);
      toast.success("Updated.");
    } catch {
      toast.error("Upload failed.");
    } finally {
      setSaving((s) => ({ ...s, [field]: false }));
    }
  };

  const saveText = async () => {
    setSaving((s) => ({ ...s, text: true }));
    try {
      const updated = await updateSite({
        contact_email: site.contact_email,
        instagram: site.instagram,
        blog_url: site.blog_url,
        show_blog: site.show_blog !== false,
      });
      setSite(updated);
      toast.success("Saved.");
    } catch {
      toast.error("Save failed.");
    } finally {
      setSaving((s) => ({ ...s, text: false }));
    }
  };

  const setOption = (i, key, val) => {
    const opts = [...(site.print_options || [])];
    opts[i] = { ...opts[i], [key]: val };
    setSite({ ...site, print_options: opts });
  };
  const addOption = () => setSite({ ...site, print_options: [...(site.print_options || []), { size: "", price: "" }] });
  const removeOption = (i) => setSite({ ...site, print_options: (site.print_options || []).filter((_, idx) => idx !== i) });
  const savePrints = async () => {
    setSaving((s) => ({ ...s, prints: true }));
    try {
      const updated = await updateSite({
        currency: site.currency,
        print_options: (site.print_options || []).filter((o) => o.size && o.price),
      });
      setSite(updated);
      toast.success("Print pricing saved.");
    } catch {
      toast.error("Save failed.");
    } finally {
      setSaving((s) => ({ ...s, prints: false }));
    }
  };

  const siteCategories = (site?.categories && site.categories.length > 0)
    ? site.categories
    : CATEGORIES.filter((c) => c !== "All");

  const addCategory = async () => {
    const name = newCat.trim();
    if (!name) return;
    if (siteCategories.some((c) => c.toLowerCase() === name.toLowerCase())) {
      toast.error(`Category "${name}" already exists.`);
      return;
    }
    const updatedCats = [...siteCategories, name];
    setSaving((s) => ({ ...s, cats: true }));
    try {
      const updated = await updateSite({ categories: updatedCats });
      setSite(updated);
      setNewCat("");
      toast.success(`Category "${name}" added.`);
    } catch {
      toast.error("Failed to add category.");
    } finally {
      setSaving((s) => ({ ...s, cats: false }));
    }
  };

  const promptRemoveCategory = (catName) => {
    const count = allPhotos.filter((p) => p.category === catName).length;
    setDeleteConfirm({ type: "category", name: catName, count, reassign: true });
  };

  const confirmDeleteCategory = async () => {
    if (!deleteConfirm || deleteConfirm.type !== "category") return;
    const { name, count, reassign } = deleteConfirm;
    if (siteCategories.length <= 1) {
      toast.error("At least one category is required.");
      setDeleteConfirm(null);
      return;
    }
    const updatedCats = siteCategories.filter((c) => c !== name);
    setSaving((s) => ({ ...s, cats: true }));
    try {
      const updated = await updateSite({ categories: updatedCats });
      setSite(updated);

      if (reassign && count > 0) {
        const fallback = updatedCats[0] || "Wildlife";
        const toReassign = allPhotos.filter((p) => p.category === name);
        await Promise.all(toReassign.map((p) => updatePhoto(p.id, { category: fallback })));
        const refreshedPhotos = await getPhotos();
        setAllPhotos(refreshedPhotos);
      }

      toast.success(`Category "${name}" removed.`);
      setDeleteConfirm(null);
    } catch {
      toast.error("Failed to remove category.");
    } finally {
      setSaving((s) => ({ ...s, cats: false }));
    }
  };

  const setColl = (name, key, val) => {
    const collections = { ...(site.collections || {}) };
    collections[name] = { ...collections[name], [key]: val };
    setSite({ ...site, collections });
  };

  const addColl = async () => {
    const name = newColl.trim();
    if (!name) return;
    const collections = { ...(site.collections || {}) };
    if (collections[name]) {
      toast.error(`Series "${name}" already exists.`);
      return;
    }
    collections[name] = { caption: "", cover_public_id: "" };
    setSite({ ...site, collections });
    setNewColl("");
    setSaving((s) => ({ ...s, coll: true }));
    try {
      const updated = await updateSite({ collections });
      setSite(updated);
      toast.success(`Series "${name}" created.`);
    } catch {
      toast.error("Failed to save new series.");
    } finally {
      setSaving((s) => ({ ...s, coll: false }));
    }
  };

  const promptRemoveSeries = (name) => {
    const count = allPhotos.filter((p) => p.collection === name).length;
    setDeleteConfirm({ type: "series", name, count, unassignPhotos: count > 0 });
  };

  const confirmDeleteSeries = async () => {
    if (!deleteConfirm || deleteConfirm.type !== "series") return;
    const { name, count, unassignPhotos } = deleteConfirm;
    setSaving((s) => ({ ...s, coll: true }));
    try {
      const collections = { ...(site.collections || {}) };
      delete collections[name];
      const updated = await updateSite({ collections });
      setSite(updated);

      if (unassignPhotos && count > 0) {
        const toUnassign = allPhotos.filter((p) => p.collection === name);
        await Promise.all(toUnassign.map((p) => updatePhoto(p.id, { collection: "" })));
        const refreshedPhotos = await getPhotos();
        setAllPhotos(refreshedPhotos);
      }

      toast.success(`Series "${name}" removed.`);
      setDeleteConfirm(null);
    } catch {
      toast.error("Failed to remove series.");
    } finally {
      setSaving((s) => ({ ...s, coll: false }));
    }
  };

  const addPhotoToSeries = async (seriesName, photoId) => {
    if (!photoId) return;
    try {
      await updatePhoto(photoId, { collection: seriesName });
      const refreshedPhotos = await getPhotos();
      setAllPhotos(refreshedPhotos);
      toast.success("Photo added to series.");
    } catch {
      toast.error("Failed to add photo to series.");
    }
  };

  const removePhotoFromSeries = async (photoId) => {
    try {
      await updatePhoto(photoId, { collection: "" });
      const refreshedPhotos = await getPhotos();
      setAllPhotos(refreshedPhotos);
      toast.success("Photo removed from series.");
    } catch {
      toast.error("Failed to remove photo from series.");
    }
  };

  const saveCollections = async () => {
    setSaving((s) => ({ ...s, coll: true }));
    try {
      const updated = await updateSite({ collections: site.collections || {} });
      setSite(updated);
      toast.success("Series stories saved.");
    } catch {
      toast.error("Save failed.");
    } finally {
      setSaving((s) => ({ ...s, coll: false }));
    }
  };

  if (!site) return <Loader2 className="animate-spin text-accent" />;

  const ImgUpload = ({ label, field, folder, inputRef, aspect }) => (
    <Card className="bg-[#0A0A0A] border-white/10 p-6 rounded-none">
      <p className="font-mono-accent text-xs uppercase tracking-[0.2em] text-accent mb-4">{label}</p>
      <div className={`${aspect} bg-neutral-900 mb-4 overflow-hidden flex items-center justify-center border border-white/10`}>
        {site[`${field}_url`] ? (
          <img src={site[`${field}_url`]} alt={label} className="w-full h-full object-contain" />
        ) : (
          <span className="text-neutral-600 text-sm">No image</span>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => uploadFor(e, field, folder)} data-testid={`${field}-file-input`} />
      <Button
        data-testid={`${field}-upload-btn`}
        disabled={saving[field]}
        onClick={() => inputRef.current?.click()}
        className="rounded-none bg-transparent border border-white/30 text-white hover:bg-white hover:text-black w-full gap-2 uppercase tracking-[0.15em] text-xs"
      >
        {saving[field] ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
        Replace
      </Button>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-6">
        <ImgUpload label="Logo" field="logo" folder="portfolio/brand" inputRef={logoRef} aspect="h-32" />
        <ImgUpload label="Hero Image (Default Cover)" field="hero_image" folder="portfolio/brand" inputRef={heroRef} aspect="aspect-video" />
        <ImgUpload label="About Portrait" field="about_image" folder="portfolio/brand" inputRef={aboutRef} aspect="aspect-[4/5]" />
      </div>

      {/* Hero Slideshow Rotator Space */}
      <Card className="bg-[#0A0A0A] border-white/10 p-6 rounded-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono-accent text-xs uppercase tracking-[0.2em] text-accent">
                Hero Showcase
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-accent/10 border border-accent/30 text-accent">
                Cycles Every 10 Seconds
              </span>
            </div>
            <h3 className="font-serif text-2xl text-white">Hero Photo Space & Rotator</h3>
            <p className="text-xs text-neutral-400 mt-1">
              These photos automatically transition every 10 seconds in the Hero section with smooth cross-fade & scroll parallax.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <input
              ref={heroMultiRef}
              type="file"
              accept="image/*"
              hidden
              onChange={addHeroPhotoFromUpload}
            />
            <Button
              type="button"
              disabled={saving.hero_upload}
              onClick={() => heroMultiRef.current?.click()}
              className="rounded-none bg-accent text-black hover:bg-gold-hover uppercase tracking-[0.15em] text-xs h-9 gap-1.5"
            >
              {saving.hero_upload ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
              Upload New Hero Photo
            </Button>
          </div>
        </div>

        {/* Existing Hero Photos Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
          {heroImages.map((imgUrl, idx) => (
            <div
              key={idx}
              className="group relative aspect-video bg-neutral-900 border border-white/15 overflow-hidden"
            >
              <img
                src={typeof imgUrl === "string" ? imgUrl : imgUrl?.url}
                alt={`Hero Slide ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-1.5 left-1.5 z-10 bg-black/80 px-2 py-0.5 text-[10px] font-mono text-accent">
                Slide {idx + 1}
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => removeHeroPhoto(idx)}
                  title="Remove from rotator"
                  disabled={saving.hero_remove}
                  className="p-1.5 bg-red-500/80 hover:bg-red-600 text-white transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add from Gallery Photos Selector */}
        {allPhotos.length > 0 && (
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <span className="text-xs text-neutral-400 whitespace-nowrap font-mono uppercase tracking-wider">
              Add from Portfolio Gallery:
            </span>
            <div className="flex-1">
              <Select value={selectedGalleryPhoto} onValueChange={(val) => {
                setSelectedGalleryPhoto(val);
                addHeroPhotoFromGallery(val);
              }}>
                <SelectTrigger className="bg-transparent border-white/20 rounded-none text-white h-9 text-xs">
                  <SelectValue placeholder="Choose a photo from your gallery to add to Hero..." />
                </SelectTrigger>
                <SelectContent className="bg-[#121212] border-white/15 text-white">
                  {allPhotos.map((p) => (
                    <SelectItem key={p.id} value={p.image_url} className="text-xs">
                      {p.title} ({p.category || "General"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </Card>

      <Card className="bg-[#0A0A0A] border-white/10 p-6 rounded-none">
        <h3 className="font-serif text-2xl text-white mb-5">Contact details</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
          <div>
            <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-2">Email</label>
            <Input
              data-testid="site-email"
              value={site.contact_email || ""}
              onChange={(e) => setSite({ ...site, contact_email: e.target.value })}
              className="bg-transparent border-white/20 rounded-none text-white"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-2">Instagram URL</label>
            <Input
              data-testid="site-instagram"
              value={site.instagram || ""}
              onChange={(e) => setSite({ ...site, instagram: e.target.value })}
              placeholder="https://www.instagram.com/mihirwildlife"
              className="bg-transparent border-white/20 rounded-none text-white"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-2">Facebook URL</label>
            <Input
              data-testid="site-facebook"
              value={site.facebook || ""}
              onChange={(e) => setSite({ ...site, facebook: e.target.value })}
              placeholder="https://facebook.com/mihirwildlife"
              className="bg-transparent border-white/20 rounded-none text-white"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-2">Threads URL</label>
            <Input
              data-testid="site-threads"
              value={site.threads || ""}
              onChange={(e) => setSite({ ...site, threads: e.target.value })}
              placeholder="https://www.threads.com/@mihirwildlife"
              className="bg-transparent border-white/20 rounded-none text-white"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-2">LinkedIn URL</label>
            <Input
              data-testid="site-linkedin"
              value={site.linkedin || ""}
              onChange={(e) => setSite({ ...site, linkedin: e.target.value })}
              placeholder="https://www.linkedin.com/in/mihirkumarranva/"
              className="bg-transparent border-white/20 rounded-none text-white"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-2">X / Twitter URL</label>
            <Input
              data-testid="site-x"
              value={site.x || site.twitter || ""}
              onChange={(e) => setSite({ ...site, x: e.target.value, twitter: e.target.value })}
              placeholder="https://x.com/mihirwildlife"
              className="bg-transparent border-white/20 rounded-none text-white"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-2">Blog URL (Nav "Blog ↗")</label>
            <Input
              data-testid="site-blog-url"
              value={site.blog_url || ""}
              onChange={(e) => setSite({ ...site, blog_url: e.target.value })}
              placeholder="/blog or https://..."
              className="bg-transparent border-white/20 rounded-none text-white"
            />
          </div>
        </div>

        {/* Add or Remove Blog in Website Navigation */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white/[0.02] p-4 border border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono-accent text-[11px] uppercase tracking-wider text-accent font-semibold">
                Website Navigation Link
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 uppercase tracking-wider font-mono ${
                  site.show_blog !== false
                    ? "bg-emerald-950/60 border border-emerald-500/40 text-emerald-400"
                    : "bg-red-950/60 border border-red-500/40 text-red-400"
                }`}
              >
                {site.show_blog !== false ? "Added to Nav" : "Removed from Nav"}
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              {site.show_blog !== false
                ? "The Blog link is currently shown in your main website navigation bar."
                : "The Blog link is currently hidden/removed from your website navigation bar."}
            </p>
          </div>
          <div>
            {site.show_blog !== false ? (
              <Button
                type="button"
                data-testid="remove-blog-nav-btn"
                onClick={() => setSite({ ...site, show_blog: false })}
                className="rounded-none bg-red-950/40 border border-red-500/40 text-red-400 hover:bg-red-600 hover:text-white uppercase tracking-wider text-xs gap-1.5 h-9"
              >
                <Trash2 size={13} /> Remove Blog from Nav
              </Button>
            ) : (
              <Button
                type="button"
                data-testid="add-blog-nav-btn"
                onClick={() => setSite({ ...site, show_blog: true })}
                className="rounded-none bg-accent/20 border border-accent/40 text-accent hover:bg-accent hover:text-black uppercase tracking-wider text-xs gap-1.5 h-9"
              >
                <Plus size={13} /> Add Blog to Nav
              </Button>
            )}
          </div>
        </div>

        <Button data-testid="site-save-btn" onClick={saveText} disabled={saving.text} className="rounded-none bg-accent text-black hover:bg-gold-hover uppercase tracking-[0.15em]">
          {saving.text ? "Saving..." : "Save Branding & Navigation"}
        </Button>
      </Card>

      <Card className="bg-[#0A0A0A] border-white/10 p-6 rounded-none" data-testid="print-pricing-card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-serif text-2xl text-white">Print pricing</h3>
          <div className="flex items-center gap-2">
            <label className="text-xs text-neutral-500 uppercase tracking-wider">Currency</label>
            <Input
              data-testid="site-currency"
              value={site.currency || ""}
              onChange={(e) => setSite({ ...site, currency: e.target.value })}
              className="bg-transparent border-white/20 rounded-none text-white w-24 h-9"
            />
          </div>
        </div>
        <div className="space-y-3 mb-5">
          {(site.print_options || []).map((o, i) => (
            <div key={i} className="flex gap-3 items-center" data-testid={`price-row-${i}`}>
              <Input
                data-testid={`price-size-${i}`}
                value={o.size}
                onChange={(e) => setOption(i, "size", e.target.value)}
                placeholder="Size (e.g. A3 · 297×420mm)"
                className="bg-transparent border-white/20 rounded-none text-white flex-1"
              />
              <Input
                data-testid={`price-amount-${i}`}
                value={o.price}
                onChange={(e) => setOption(i, "price", e.target.value)}
                placeholder="Price"
                className="bg-transparent border-white/20 rounded-none text-white w-32"
              />
              <button
                data-testid={`price-remove-${i}`}
                onClick={() => removeOption(i)}
                className="text-neutral-500 hover:text-red-400 p-2"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <Button data-testid="price-add" onClick={addOption} variant="ghost" className="rounded-none border border-white/20 text-white uppercase tracking-[0.15em] text-xs">
            + Add size
          </Button>
          <Button data-testid="price-save" onClick={savePrints} disabled={saving.prints} className="rounded-none bg-accent text-black hover:bg-gold-hover uppercase tracking-[0.15em] text-xs">
            {saving.prints ? "Saving..." : "Save pricing"}
          </Button>
        </div>
      </Card>

      {/* Gallery Categories card */}
      <Card className="bg-[#0A0A0A] border-white/10 p-6 rounded-none" data-testid="categories-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div>
            <h3 className="font-serif text-2xl text-white mb-1">Gallery categories</h3>
            <p className="text-[11px] text-neutral-500">
              Manage categories (e.g. Birds, Wildlife, Behavior, Ecosystems) shown on portfolio filters and upload forms.
            </p>
          </div>
        </div>

        {/* Add Category bar */}
        <div className="flex gap-3 mb-6 mt-4 p-4 bg-neutral-950 border border-white/10 items-center flex-wrap">
          <Input
            data-testid="site-new-category-name"
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCategory();
              }
            }}
            placeholder="New category name (e.g. Reptiles, Portraits, Macro)"
            className="bg-transparent border-white/20 rounded-none text-white max-w-xs"
          />
          <Button
            data-testid="site-add-category-btn"
            onClick={addCategory}
            disabled={saving.cats}
            className="rounded-none bg-accent text-black hover:bg-gold-hover uppercase tracking-[0.15em] text-xs gap-1.5"
          >
            <Plus size={14} /> Add Category
          </Button>
        </div>

        {/* Categories list */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {siteCategories.map((c) => {
            const count = allPhotos.filter((p) => p.category === c).length;
            return (
              <div key={c} className="flex items-center justify-between p-3.5 bg-neutral-950 border border-white/10">
                <div className="flex items-center gap-2">
                  <span className="font-mono-accent text-xs uppercase tracking-wider text-white font-medium">{c}</span>
                  <span className="text-[10px] font-mono-accent text-neutral-400 bg-white/5 px-2 py-0.5 border border-white/10">
                    {count} {count === 1 ? "frame" : "frames"}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => promptRemoveCategory(c)}
                  className="h-7 w-7 p-0 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-none transition-colors"
                  title={`Remove category "${c}"`}
                >
                  <Trash2 size={13} />
                </Button>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="bg-[#0A0A0A] border-white/10 p-6 rounded-none" data-testid="series-stories-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div>
            <h3 className="font-serif text-2xl text-white mb-1">Series stories</h3>
            <p className="text-[11px] text-neutral-500">
              Add or remove series stories, configure cover frames and captions, and assign or remove photos from each series.
            </p>
          </div>
          <Button
            data-testid="series-save-top-btn"
            onClick={saveCollections}
            disabled={saving.coll}
            className="rounded-none bg-accent text-black hover:bg-gold-hover uppercase tracking-[0.15em] text-xs self-start md:self-auto"
          >
            {saving.coll ? "Saving..." : "Save series"}
          </Button>
        </div>

        {/* Add Series bar */}
        <div className="flex gap-3 mb-6 mt-4 p-4 bg-neutral-950 border border-white/10 items-center flex-wrap">
          <Input
            data-testid="new-series-name"
            value={newColl}
            onChange={(e) => setNewColl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addColl();
              }
            }}
            placeholder="New series name (e.g. Reptiles, Monsoon)"
            className="bg-transparent border-white/20 rounded-none text-white max-w-xs"
          />
          <Button
            data-testid="add-series-btn"
            onClick={addColl}
            disabled={saving.coll}
            className="rounded-none bg-accent text-black hover:bg-gold-hover uppercase tracking-[0.15em] text-xs gap-1.5"
          >
            <Plus size={14} /> Add Series
          </Button>
        </div>

        {/* Unconfigured series banner (if photos have collection tags not in site.collections) */}
        {(() => {
          const unconfigured = Array.from(
            new Set(allPhotos.map((p) => p.collection).filter((c) => c && c.trim() && !site.collections?.[c]))
          );
          if (unconfigured.length === 0) return null;
          return (
            <div className="p-4 bg-white/[0.02] border border-accent/20 mb-6">
              <p className="text-xs text-accent uppercase tracking-wider mb-2 font-mono-accent">
                Series found on photos without a story config:
              </p>
              <div className="flex flex-wrap gap-2">
                {unconfigured.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      const collections = { ...(site.collections || {}) };
                      collections[c] = { caption: "", cover_public_id: "" };
                      setSite({ ...site, collections });
                      toast.info(`Added "${c}" to series stories. Click "Save series" to persist.`);
                    }}
                    className="text-xs bg-accent/10 border border-accent/30 text-white hover:bg-accent hover:text-black px-2.5 py-1 flex items-center gap-1.5 transition-colors"
                  >
                    <Plus size={12} /> Add story for "{c}"
                  </button>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Series cards list */}
        <div className="space-y-6">
          {Object.keys(site.collections || {}).length === 0 ? (
            <p className="text-neutral-500 text-sm italic py-4">No series configured yet. Add one above.</p>
          ) : (
            Object.keys(site.collections || {}).map((name) => {
              const inColl = allPhotos.filter((p) => p.collection === name);
              const notInColl = allPhotos.filter((p) => p.collection !== name);
              const meta = site.collections[name] || {};
              return (
                <div key={name} className="border border-white/10 bg-black/40 p-5 rounded-none" data-testid={`series-edit-${name}`}>
                  <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-3">
                      <p className="font-mono-accent text-sm uppercase tracking-[0.2em] text-accent font-semibold">{name}</p>
                      <span className="text-[11px] font-mono-accent text-neutral-400 bg-white/5 px-2 py-0.5 border border-white/10">
                        {inColl.length} {inColl.length === 1 ? "frame" : "frames"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onUploadToSeries?.(name)}
                        className="rounded-none text-accent hover:text-black hover:bg-accent border border-accent/30 text-xs gap-1.5 h-8 px-2.5 transition-colors"
                        title={`Upload a new frame to ${name}`}
                      >
                        <Upload size={13} /> Upload Frame
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        data-testid={`series-remove-${name}`}
                        onClick={() => promptRemoveSeries(name)}
                        className="rounded-none text-neutral-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-xs gap-1.5 h-8 px-2.5 transition-colors"
                      >
                        <Trash2 size={13} /> Remove Series
                      </Button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-2">Caption / Story</label>
                      <Textarea
                        data-testid={`series-caption-${name}`}
                        value={meta.caption || ""}
                        onChange={(e) => setColl(name, "caption", e.target.value)}
                        rows={3}
                        placeholder="A visual story from the field..."
                        className="bg-transparent border-white/20 rounded-none text-white resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-2">Cover frame</label>
                      <Select value={meta.cover_public_id || ""} onValueChange={(v) => setColl(name, "cover_public_id", v)}>
                        <SelectTrigger data-testid={`series-cover-${name}`} className="bg-transparent border-white/20 rounded-none text-white">
                          <SelectValue placeholder="Choose cover" />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-white/20 text-white">
                          {inColl.map((p) => (
                            <SelectItem key={p.id} value={p.public_id || p.id}>{p.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {inColl.length === 0 && (
                        <p className="text-[11px] text-neutral-500 mt-2 italic">Assign photos below to choose a cover.</p>
                      )}
                    </div>
                  </div>

                  {/* Photos assigned to this series */}
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <label className="text-[11px] text-neutral-400 uppercase tracking-wider font-mono-accent">
                        Assigned Frames ({inColl.length})
                      </label>
                      {notInColl.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Select onValueChange={(photoId) => addPhotoToSeries(name, photoId)} value="">
                            <SelectTrigger className="h-8 text-xs bg-neutral-900 border-white/20 rounded-none text-neutral-300 w-48">
                              <SelectValue placeholder="+ Assign photo..." />
                            </SelectTrigger>
                            <SelectContent className="bg-neutral-900 border-white/20 text-white max-h-56">
                              {notInColl.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    {inColl.length === 0 ? (
                      <p className="text-xs text-neutral-600 italic">No photos assigned to this series yet. Use "+ Assign photo..." above.</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {inColl.map((p) => (
                          <div
                            key={p.id}
                            className="relative group bg-neutral-900 border border-white/10 overflow-hidden"
                          >
                            <img
                              src={p.image_url}
                              alt={p.title}
                              className="w-full h-16 object-cover"
                            />
                            <div className="p-1">
                              <p className="text-[10px] text-neutral-300 truncate">{p.title}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removePhotoFromSeries(p.id)}
                              title={`Remove "${p.title}" from ${name}`}
                              className="absolute top-1 right-1 bg-black/80 text-white/80 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <Button data-testid="series-save-btn" onClick={saveCollections} disabled={saving.coll} className="mt-6 rounded-none bg-accent text-black hover:bg-gold-hover uppercase tracking-[0.15em] text-xs">
          {saving.coll ? "Saving..." : "Save series"}
        </Button>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <DialogContent className="bg-[#0A0A0A] border-white/15 rounded-none max-w-md text-white">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-red-400">
              {deleteConfirm?.type === "category" ? "Remove Category" : "Remove Series Story"}
            </DialogTitle>
          </DialogHeader>
          {deleteConfirm && (
            <div className="space-y-4 mt-2">
              <p className="text-neutral-300 text-sm">
                Are you sure you want to remove{" "}
                {deleteConfirm.type === "category" ? "the category " : "the series story for "}
                <span className="font-semibold text-white">"{deleteConfirm.name}"</span>?
              </p>

              {deleteConfirm.type === "category" && deleteConfirm.count > 0 && (
                <label className="flex items-start gap-3 p-3 bg-neutral-900 border border-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deleteConfirm.reassign}
                    onChange={(e) =>
                      setDeleteConfirm({ ...deleteConfirm, reassign: e.target.checked })
                    }
                    className="mt-1 accent-accent"
                  />
                  <span className="text-xs text-neutral-300">
                    Reassign <strong>{deleteConfirm.count} photo(s)</strong> in this category to{" "}
                    <strong>"{siteCategories.find((c) => c !== deleteConfirm.name) || "Wildlife"}"</strong>.
                  </span>
                </label>
              )}

              {deleteConfirm.type !== "category" && deleteConfirm.count > 0 && (
                <label className="flex items-start gap-3 p-3 bg-neutral-900 border border-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deleteConfirm.unassignPhotos}
                    onChange={(e) =>
                      setDeleteConfirm({ ...deleteConfirm, unassignPhotos: e.target.checked })
                    }
                    className="mt-1 accent-accent"
                  />
                  <span className="text-xs text-neutral-300">
                    Also unassign this series from all <strong>{deleteConfirm.count} photo(s)</strong> (so it is completely removed from the public website).
                  </span>
                </label>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setDeleteConfirm(null)}
                  className="rounded-none border border-white/20 text-neutral-300 hover:text-white"
                >
                  Cancel
                </Button>
                {deleteConfirm.type === "category" ? (
                  <Button
                    type="button"
                    disabled={saving.cats}
                    onClick={confirmDeleteCategory}
                    className="rounded-none bg-red-600 hover:bg-red-700 text-white gap-2 uppercase tracking-wider text-xs"
                  >
                    {saving.cats ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                    Remove Category
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={saving.coll}
                    onClick={confirmDeleteSeries}
                    className="rounded-none bg-red-600 hover:bg-red-700 text-white gap-2 uppercase tracking-wider text-xs"
                  >
                    {saving.coll ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                    Remove Series
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BlogTab() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState("edit");
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [uploadingInline, setUploadingInline] = useState(false);
  const [inlineData, setInlineData] = useState({ url: "", alt: "", caption: "" });
  const [showBlogManager, setShowBlogManager] = useState(false);
  const [quickTitle, setQuickTitle] = useState("");

  const emptyForm = {
    title: "",
    slug: "",
    category: "Conservation & Fieldwork",
    excerpt: "",
    content: `<p>Fieldwork requires patience before the frame. In this study, we break down how analytical tracking systems help map out the migratory movements of local species across the wetlands.</p>

<img src="https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=1400&q=80" alt="Indian Cormorants hunting bullfrogs">
<span class="img-caption">Figure 1: Rare documentation of hunting sequences captured at Lal Dhori.</span>

<h2>The Intersection of Systems and Field Biology</h2>
<p>By treating photography as scientific evidence rather than simple spectacle, we feed crucial dataset observations straight to environmental networks like the Bombay Natural History Society.</p>`,
    cover_image: "",
    cover_caption: "",
    published_date: new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    reading_time: "4 min read",
    author: "Mihir Ranva",
  };

  const [form, setForm] = useState(emptyForm);
  const textareaRef = useRef(null);
  const coverFileRef = useRef(null);
  const inlineFileRef = useRef(null);

  const loadPosts = () => {
    setLoading(true);
    getBlogPosts()
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Could not load blog posts."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setActiveTab("edit");
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditingId(p.id);
    setForm({
      title: p.title || "",
      slug: p.slug || "",
      category: p.category || "Conservation & Fieldwork",
      excerpt: p.excerpt || "",
      content: p.content || "",
      cover_image: p.cover_image || "",
      cover_caption: p.cover_caption || "",
      published_date: p.published_date || "",
      reading_time: p.reading_time || "4 min read",
      author: p.author || "Mihir Ranva",
    });
    setActiveTab("edit");
    setModalOpen(true);
  };

  const autoSlug = (title) => {
    return (title || "")
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (val) => {
    const isNew = !editingId || !form.slug || form.slug === autoSlug(form.title);
    setForm((f) => ({
      ...f,
      title: val,
      slug: isNew ? autoSlug(val) : f.slug,
    }));
  };

  const quickAddBlog = (e) => {
    e?.preventDefault();
    const title = quickTitle.trim();
    if (!title) {
      toast.error("Please enter a blog title to add.");
      return;
    }
    setEditingId(null);
    setForm({
      ...emptyForm,
      title,
      slug: autoSlug(title),
    });
    setQuickTitle("");
    setActiveTab("edit");
    setModalOpen(true);
  };

  const autoCalcReadTime = () => {
    const text = (form.title + " " + form.excerpt + " " + form.content.replace(/<[^>]*>/g, " ")).trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const mins = Math.max(1, Math.round(words / 180));
    setForm((f) => ({ ...f, reading_time: `${mins} min read` }));
    toast.success(`Calculated: ${mins} min read (~${words} words)`);
  };

  const insertSnippet = (snippet) => {
    const ta = textareaRef.current;
    if (!ta) {
      setForm((f) => ({ ...f, content: f.content + "\n" + snippet }));
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const current = form.content;
    const updated = current.substring(0, start) + snippet + current.substring(end);
    setForm((f) => ({ ...f, content: updated }));
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 50);
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const res = await uploadToCloudinary(file, "portfolio/blog");
      setForm((f) => ({ ...f, cover_image: res.secure_url }));
      toast.success("Cover image uploaded.");
    } catch {
      toast.error("Cover image upload failed.");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleInlineUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingInline(true);
    try {
      const res = await uploadToCloudinary(file, "portfolio/blog");
      setInlineData((d) => ({ ...d, url: res.secure_url }));
      toast.success("Image uploaded. You can now insert it.");
    } catch {
      toast.error("Image upload failed.");
    } finally {
      setUploadingInline(false);
    }
  };

  const insertImageBlock = () => {
    if (!inlineData.url.trim()) {
      toast.error("Please enter or upload an image URL first.");
      return;
    }
    const altText = inlineData.alt.trim() || form.title || "Field observation";
    const captionText = inlineData.caption.trim() || "Figure: Field documentation.";
    const block = `\n<img src="${inlineData.url.trim()}" alt="${altText}">\n<span class="img-caption">${captionText}</span>\n`;
    insertSnippet(block);
    setImageModalOpen(false);
    setInlineData({ url: "", alt: "", caption: "" });
    toast.success("Image & caption inserted into article.");
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!form.title.trim()) {
      toast.error("Article title is required.");
      return;
    }
    if (!form.content.trim()) {
      toast.error("Article content is required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        slug: form.slug.trim() || autoSlug(form.title),
      };
      if (editingId) {
        await updateBlogPost(editingId, payload);
        toast.success("Article updated.");
      } else {
        await createBlogPost(payload);
        toast.success("Article published.");
      }
      setModalOpen(false);
      loadPosts();
    } catch (err) {
      const msg = err.response?.data?.detail || "Save failed. Check slug uniqueness.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteBlogPost(deleteConfirm.id);
      toast.success(`Removed blog "${deleteConfirm.title}".`);
      setDeleteConfirm(null);
      loadPosts();
    } catch {
      toast.error("Failed to remove blog.");
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-blog">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0A0A0A] p-6 border border-white/10">
        <div>
          <p className="font-mono-accent text-xs uppercase tracking-[0.2em] text-accent mb-1">
            Uniform Content System
          </p>
          <h2 className="font-serif text-2xl text-white">Field Journal & Blog Articles</h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            Add new blog articles or remove existing posts. Every post automatically uses the Universal Blog Post CSS System (800px optimal reading width, identical typography, and centered captions).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-white/20 hover:border-white text-xs uppercase tracking-[0.15em] px-4 py-3 text-neutral-300 hover:text-white inline-flex items-center gap-2 transition-colors"
          >
            <ExternalLink size={14} />
            <span>Open Blog ↗</span>
          </a>
          <Button
            type="button"
            variant="outline"
            data-testid="admin-manage-blogs-toggle-btn"
            onClick={() => setShowBlogManager(!showBlogManager)}
            className="rounded-none border-white/20 text-neutral-300 hover:border-white uppercase tracking-wider text-xs h-11 gap-2"
          >
            <Trash2 size={14} />
            <span>{showBlogManager ? "Hide Blog Manager" : "Manage / Remove Blogs"}</span>
          </Button>
          <Button
            onClick={openNew}
            data-testid="admin-add-blog-btn"
            className="rounded-none bg-accent text-black hover:bg-gold-hover uppercase tracking-[0.15em] text-xs h-11 gap-2 font-medium"
          >
            <Plus size={16} /> Add Blog
          </Button>
        </div>
      </div>

      {/* Quick Manage & Remove Blogs Bar */}
      {showBlogManager && (
        <div className="bg-[#0D0D0D] p-5 border border-white/15 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-accent font-mono-accent font-semibold">
                Quick Remove / Add Blog Bar ({posts.length} {posts.length === 1 ? "article" : "articles"})
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">
                Click the (✕) icon on any blog to remove it immediately, or type a title to quickly add one.
              </p>
            </div>
            <form onSubmit={quickAddBlog} className="flex gap-2 w-full sm:w-auto">
              <Input
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder="New article title..."
                className="bg-black/50 border-white/20 rounded-none text-white text-xs h-9 sm:w-64"
              />
              <Button
                type="submit"
                className="rounded-none bg-accent text-black hover:bg-gold-hover text-xs uppercase tracking-wider h-9 px-4 shrink-0 font-medium gap-1"
              >
                <Plus size={13} /> Add Blog
              </Button>
            </form>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
            {posts.length === 0 ? (
              <span className="text-xs text-neutral-500">No blog posts found to manage.</span>
            ) : (
              posts.map((p) => (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/50 border border-white/15 text-xs text-neutral-300 hover:border-red-500/50 transition-colors group"
                >
                  <span className="truncate max-w-[220px] font-medium">{p.title}</span>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(p)}
                    data-testid={`quick-remove-blog-${p.id}`}
                    title={`Remove Blog "${p.title}"`}
                    className="text-neutral-400 hover:text-red-400 p-0.5 transition-colors"
                  >
                    <X size={13} />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>
      )}

      {/* Articles List */}
      {loading ? (
        <div className="py-20 flex justify-center text-accent">
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : posts.length === 0 ? (
        <Card className="bg-[#0A0A0A] border-white/10 p-12 text-center rounded-none">
          <BookOpen className="mx-auto text-accent/50 mb-3" size={36} />
          <p className="font-serif text-2xl text-white mb-2">No Articles Yet</p>
          <p className="text-neutral-400 text-sm mb-6 max-w-md mx-auto">
            Add your first field journal entry using standard HTML text blocks, and the universal template will format it uniformly.
          </p>
          <Button
            onClick={openNew}
            data-testid="admin-add-first-blog-btn"
            className="rounded-none bg-accent text-black hover:bg-gold-hover uppercase tracking-[0.15em] text-xs"
          >
            <Plus size={16} className="mr-2" /> Add First Blog
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <Card
              key={p.id}
              className="bg-[#0A0A0A] border-white/10 p-5 md:p-6 rounded-none hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-5 flex-1 min-w-0">
                {p.cover_image ? (
                  <img
                    src={p.cover_image}
                    alt={p.title}
                    className="w-24 h-24 object-cover border border-white/10 shrink-0"
                  />
                ) : (
                  <div className="w-24 h-24 bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-accent/60">
                    <FileText size={28} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="font-mono-accent text-[11px] uppercase tracking-[0.15em] text-accent font-semibold">
                      {p.category || "Fieldwork"}
                    </span>
                    <span className="text-neutral-500 text-xs">•</span>
                    <span className="font-mono-accent text-xs text-neutral-400">
                      {p.published_date}
                    </span>
                    {p.reading_time && (
                      <>
                        <span className="text-neutral-500 text-xs">•</span>
                        <span className="font-mono-accent text-xs text-neutral-400">
                          {p.reading_time}
                        </span>
                      </>
                    )}
                  </div>
                  <h3 className="font-serif text-xl md:text-2xl text-white truncate mb-1">
                    {p.title}
                  </h3>
                  <p className="text-xs text-neutral-400 line-clamp-2 max-w-2xl font-light">
                    {p.excerpt || "No excerpt provided."}
                  </p>
                  <p className="font-mono text-[11px] text-neutral-500 mt-2 truncate">
                    /blog/{p.slug}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <a
                  href={`/blog/${p.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-white/20 hover:border-accent text-neutral-300 hover:text-accent px-3 py-2 text-xs uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors"
                  title="Open Article in New Tab"
                >
                  <ExternalLink size={14} />
                  <span className="hidden sm:inline">View ↗</span>
                </a>
                <Button
                  onClick={() => openEdit(p)}
                  variant="outline"
                  className="rounded-none border-white/20 hover:border-white text-white px-3 py-2 h-auto text-xs uppercase tracking-wider gap-1.5"
                  title="Edit Article"
                >
                  <Pencil size={14} />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
                <Button
                  onClick={() => setDeleteConfirm(p)}
                  data-testid={`admin-remove-blog-${p.id}`}
                  variant="outline"
                  className="rounded-none border-red-500/40 bg-red-950/20 hover:bg-red-600 hover:border-red-600 text-red-400 hover:text-white px-3 py-2 h-auto text-xs uppercase tracking-wider gap-1.5 transition-colors"
                  title={`Remove Blog "${p.title}"`}
                >
                  <Trash2 size={14} />
                  <span>Remove Blog</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Article Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto bg-[#070707] border-white/15 text-white rounded-none p-6 md:p-8">
          <DialogHeader className="mb-4 pb-4 border-b border-white/10 flex flex-row items-center justify-between">
            <div>
              <p className="font-mono-accent text-xs uppercase tracking-[0.2em] text-accent">
                {editingId ? "Edit Journal Article" : "Write Journal Article"}
              </p>
              <DialogTitle className="font-serif text-2xl md:text-3xl text-white mt-1">
                {editingId ? "Update Blog Post" : "Universal Blog Post Template"}
              </DialogTitle>
            </div>
            <div className="flex items-center gap-1 bg-[#111] p-1 border border-white/10 mr-8">
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className={`px-3 py-1.5 text-xs uppercase tracking-wider transition-colors ${
                  activeTab === "edit" ? "bg-accent text-black font-medium" : "text-neutral-400 hover:text-white"
                }`}
              >
                Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`px-3 py-1.5 text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                  activeTab === "preview" ? "bg-accent text-black font-medium" : "text-neutral-400 hover:text-white"
                }`}
              >
                <Eye size={13} />
                <span>Live Preview</span>
              </button>
            </div>
          </DialogHeader>

          {activeTab === "preview" ? (
            <div className="bg-[#050505] p-6 md:p-10 border border-white/10 my-4 max-h-[68vh] overflow-y-auto">
              <div className="mb-4 pb-2 border-b border-white/10 flex items-center justify-between text-xs text-neutral-500">
                <span>PREVIEW MODE · EXACT TEMPLATE RENDERING</span>
                <span className="font-mono">800px optimal container</span>
              </div>
              <article className="blog-wrapper !my-4 !p-0">
                <div className="blog-meta">
                  Published: {form.published_date || "Date"} • {form.category || "Conservation"} • {form.reading_time}
                </div>
                <h1 className="blog-main-title">{form.title || "Your Main Article Title"}</h1>
                {form.cover_image && (
                  <div>
                    <img src={form.cover_image} alt={form.title} />
                    {form.cover_caption && <span className="img-caption">{form.cover_caption}</span>}
                  </div>
                )}
                <div
                  className="blog-content"
                  dangerouslySetInnerHTML={{ __html: form.content }}
                />
              </article>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              {/* Row 1: Title & Slug */}
              <div className="grid md:grid-cols-12 gap-4">
                <div className="md:col-span-8">
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5">
                    Article Title *
                  </label>
                  <Input
                    required
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Waterbird Dynamics: Tracking Hunting Behaviours in Junagadh's Wetlands"
                    className="bg-[#0D0D0D] border-white/20 rounded-none text-white text-base"
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5">
                    URL Slug
                  </label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="waterbird-dynamics-wetlands"
                    className="bg-[#0D0D0D] border-white/20 rounded-none text-white font-mono text-xs"
                  />
                </div>
              </div>

              {/* Row 2: Category, Date & Reading Time */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5">
                    Category
                  </label>
                  <Input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="e.g. Conservation & Fieldwork"
                    className="bg-[#0D0D0D] border-white/20 rounded-none text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5">
                    Published Date
                  </label>
                  <Input
                    value={form.published_date}
                    onChange={(e) => setForm({ ...form, published_date: e.target.value })}
                    placeholder="October 24, 2026"
                    className="bg-[#0D0D0D] border-white/20 rounded-none text-white text-sm"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs uppercase tracking-wider text-neutral-400">
                      Reading Time
                    </label>
                    <button
                      type="button"
                      onClick={autoCalcReadTime}
                      className="text-[11px] text-accent hover:underline flex items-center gap-1 font-mono-accent"
                    >
                      <Sparkles size={11} /> Auto Calc
                    </button>
                  </div>
                  <Input
                    value={form.reading_time}
                    onChange={(e) => setForm({ ...form, reading_time: e.target.value })}
                    placeholder="4 min read"
                    className="bg-[#0D0D0D] border-white/20 rounded-none text-white text-sm"
                  />
                </div>
              </div>

              {/* Row 3: Cover Image */}
              <div className="grid md:grid-cols-12 gap-4">
                <div className="md:col-span-7">
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5">
                    Cover / Header Image URL (Optional)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={form.cover_image}
                      onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
                      placeholder="https://... or upload below"
                      className="bg-[#0D0D0D] border-white/20 rounded-none text-white text-sm"
                    />
                    <input
                      ref={coverFileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploadingCover}
                      onClick={() => coverFileRef.current?.click()}
                      className="rounded-none border-white/20 text-white hover:bg-white hover:text-black gap-2 uppercase text-xs shrink-0"
                    >
                      {uploadingCover ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                      Upload
                    </Button>
                  </div>
                </div>
                <div className="md:col-span-5">
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5">
                    Cover Image Caption
                  </label>
                  <Input
                    value={form.cover_caption}
                    onChange={(e) => setForm({ ...form, cover_caption: e.target.value })}
                    placeholder="Figure 1: Rare documentation of hunting sequences captured at Lal Dhori."
                    className="bg-[#0D0D0D] border-white/20 rounded-none text-white text-sm"
                  />
                </div>
              </div>

              {/* Row 4: Excerpt */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5">
                  Lead Excerpt (Summary for article cards & SEO)
                </label>
                <Textarea
                  rows={2}
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="Fieldwork requires patience before the frame. In this study, we break down how analytical tracking systems help map out the migratory movements of local species across the wetlands."
                  className="bg-[#0D0D0D] border-white/20 rounded-none text-white text-sm"
                />
              </div>

              {/* Row 5: Content Editor Toolbar & Textarea */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs uppercase tracking-wider text-neutral-400">
                    Article Content (HTML Blocks) *
                  </label>
                  <span className="text-[11px] text-accent font-mono-accent">
                    Backed by Universal Blog Post CSS (.blog-content)
                  </span>
                </div>

                {/* Quick Insert Toolbar */}
                <div className="flex flex-wrap items-center gap-1.5 bg-[#121212] p-2 border border-white/10">
                  <span className="text-[11px] uppercase tracking-wider text-neutral-500 mr-1 font-mono-accent">
                    Insert:
                  </span>
                  <button
                    type="button"
                    onClick={() => insertSnippet("<p>\nFieldwork requires patience before the frame. Observation text goes here...\n</p>\n\n")}
                    className="text-xs px-2.5 py-1 bg-white/5 hover:bg-white/15 text-neutral-200 border border-white/10 transition-colors"
                  >
                    + Paragraph &lt;p&gt;
                  </button>
                  <button
                    type="button"
                    onClick={() => insertSnippet("<h2>The Intersection of Systems and Field Biology</h2>\n\n")}
                    className="text-xs px-2.5 py-1 bg-white/5 hover:bg-white/15 text-neutral-200 border border-white/10 transition-colors"
                  >
                    + Heading &lt;h2&gt;
                  </button>
                  <button
                    type="button"
                    onClick={() => insertSnippet("<h3>Field Tracking Dynamics</h3>\n\n")}
                    className="text-xs px-2.5 py-1 bg-white/5 hover:bg-white/15 text-neutral-200 border border-white/10 transition-colors"
                  >
                    + Subheading &lt;h3&gt;
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageModalOpen(true)}
                    className="text-xs px-2.5 py-1 bg-accent/20 hover:bg-accent/30 text-accent border border-accent/40 font-medium flex items-center gap-1 transition-colors"
                  >
                    <ImageIcon size={13} />
                    <span>+ Image with Caption</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertSnippet("<blockquote>\n\"By treating photography as scientific evidence rather than simple spectacle, we feed crucial dataset observations straight to environmental networks.\"\n</blockquote>\n\n")}
                    className="text-xs px-2.5 py-1 bg-white/5 hover:bg-white/15 text-neutral-200 border border-white/10 transition-colors"
                  >
                    + Quote &lt;blockquote&gt;
                  </button>
                  <button
                    type="button"
                    onClick={() => insertSnippet("<ul>\n  <li>Documented 42 unique flight and foraging patterns.</li>\n  <li>Standardized visual metadata cataloged for BNHS review.</li>\n</ul>\n\n")}
                    className="text-xs px-2.5 py-1 bg-white/5 hover:bg-white/15 text-neutral-200 border border-white/10 transition-colors"
                  >
                    + List &lt;ul&gt;
                  </button>
                </div>

                <Textarea
                  ref={textareaRef}
                  required
                  rows={14}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="<p>Fieldwork requires patience before the frame...</p>"
                  className="bg-[#0D0D0D] border-white/20 rounded-none text-white font-mono text-sm leading-relaxed"
                />

                <p className="text-[11px] text-neutral-400 italic">
                  Note: You don&apos;t need to manually style fonts or spacing. The website automatically styles all paragraphs, headings, blockquotes, and images with centered captions.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/10">
                {editingId ? (
                  <Button
                    type="button"
                    data-testid="admin-dialog-remove-blog-btn"
                    onClick={() => {
                      const target = posts.find((p) => p.id === editingId);
                      if (target) setDeleteConfirm(target);
                      setModalOpen(false);
                    }}
                    className="rounded-none bg-red-950/40 border border-red-500/40 text-red-400 hover:bg-red-600 hover:text-white uppercase tracking-wider text-xs gap-1.5 h-11 px-4"
                  >
                    <Trash2 size={14} /> Remove This Blog
                  </Button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalOpen(false)}
                    className="rounded-none border-white/20 text-neutral-300 hover:bg-white hover:text-black uppercase tracking-wider text-xs h-11 px-5"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="rounded-none bg-accent text-black hover:bg-gold-hover uppercase tracking-[0.15em] text-xs h-11 px-8 font-medium gap-2"
                  >
                    {saving ? <Loader2 className="animate-spin" size={15} /> : null}
                    {editingId ? "Update Blog" : "Add & Publish Blog"}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Insert Image Block Helper Dialog */}
      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="max-w-lg bg-[#0F0F0F] border-white/15 text-white rounded-none p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="font-serif text-2xl text-white">
              Insert Image with Caption
            </DialogTitle>
            <p className="text-xs text-neutral-400 mt-1">
              Creates a standardized image block with uniform scaling and centered italic caption.
            </p>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5">
                Image Source URL
              </label>
              <div className="flex gap-2">
                <Input
                  value={inlineData.url}
                  onChange={(e) => setInlineData({ ...inlineData, url: e.target.value })}
                  placeholder="https://... or upload photo"
                  className="bg-[#181818] border-white/20 rounded-none text-white text-xs"
                />
                <input
                  ref={inlineFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleInlineUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploadingInline}
                  onClick={() => inlineFileRef.current?.click()}
                  className="rounded-none border-white/20 text-white hover:bg-white hover:text-black uppercase text-xs shrink-0"
                >
                  {uploadingInline ? <Loader2 className="animate-spin" size={13} /> : <Upload size={13} />}
                  Upload
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5">
                Alt Text (Accessible Description)
              </label>
              <Input
                value={inlineData.alt}
                onChange={(e) => setInlineData({ ...inlineData, alt: e.target.value })}
                placeholder="Indian Cormorants hunting bullfrogs"
                className="bg-[#181818] border-white/20 rounded-none text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5">
                Figure Caption (Styled in Italic Centered)
              </label>
              <Input
                value={inlineData.caption}
                onChange={(e) => setInlineData({ ...inlineData, caption: e.target.value })}
                placeholder="Figure 1: Rare documentation of hunting sequences captured at Lal Dhori."
                className="bg-[#181818] border-white/20 rounded-none text-white text-xs"
              />
            </div>

            {inlineData.url && (
              <div className="p-3 bg-black/40 border border-white/10 rounded-sm">
                <p className="text-[11px] uppercase tracking-wider text-neutral-400 mb-2 font-mono">
                  Preview:
                </p>
                <img
                  src={inlineData.url}
                  alt={inlineData.alt || "Preview"}
                  className="w-full max-h-40 object-cover rounded"
                />
                <p className="text-center italic text-xs text-neutral-400 mt-2 font-serif">
                  {inlineData.caption || "Caption preview"}
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setImageModalOpen(false)}
                className="rounded-none text-neutral-400 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={insertImageBlock}
                className="rounded-none bg-accent text-black hover:bg-gold-hover uppercase tracking-wider text-xs font-medium"
              >
                Insert Image Block
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-md bg-[#0F0F0F] border-white/15 text-white rounded-none p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="font-serif text-2xl text-white">
              Remove Blog Post?
            </DialogTitle>
          </DialogHeader>
          <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
            Are you sure you want to permanently remove <strong className="text-white">&ldquo;{deleteConfirm?.title}&rdquo;</strong> from your blog? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              className="rounded-none border-white/20 text-neutral-300 hover:bg-white hover:text-black uppercase text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              data-testid="confirm-remove-blog-btn"
              onClick={confirmDelete}
              className="rounded-none bg-red-600 hover:bg-red-700 text-white uppercase text-xs gap-1.5"
            >
              <Trash2 size={13} /> Remove Blog
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MessagesTab() {

  const [msgs, setMsgs] = useState([]);
  useEffect(() => { getMessages().then(setMsgs).catch(() => {}); }, []);
  const loadMessages = () => {
    getMessages().then(setMsgs).catch(() => {});
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      await deleteContactMessage(id);
      toast.success("Message deleted.");
      loadMessages();
    } catch {
      toast.error("Failed to delete message.");
    }
  };

  return (
    <div className="space-y-4" data-testid="admin-messages">
      <div className="flex items-center justify-between pb-2">
        <h2 className="font-serif text-2xl text-white">Contact &amp; General Inquiries</h2>
        <span className="font-mono-accent text-xs px-2.5 py-1 bg-white/5 border border-white/10 text-accent">
          {msgs.length} messages
        </span>
      </div>
      {msgs.length === 0 ? (
        <Card className="bg-[#0A0A0A] border-white/10 p-10 text-center rounded-none">
          <p className="text-neutral-500">No contact messages yet.</p>
        </Card>
      ) : msgs.map((m) => (
        <Card key={m.id} className="bg-[#0A0A0A] border-white/10 p-5 rounded-none space-y-3">
          <div className="flex justify-between items-baseline">
            <p className="text-white font-medium">{m.name} · <span className="text-accent text-sm">{m.email}</span></p>
            <span className="font-mono-accent text-xs text-neutral-500">{new Date(m.created_at).toLocaleDateString()}</span>
          </div>
          <p className="text-neutral-300 text-sm leading-relaxed">{m.message}</p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
            <a
              href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: Enquiry on Mihir Wildlife Photography`)}&body=${encodeURIComponent(`Hi ${m.name},\n\nThank you for reaching out via mihirwildlife.in.\n\n`)}`}
              className="inline-flex items-center gap-1.5 h-8 px-3 border border-white/20 text-xs text-neutral-300 hover:text-white hover:border-white/40 uppercase tracking-wider transition-colors"
            >
              <Mail size={12} /> Reply via Email
            </a>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDelete(m.id)}
              className="text-neutral-500 hover:text-red-400 h-8 rounded-none px-2"
              title="Delete message"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function RequestsTab() {
  const [reqs, setReqs] = useState([]);
  const [activeReply, setActiveReply] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const loadRequests = () => {
    getPrintRequests().then(setReqs).catch(() => {});
  };

  useEffect(() => { loadRequests(); }, []);

  const handleStatusChange = async (id, status) => {
    try {
      setUpdatingId(id);
      await updatePrintRequest(id, { status });
      toast.success(`Request status updated to ${status}.`);
      loadRequests();
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to remove this print request?")) return;
    try {
      await deletePrintRequest(id);
      toast.success("Print request deleted.");
      loadRequests();
    } catch {
      toast.error("Failed to delete request.");
    }
  };

  const openReplyModal = (r) => {
    setActiveReply(r);
    const quotePrice = r.print_price || "INR 4,500";
    const size = r.print_size || "A3 (297×420mm)";
    setReplyText(
      `Hello ${r.name},\n\nThank you for reaching out regarding the fine art collector print of "${r.photo_title || 'my wildlife photography frame'}".\n\nI would be delighted to prepare this for you. For the requested ${size} archival giclée print, the cost is ${quotePrice}.\n\nEach print is meticulously produced using museum-grade archival mineral pigments on 310gsm 100% cotton-rag fine art paper and includes a signed certificate of authenticity.\n\nPlease confirm your preferred delivery address and whether you'd like custom framing options.\n\nWarm regards,\nMihir Ranva\nWildlife Photographer & Conservationist\nJunagadh, Gujarat\nhttps://mihirwildlife.in`
    );
  };

  return (
    <div className="space-y-6" data-testid="admin-requests">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl text-white">Fine Art Prints &amp; Licensing Inquiries</h2>
          <p className="text-xs text-neutral-400 mt-1">Review, respond to, and track collector requests directly.</p>
        </div>
        <span className="font-mono-accent text-xs px-3 py-1 bg-white/5 border border-white/10 text-accent">
          Total: {reqs.length} inquiries
        </span>
      </div>

      {reqs.length === 0 ? (
        <Card className="bg-[#0A0A0A] border-white/10 p-12 text-center rounded-none">
          <p className="text-neutral-400 font-serif text-lg">No print or licensing requests yet.</p>
          <p className="text-xs text-neutral-500 mt-1">When collectors request a print or license on the website, they will appear here with full response tools.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reqs.map((r) => {
            const status = r.status || "Pending";
            const mailtoUrl = `mailto:${r.email}?subject=${encodeURIComponent(`Regarding your ${r.purpose === "license" ? "Licensing" : "Print"} Request · "${r.photo_title || 'Wildlife Frame'}"`)}&body=${encodeURIComponent(`Hello ${r.name},\n\nThank you for your interest in "${r.photo_title}".\n\n`)}`;

            return (
              <Card key={r.id} className="bg-[#0A0A0A] border-white/15 p-6 rounded-none space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="text-white text-lg font-medium">{r.name}</p>
                      <span className={`text-[11px] px-2.5 py-0.5 border uppercase font-mono-accent tracking-wider ${
                        status === "Completed"
                          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                          : status === "Responded"
                          ? "bg-sky-500/15 border-sky-500/40 text-sky-400"
                          : "bg-amber-500/15 border-amber-500/40 text-amber-300"
                      }`}>
                        {status}
                      </span>
                    </div>
                    <p className="text-sm text-accent mt-0.5">{r.email}</p>
                  </div>

                  <div className="text-right">
                    <span className="font-mono-accent text-xs text-neutral-400 block">
                      {new Date(r.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="font-mono-accent text-[11px] uppercase tracking-wider text-neutral-500">
                      {r.purpose === "license" ? "Commercial License" : "Archival Print"}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-white/[0.02] border border-white/5 text-xs">
                  <div>
                    <span className="text-neutral-500 block uppercase font-mono-accent tracking-wider text-[10px]">Requested Frame</span>
                    <span className="text-white font-serif text-sm mt-0.5 block">{r.photo_title || "General Portfolio Inquiry"}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block uppercase font-mono-accent tracking-wider text-[10px]">Size / Type</span>
                    <span className="text-neutral-200 mt-0.5 block">{r.print_size || "Not specified"}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block uppercase font-mono-accent tracking-wider text-[10px]">Estimated Price</span>
                    <span className="text-accent font-medium mt-0.5 block">{r.print_price || "Custom Quote"}</span>
                  </div>
                </div>

                {/* Message / Details */}
                {r.message && (
                  <div className="p-3 bg-white/[0.015] border-l-2 border-accent text-neutral-300 text-sm">
                    <p className="text-[11px] text-neutral-500 uppercase font-mono-accent tracking-wider mb-1">Collector's Note &amp; Contact Details:</p>
                    <p className="italic">{r.message}</p>
                  </div>
                )}

                {/* Action Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400 font-mono-accent">Status:</span>
                    <select
                      value={status}
                      onChange={(e) => handleStatusChange(r.id, e.target.value)}
                      disabled={updatingId === r.id}
                      className="bg-black border border-white/20 text-xs px-2.5 py-1 text-white rounded-none cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Responded">Responded</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => openReplyModal(r)}
                      className="rounded-none bg-accent text-black hover:bg-gold-hover text-xs uppercase tracking-wider h-8 font-semibold"
                    >
                      <Mail size={13} className="mr-1.5" /> Respond to Client
                    </Button>
                    <a
                      href={mailtoUrl}
                      className="inline-flex items-center gap-1.5 h-8 px-3 border border-white/20 text-xs text-neutral-300 hover:text-white hover:border-white/40 uppercase tracking-wider transition-colors"
                    >
                      <ExternalLink size={12} /> Email Client
                    </a>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(r.id)}
                      className="text-neutral-500 hover:text-red-400 h-8 rounded-none px-2"
                      title="Delete inquiry"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Reply Modal */}
      <Dialog open={!!activeReply} onOpenChange={(o) => !o && setActiveReply(null)}>
        <DialogContent className="bg-[#0A0A0A] border-white/15 rounded-none max-w-lg text-white">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              Respond to {activeReply?.name}
            </DialogTitle>
          </DialogHeader>
          {activeReply && (
            <div className="space-y-4 mt-2">
              <div className="p-3 bg-white/5 border border-white/10 text-xs text-neutral-300">
                <p><strong className="text-white">To:</strong> {activeReply.email}</p>
                <p><strong className="text-white">Regarding:</strong> {activeReply.photo_title} ({activeReply.print_size || 'Custom'})</p>
              </div>

              <div>
                <label className="text-xs text-neutral-400 uppercase font-mono-accent block mb-1">Response Message Draft</label>
                <Textarea
                  rows={8}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="bg-transparent border-white/20 rounded-none text-white text-xs leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <Button
                  variant="outline"
                  onClick={() => setActiveReply(null)}
                  className="rounded-none border-white/20 text-neutral-300 text-xs uppercase"
                >
                  Close
                </Button>
                <a
                  href={`mailto:${activeReply.email}?subject=${encodeURIComponent(`Response: Print Request for "${activeReply.photo_title || 'Mihir Wildlife'}"`)}&body=${encodeURIComponent(replyText)}`}
                  onClick={() => {
                    handleStatusChange(activeReply.id, "Responded");
                    setActiveReply(null);
                  }}
                  className="inline-flex items-center gap-2 bg-accent text-black hover:bg-gold-hover px-4 py-2 font-semibold text-xs uppercase tracking-wider transition-colors"
                >
                  <Mail size={14} /> Open in Email &amp; Mark Responded
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [tab, setTab] = useState("photos");
  const [site, setSite] = useState(null);
  const [prefilledSeries, setPrefilledSeries] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("admin_token");
      if (token) setAuthed(true);
    }
    setCheckingAuth(false);
  }, []);

  useEffect(() => {
    if (authed) {
      getSite().then(setSite).catch(() => {});
    }
  }, [authed]);

  const logout = () => {
    if (typeof window !== "undefined") { localStorage.removeItem("admin_token"); }
    setAuthed(false);
  };

  if (checkingAuth) return <div className="min-h-screen bg-[#050505]" />;
  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen bg-[#050505] py-10 px-6 md:px-12" data-testid="admin-dashboard">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="font-mono-accent text-xs uppercase tracking-[0.3em] text-accent mb-2">Studio</p>
            <h1 className="font-serif text-4xl text-white">Portfolio Admin</h1>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => router.push("/")} variant="ghost" className="text-neutral-400 rounded-none gap-2">
              <ArrowLeft size={16} /> Site
            </Button>
            <Button data-testid="admin-logout" onClick={logout} variant="ghost" className="text-neutral-400 rounded-none gap-2">
              <LogOut size={16} /> Logout
            </Button>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-[#0A0A0A] border border-white/10 rounded-none mb-8">
            <TabsTrigger value="photos" data-testid="tab-photos" className="rounded-none data-[state=active]:bg-accent data-[state=active]:text-black uppercase tracking-wider text-xs">Photos</TabsTrigger>
            <TabsTrigger value="site" data-testid="tab-site" className="rounded-none data-[state=active]:bg-accent data-[state=active]:text-black uppercase tracking-wider text-xs">Branding</TabsTrigger>
            <TabsTrigger value="blog" data-testid="tab-blog" className="rounded-none data-[state=active]:bg-accent data-[state=active]:text-black uppercase tracking-wider text-xs">Blog</TabsTrigger>
            <TabsTrigger value="messages" data-testid="tab-messages" className="rounded-none data-[state=active]:bg-accent data-[state=active]:text-black uppercase tracking-wider text-xs">Messages</TabsTrigger>
            <TabsTrigger value="requests" data-testid="tab-requests" className="rounded-none data-[state=active]:bg-accent data-[state=active]:text-black uppercase tracking-wider text-xs">Prints</TabsTrigger>
          </TabsList>
          <TabsContent value="photos">
            <PhotosTab
              site={site}
              setSite={setSite}
              prefilledSeries={prefilledSeries}
              clearPrefilledSeries={() => setPrefilledSeries("")}
            />
          </TabsContent>
          <TabsContent value="site">
            <SiteTab
              site={site}
              setSite={setSite}
              onUploadToSeries={(seriesName) => {
                setPrefilledSeries(seriesName);
                setTab("photos");
              }}
            />
          </TabsContent>
          <TabsContent value="blog"><BlogTab /></TabsContent>
          <TabsContent value="messages"><MessagesTab /></TabsContent>
          <TabsContent value="requests"><RequestsTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
