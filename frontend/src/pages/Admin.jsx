import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import exifr from "exifr";
import {
  adminLogin, getPhotos, createPhoto, updatePhoto, deletePhoto, reorderPhotos,
  getSite, updateSite, getMessages, getPrintRequests, uploadToCloudinary,
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
import { Trash2, Upload, LogOut, Loader2, ArrowLeft, GripVertical, Frame, Pencil } from "lucide-react";

async function extractExif(file) {
  try {
    const d = await exifr.parse(file, ["Make", "Model", "LensModel", "LensMake", "FNumber", "ExposureTime", "ISO", "ISOSpeedRatings", "FocalLength"]);
    if (!d) return {};
    const camera = [d.Make, d.Model].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
    const lens = (d.LensModel || d.LensMake || "").trim();
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
      localStorage.setItem("admin_token", token);
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
        <Link to="/" className="text-neutral-500 text-sm flex items-center gap-2 mb-10 hover:text-accent">
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

function PhotosTab() {
  const [photos, setPhotos] = useState([]);
  const [form, setForm] = useState({ title: "", title_gu: "", category: "Wildlife", location: "", collection: "", story: "", camera: "", lens: "", settings: "" });
  const [uploading, setUploading] = useState(false);
  const [dragId, setDragId] = useState(null);
  const [editing, setEditing] = useState(null);
  const fileRef = useRef();

  const load = () => getPhotos().then(setPhotos);
  useEffect(() => { load(); }, []);

  const knownCollections = Array.from(new Set(photos.map((p) => p.collection).filter(Boolean)));

  const saveEdit = async () => {
    try {
      await updatePhoto(editing.id, {
        title: editing.title,
        title_gu: editing.title_gu,
        category: editing.category,
        location: editing.location,
        collection: editing.collection,
        story: editing.story,
        camera: editing.camera,
        lens: editing.lens,
        settings: editing.settings,
        image_url: editing.image_url,
        public_id: editing.public_id,
        order: editing.order,
        featured: editing.featured,
      });
      toast.success("Photo updated.");
      setEditing(null);
      load();
    } catch {
      toast.error("Update failed.");
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!form.title.trim()) { toast.error("Add a title first."); fileRef.current.value = ""; return; }
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
        title: form.title,
        title_gu: form.title_gu,
        category: form.category,
        location: form.location,
        collection: form.collection,
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
      setForm({ title: "", title_gu: "", category: "Wildlife", location: "", collection: "", story: "", camera: "", lens: "", settings: "" });
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
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger data-testid="photo-category" className="bg-transparent border-white/20 rounded-none text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.filter((c) => c !== "All").map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            data-testid="photo-location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Location (optional)"
            className="bg-transparent border-white/20 rounded-none text-white"
          />
        </div>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <Input
            data-testid="photo-collection"
            value={form.collection}
            onChange={(e) => setForm({ ...form, collection: e.target.value })}
            placeholder="Series / collection (e.g. Reptiles, Monsoon)"
            className="bg-transparent border-white/20 rounded-none text-white md:col-span-1"
          />
          <Input
            data-testid="photo-story"
            value={form.story}
            onChange={(e) => setForm({ ...form, story: e.target.value })}
            placeholder="One-line field story (shown in lightbox)"
            className="bg-transparent border-white/20 rounded-none text-white md:col-span-2"
          />
        </div>
        <div className="grid md:grid-cols-3 gap-4 mb-3">
          <Input
            data-testid="photo-camera"
            value={form.camera}
            onChange={(e) => setForm({ ...form, camera: e.target.value })}
            placeholder="Camera body (auto-read from EXIF)"
            className="bg-transparent border-white/20 rounded-none text-white"
          />
          <Input
            data-testid="photo-lens"
            value={form.lens}
            onChange={(e) => setForm({ ...form, lens: e.target.value })}
            placeholder="Lens (auto-read from EXIF)"
            className="bg-transparent border-white/20 rounded-none text-white"
          />
          <Input
            data-testid="photo-settings"
            value={form.settings}
            onChange={(e) => setForm({ ...form, settings: e.target.value })}
            placeholder="Settings (auto-read from EXIF)"
            className="bg-transparent border-white/20 rounded-none text-white"
          />
        </div>
        <p className="text-[11px] text-neutral-500 mb-5">
          Leave camera fields blank — they're read automatically from the photo's EXIF data on upload.
        </p>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleUpload} data-testid="photo-file-input" />
        <Button
          data-testid="photo-upload-btn"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="rounded-none bg-accent text-black hover:bg-gold-hover uppercase tracking-[0.15em] gap-2"
        >
          {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
          {uploading ? "Uploading..." : "Select Image"}
        </Button>
      </Card>

      <p className="font-mono-accent text-xs uppercase tracking-[0.2em] text-neutral-500">
        Drag frames to reorder the gallery
      </p>
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
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                data-testid={`edit-photo-${p.id}`}
                onClick={() => setEditing({ ...p })}
                className="bg-black/70 p-2 text-white hover:text-accent"
              >
                <Pencil size={16} />
              </button>
              <button
                data-testid={`delete-photo-${p.id}`}
                onClick={() => remove(p.id)}
                className="bg-black/70 p-2 text-white hover:text-red-400"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent data-testid="edit-photo-dialog" className="bg-[#0A0A0A] border-white/15 rounded-none max-w-lg text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Edit frame</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4 mt-2">
              <Input data-testid="edit-title" value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Title (English)" className="bg-transparent border-white/20 rounded-none" />
              <Input data-testid="edit-title-gu" value={editing.title_gu || ""} onChange={(e) => setEditing({ ...editing, title_gu: e.target.value })} placeholder="Title (ગુજરાતી)" className="bg-transparent border-white/20 rounded-none" />
              <div className="grid grid-cols-2 gap-3">
                <Select value={editing.category} onValueChange={(v) => setEditing({ ...editing, category: v })}>
                  <SelectTrigger data-testid="edit-category" className="bg-transparent border-white/20 rounded-none"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter((c) => c !== "All").map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input data-testid="edit-location" value={editing.location || ""} onChange={(e) => setEditing({ ...editing, location: e.target.value })} placeholder="Location" className="bg-transparent border-white/20 rounded-none" />
              </div>
              <Input data-testid="edit-collection" list="known-collections" value={editing.collection || ""} onChange={(e) => setEditing({ ...editing, collection: e.target.value })} placeholder="Series (type a new name to create one)" className="bg-transparent border-white/20 rounded-none" />
              <datalist id="known-collections">
                {knownCollections.map((c) => <option key={c} value={c} />)}
              </datalist>
              <Textarea data-testid="edit-story" value={editing.story || ""} onChange={(e) => setEditing({ ...editing, story: e.target.value })} rows={2} placeholder="One-line field story" className="bg-transparent border-white/20 rounded-none resize-none" />
              <div className="grid grid-cols-3 gap-3">
                <Input data-testid="edit-camera" value={editing.camera || ""} onChange={(e) => setEditing({ ...editing, camera: e.target.value })} placeholder="Camera" className="bg-transparent border-white/20 rounded-none" />
                <Input data-testid="edit-lens" value={editing.lens || ""} onChange={(e) => setEditing({ ...editing, lens: e.target.value })} placeholder="Lens" className="bg-transparent border-white/20 rounded-none" />
                <Input data-testid="edit-settings" value={editing.settings || ""} onChange={(e) => setEditing({ ...editing, settings: e.target.value })} placeholder="Settings" className="bg-transparent border-white/20 rounded-none" />
              </div>
              <Button data-testid="edit-save-btn" onClick={saveEdit} className="w-full rounded-none bg-accent text-black hover:bg-gold-hover uppercase tracking-[0.15em]">Save changes</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SiteTab() {
  const [site, setSite] = useState(null);
  const [saving, setSaving] = useState({});
  const [allPhotos, setAllPhotos] = useState([]);
  const [newColl, setNewColl] = useState("");
  const logoRef = useRef();
  const heroRef = useRef();
  const aboutRef = useRef();

  useEffect(() => { getSite().then(setSite); getPhotos().then(setAllPhotos); }, []);

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
      const updated = await updateSite({ contact_email: site.contact_email, instagram: site.instagram });
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

  const setColl = (name, key, val) => {
    const collections = { ...(site.collections || {}) };
    collections[name] = { ...collections[name], [key]: val };
    setSite({ ...site, collections });
  };
  const addColl = () => {
    const name = newColl.trim();
    if (!name) return;
    const collections = { ...(site.collections || {}) };
    if (!collections[name]) collections[name] = { caption: "", cover_public_id: "" };
    setSite({ ...site, collections });
    setNewColl("");
    toast.success(`Series "${name}" added — assign photos to it, then Save.`);
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
        <ImgUpload label="Hero Image" field="hero_image" folder="portfolio/brand" inputRef={heroRef} aspect="aspect-video" />
        <ImgUpload label="About Portrait" field="about_image" folder="portfolio/brand" inputRef={aboutRef} aspect="aspect-[4/5]" />
      </div>

      <Card className="bg-[#0A0A0A] border-white/10 p-6 rounded-none">
        <h3 className="font-serif text-2xl text-white mb-5">Contact details</h3>
        <div className="grid md:grid-cols-2 gap-4 mb-5">
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
              placeholder="https://instagram.com/..."
              className="bg-transparent border-white/20 rounded-none text-white"
            />
          </div>
        </div>
        <Button data-testid="site-save-btn" onClick={saveText} disabled={saving.text} className="rounded-none bg-accent text-black hover:bg-gold-hover uppercase tracking-[0.15em]">
          {saving.text ? "Saving..." : "Save"}
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

      <Card className="bg-[#0A0A0A] border-white/10 p-6 rounded-none" data-testid="series-stories-card">
        <h3 className="font-serif text-2xl text-white mb-1">Series stories</h3>
        <p className="text-[11px] text-neutral-500 mb-5">Give each collection a cover frame and a short caption. Add a new series here, then assign photos to it from the Photos tab (edit a photo → Series).</p>
        <div className="flex gap-3 mb-6">
          <Input
            data-testid="new-series-name"
            value={newColl}
            onChange={(e) => setNewColl(e.target.value)}
            placeholder="New series name (e.g. Reptiles, Monsoon)"
            className="bg-transparent border-white/20 rounded-none text-white max-w-xs"
          />
          <Button data-testid="add-series-btn" onClick={addColl} variant="ghost" className="rounded-none border border-white/20 text-white uppercase tracking-[0.15em] text-xs">+ Add series</Button>
        </div>
        <div className="space-y-6">
          {Object.keys(site.collections || {}).map((name) => {
            const inColl = allPhotos.filter((p) => p.collection === name);
            const meta = site.collections[name] || {};
            return (
              <div key={name} className="border border-white/10 p-4" data-testid={`series-edit-${name}`}>
                <p className="font-mono-accent text-xs uppercase tracking-[0.2em] text-accent mb-3">{name}</p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-2">Caption</label>
                    <Textarea
                      data-testid={`series-caption-${name}`}
                      value={meta.caption || ""}
                      onChange={(e) => setColl(name, "caption", e.target.value)}
                      rows={3}
                      className="bg-transparent border-white/20 rounded-none text-white resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-2">Cover frame</label>
                    <Select value={meta.cover_public_id || ""} onValueChange={(v) => setColl(name, "cover_public_id", v)}>
                      <SelectTrigger data-testid={`series-cover-${name}`} className="bg-transparent border-white/20 rounded-none text-white">
                        <SelectValue placeholder="Choose cover" />
                      </SelectTrigger>
                      <SelectContent>
                        {inColl.map((p) => (
                          <SelectItem key={p.id} value={p.public_id || p.id}>{p.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <Button data-testid="series-save-btn" onClick={saveCollections} disabled={saving.coll} className="mt-5 rounded-none bg-accent text-black hover:bg-gold-hover uppercase tracking-[0.15em] text-xs">
          {saving.coll ? "Saving..." : "Save series"}
        </Button>
      </Card>
    </div>
  );
}

function MessagesTab() {
  const [msgs, setMsgs] = useState([]);
  useEffect(() => { getMessages().then(setMsgs).catch(() => {}); }, []);
  return (
    <div className="space-y-4" data-testid="admin-messages">
      {msgs.length === 0 ? (
        <p className="text-neutral-500">No messages yet.</p>
      ) : msgs.map((m) => (
        <Card key={m.id} className="bg-[#0A0A0A] border-white/10 p-5 rounded-none">
          <div className="flex justify-between items-baseline mb-2">
            <p className="text-white font-medium">{m.name} · <span className="text-accent text-sm">{m.email}</span></p>
            <span className="font-mono-accent text-xs text-neutral-500">{new Date(m.created_at).toLocaleDateString()}</span>
          </div>
          <p className="text-neutral-400">{m.message}</p>
        </Card>
      ))}
    </div>
  );
}

function RequestsTab() {
  const [reqs, setReqs] = useState([]);
  useEffect(() => { getPrintRequests().then(setReqs).catch(() => {}); }, []);
  return (
    <div className="space-y-4" data-testid="admin-requests">
      {reqs.length === 0 ? (
        <p className="text-neutral-500">No print or licensing requests yet.</p>
      ) : reqs.map((r) => (
        <Card key={r.id} className="bg-[#0A0A0A] border-white/10 p-5 rounded-none">
          <div className="flex justify-between items-baseline mb-2">
            <p className="text-white font-medium flex items-center gap-2">
              <Frame size={15} className="text-accent" />
              {r.name} · <span className="text-accent text-sm">{r.email}</span>
            </p>
            <span className="font-mono-accent text-xs text-neutral-500">{new Date(r.created_at).toLocaleDateString()}</span>
          </div>
          <p className="font-mono-accent text-[11px] uppercase tracking-[0.15em] text-neutral-400 mb-1">
            {r.purpose === "license" ? "License" : "Print"} · {r.photo_title || "General"}
          </p>
          {r.message && <p className="text-neutral-400">{r.message}</p>}
        </Card>
      ))}
    </div>
  );
}

export default function Admin() {
  const [authed, setAuthed] = useState(!!localStorage.getItem("admin_token"));
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("admin_token");
    setAuthed(false);
  };

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
            <Button onClick={() => navigate("/")} variant="ghost" className="text-neutral-400 rounded-none gap-2">
              <ArrowLeft size={16} /> Site
            </Button>
            <Button data-testid="admin-logout" onClick={logout} variant="ghost" className="text-neutral-400 rounded-none gap-2">
              <LogOut size={16} /> Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="photos">
          <TabsList className="bg-[#0A0A0A] border border-white/10 rounded-none mb-8">
            <TabsTrigger value="photos" data-testid="tab-photos" className="rounded-none data-[state=active]:bg-accent data-[state=active]:text-black uppercase tracking-wider text-xs">Photos</TabsTrigger>
            <TabsTrigger value="site" data-testid="tab-site" className="rounded-none data-[state=active]:bg-accent data-[state=active]:text-black uppercase tracking-wider text-xs">Branding</TabsTrigger>
            <TabsTrigger value="messages" data-testid="tab-messages" className="rounded-none data-[state=active]:bg-accent data-[state=active]:text-black uppercase tracking-wider text-xs">Messages</TabsTrigger>
            <TabsTrigger value="requests" data-testid="tab-requests" className="rounded-none data-[state=active]:bg-accent data-[state=active]:text-black uppercase tracking-wider text-xs">Prints</TabsTrigger>
          </TabsList>
          <TabsContent value="photos"><PhotosTab /></TabsContent>
          <TabsContent value="site"><SiteTab /></TabsContent>
          <TabsContent value="messages"><MessagesTab /></TabsContent>
          <TabsContent value="requests"><RequestsTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
