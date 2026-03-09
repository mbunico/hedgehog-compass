from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import httpx
import time
from mangum import Mangum

app = FastAPI(title="Autism Centers – OSM Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://hedgehog-compass.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── In-memory TTL cache ─────────────────────────────────────────────────────
# Structure: { "TX": { "data": [...], "expires_at": 1234567890.0 } }
_cache: Dict[str, Dict[str, Any]] = {}
CACHE_TTL_SECONDS = 60 * 30  # 30 minutes


def cache_get(state: str) -> Optional[List[dict]]:
    entry = _cache.get(state)
    if entry and time.time() < entry["expires_at"]:
        return entry["data"]
    return None


def cache_set(state: str, data: List[dict]) -> None:
    _cache[state] = {
        "data": data,
        "expires_at": time.time() + CACHE_TTL_SECONDS,
    }


# ─── Models ──────────────────────────────────────────────────────────────────
class Center(BaseModel):
    id: str
    name: str
    city: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    zip_code: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    email: Optional[str] = None
    description: Optional[str] = None
    opening_hours: Optional[str] = None
    services: List[str] = []
    waitlist_time: Optional[str] = None
    verified: bool = False
    rating: Optional[float] = None


# ─── Overpass query ───────────────────────────────────────────────────────────
OVERPASS_URL = "https://overpass-api.de/api/interpreter"

# Healthcare specialities that are relevant to autism / behavioral support
RELEVANT_SPECIALITIES = (
    "autism|aba|behavioral|behavior|behavioral_health_services"
    "|mental_health_center|psychotherapist|child_psychiatry"
    "|child_therapist|occupational_therapy|speech_therapy"
)


def build_overpass_query(state_code: str) -> str:
    """
    Queries nodes, ways, and relations inside the US state area whose
    healthcare:speciality matches our autism/behavioral-health keywords.
    `out center tags` returns the centroid for ways/relations so we always
    have a single lat/lon to work with.
    """
    return f"""
    [out:json][timeout:180];
    area["ISO3166-2"="US-{state_code}"][admin_level=4];
    (
        node(area)["healthcare:speciality"~"{RELEVANT_SPECIALITIES}",i];
        way(area)["healthcare:speciality"~"{RELEVANT_SPECIALITIES}",i];
        rel(area)["healthcare:speciality"~"{RELEVANT_SPECIALITIES}",i];
    );
    out center tags;
    """


# ─── Service inference from OSM tags ─────────────────────────────────────────
def infer_services(name: str, tags: dict) -> List[str]:
    services: List[str] = []
    speciality = tags.get("healthcare:speciality", "").lower()
    name_lower = name.lower()

    mapping = {
        "autism":              "Autism Services",
        "aba":                 "ABA Therapy",
        "behavior":            "Behavioral Health",
        "speech":              "Speech Therapy",
        "occupational":        "Occupational Therapy",
        "psychotherapist":     "Psychotherapy",
        "psychiatry":          "Psychiatry",
        "mental_health":       "Mental Health",
        "child_therapist":     "Child Therapy",
        "child_psychiatry":    "Child Psychiatry",
        "counselling":         "Counseling",
        "counseling":          "Counseling",
    }

    seen: set = set()
    for keyword, label in mapping.items():
        if keyword in speciality or keyword in name_lower:
            if label not in seen:
                services.append(label)
                seen.add(label)

    return services


# ─── OSM element → Center ─────────────────────────────────────────────────────
def parse_element(el: dict, state_code: str) -> Optional[dict]:
    tags = el.get("tags", {})
    name = tags.get("name", "").strip()
    if not name:
        return None  # skip unnamed entries

    el_type = el.get("type", "node")
    el_id   = el.get("id")

    # Coordinates: nodes have top-level lat/lon;
    # ways & relations carry a `center` object after `out center tags`
    if el_type == "node":
        lat = el.get("lat")
        lon = el.get("lon")
    else:
        center_obj = el.get("center", {})
        lat = center_obj.get("lat")
        lon = center_obj.get("lon")

    if lat is None or lon is None:
        return None

    # Build a human-readable address from OSM addr:* tags
    parts = [
        tags.get("addr:housenumber", ""),
        tags.get("addr:street", tags.get("addr:full", "")),
        tags.get("addr:unit", ""),
    ]
    address = " ".join(p for p in parts if p).strip() or None

    phone = (
        tags.get("phone")
        or tags.get("contact:phone")
        or tags.get("phone:tollfree")
    )
    website = tags.get("website") or tags.get("contact:website")
    email   = tags.get("email")   or tags.get("contact:email")

    services = infer_services(name, tags)

    center = Center(
        id           = f"osm-{el_type}-{el_id}",
        name         = name,
        city         = tags.get("addr:city"),
        state        = tags.get("addr:state") or state_code,
        latitude     = lat,
        longitude    = lon,
        address      = address,
        zip_code     = tags.get("addr:postcode"),
        phone        = phone,
        website      = website,
        email        = email,
        description  = tags.get("description"),
        opening_hours= tags.get("opening_hours"),
        services     = services,
        verified     = False,
    )

    return center.model_dump(exclude_none=True)


# ─── Endpoint ─────────────────────────────────────────────────────────────────
@app.get("/api/centers")
async def get_centers(
    state: str = Query(
        ...,
        min_length=2,
        max_length=2,
        description="Two-letter US state code, e.g. TX, CA, FL",
    )
):
    state = state.upper()

    # ── 1. Check cache ────────────────────────────────────────────────────────
    cached = cache_get(state)
    if cached is not None:
        return {
            "state":   state,
            "count":   len(cached),
            "cached":  True,
            "centers": cached,
        }

    # ── 2. Fetch from Overpass ────────────────────────────────────────────────
    query = build_overpass_query(state)
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                OVERPASS_URL,
                data={"data": query},         # Overpass expects form field "data"
                headers={"User-Agent": "AutismCentersApp/1.0"},
                timeout=60,
            )
            resp.raise_for_status()
            osm_data = resp.json()
        except httpx.TimeoutException:
            raise HTTPException(504, "Overpass API timed out. Please try again.")
        except Exception as e:
            raise HTTPException(503, f"Overpass API error: {str(e)}")

    elements = osm_data.get("elements", [])

    # ── 3. Parse elements ─────────────────────────────────────────────────────
    centers: List[dict] = []
    seen_ids: set = set()

    for el in elements:
        parsed = parse_element(el, state)
        if parsed and parsed["id"] not in seen_ids:
            centers.append(parsed)
            seen_ids.add(parsed["id"])

    # ── 4. Store in cache ─────────────────────────────────────────────────────
    if centers:
        cache_set(state, centers)

    return {
        "state":   state,
        "count":   len(centers),
        "cached":  False,
        "centers": centers,
    }


# ─── Cache management endpoints (optional, handy for dev) ────────────────────
@app.delete("/cache/{state}")
async def clear_state_cache(state: str):
    state = state.upper()
    removed = state in _cache
    _cache.pop(state, None)
    return {"state": state, "cleared": removed}


@app.delete("/cache")
async def clear_all_cache():
    count = len(_cache)
    _cache.clear()
    return {"cleared_states": count}


@app.get("/cache/status")
async def cache_status():
    now = time.time()
    return {
        s: {
            "count":      len(v["data"]),
            "expires_in": max(0, round(v["expires_at"] - now)),
        }
        for s, v in _cache.items()
    }

handler = Mangum(app)