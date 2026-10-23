from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import UpdateOne
import os
import time
import asyncio
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

import cloudinary
import cloudinary.utils
import cloudinary.uploader
import resend


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from local_db import LocalDatabase

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'mihir_wildlife')
client = None

local_db_instance = LocalDatabase(ROOT_DIR / "data_local.json")

class DatabaseProxy:
    def __init__(self):
        self._db = None

    def set_db(self, real_db):
        self._db = real_db

    def __getitem__(self, name: str):
        return self._db[name]

    def __getattr__(self, name: str):
        return getattr(self._db, name)

db = DatabaseProxy()
db.set_db(local_db_instance)

ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'Mihir@282878')

# Resend config
resend.api_key = os.environ.get('RESEND_API_KEY')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
OWNER_EMAIL = os.environ.get('OWNER_EMAIL')


async def send_owner_email(subject: str, html: str):
    if not resend.api_key or not OWNER_EMAIL:
        logging.warning("Resend not configured; skipping email")
        return
    try:
        params = {"from": SENDER_EMAIL, "to": [OWNER_EMAIL], "subject": subject, "html": html}
        await asyncio.to_thread(resend.Emails.send, params)
    except Exception as e:
        logging.error(f"Failed to send email: {e}")

# Cloudinary config
cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
    api_key=os.environ.get('CLOUDINARY_API_KEY'),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET'),
    secure=True,
)

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ---------------- Auth helper ----------------
async def require_admin(authorization: Optional[str] = Header(None)):
    token = None
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization[7:]
    if not ADMIN_PASSWORD or token != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True


# ---------------- Models ----------------
def now_iso():
    return datetime.now(timezone.utc).isoformat()


class Photo(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    title_gu: Optional[str] = None
    category: str = "Wildlife"
    location: Optional[str] = None
    collection: Optional[str] = None
    story: Optional[str] = None
    camera: Optional[str] = None
    lens: Optional[str] = None
    settings: Optional[str] = None
    image_url: str
    public_id: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    featured: bool = False
    order: int = 0
    created_at: str = Field(default_factory=now_iso)


class PhotoCreate(BaseModel):
    title: str
    title_gu: Optional[str] = None
    category: str = "Wildlife"
    location: Optional[str] = None
    collection: Optional[str] = None
    story: Optional[str] = None
    camera: Optional[str] = None
    lens: Optional[str] = None
    settings: Optional[str] = None
    image_url: str
    public_id: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    featured: bool = False
    order: int = 0


class ReorderInput(BaseModel):
    ids: List[str]


class PrintRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    photo_id: Optional[str] = None
    photo_title: Optional[str] = None
    name: str
    email: str
    purpose: str = "print"  # print | license
    print_size: Optional[str] = None
    print_price: Optional[str] = None
    message: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)


class PrintRequestCreate(BaseModel):
    photo_id: Optional[str] = None
    photo_title: Optional[str] = None
    name: str
    email: str
    purpose: str = "print"
    print_size: Optional[str] = None
    print_price: Optional[str] = None
    message: Optional[str] = None


DEFAULT_PRINT_OPTIONS = [
    {"size": "A4 · 210×297mm", "price": "2,500"},
    {"size": "A3 · 297×420mm", "price": "4,500"},
    {"size": "A2 · 420×594mm", "price": "7,500"},
    {"size": "A1 · 594×841mm (Museum)", "price": "12,000"},
]

DEFAULT_COLLECTIONS = {
    "Big Cats of Gir": {
        "cover_public_id": "lion_pride_3_jwn89m",
        "caption": "The last refuge of the Asiatic lion and the elusive leopard — Gir's great predators, watched with patience and quiet respect.",
    },
    "Raptors & Owls": {
        "cover_public_id": "070A1006_ncv8gi",
        "caption": "Eyes of the forest. The hunters that rule Gujarat's open skies and its shadowed, tangled canopies.",
    },
    "Wetlands of Junagadh": {
        "cover_public_id": "lion_pride_13_q5bwgp",
        "caption": "Where water meets the city — flamingos, kingfishers and waders that turn Junagadh's wetlands into a living theatre.",
    },
    "Songbirds of Gujarat": {
        "cover_public_id": "lion_pride_7_tphqdl",
        "caption": "The smaller voices of the wild — larks, pittas and flycatchers, each a splash of colour in the scrub and forest edge.",
    },
    "After Dark": {
        "cover_public_id": "lion_pride_1_vjwkfm",
        "caption": "When the forest sleeps, the sky wakes. Long nights spent under some of Gujarat's darkest, star-flooded skies.",
    },
    "Reptiles": {
        "cover_public_id": "",
        "caption": "The cold-blooded and the misunderstood — snakes, lizards and the reptiles that keep the ecosystem in balance.",
    },
}


class SiteSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "site"
    logo_url: Optional[str] = "https://res.cloudinary.com/uq0zgy3i/image/upload/Brown_2_bsk3ns.png"
    logo_public_id: Optional[str] = "Brown_2_bsk3ns"
    hero_image_url: str = "https://res.cloudinary.com/uq0zgy3i/image/upload/q_auto,f_auto,w_2200/lion_pride_9_de9akv.jpg"
    hero_public_id: Optional[str] = "lion_pride_9_de9akv"
    about_image_url: str = "https://customer-assets.emergentagent.com/job_ffe20947-a722-4c4e-91fc-0363cc8eaee7/artifacts/0d85h6jz_about%20Photo.jpg"
    about_public_id: Optional[str] = None
    contact_email: str = "mihirwildlife@gmail.com"
    instagram: str = ""
    currency: str = "INR"
    print_options: List[dict] = Field(default_factory=lambda: [dict(o) for o in DEFAULT_PRINT_OPTIONS])
    collections: dict = Field(default_factory=lambda: {k: dict(v) for k, v in DEFAULT_COLLECTIONS.items()})


class SiteUpdate(BaseModel):
    logo_url: Optional[str] = None
    logo_public_id: Optional[str] = None
    hero_image_url: Optional[str] = None
    hero_public_id: Optional[str] = None
    about_image_url: Optional[str] = None
    about_public_id: Optional[str] = None
    contact_email: Optional[str] = None
    instagram: Optional[str] = None
    currency: Optional[str] = None
    print_options: Optional[List[dict]] = None
    collections: Optional[dict] = None


class ContactMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    message: str
    created_at: str = Field(default_factory=now_iso)


class ContactCreate(BaseModel):
    name: str
    email: str
    message: str


class LoginInput(BaseModel):
    password: str


# ---------------- Routes ----------------
@api_router.get("/")
async def root():
    return {"message": "Mihirkumar Ranva Wildlife Portfolio API"}


@api_router.post("/admin/login")
async def admin_login(body: LoginInput):
    if not ADMIN_PASSWORD or body.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid password")
    return {"token": ADMIN_PASSWORD}


# ---- Cloudinary signature (admin only) ----
@api_router.get("/cloudinary/signature")
async def cloudinary_signature(
    folder: str = Query("portfolio/photos"),
    _: bool = Depends(require_admin),
):
    ALLOWED = ("portfolio/",)
    if not folder.startswith(ALLOWED):
        raise HTTPException(status_code=400, detail="Invalid folder path")
    timestamp = int(time.time())
    params = {"timestamp": timestamp, "folder": folder}
    signature = cloudinary.utils.api_sign_request(
        params, os.environ.get('CLOUDINARY_API_SECRET')
    )
    return {
        "signature": signature,
        "timestamp": timestamp,
        "cloud_name": os.environ.get('CLOUDINARY_CLOUD_NAME'),
        "api_key": os.environ.get('CLOUDINARY_API_KEY'),
        "folder": folder,
    }


# ---- Photos ----
@api_router.get("/photos", response_model=List[Photo])
async def list_photos(category: Optional[str] = None):
    q = {}
    if category and category.lower() != "all":
        q["category"] = category
    docs = await db.photos.find(q, {"_id": 0}).sort("order", 1).to_list(1000)
    return [Photo(**d) for d in docs]


@api_router.post("/photos", response_model=Photo)
async def create_photo(body: PhotoCreate, _: bool = Depends(require_admin)):
    photo = Photo(**body.model_dump())
    await db.photos.insert_one(photo.model_dump())
    return photo


@api_router.put("/photos/reorder")
async def reorder_photos(body: ReorderInput, _: bool = Depends(require_admin)):
    if not body.ids:
        return {"success": True}
    ops = [UpdateOne({"id": pid}, {"$set": {"order": idx}}) for idx, pid in enumerate(body.ids)]
    await db.photos.bulk_write(ops)
    return {"success": True}


@api_router.put("/photos/{photo_id}", response_model=Photo)
async def update_photo(photo_id: str, body: PhotoCreate, _: bool = Depends(require_admin)):
    existing = await db.photos.find_one({"id": photo_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Photo not found")
    updated = {**existing, **body.model_dump()}
    await db.photos.update_one({"id": photo_id}, {"$set": updated})
    return Photo(**updated)


@api_router.delete("/photos/{photo_id}")
async def delete_photo(photo_id: str, _: bool = Depends(require_admin)):
    doc = await db.photos.find_one({"id": photo_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Photo not found")
    if doc.get("public_id"):
        try:
            cloudinary.uploader.destroy(doc["public_id"], invalidate=True)
        except Exception as e:
            logging.warning(f"Cloudinary destroy failed: {e}")
    await db.photos.delete_one({"id": photo_id})
    return {"success": True}


@api_router.get("/photos/{photo_id}/share-card")
async def photo_share_card(photo_id: str):
    doc = await db.photos.find_one({"id": photo_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Photo not found")
    if not doc.get("public_id"):
        return {"url": doc.get("image_url")}
    title = doc.get("title") or "Wildlife"
    subtitle = "MIHIR RANVA PHOTOGRAPHY"
    transformation = [
        {"width": 1200, "height": 1200, "crop": "fill", "gravity": "auto"},
        {"effect": "brightness:-28"},
        {"overlay": "Brown_2_bsk3ns", "width": 0.20, "flags": "relative",
         "gravity": "north_west", "x": 55, "y": 50, "opacity": 92},
        {"overlay": {"font_family": "Georgia", "font_size": 42, "text": title},
         "color": "white", "gravity": "south_west", "x": 60, "y": 150, "width": 1040, "crop": "fit"},
        {"overlay": {"font_family": "Arial", "font_size": 26, "letter_spacing": 6, "text": subtitle},
         "color": "#C9A25E", "gravity": "south_west", "x": 62, "y": 90},
    ]
    url = cloudinary.CloudinaryImage(doc["public_id"]).build_url(
        transformation=transformation, secure=True, format="jpg")
    return {"url": url}


# ---- Site settings ----
@api_router.get("/site", response_model=SiteSettings)
async def get_site():
    doc = await db.site_settings.find_one({"id": "site"}, {"_id": 0})
    if not doc:
        default = SiteSettings()
        await db.site_settings.insert_one(default.model_dump())
        return default
    return SiteSettings(**doc)


@api_router.put("/site", response_model=SiteSettings)
async def update_site(body: SiteUpdate, _: bool = Depends(require_admin)):
    doc = await db.site_settings.find_one({"id": "site"}, {"_id": 0})
    if not doc:
        doc = SiteSettings().model_dump()
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    doc.update(updates)
    await db.site_settings.update_one({"id": "site"}, {"$set": doc}, upsert=True)
    return SiteSettings(**doc)


# ---- Contact ----
@api_router.post("/contact", response_model=ContactMessage)
async def create_contact(body: ContactCreate):
    msg = ContactMessage(**body.model_dump())
    await db.contact_messages.insert_one(msg.model_dump())
    html = f"""
    <h2 style='font-family:sans-serif'>New contact enquiry</h2>
    <p style='font-family:sans-serif'><strong>Name:</strong> {msg.name}<br/>
    <strong>Email:</strong> {msg.email}</p>
    <p style='font-family:sans-serif'><strong>Message:</strong><br/>{msg.message}</p>
    """
    await send_owner_email(f"New enquiry from {msg.name}", html)
    return msg


@api_router.get("/contact", response_model=List[ContactMessage])
async def list_contact(_: bool = Depends(require_admin)):
    docs = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [ContactMessage(**d) for d in docs]


# ---- Print / License requests ----
@api_router.post("/print-requests", response_model=PrintRequest)
async def create_print_request(body: PrintRequestCreate):
    req = PrintRequest(**body.model_dump())
    await db.print_requests.insert_one(req.model_dump())
    label = "Print" if req.purpose == "print" else "License"
    html = f"""
    <h2 style='font-family:sans-serif'>New {label} request</h2>
    <p style='font-family:sans-serif'><strong>Image:</strong> {req.photo_title or 'General enquiry'}<br/>
    <strong>Type:</strong> {label}<br/>
    <strong>Size:</strong> {req.print_size or '-'}<br/>
    <strong>Price:</strong> {req.print_price or '-'}<br/>
    <strong>Name:</strong> {req.name}<br/>
    <strong>Email:</strong> {req.email}</p>
    <p style='font-family:sans-serif'><strong>Message:</strong><br/>{req.message or '-'}</p>
    """
    await send_owner_email(f"{label} request · {req.photo_title or 'General'}", html)
    return req


@api_router.get("/print-requests", response_model=List[PrintRequest])
async def list_print_requests(_: bool = Depends(require_admin)):
    docs = await db.print_requests.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [PrintRequest(**d) for d in docs]


# ---------------- Startup seed ----------------
BASE_CDN = "https://res.cloudinary.com/uq0zgy3i/image/upload/q_auto,f_auto,w_1600/"
SEED_PHOTOS = [
    {"title": "The Leopard's Gaze", "category": "Wildlife", "location": "Gir Forest", "collection": "Big Cats of Gir",
     "story": "An Indian leopard holds a long, unhurried stare in the dappled Gir light.",
     "camera": "Canon EOS 7D", "lens": "300mm f/2.8", "settings": "f/3.5 · 1/500s · ISO 640", "public_id": "lion_pride_3_jwn89m", "featured": True, "order": 1},
    {"title": "Asiatic Lion Cubs", "category": "Wildlife", "location": "Gir Forest", "collection": "Big Cats of Gir",
     "story": "Two Asiatic lion cubs rest by the water's edge, the future of Gir in their eyes.",
     "camera": "Canon EOS 7D", "lens": "300mm f/2.8", "settings": "f/4 · 1/640s · ISO 400", "public_id": "two_cub_htqku2", "featured": True, "order": 2},
    {"title": "Cub in the Clearing", "category": "Wildlife", "location": "Gir Forest", "collection": "Big Cats of Gir",
     "story": "A lone cub tests the open ground, still learning the rhythms of the forest.",
     "camera": "Canon EOS 7D", "lens": "400mm", "settings": "f/5 · 1/800s · ISO 500", "public_id": "lion_pride_4_rx1yai", "order": 3},
    {"title": "Short-toed Snake Eagle", "category": "Birds", "location": "Gir National Park", "collection": "Raptors & Owls",
     "story": "A short-toed snake eagle scans the scrub, a specialist hunter of reptiles.",
     "camera": "Canon EOS 7D", "lens": "600mm", "settings": "f/6.3 · 1/1250s · ISO 500", "public_id": "070A1006_ncv8gi", "featured": True, "order": 4},
    {"title": "Black-winged Kite", "category": "Birds", "location": "Grasslands", "collection": "Raptors & Owls",
     "story": "A black-winged kite perches with ruby-red eyes above the open grassland.",
     "camera": "Canon EOS 7D", "lens": "600mm", "settings": "f/7.1 · 1/1600s · ISO 400", "public_id": "lion_pride_6_vjdoru", "order": 5},
    {"title": "Shikra", "category": "Birds", "location": "Gir Forest", "collection": "Raptors & Owls",
     "story": "A shikra waits in the canopy, the forest's swift and silent ambush hunter.",
     "camera": "Canon EOS 7D", "lens": "400mm", "settings": "f/5.6 · 1/800s · ISO 800", "public_id": "lion_pride_11_thewug", "order": 6},
    {"title": "Mottled Wood Owls", "category": "Birds", "location": "Gir Forest", "collection": "Raptors & Owls",
     "story": "Three mottled wood owls roost shoulder to shoulder, hidden in plain sight.",
     "camera": "Canon EOS 7D", "lens": "300mm f/2.8", "settings": "f/4 · 1/320s · ISO 1000", "public_id": "lion_pride_5_nlsjxb", "order": 7},
    {"title": "Spotted Owlet", "category": "Birds", "location": "Junagadh", "collection": "Raptors & Owls",
     "story": "A spotted owlet peers out from its tree hollow at the fading afternoon.",
     "camera": "Canon EOS 7D", "lens": "400mm", "settings": "f/5.6 · 1/250s · ISO 1250", "public_id": "lion_pride_14_v0g3tn", "order": 8},
    {"title": "White-breasted Kingfisher with a Kill", "category": "Behavior", "location": "Junagadh Wetland", "collection": "Wetlands of Junagadh",
     "story": "A white-breasted kingfisher returns to its perch with a hard-won catch.",
     "camera": "Canon EOS 7D", "lens": "150-600mm", "settings": "f/6.3 · 1/1600s · ISO 800", "public_id": "Hunter_s_Prize_thfbx8", "featured": True, "order": 9},
    {"title": "White-breasted Waterhen", "category": "Behavior", "location": "Junagadh Wetland", "collection": "Wetlands of Junagadh",
     "story": "A white-breasted waterhen mirrors itself in the still wetland shallows.",
     "camera": "Canon EOS 7D", "lens": "150-600mm", "settings": "f/6.3 · 1/1000s · ISO 640", "public_id": "070A6895_2_kpd1iw", "order": 10},
    {"title": "Lesser Flamingos & the Skyline", "category": "Ecosystems", "location": "Coastal Wetland", "collection": "Wetlands of Junagadh",
     "story": "A march of lesser flamingos against a distant city — where wild and urban meet.",
     "camera": "Canon EOS 7D", "lens": "150-600mm", "settings": "f/8 · 1/1250s · ISO 320", "public_id": "lion_pride_13_q5bwgp", "featured": True, "order": 11},
    {"title": "Ashy-crowned Sparrow Lark", "category": "Birds", "location": "Grasslands", "collection": "Songbirds of Gujarat",
     "story": "An ashy-crowned sparrow lark stands proud on a sun-baked rock.",
     "camera": "Canon EOS 7D", "lens": "600mm", "settings": "f/7.1 · 1/1000s · ISO 400", "public_id": "IMG_1700_ibou9f", "order": 12},
    {"title": "Indian Pitta", "category": "Birds", "location": "Forest Edge", "collection": "Songbirds of Gujarat",
     "story": "The jewel-toned Indian pitta, a monsoon visitor to Gujarat's forest floor.",
     "camera": "Canon EOS 7D", "lens": "400mm", "settings": "f/5.6 · 1/400s · ISO 1600", "public_id": "lion_pride_7_tphqdl", "order": 12.5},
    {"title": "Taiga Flycatcher", "category": "Birds", "location": "Forest Edge", "collection": "Songbirds of Gujarat",
     "story": "A taiga flycatcher pauses on a bare twig between darting sallies for insects.",
     "camera": "Canon EOS 7D", "lens": "400mm", "settings": "f/5.6 · 1/500s · ISO 1250", "public_id": "tiny_bird_c9bg5h", "order": 13},
    {"title": "Milky Way over the Wild", "category": "Ecosystems", "location": "Night Sky", "collection": "After Dark",
     "story": "The galactic core rises over silent treetops on a moonless Gujarat night.",
     "camera": "Canon EOS 7D", "lens": "16-35mm", "settings": "f/2.8 · 20s · ISO 3200", "public_id": "lion_pride_1_vjwkfm", "order": 14},
    {"title": "Oriental Magpie Robin at Sunset", "category": "Behavior", "location": "Dusk, Junagadh", "collection": "After Dark",
     "story": "An oriental magpie robin sings its last notes, framed against a burning sun.",
     "camera": "Canon EOS 7D", "lens": "150-600mm", "settings": "f/8 · 1/800s · ISO 250", "public_id": "lion_pride_10_vt03vf", "order": 15},
]
GU_NAMES = {
    "lion_pride_3_jwn89m": "દીપડો",
    "two_cub_htqku2": "એશિયાઈ સિંહનાં બચ્ચાં",
    "lion_pride_4_rx1yai": "સિંહનું બચ્ચું",
    "070A1006_ncv8gi": "સાપમાર ગરુડ",
    "lion_pride_6_vjdoru": "કાળા-પાંખવાળો ચીલ",
    "lion_pride_11_thewug": "શિકરો",
    "lion_pride_5_nlsjxb": "વન ઘુવડ",
    "lion_pride_14_v0g3tn": "ટપકાંવાળી ચિબરી",
    "Hunter_s_Prize_thfbx8": "ધોળી છાતીનો કલકલિયો",
    "070A6895_2_kpd1iw": "સફેદ છાતીની જળમુરઘી",
    "lion_pride_13_q5bwgp": "નાનો સુરખાબ",
    "IMG_1700_ibou9f": "ચંડૂલ",
    "lion_pride_7_tphqdl": "નવરંગ",
    "tiny_bird_c9bg5h": "તાઈગા માખીમાર",
    "lion_pride_1_vjwkfm": "આકાશગંગા",
    "lion_pride_10_vt03vf": "દૈયડ",
}
for _i, _p in enumerate(SEED_PHOTOS):
    _p["image_url"] = BASE_CDN + _p["public_id"] + ".jpg"
    _p["order"] = _i + 1
    _p["title_gu"] = GU_NAMES.get(_p["public_id"])


@app.on_event("startup")
async def seed_data():
    global client
    if mongo_url:
        try:
            motor_client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=1500)
            await motor_client.admin.command('ping')
            client = motor_client
            db.set_db(client[db_name])
            logging.info("Connected to MongoDB successfully.")
        except Exception as e:
            logging.warning(f"MongoDB not reachable ({e}). Using local file database.")
            db.set_db(local_db_instance)
    else:
        db.set_db(local_db_instance)

    site = await db.site_settings.find_one({"id": "site"})
    if not site:
        await db.site_settings.insert_one(SiteSettings().model_dump())
        site = {}
    # One-time, idempotent seed: only runs once (guarded by flag) and never
    # inserts a photo whose public_id already exists (bulk insert, no N+1).
    if not site.get("photos_seeded"):
        existing_pids = set(await db.photos.distinct("public_id"))
        to_insert = [Photo(**p).model_dump() for p in SEED_PHOTOS
                     if p["public_id"] not in existing_pids]
        if to_insert:
            await db.photos.insert_many(to_insert)
            logging.info(f"Seeded {len(to_insert)} photos")
        await db.site_settings.update_one(
            {"id": "site"}, {"$set": {"photos_seeded": True}}, upsert=True)


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    if client:
        client.close()
