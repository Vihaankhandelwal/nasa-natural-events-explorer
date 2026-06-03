const EONET_BASE_URL = "https://eonet.gsfc.nasa.gov/api/v3";

const fallbackCategories = [
  { id: "", title: "All categories" },
  { id: "wildfires", title: "Wildfires" },
  { id: "severeStorms", title: "Severe Storms" },
  { id: "volcanoes", title: "Volcanoes" },
  { id: "earthquakes", title: "Earthquakes" },
  { id: "floods", title: "Floods" },
  { id: "landslides", title: "Landslides" },
  { id: "dustHaze", title: "Dust and Haze" },
  { id: "seaLakeIce", title: "Sea and Lake Ice" },
  { id: "snow", title: "Snow" },
  { id: "temperatureExtremes", title: "Temperature Extremes" },
  { id: "waterColor", title: "Water Color" },
  { id: "manmade", title: "Manmade" },
];

const categoryColors = {
  wildfires: "#e4572e",
  severeStorms: "#2364aa",
  volcanoes: "#7d4bc6",
  earthquakes: "#f2b705",
  floods: "#00a6a6",
  landslides: "#7f6a4f",
  dustHaze: "#c69249",
  seaLakeIce: "#7cc7d9",
  snow: "#9aa9bd",
  temperatureExtremes: "#c73e62",
  waterColor: "#338f7a",
  manmade: "#55595c",
  default: "#d94f24",
};

const sampleFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "SAMPLE_WILDFIRE",
      properties: {
        id: "SAMPLE_WILDFIRE",
        title: "Sample wildfire event",
        description: "Shown only when live EONET data cannot be reached.",
        link: "https://eonet.gsfc.nasa.gov/",
        closed: null,
        date: "2026-06-01T00:00:00Z",
        categories: [{ id: "wildfires", title: "Wildfires" }],
        sources: [{ id: "Sample", url: "https://eonet.gsfc.nasa.gov/" }],
      },
      geometry: { type: "Point", coordinates: [-121.5, 39.3] },
    },
    {
      type: "Feature",
      id: "SAMPLE_STORM",
      properties: {
        id: "SAMPLE_STORM",
        title: "Sample severe storm",
        description: "Shown only when live EONET data cannot be reached.",
        link: "https://eonet.gsfc.nasa.gov/",
        closed: null,
        date: "2026-06-02T00:00:00Z",
        categories: [{ id: "severeStorms", title: "Severe Storms" }],
        sources: [{ id: "Sample", url: "https://eonet.gsfc.nasa.gov/" }],
      },
      geometry: { type: "Point", coordinates: [-62.2, 17.4] },
    },
  ],
};

const continentShapes = [
  [
    [71, -166],
    [62, -141],
    [55, -126],
    [49, -118],
    [31, -117],
    [17, -98],
    [9, -82],
    [19, -66],
    [43, -60],
    [58, -68],
    [72, -96],
    [71, -166],
  ],
  [
    [13, -79],
    [8, -61],
    [-5, -45],
    [-18, -39],
    [-35, -54],
    [-55, -70],
    [-22, -78],
    [6, -82],
    [13, -79],
  ],
  [
    [72, -53],
    [81, -21],
    [75, 12],
    [62, -18],
    [60, -45],
    [72, -53],
  ],
  [
    [37, -10],
    [59, 0],
    [70, 34],
    [55, 61],
    [39, 49],
    [32, 15],
    [37, -10],
  ],
  [
    [34, -17],
    [31, 33],
    [12, 51],
    [-35, 32],
    [-35, 17],
    [-6, 10],
    [8, -13],
    [34, -17],
  ],
  [
    [71, 36],
    [67, 98],
    [57, 145],
    [43, 156],
    [22, 118],
    [7, 80],
    [25, 50],
    [45, 58],
    [71, 36],
  ],
  [
    [8, 73],
    [23, 89],
    [13, 105],
    [-8, 122],
    [-10, 98],
    [8, 73],
  ],
  [
    [-11, 113],
    [-17, 145],
    [-35, 153],
    [-44, 130],
    [-31, 114],
    [-11, 113],
  ],
  [
    [-62, -180],
    [-70, -95],
    [-66, 0],
    [-72, 91],
    [-63, 180],
    [-84, 180],
    [-84, -180],
    [-62, -180],
  ],
];

const els = {
  apiStatus: document.querySelector("#apiStatus"),
  categorySelect: document.querySelector("#categorySelect"),
  daysRange: document.querySelector("#daysRange"),
  daysOutput: document.querySelector("#daysOutput"),
  limitSelect: document.querySelector("#limitSelect"),
  refreshBtn: document.querySelector("#refreshBtn"),
  searchInput: document.querySelector("#searchInput"),
  clearSearchBtn: document.querySelector("#clearSearchBtn"),
  eventList: document.querySelector("#eventList"),
  eventCount: document.querySelector("#eventCount"),
  mappedCount: document.querySelector("#mappedCount"),
  topCategory: document.querySelector("#topCategory"),
  latestDate: document.querySelector("#latestDate"),
};

const state = {
  features: [],
  selectedEventId: null,
  searchTerm: "",
  usingSampleData: false,
};

let map;
let eventLayer;
let geometryLayer;

window.addEventListener("DOMContentLoaded", init);

async function init() {
  waitForLeaflet().then(() => {
    initMap();
    bindEvents();
    populateCategories(fallbackCategories);
    loadCategories();
    loadEvents();
  });
}

function waitForLeaflet() {
  return new Promise((resolve) => {
    if (window.L) {
      resolve();
      return;
    }

    const timer = window.setInterval(() => {
      if (window.L) {
        window.clearInterval(timer);
        resolve();
      }
    }, 25);
  });
}

function initMap() {
  map = L.map("map", {
    center: [22, 0],
    zoom: 2,
    minZoom: 2,
    maxZoom: 9,
    worldCopyJump: true,
    attributionControl: false,
  });

  L.control.zoom({ position: "bottomright" }).addTo(map);
  drawReferenceMap();
  eventLayer = L.layerGroup().addTo(map);
  geometryLayer = L.layerGroup().addTo(map);
}

function drawReferenceMap() {
  const mapStyle = {
    color: "#f3f0e9",
    fillColor: "#f3f0e9",
    fillOpacity: 0.86,
    opacity: 0.92,
    weight: 1,
    interactive: false,
  };

  continentShapes.forEach((shape) => {
    L.polygon(shape, mapStyle).addTo(map);
  });

  for (let lat = -60; lat <= 60; lat += 30) {
    L.polyline(
      [
        [lat, -180],
        [lat, 180],
      ],
      {
        color: "rgba(255, 255, 255, 0.38)",
        weight: 1,
        interactive: false,
      },
    ).addTo(map);
  }

  for (let lng = -120; lng <= 120; lng += 60) {
    L.polyline(
      [
        [-80, lng],
        [80, lng],
      ],
      {
        color: "rgba(255, 255, 255, 0.3)",
        weight: 1,
        interactive: false,
      },
    ).addTo(map);
  }
}

function bindEvents() {
  els.refreshBtn.addEventListener("click", loadEvents);
  els.categorySelect.addEventListener("change", loadEvents);
  els.limitSelect.addEventListener("change", loadEvents);

  document.querySelectorAll('input[name="status"]').forEach((input) => {
    input.addEventListener("change", loadEvents);
  });

  els.daysRange.addEventListener("input", () => {
    els.daysOutput.value = els.daysRange.value;
  });

  els.daysRange.addEventListener("change", loadEvents);

  els.searchInput.addEventListener("input", (event) => {
    state.searchTerm = event.target.value.trim().toLowerCase();
    renderList();
  });

  els.clearSearchBtn.addEventListener("click", () => {
    els.searchInput.value = "";
    state.searchTerm = "";
    renderList();
    els.searchInput.focus();
  });
}

async function loadCategories() {
  try {
    const response = await fetch(`${EONET_BASE_URL}/categories`);
    if (!response.ok) {
      throw new Error(`NASA categories returned ${response.status}`);
    }

    const data = await response.json();
    const categories = normalizeCategories(data);
    populateCategories(categories.length > 1 ? categories : fallbackCategories);
  } catch (error) {
    console.warn(error);
  }
}

function normalizeCategories(data) {
  const categories = Array.isArray(data.categories) ? data.categories : [];

  return [
    { id: "", title: "All categories" },
    ...categories
      .filter((category) => category.id && category.title)
      .map((category) => ({
        id: category.id,
        title: category.title,
      }))
      .sort((a, b) => a.title.localeCompare(b.title)),
  ];
}

function populateCategories(categories) {
  const selectedValue = els.categorySelect.value;
  els.categorySelect.innerHTML = categories
    .map(
      (category) =>
        `<option value="${escapeHtml(category.id)}">${escapeHtml(category.title)}</option>`,
    )
    .join("");

  if (categories.some((category) => category.id === selectedValue)) {
    els.categorySelect.value = selectedValue;
  }
}

async function loadEvents() {
  setStatus("Loading", "is-loading");
  els.refreshBtn.disabled = true;

  try {
    const response = await fetch(buildEventsUrl());
    if (!response.ok) {
      throw new Error(`NASA events returned ${response.status}`);
    }

    const data = await response.json();
    state.features = Array.isArray(data.events)
      ? normalizeEvents(data.events)
      : normalizeFeatures(data.features || []);
    state.usingSampleData = false;
    setStatus(`Live: ${state.features.length} events`);
  } catch (error) {
    console.warn(error);
    state.features = normalizeFeatures(sampleFeatureCollection.features);
    state.usingSampleData = true;
    setStatus("Sample data", "is-error");
  } finally {
    els.refreshBtn.disabled = false;
    state.selectedEventId = state.features[0]?.id || null;
    render();
  }
}

function buildEventsUrl() {
  const params = new URLSearchParams({
    status: getSelectedStatus(),
    days: els.daysRange.value,
    limit: els.limitSelect.value,
  });

  if (els.categorySelect.value) {
    params.set("category", els.categorySelect.value);
  }

  return `${EONET_BASE_URL}/events?${params.toString()}`;
}

function getSelectedStatus() {
  return document.querySelector('input[name="status"]:checked')?.value || "open";
}

function normalizeFeatures(features) {
  return features
    .map((feature) => {
      const props = feature.properties || {};
      const point = getRepresentativePoint(feature.geometry);
      const categories = Array.isArray(props.categories) ? props.categories : [];
      const sources = Array.isArray(props.sources) ? props.sources : [];
      const primaryCategory = categories[0] || { id: "default", title: "Other" };
      const latestDate =
        props.date ||
        props.geometryDates?.[props.geometryDates.length - 1] ||
        feature.geometryDates?.[feature.geometryDates.length - 1] ||
        null;

      return {
        id: props.id || feature.id || props.title,
        title: props.title || "Untitled event",
        description: props.description || "",
        link: props.link || "",
        closed: props.closed || null,
        latestDate,
        categories,
        primaryCategory,
        sources,
        point,
        geometry: feature.geometry,
        rawFeature: feature,
      };
    })
    .filter((feature) => feature.id && feature.point);
}

function normalizeEvents(events) {
  return events
    .map((event) => {
      const categories = Array.isArray(event.categories) ? event.categories : [];
      const sources = Array.isArray(event.sources) ? event.sources : [];
      const primaryCategory = categories[0] || { id: "default", title: "Other" };
      const latestGeometry = getLatestGeometry(event.geometry);
      const geometry = latestGeometry
        ? {
            type: latestGeometry.type,
            coordinates: latestGeometry.coordinates,
          }
        : null;
      const point = getRepresentativePoint(geometry);

      return {
        id: event.id,
        title: event.title || "Untitled event",
        description: event.description || "",
        link: event.link || "",
        closed: event.closed || null,
        latestDate: latestGeometry?.date || event.closed || null,
        categories,
        primaryCategory,
        sources,
        point,
        geometry,
        rawFeature: event,
      };
    })
    .filter((event) => event.id && event.point);
}

function getLatestGeometry(geometries) {
  if (!Array.isArray(geometries) || geometries.length === 0) {
    return null;
  }

  return [...geometries].sort((a, b) => {
    const aTime = new Date(a.date || 0).getTime();
    const bTime = new Date(b.date || 0).getTime();
    return aTime - bTime;
  })[geometries.length - 1];
}

function getRepresentativePoint(geometry) {
  if (!geometry || !geometry.coordinates) {
    return null;
  }

  const { type, coordinates } = geometry;

  if (type === "Point") {
    return toPoint(coordinates);
  }

  if (type === "MultiPoint" || type === "LineString") {
    return toPoint(coordinates[coordinates.length - 1]);
  }

  if (type === "MultiLineString") {
    const latestLine = coordinates[coordinates.length - 1] || [];
    return toPoint(latestLine[latestLine.length - 1]);
  }

  if (type === "Polygon") {
    return getCentroid(coordinates[0]);
  }

  if (type === "MultiPolygon") {
    return getCentroid(coordinates[0]?.[0]);
  }

  return null;
}

function toPoint(coordinates) {
  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    return null;
  }

  const [lng, lat] = coordinates;
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

function getCentroid(ring) {
  if (!Array.isArray(ring) || ring.length === 0) {
    return null;
  }

  const validPoints = ring.map(toPoint).filter(Boolean);
  if (!validPoints.length) {
    return null;
  }

  const total = validPoints.reduce(
    (sum, point) => ({
      lat: sum.lat + point.lat,
      lng: sum.lng + point.lng,
    }),
    { lat: 0, lng: 0 },
  );

  return {
    lat: total.lat / validPoints.length,
    lng: total.lng / validPoints.length,
  };
}

function render() {
  renderMetrics();
  renderMap();
  renderList();
}

function renderMetrics() {
  els.eventCount.textContent = state.features.length;
  els.mappedCount.textContent = state.features.filter((feature) => feature.point).length;
  els.topCategory.textContent = getTopCategory();
  els.latestDate.textContent = formatShortDate(getLatestDate());
}

function getTopCategory() {
  if (!state.features.length) {
    return "None";
  }

  const counts = state.features.reduce((totals, feature) => {
    const title = feature.primaryCategory.title || "Other";
    totals[title] = (totals[title] || 0) + 1;
    return totals;
  }, {});

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";
}

function getLatestDate() {
  const timestamps = state.features
    .map((feature) => new Date(feature.latestDate).getTime())
    .filter(Number.isFinite);

  if (!timestamps.length) {
    return null;
  }

  return new Date(Math.max(...timestamps));
}

function renderMap() {
  eventLayer.clearLayers();
  geometryLayer.clearLayers();

  const bounds = [];

  state.features.forEach((feature) => {
    const color = getCategoryColor(feature.primaryCategory.id);
    const marker = L.circleMarker([feature.point.lat, feature.point.lng], {
      radius: feature.id === state.selectedEventId ? 9 : 7,
      color: "#20201d",
      weight: 1.5,
      fillColor: color,
      fillOpacity: 0.92,
    })
      .bindPopup(buildPopup(feature))
      .on("click", () => selectEvent(feature.id));

    marker.addTo(eventLayer);
    bounds.push([feature.point.lat, feature.point.lng]);

    if (feature.geometry && feature.geometry.type !== "Point") {
      L.geoJSON(feature.geometry, {
        style: {
          color,
          weight: 2,
          opacity: 0.55,
          fillColor: color,
          fillOpacity: 0.13,
        },
      }).addTo(geometryLayer);
    }
  });

  if (bounds.length === 1) {
    map.setView(bounds[0], 5);
  } else if (bounds.length > 1) {
    map.fitBounds(bounds, { padding: [34, 34], maxZoom: 5 });
  }
}

function renderList() {
  const features = getFilteredFeatures();

  if (!features.length) {
    els.eventList.innerHTML = `<li class="empty-state">${getEmptyMessage()}</li>`;
    return;
  }

  els.eventList.innerHTML = features
    .map((feature) => {
      const selectedClass = feature.id === state.selectedEventId ? " is-selected" : "";
      const categoryTitle = feature.primaryCategory.title || "Other";
      const status = feature.closed ? "Closed" : "Open";
      const sourceText = formatSources(feature.sources);

      return `
        <li>
          <button class="event-card${selectedClass}" type="button" data-event-id="${escapeHtml(feature.id)}">
            <div class="event-title-row">
              <h2 class="event-title">${escapeHtml(feature.title)}</h2>
              <span class="event-date">${escapeHtml(formatShortDate(feature.latestDate))}</span>
            </div>
            <div class="meta-row">
              <span class="chip">${escapeHtml(categoryTitle)}</span>
              <span class="chip status">${status}</span>
            </div>
            <p class="event-source">${escapeHtml(sourceText)}</p>
          </button>
        </li>
      `;
    })
    .join("");

  els.eventList.querySelectorAll(".event-card").forEach((button) => {
    button.addEventListener("click", () => selectEvent(button.dataset.eventId));
  });
}

function getFilteredFeatures() {
  if (!state.searchTerm) {
    return state.features;
  }

  return state.features.filter((feature) => {
    const haystack = [
      feature.title,
      feature.description,
      feature.primaryCategory.title,
      formatSources(feature.sources),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(state.searchTerm);
  });
}

function getEmptyMessage() {
  if (state.searchTerm) {
    return "No events match the current search.";
  }

  if (state.usingSampleData) {
    return "The live NASA feed is unavailable and no sample events matched these filters.";
  }

  return "No events matched these filters.";
}

function selectEvent(eventId) {
  const feature = state.features.find((item) => item.id === eventId);
  if (!feature) {
    return;
  }

  state.selectedEventId = eventId;
  map.flyTo([feature.point.lat, feature.point.lng], Math.max(map.getZoom(), 5), {
    duration: 0.8,
  });

  renderMap();
  renderList();

  window.setTimeout(() => {
    const marker = eventLayer
      .getLayers()
      .find((layer) => {
        const latLng = layer.getLatLng?.();
        return (
          latLng &&
          Math.abs(latLng.lat - feature.point.lat) < 0.000001 &&
          Math.abs(latLng.lng - feature.point.lng) < 0.000001
        );
      });

    marker?.openPopup();
  }, 120);
}

function buildPopup(feature) {
  const categoryTitle = feature.primaryCategory.title || "Other";
  const date = formatLongDate(feature.latestDate);
  const sourceText = formatSources(feature.sources);
  const sourceLink = normalizeUrl(
    getPrimarySourceUrl(feature.sources) || feature.link || "https://eonet.gsfc.nasa.gov/",
  );

  return `
    <div class="popup">
      <h3>${escapeHtml(feature.title)}</h3>
      <p>${escapeHtml(categoryTitle)} | ${escapeHtml(date)}</p>
      <p>${escapeHtml(sourceText)}</p>
      <a href="${escapeAttribute(sourceLink)}" target="_blank" rel="noreferrer">Open source</a>
    </div>
  `;
}

function getCategoryColor(categoryId) {
  return categoryColors[categoryId] || categoryColors.default;
}

function formatSources(sources) {
  if (!Array.isArray(sources) || sources.length === 0) {
    return "Source unavailable";
  }

  return sources
    .map((source) => source.id || source.title || "Source")
    .slice(0, 3)
    .join(", ");
}

function getPrimarySourceUrl(sources) {
  const source = sources.find((item) => item.url || item.link);
  return source?.url || source?.link || "";
}

function normalizeUrl(url) {
  const trimmedUrl = String(url || "").trim();

  if (!trimmedUrl) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  if (trimmedUrl.startsWith("//")) {
    return `https:${trimmedUrl}`;
  }

  return `https://${trimmedUrl}`;
}

function formatShortDate(value) {
  if (!value) {
    return "None";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "None";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatLongDate(value) {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function setStatus(message, modifierClass = "") {
  els.apiStatus.className = `api-pill ${modifierClass}`.trim();
  els.apiStatus.textContent = message;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}
