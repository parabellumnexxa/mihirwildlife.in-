"""Backend API tests for Mihirkumar Ranva wildlife portfolio."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://mihir-wildlife.preview.emergentagent.com").rstrip("/")
ADMIN_PASSWORD = "Mihir@282878"

EXPECTED_COLLECTIONS = {
    "Big Cats of Gir": 3,
    "Raptors & Owls": 5,
    "Wetlands of Junagadh": 3,
    "Songbirds of Gujarat": 3,
    "After Dark": 2,
}

EXPECTED_TITLES = [
    "White-breasted Kingfisher with a Kill",
    "Short-toed Snake Eagle",
    "Ashy-crowned Sparrow Lark",
    "Taiga Flycatcher",
    "Oriental Magpie Robin at Sunset",
    "Mottled Wood Owls",
    "Lesser Flamingos & the Skyline",
]


@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# ---------- Photos ----------
class TestPhotos:
    def test_list_photos_16(self):
        r = requests.get(f"{BASE_URL}/api/photos")
        assert r.status_code == 200
        photos = r.json()
        assert len(photos) == 16, f"Expected 16 photos, got {len(photos)}"

    def test_no_duplicate_images(self):
        photos = requests.get(f"{BASE_URL}/api/photos").json()
        public_ids = [p.get("public_id") for p in photos]
        assert len(public_ids) == len(set(public_ids)), f"Duplicate public_ids found: {public_ids}"
        image_urls = [p.get("image_url") for p in photos]
        assert len(image_urls) == len(set(image_urls)), "Duplicate image_urls found"

    def test_all_photos_have_collection(self):
        photos = requests.get(f"{BASE_URL}/api/photos").json()
        no_coll = [p["title"] for p in photos if not p.get("collection")]
        assert not no_coll, f"Photos without collection: {no_coll}"

    def test_collection_counts(self):
        photos = requests.get(f"{BASE_URL}/api/photos").json()
        counts = {}
        for p in photos:
            counts[p["collection"]] = counts.get(p["collection"], 0) + 1
        for name, expected in EXPECTED_COLLECTIONS.items():
            assert counts.get(name) == expected, f"{name}: expected {expected}, got {counts.get(name)}"

    def test_expected_species_titles(self):
        photos = requests.get(f"{BASE_URL}/api/photos").json()
        titles = {p["title"] for p in photos}
        missing = [t for t in EXPECTED_TITLES if t not in titles]
        assert not missing, f"Missing species titles: {missing}"

    def test_every_photo_has_story(self):
        photos = requests.get(f"{BASE_URL}/api/photos").json()
        no_story = [p["title"] for p in photos if not p.get("story")]
        assert not no_story, f"Photos without story: {no_story}"

    def test_every_photo_has_title_gu(self):
        photos = requests.get(f"{BASE_URL}/api/photos").json()
        missing = [p["title"] for p in photos if not p.get("title_gu")]
        assert not missing, f"Photos missing title_gu: {missing}"
        # Verify it's non-ASCII (Gujarati)
        for p in photos:
            assert any(ord(c) > 127 for c in p["title_gu"]), f"title_gu not Gujarati for {p['title']}: {p['title_gu']}"


# ---------- Share card ----------
class TestShareCard:
    def test_share_card_returns_cloudinary_url(self):
        photos = requests.get(f"{BASE_URL}/api/photos").json()
        # Test at least 2 photos
        for target in photos[:2]:
            r = requests.get(f"{BASE_URL}/api/photos/{target['id']}/share-card")
            assert r.status_code == 200, r.text
            data = r.json()
            assert "url" in data
            url = data["url"]
            assert "res.cloudinary.com" in url, f"Not a Cloudinary URL: {url}"
            assert target["public_id"] in url, f"public_id {target['public_id']} not in URL: {url}"
            # Fetch the image
            img_r = requests.get(url, timeout=30)
            assert img_r.status_code == 200, f"Share card fetch failed: {img_r.status_code} {url}"
            ct = img_r.headers.get("content-type", "")
            assert ct.startswith("image/"), f"Not an image content-type: {ct}"

    def test_share_card_not_found(self):
        r = requests.get(f"{BASE_URL}/api/photos/nonexistent-id/share-card")
        assert r.status_code == 404


# ---------- Site ----------
class TestSite:
    def test_get_site(self):
        r = requests.get(f"{BASE_URL}/api/site")
        assert r.status_code == 200
        s = r.json()
        assert s.get("contact_email") == "mihirwildlife@gmail.com"
        assert "currency" in s
        assert isinstance(s.get("print_options"), list) and len(s["print_options"]) > 0
        colls = s.get("collections") or {}
        for name in EXPECTED_COLLECTIONS:
            assert name in colls, f"Missing collection in site.collections: {name}"


# ---------- Auth ----------
class TestAuth:
    def test_login_wrong(self):
        r = requests.post(f"{BASE_URL}/api/admin/login", json={"password": "wrong"})
        assert r.status_code == 401

    def test_login_ok(self, token):
        assert token == ADMIN_PASSWORD

    def test_update_photo_unauthorized(self):
        photos = requests.get(f"{BASE_URL}/api/photos").json()
        pid = photos[0]["id"]
        r = requests.put(f"{BASE_URL}/api/photos/{pid}", json={"title": "x", "image_url": "x"})
        assert r.status_code == 401


# ---------- Update flow ----------
class TestUpdatePhoto:
    def test_update_collection_and_story_persists(self, auth_headers):
        photos = requests.get(f"{BASE_URL}/api/photos").json()
        target = photos[0]
        orig = {k: target.get(k) for k in ["title", "title_gu", "category", "location", "collection", "story",
                                           "camera", "lens", "settings", "image_url", "public_id",
                                           "order", "featured"]}
        new_body = {**orig, "collection": "TEST_Reptiles", "story": "TEST story caption", "title_gu": "TEST_GU"}
        r = requests.put(f"{BASE_URL}/api/photos/{target['id']}", json=new_body, headers=auth_headers)
        assert r.status_code == 200, r.text
        updated = r.json()
        assert updated["collection"] == "TEST_Reptiles"
        assert updated["story"] == "TEST story caption"
        assert updated["title_gu"] == "TEST_GU"

        # Verify via GET
        g = requests.get(f"{BASE_URL}/api/photos").json()
        matched = next(p for p in g if p["id"] == target["id"])
        assert matched["collection"] == "TEST_Reptiles"
        assert matched["story"] == "TEST story caption"
        assert matched["title_gu"] == "TEST_GU"

        # Revert
        rr = requests.put(f"{BASE_URL}/api/photos/{target['id']}", json=orig, headers=auth_headers)
        assert rr.status_code == 200


# ---------- Site collections update ----------
class TestSiteCollections:
    def test_reptiles_collection_present(self):
        s = requests.get(f"{BASE_URL}/api/site").json()
        colls = s.get("collections") or {}
        assert "Reptiles" in colls, "Reptiles collection missing"
        assert colls["Reptiles"].get("caption"), "Reptiles has no caption"

    def test_add_and_remove_series(self, auth_headers):
        s = requests.get(f"{BASE_URL}/api/site").json()
        original = s.get("collections") or {}
        new_colls = {**original, "TEST_Reptiles": {"caption": "test", "cover_public_id": ""}}
        r = requests.put(f"{BASE_URL}/api/site", json={"collections": new_colls}, headers=auth_headers)
        assert r.status_code == 200, r.text
        assert "TEST_Reptiles" in r.json()["collections"]

        # Revert
        rr = requests.put(f"{BASE_URL}/api/site", json={"collections": original}, headers=auth_headers)
        assert rr.status_code == 200
        assert "TEST_Reptiles" not in rr.json()["collections"]
