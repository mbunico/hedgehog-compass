// import fetch from "node-fetch";
// import fs from "fs/promises";

const CACHE_FILE = "./centers_cache.json";

// US states bounding boxes for Overpass (approx)
const BOUNDS = {
  CA: [32.5343, -124.4096, 42.0095, -114.1312], // lat1, lon1, lat2, lon2
  NY: [40.4774, -79.7624, 45.0153, -71.8562],
  // Add other states...
};

async function fetchOSMCenters(state) {
  const bbox = BOUNDS[state];
  if (!bbox) return [];

  const query = `
  [out:json][timeout:25];
  (
    node["healthcare"="clinic"](${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]});
    node["healthcare"="therapy"](${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]});
    node["amenity"="hospital"](${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]});
  );
  out body;
  `;

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query,
  });

  const data = await res.json();

  return data.elements
    .filter((el) => el.tags?.name)
    .map((el, i) => ({
      id: `${state}-${i}`,
      name: el.tags.name,
      address: el.tags["addr:street"] || "",
      city: el.tags["addr:city"] || "",
      state: el.tags["addr:state"] || state,
      zip_code: el.tags["addr:postcode"] || "",
      phone: el.tags.phone || "",
      website: el.tags.website || "",
      services: ["Therapy"],
      description: "Autism or developmental therapy provider from OSM",
      verified: false,
    }));
}

// Optional: Google Places enrichment
async function enrichWithGooglePlaces(centers, googleApiKey) {
  const enriched = [];
  for (const center of centers) {
    if (!center.name) continue;
    const query = encodeURIComponent(`${center.name}, ${center.city}, ${center.state}`);
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id,name,formatted_address,formatted_phone_number,website,rating,user_ratings_total&key=${googleApiKey}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.candidates && data.candidates.length) {
        const candidate = data.candidates[0];
        enriched.push({
          ...center,
          name: candidate.name || center.name,
          address: candidate.formatted_address || center.address,
          phone: candidate.formatted_phone_number || center.phone,
          website: candidate.website || center.website,
          rating: candidate.rating || null,
          review_count: candidate.user_ratings_total || null,
          verified: true,
        });
      } else {
        enriched.push(center);
      }
    } catch (err) {
      console.error("Google enrichment error:", err);
      enriched.push(center);
    }
    await sleep(150); // avoid hitting Google rate limit
  }
  return enriched;
}

// Simple delay
function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

// Save to cache
async function saveCache(data) {
  await fs.writeFile(CACHE_FILE, JSON.stringify(data, null, 2));
}

// Load from cache
async function loadCache() {
  try {
    const raw = await fs.readFile(CACHE_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Main function
export async function scrapeAllStates(states, googleApiKey = null) {
  let allCenters = await loadCache();
  const newCenters = [];

  for (const state of states) {
    // Skip if already cached
    if (allCenters.some(c => c.state === state)) continue;

    console.log("Scraping state:", state);
    const osmCenters = await fetchOSMCenters(state);

    let finalCenters = osmCenters;
    if (googleApiKey) {
      finalCenters = await enrichWithGooglePlaces(osmCenters, googleApiKey);
    }

    newCenters.push(...finalCenters);

    // save cache after each state
    allCenters.push(...finalCenters);
    await saveCache(allCenters);

    // small delay to avoid API overload
    await sleep(500);
  }

  console.log("Scraping done:", newCenters.length, "new centers added.");
  return allCenters;
}