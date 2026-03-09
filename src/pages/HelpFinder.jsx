import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  Star, Clock, Phone, ExternalLink, ChevronDown,
  Shield, RefreshCw, MapPin, Heart, X, Mail, AlarmClock
} from "lucide-react";

// ─── Leaflet icon fix ────────────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const createMarkerIcon = (color = "#6B8F71") =>
  L.divIcon({
    className: "",
    html: `<div style="width:36px;height:36px;background:${color};border-radius:50%;border:3px solid white;
           box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;
           justify-content:center;font-size:18px;cursor:pointer;">🦔</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

// ─── Constants ───────────────────────────────────────────────────────────────
const US_STATES = [
  "All States","AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN",
  "IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM",
  "NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

const SERVICES_LIST = [
  "All Services","ABA Therapy","Autism Services","Behavioral Health","Speech Therapy",
  "Occupational Therapy","Psychotherapy","Psychiatry","Child Therapy",
  "Child Psychiatry","Mental Health","Counseling","Addiction Treatment",
];

const STATE_COORDS = {
  AL:[32.8,-86.8], AK:[64.2,-153.4], AZ:[34.0,-111.0], AR:[34.8,-92.4], CA:[36.7,-119.4],
  CO:[38.9,-105.5], CT:[41.6,-72.7], DE:[38.9,-75.5], FL:[27.7,-81.5], GA:[32.7,-83.5],
  HI:[20.9,-157.0], ID:[44.1,-114.5], IL:[40.0,-89.0], IN:[39.8,-86.1], IA:[42.0,-93.2],
  KS:[38.5,-98.3], KY:[37.7,-84.9], LA:[31.2,-91.8], ME:[44.7,-69.4], MD:[39.0,-76.8],
  MA:[42.2,-71.8], MI:[44.3,-85.4], MN:[46.4,-93.1], MS:[32.7,-89.7], MO:[38.3,-92.4],
  MT:[47.0,-110.5], NE:[41.5,-99.9], NV:[38.8,-116.4], NH:[43.5,-71.6], NJ:[40.1,-74.5],
  NM:[34.5,-106.2], NY:[42.9,-75.5], NC:[35.5,-79.5], ND:[47.5,-100.5], OH:[40.4,-82.9],
  OK:[35.6,-96.9], OR:[44.6,-122.1], PA:[40.9,-77.8], RI:[41.7,-71.6], SC:[33.8,-80.9],
  SD:[44.4,-100.2], TN:[35.7,-86.3], TX:[31.0,-100.0], UT:[39.3,-111.1], VT:[44.0,-72.7],
  VA:[37.5,-78.9], WA:[47.5,-120.5], WV:[38.6,-80.5], WI:[44.3,-89.6], WY:[42.8,-107.3],
};

const STORAGE_KEY = "autism_centers_v2";
// @ts-ignore
// const API_BASE = import.meta.env.VITE_API_URL;

// ─── Map updater ─────────────────────────────────────────────────────────────
function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom || 7, { animate: true });
  }, [center, map, zoom]);
  return null;
}

// ─── Service badge colours ────────────────────────────────────────────────────
const SERVICE_COLORS = {
  "Autism Services":     "bg-purple-100 text-purple-800 border-purple-200",
  "ABA Therapy":         "bg-blue-100 text-blue-800 border-blue-200",
  "Behavioral Health":   "bg-teal-100 text-teal-800 border-teal-200",
  "Speech Therapy":      "bg-pink-100 text-pink-800 border-pink-200",
  "Occupational Therapy":"bg-orange-100 text-orange-800 border-orange-200",
  "Psychotherapy":       "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Psychiatry":          "bg-violet-100 text-violet-800 border-violet-200",
  "Child Therapy":       "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Child Psychiatry":    "bg-amber-100 text-amber-800 border-amber-200",
  "Mental Health":       "bg-cyan-100 text-cyan-800 border-cyan-200",
  "Counseling":          "bg-lime-100 text-lime-800 border-lime-200",
  "Addiction Treatment": "bg-rose-100 text-rose-800 border-rose-200",
};
const serviceBadge = (s) => SERVICE_COLORS[s] || "bg-gray-100 text-gray-700 border-gray-200";

// ─── Reusable service badge row ───────────────────────────────────────────────
const ServiceBadges = ({ services = [], max = 99 }) => (
  <div className="flex flex-wrap gap-1">
    {services.slice(0, max).map((s) => (
      <span key={s} className={`text-xs px-2 py-0.5 rounded-full border font-medium ${serviceBadge(s)}`}>{s}</span>
    ))}
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
export default function HelpFinder() {
  const [centers, setCenters]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState("");
  const [state, setState]           = useState("All States");
  const [service, setService]       = useState("All Services");
  const [selected, setSelected]     = useState(null);
  const [saved, setSaved]           = useState([]);
  const [mapCenter, setMapCenter]   = useState([39.5, -98.35]);
  const [mapZoom, setMapZoom]       = useState(4);
  const [activeTab, setActiveTab]   = useState("map");
  const [error, setError]           = useState("");
  const [lastCached, setLastCached] = useState(false);
  const [page, setPage]             = useState(1);
  const ITEMS_PER_PAGE              = 9;

  useEffect(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) setCenters(JSON.parse(raw)); } catch (_) {}
  }, []);

  useEffect(() => {
    if (centers.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(centers));
  }, [centers]);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchCenters = async () => {
    setError("");
    const stateCode = state === "All States" ? "" : state;
    if (!stateCode) { setError("Please select a specific state first."); return; }
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/centers?state=${stateCode}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server error ${res.status}`);
      }
      const data = await res.json();
      setLastCached(data.cached);

      if (!data.centers?.length) {
        setError(`No centers found in OpenStreetMap for ${stateCode}.`);
        return;
      }

      setCenters((prev) => {
        const existing = new Set(prev.map((c) => c.id));
        const fresh = data.centers.filter((c) => !existing.has(c.id));
        return [...prev, ...fresh];
      });

      if (STATE_COORDS[stateCode]) { setMapCenter(STATE_COORDS[stateCode]); setMapZoom(7); }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = centers.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !search
      || c.name?.toLowerCase().includes(q)
      || c.city?.toLowerCase().includes(q)
      || c.address?.toLowerCase().includes(q);
    const matchState   = state   === "All States"   || c.state   === state;
    const matchService = service === "All Services" || c.services?.includes(service);
    return matchSearch && matchState && matchService;
  });

  const mapCenters = filtered.filter((c) => c.latitude && c.longitude);
  const toggleSave = (id) => setSaved((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const clearCache = () => { localStorage.removeItem(STORAGE_KEY); setCenters([]); setSelected(null); };

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1); }, [search, state, service]);

  // Pagination derived values
  const totalPages  = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated   = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-[#FAFAF7]">

      {/* Header */}
      <div className="py-14 text-center" style={{ background: "linear-gradient(135deg,#E3F2FD,#E8F5E9)" }}>
        <div className="text-5xl mb-3">🗺️</div>
        <h1 className="text-4xl lg:text-5xl font-black text-[#2D3748] mb-3" style={{ fontFamily:"'Playfair Display',serif" }}>
          Find Autism Support Near You
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto px-6">
          Live data from OpenStreetMap — behavioral health, ABA therapy, autism services, and more.
        </p>
      </div>

      {/* Filter bar — z-[100] keeps it above normal page content */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-16 z-[100]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-3 flex-1">

            {/* Search */}
            {/* <div className="relative flex-1 min-w-[180px] max-w-xs">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Search name or city…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div> */}

            {/* State */}
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-8 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  const code = e.target.value;
                  if (code !== "All States" && STATE_COORDS[code]) { setMapCenter(STATE_COORDS[code]); setMapZoom(7); }
                }}
              >
                {US_STATES.map((o) => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Service */}
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-8 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                value={service}
                onChange={(e) => setService(e.target.value)}
              >
                {SERVICES_LIST.map((o) => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchCenters}
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-[#6B8F71] to-[#457B9D] text-white font-bold px-5 py-2.5 rounded-xl shadow hover:shadow-lg transition-all disabled:opacity-60 whitespace-nowrap"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Fetching…" : `Load ${state === "All States" ? "a State" : state}`}
            </button>
            {centers.length > 0 && (
              <button onClick={clearCache} className="flex items-center gap-1 border border-gray-200 text-gray-500 text-sm font-semibold px-3 py-2.5 rounded-xl hover:border-red-300 hover:text-red-500 transition-all whitespace-nowrap">
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="max-w-7xl mx-auto px-6 pb-3">
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-2.5 flex items-center justify-between">
              <span>⚠️ {error}</span>
              <button onClick={() => setError("")}><X className="w-4 h-4 text-red-400 hover:text-red-600" /></button>
            </div>
          </div>
        )}

        {lastCached && (
          <div className="max-w-7xl mx-auto px-6 pb-3">
            <div className="bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-xl px-4 py-2">
              ⚡ Served from server cache — refreshes every 30 minutes
            </div>
          </div>
        )}
      </div>

      {/* Tab toggle */}
      <div className="max-w-7xl mx-auto px-6 pt-6 flex gap-3 items-center">
        {["map", "list"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
              activeTab === t ? "bg-[#6B8F71] text-white shadow" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
            }`}
          >
            {t === "map" ? "🗺️ Map View" : "📋 List View"}
          </button>
        ))}
        <span className="text-sm text-gray-400 ml-2">{filtered.length} centers found</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* MAP VIEW */}
        {activeTab === "map" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/*
              isolation:isolate creates a new CSS stacking context —
              Leaflet's internal z-indices (400-800) are scoped inside
              and can never bleed above the sticky header or modal.
            */}
            <div
              className="lg:col-span-2 rounded-3xl overflow-hidden shadow-xl border border-gray-100"
              style={{ height: "600px", position: "relative", isolation: "isolate" }}
            >
              <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: "100%", width: "100%" }} zoomControl>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapUpdater center={mapCenter} zoom={mapZoom} />
                {mapCenters.map((c) => (
                  <Marker
                    key={c.id}
                    position={[c.latitude, c.longitude]}
                    icon={createMarkerIcon(selected?.id === c.id ? "#F4A261" : "#6B8F71")}
                    eventHandlers={{ click: () => setSelected(c) }}
                  >
                    <Popup>
                      <div className="text-sm font-bold">{c.name}</div>
                      <div className="text-xs text-gray-500">{c.city}{c.city && c.state ? ", " : ""}{c.state}</div>
                      {c.services?.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">{c.services.slice(0,2).join(" · ")}</div>
                      )}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            {/* Sidebar */}
            <div className="space-y-3 overflow-y-auto" style={{ maxHeight: "600px" }}>
              {filtered.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <div className="text-5xl mb-3">🗺️</div>
                  <p className="font-semibold">No centers loaded yet.</p>
                  <p className="text-sm mt-1">Select a state and click "Load".</p>
                </div>
              )}
              {filtered.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelected(c);
                    if (c.latitude && c.longitude) { setMapCenter([c.latitude, c.longitude]); setMapZoom(13); }
                  }}
                  className={`bg-white rounded-2xl border p-4 cursor-pointer transition-all ${
                    selected?.id === c.id ? "border-[#6B8F71] shadow-lg ring-2 ring-[#6B8F71]/20" : "border-gray-100 hover:border-gray-300 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-[#2D3748] text-sm leading-snug flex-1">{c.name}</h3>
                    {/* <button onClick={(e) => { e.stopPropagation(); toggleSave(c.id); }} className={`shrink-0 transition-colors ${saved.includes(c.id) ? "text-red-500" : "text-gray-300 hover:text-red-400"}`}>
                      <Heart className="w-4 h-4" fill={saved.includes(c.id) ? "currentColor" : "none"} />
                    </button> */}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3" />{c.city}{c.city && c.state ? ", " : ""}{c.state}
                  </div>
                  <ServiceBadges services={c.services} max={3} />
                  {c.opening_hours && (
                    <div className="mt-2 text-xs text-gray-400 flex items-center gap-1 truncate">
                      <AlarmClock className="w-3 h-3 shrink-0" />{c.opening_hours}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LIST VIEW */}
        {activeTab === "list" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.length === 0 && (
                <div className="col-span-3 text-center py-16 text-gray-400">
                  <div className="text-5xl mb-3">📋</div>
                  <p className="font-semibold">No centers loaded yet.</p>
                  <p className="text-sm mt-1">Select a state and click "Load".</p>
                </div>
              )}
              {paginated.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="h-2 bg-gradient-to-r from-[#6B8F71] to-[#457B9D]" />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[#2D3748] leading-snug mb-1">{c.name}</h3>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />{c.city}{c.city && c.state ? ", " : ""}{c.state}
                        </div>
                      </div>
                      {/* <button onClick={(e) => { e.stopPropagation(); toggleSave(c.id); }} className={`ml-2 shrink-0 ${saved.includes(c.id) ? "text-red-500" : "text-gray-300 hover:text-red-400"} transition-colors`}>
                        <Heart className="w-5 h-5" fill={saved.includes(c.id) ? "currentColor" : "none"} />
                      </button> */}
                    </div>

                    {c.description && (
                      <p className="text-xs text-gray-500 italic mb-3 line-clamp-2">{c.description}</p>
                    )}

                    <ServiceBadges services={c.services} max={4} />

                    <div className="mt-3 space-y-1 text-xs text-gray-500">
                      {c.phone && (
                        <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{c.phone}</div>
                      )}
                      {c.opening_hours && (
                        <div className="flex items-center gap-1.5"><AlarmClock className="w-3 h-3" />{c.opening_hours}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination controls */}
            {filtered.length > ITEMS_PER_PAGE && (
              <div className="mt-10 flex flex-col items-center gap-4">
                {/* Page info */}
                <p className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-semibold text-[#2D3748]">
                    {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)}
                  </span>{" "}
                  of <span className="font-semibold text-[#2D3748]">{filtered.length}</span> centers
                </p>

                {/* Button row */}
                <div className="flex items-center gap-1">
                  {/* Prev */}
                  <button
                    onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={page === 1}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold
                               hover:border-[#6B8F71] hover:text-[#6B8F71] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    ← Prev
                  </button>

                  {/* Page numbers */}
                  {(() => {
                    const pages = [];
                    const delta = 2; // pages on each side of current
                    const left  = Math.max(1, page - delta);
                    const right = Math.min(totalPages, page + delta);

                    if (left > 1) {
                      pages.push(1);
                      if (left > 2) pages.push("…");
                    }
                    for (let i = left; i <= right; i++) pages.push(i);
                    if (right < totalPages) {
                      if (right < totalPages - 1) pages.push("…");
                      pages.push(totalPages);
                    }

                    return pages.map((p, idx) =>
                      p === "…" ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 select-none">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                          className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                            p === page
                              ? "bg-[#6B8F71] text-white shadow"
                              : "border border-gray-200 text-gray-600 hover:border-[#6B8F71] hover:text-[#6B8F71]"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    );
                  })()}

                  {/* Next */}
                  <button
                    onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={page === totalPages}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold
                               hover:border-[#6B8F71] hover:text-[#6B8F71] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal — z-[9999] always above everything */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-3 bg-gradient-to-r from-[#6B8F71] to-[#457B9D] rounded-t-3xl" />
            <div className="p-8">

              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-black text-[#2D3748] leading-tight">{selected.name}</h2>
                  <p className="text-gray-500 mt-1 flex items-center gap-1 text-sm">
                    <MapPin className="w-4 h-4 shrink-0" />
                    {[selected.address, selected.city, selected.state, selected.zip_code].filter(Boolean).join(", ")}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  {/* <button
                    onClick={() => toggleSave(selected.id)}
                    className={`p-2 rounded-full border transition-all ${saved.includes(selected.id) ? "border-red-300 bg-red-50 text-red-500" : "border-gray-200 text-gray-400 hover:text-red-400"}`}
                  >
                    <Heart className="w-5 h-5" fill={saved.includes(selected.id) ? "currentColor" : "none"} />
                  </button> */}
                  <button onClick={() => setSelected(null)} className="p-2 rounded-full border border-gray-200 text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {selected.description && (
                <p className="text-gray-600 bg-green-50 rounded-2xl p-4 leading-relaxed mb-6 italic text-sm">
                  {selected.description}
                </p>
              )}

              {/* Info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {selected.phone && (
                  <div className="bg-green-50 rounded-xl p-3">
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Phone className="w-3 h-3" />Phone</div>
                    <div className="font-bold text-green-700 text-xs break-all">{selected.phone}</div>
                  </div>
                )}
                {selected.email && (
                  <div className="bg-blue-50 rounded-xl p-3">
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Mail className="w-3 h-3" />Email</div>
                    <div className="font-bold text-blue-700 text-xs break-all">{selected.email}</div>
                  </div>
                )}
                {selected.opening_hours && (
                  <div className="bg-amber-50 rounded-xl p-3">
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><AlarmClock className="w-3 h-3" />Hours</div>
                    <div className="font-bold text-amber-700 text-xs">{selected.opening_hours}</div>
                  </div>
                )}
              </div>

              {selected.services?.length > 0 && (
                <div className="mb-5">
                  <h4 className="font-black text-gray-700 mb-2 text-sm">Services</h4>
                  <ServiceBadges services={selected.services} />
                </div>
              )}

              <div className="flex gap-3 flex-wrap mt-2">
                {selected.phone && (
                  <a href={`tel:${selected.phone}`} className="flex items-center gap-2 bg-green-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-green-700 transition-colors text-sm">
                    <Phone className="w-4 h-4" />Call
                  </a>
                )}
                {selected.email && (
                  <a href={`mailto:${selected.email}`} className="flex items-center gap-2 bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm">
                    <Mail className="w-4 h-4" />Email
                  </a>
                )}
                {selected.website && (
                  <a href={selected.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#457B9D] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#3a6b8a] transition-colors text-sm">
                    <ExternalLink className="w-4 h-4" />Website
                  </a>
                )}
              </div>

              <p className="text-xs text-gray-400 mt-5 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Data from OpenStreetMap (© ODbL). Always verify details directly with the center.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}