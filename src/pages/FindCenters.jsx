import { useState } from "react";
import {
  Search, MapPin, Clock, Phone, ExternalLink,
  ChevronDown, Shield, RefreshCw, Heart, X, Globe
} from "lucide-react";

// ── State → ISO 3166-2 used by OSM ──────────────────────────────────────────
const STATE_CODES = {
  AL:"US-AL",AK:"US-AK",AZ:"US-AZ",AR:"US-AR",CA:"US-CA",CO:"US-CO",
  CT:"US-CT",DE:"US-DE",FL:"US-FL",GA:"US-GA",HI:"US-HI",ID:"US-ID",
  IL:"US-IL",IN:"US-IN",IA:"US-IA",KS:"US-KS",KY:"US-KY",LA:"US-LA",
  ME:"US-ME",MD:"US-MD",MA:"US-MA",MI:"US-MI",MN:"US-MN",MS:"US-MS",
  MO:"US-MO",MT:"US-MT",NE:"US-NE",NV:"US-NV",NH:"US-NH",NJ:"US-NJ",
  NM:"US-NM",NY:"US-NY",NC:"US-NC",ND:"US-ND",OH:"US-OH",OK:"US-OK",
  OR:"US-OR",PA:"US-PA",RI:"US-RI",SC:"US-SC",SD:"US-SD",TN:"US-TN",
  TX:"US-TX",UT:"US-UT",VT:"US-VT",VA:"US-VA",WA:"US-WA",WV:"US-WV",
  WI:"US-WI",WY:"US-WY",
};

const US_STATES = ["Select a State", ...Object.keys(STATE_CODES)];
const SERVICES  = ["All Services","ABA Therapy","Speech Therapy","Occupational Therapy",
                   "Social Skills","Diagnostic Services","Early Intervention","BCBA Services","Family Training"];

// ── Overpass query ───────────────────────────────────────────────────────────
async function fetchFromOverpass(stateCode) {
  const query = `
    [out:json][timeout:30];
    area["ISO3166-2"="${stateCode}"]->.s;
    (
      node["name"~"(?i)autism|ABA|applied behavior|developmental disability|special needs"](area.s);
      way["name"~"(?i)autism|ABA|applied behavior|developmental disability|special needs"](area.s);

      node["amenity"="social_facility"]["name"~"(?i)autism|ABA|developmental"](area.s);
      way["amenity"="social_facility"]["name"~"(?i)autism|ABA|developmental"](area.s);

      node["healthcare"]["name"~"(?i)autism|ABA|developmental"](area.s);
      way["healthcare"]["name"~"(?i)autism|ABA|developmental"](area.s);
    );
    out center tags;
    `.trim();

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method : "POST",
    body   : `data=${encodeURIComponent(query)}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  if (!res.ok) throw new Error(`Overpass API responded with ${res.status}. Try again shortly.`);
  const json = await res.json();

  return json.elements.map((el) => {
    const t   = el.tags || {};
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;

    const phone   = t.phone || t["contact:phone"] || t["addr:phone"] || null;
    const website = t.website || t["contact:website"] || t.url || null;
    const address = [t["addr:housenumber"], t["addr:street"]].filter(Boolean).join(" ") || null;
    const mapsUrl = lat && lon ? `https://www.google.com/maps?q=${lat},${lon}` : null;

    // Infer services from name
    const name = (t.name || "").toLowerCase();
    const services = [];
    if (name.includes("aba") || name.includes("behavior"))        services.push("ABA Therapy");
    if (name.includes("speech"))                                   services.push("Speech Therapy");
    if (name.includes("occupational") || name.includes(" ot "))   services.push("Occupational Therapy");
    if (name.includes("diagnostic") || name.includes("assessment"))services.push("Diagnostic Services");
    if (name.includes("early intervention"))                       services.push("Early Intervention");
    if (services.length === 0)                                     services.push("Autism Support");

    return {
      id           : `${el.type}-${el.id}`,
      osm_type     : el.type,
      osm_id       : el.id,
      name         : t.name || "Unnamed Center",
      address,
      city         : t["addr:city"]     || null,
      state        : t["addr:state"]    || stateCode.replace("US-", ""),
      zip_code     : t["addr:postcode"] || null,
      phone,
      website,
      mapsUrl,
      latitude     : lat,
      longitude    : lon,
      services,
      opening_hours: t.opening_hours || null,
      operator     : t.operator      || null,
      description  : t.description   || t.note || null,
    };
  });
}

// ── Component ────────────────────────────────────────────────────────────────
export default function FindCenters() {
  const [centers,  setCenters]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [search,   setSearch]   = useState("");
  const [state,    setState]    = useState("Select a State");
  const [service,  setService]  = useState("All Services");
  const [selected, setSelected] = useState(null);
  const [saved,    setSaved]    = useState([]);
  const [error,    setError]    = useState(null);
  const [fetched,  setFetched]  = useState(false);

  const handleFetch = async () => {
    if (state === "Select a State") { setError("Please select a state first."); return; }
    setLoading(true);
    setError(null);
    try {
      const results = await fetchFromOverpass(STATE_CODES[state]);
      setCenters(results);
      setFetched(true);
      if (results.length === 0)
        setError(`OpenStreetMap has no tagged autism centers for ${state} yet. OSM coverage varies — try a nearby state.`);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const filtered = centers.filter((c) => {
    const ms = search.toLowerCase();
    return (
      (!search || c.name?.toLowerCase().includes(ms) || c.city?.toLowerCase().includes(ms)) &&
      (service === "All Services" || c.services?.includes(service))
    );
  });

  const toggleSave = (id) =>
    setSaved(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  return (
    <div className="min-h-screen bg-[#FAFAF7]">

      {/* Header */}
      <div className="bg-linear-to-br from-blue-50 to-green-50 py-16 text-center px-6">
        <h1 className="text-4xl lg:text-5xl font-black text-[#2D3748] mb-3">Find Autism Centers Near You</h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto mb-1">
          Real locations from <strong>OpenStreetMap</strong> via the free Overpass API.
        </p>
        <p className="text-xs text-gray-400">No database. No API key. Live queries only.</p>
      </div>

      {/* Sticky filters */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap gap-3 items-center">
          {/* Text search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Filter by name or city…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* State */}
          <div className="relative">
            <select
              className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-8 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
              value={state}
              onChange={(e) => setState(e.target.value)}
            >
              {US_STATES.map(s => <option key={s}>{s}</option>)}
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
              {SERVICES.map(s => <option key={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Fetch */}
          <button
            onClick={handleFetch}
            disabled={loading}
            className="flex items-center gap-2 bg-linear-to-r from-[#6B8F71] to-[#457B9D] text-white font-bold px-5 py-2.5 rounded-xl shadow hover:shadow-lg transition-all disabled:opacity-60 whitespace-nowrap"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Querying OSM…" : `Search ${state === "Select a State" ? "OSM" : state}`}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-6 py-8">

        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 mb-6 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Idle */}
        {!fetched && !loading && (
          <div className="text-center py-24 text-gray-400">
            <div className="text-6xl mb-4">🗺️</div>
            <p className="text-xl font-bold text-gray-600 mb-2">Select a state and click Search</p>
            <p className="text-sm">We'll query OpenStreetMap in real time — results vary by state.</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-24">
            <div className="text-5xl animate-bounce mb-4">🦔</div>
            <p className="text-gray-500 font-semibold">Querying Overpass API…</p>
            <p className="text-xs text-gray-400 mt-1">Usually takes 5–15 seconds.</p>
          </div>
        )}

        {/* Results */}
        {fetched && !loading && (
          <>
            <p className="text-sm text-gray-500 mb-6">
              {filtered.length} center{filtered.length !== 1 ? "s" : ""} found
              {search ? ` matching "${search}"` : ""}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((center) => (
                <div
                  key={center.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
                  onClick={() => setSelected(center)}
                >
                  <div className="h-3 bg-linear-to-r from-[#6B8F71] to-[#457B9D]" />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 pr-2">
                        <h3 className="font-bold text-[#2D3748] text-base leading-snug mb-1">{center.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          {[center.city, center.state, center.zip_code].filter(Boolean).join(", ") || "Location on map"}
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSave(center.id); }}
                        className={`shrink-0 ${saved.includes(center.id) ? "text-red-500" : "text-gray-300 hover:text-red-400"} transition-colors`}
                      >
                        <Heart className="w-4 h-4" fill={saved.includes(center.id) ? "currentColor" : "none"} />
                      </button>
                    </div>

                    {/* Inferred services */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {center.services.map(s => (
                        <span key={s} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>

                    {center.opening_hours && (
                      <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full mb-3 w-fit">
                        <Clock className="w-3 h-3" /> {center.opening_hours}
                      </div>
                    )}

                    {center.operator && (
                      <p className="text-xs text-gray-400 mb-3">Operator: {center.operator}</p>
                    )}

                    <div className="flex gap-2 pt-2 border-t border-gray-50 flex-wrap">
                      {center.phone && (
                        <a href={`tel:${center.phone}`} onClick={e => e.stopPropagation()}
                           className="flex items-center gap-1 text-xs text-gray-500 hover:text-green-600 font-medium">
                          <Phone className="w-3.5 h-3.5" /> {center.phone}
                        </a>
                      )}
                      {center.website ? (
                        <a href={center.website} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                           className="flex items-center gap-1 text-xs text-[#457B9D] hover:underline font-medium ml-auto">
                          Website <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : center.mapsUrl && (
                        <a href={center.mapsUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                           className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#457B9D] font-medium ml-auto">
                          Maps <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="h-4 bg-linear-to-r from-[#6B8F71] to-[#457B9D] rounded-t-3xl" />
            <div className="p-8">

              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 pr-4">
                  <h2 className="text-2xl font-black text-[#2D3748] mb-1">{selected.name}</h2>
                  <p className="text-gray-500 text-sm flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {[selected.address, selected.city, selected.state, selected.zip_code].filter(Boolean).join(", ") || "No address in OSM"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleSave(selected.id)}
                    className={`p-2 rounded-full border ${saved.includes(selected.id) ? "border-red-300 bg-red-50 text-red-500" : "border-gray-200 text-gray-400 hover:text-red-400"} transition-all`}>
                    <Heart className="w-5 h-5" fill={saved.includes(selected.id) ? "currentColor" : "none"} />
                  </button>
                  <button onClick={() => setSelected(null)}
                    className="p-2 rounded-full border border-gray-200 text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {selected.description && (
                <p className="text-gray-600 leading-relaxed mb-6 bg-green-50 p-4 rounded-xl italic">{selected.description}</p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {selected.phone && (
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <div className="text-xs text-gray-500 mb-1">Phone</div>
                    <div className="font-bold text-green-700 text-xs break-all">{selected.phone}</div>
                  </div>
                )}
                {selected.opening_hours && (
                  <div className="bg-amber-50 rounded-xl p-3 text-center">
                    <div className="text-xs text-gray-500 mb-1">Hours</div>
                    <div className="font-bold text-amber-700 text-xs">{selected.opening_hours}</div>
                  </div>
                )}
                {selected.operator && (
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <div className="text-xs text-gray-500 mb-1">Operator</div>
                    <div className="font-bold text-blue-700 text-xs">{selected.operator}</div>
                  </div>
                )}
              </div>

              <div className="mb-5">
                <h4 className="font-black text-gray-700 mb-2">Services <span className="font-normal text-xs text-gray-400">(inferred from name)</span></h4>
                <div className="flex flex-wrap gap-2">
                  {selected.services.map(s => (
                    <span key={s} className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">{s}</span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 flex-wrap mb-4">
                {selected.phone && (
                  <a href={`tel:${selected.phone}`}
                     className="flex items-center gap-2 bg-green-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-green-700 transition-colors">
                    <Phone className="w-4 h-4" /> Call
                  </a>
                )}
                {selected.website && (
                  <a href={selected.website} target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-2 bg-[#457B9D] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#3a6b8a] transition-colors">
                    <ExternalLink className="w-4 h-4" /> Website
                  </a>
                )}
                {selected.mapsUrl && (
                  <a href={selected.mapsUrl} target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-2 bg-gray-100 text-gray-700 font-bold px-5 py-2.5 rounded-xl hover:bg-gray-200 transition-colors">
                    <MapPin className="w-4 h-4" /> Google Maps
                  </a>
                )}
                <a href={`https://www.openstreetmap.org/${selected.osm_type}/${selected.osm_id}`}
                   target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 bg-gray-100 text-gray-500 font-bold px-4 py-2.5 rounded-xl hover:bg-gray-200 transition-colors text-sm">
                  <Globe className="w-4 h-4" /> View on OSM
                </a>
              </div>

              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Sourced from OpenStreetMap. Always verify details directly with the center before visiting.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}