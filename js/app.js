const $ = (id) => document.getElementById(id);

const neighbours = ["Germany", "Czechia", "Slovakia", "Hungary", "Slovenia", "Italy", "Switzerland"];
const palettes = {
  teal: ["#ecfdf5", "#ccfbf1", "#99f6e4", "#5eead4", "#14b8a6", "#0f766e"],
  blue: ["#eff6ff", "#dbeafe", "#bfdbfe", "#60a5fa", "#2563eb", "#1e3a8a"],
  purple: ["#faf5ff", "#f3e8ff", "#e9d5ff", "#c084fc", "#9333ea", "#581c87"],
  gap: ["#eff6ff", "#bfdbfe", "#93c5fd", "#fdba74", "#fb923c", "#c2410c"],
};

const state = {
  data: [],
  geojson: null,
  map: null,
  countryLayer: null,
  labelLayer: L.layerGroup(),
  selectedCountry: null,
  charts: {},
  basemaps: {},
};

Promise.all([
  fetch("data/employment_data.json").then((res) => {
    if (!res.ok) throw new Error("Could not load employment_data.json");
    return res.json();
  }),
  fetch("data/countries.geojson").then((res) => {
    if (!res.ok) throw new Error("Could not load countries.geojson");
    return res.json();
  }),
])
  .then(([employmentData, countryGeojson]) => {
    state.data = employmentData.map((d) => ({
      ...d,
      Year: Number(d.Year),
      "Employment Rate": Number(d["Employment Rate"]),
    }));
    state.geojson = countryGeojson;
    initialiseControls();
    initialiseMap();
    bindEvents();
    updateApplication();
    setTimeout(fitToLayer, 150);
    $("loading-screen").classList.add("hidden");
  })
  .catch((error) => {
    console.error(error);
    $("loading-screen").innerHTML = `<div class="card"><h2>Application data could not be loaded</h2><p>Please open this project through a local server such as VS Code Live Server or <code>python -m http.server 8000</code>.</p></div>`;
  });

function initialiseControls() {
  const years = [...new Set(state.data.map((d) => d.Year))].filter(Boolean).sort((a, b) => a - b);
  $("year-select").innerHTML = years.map((year) => `<option value="${year}">${year}</option>`).join("");
  $("year-select").value = years[years.length - 1];
  $("comparison-select").innerHTML = neighbours.map((country) => `<option value="${country}">${country}</option>`).join("");
  $("comparison-select").value = "Germany";
}

function initialiseMap() {
  state.map = L.map("map", { zoomControl: false, preferCanvas: true }).setView([47.8, 13.6], 5);
  L.control.zoom({ position: "bottomleft" }).addTo(state.map);

  const cartoLight = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
  });
  const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  });
  const topo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    maxZoom: 17,
    attribution: '&copy; OpenStreetMap contributors, SRTM | &copy; OpenTopoMap',
  });

  state.basemaps = { "Cartographic light": cartoLight, "OpenStreetMap": osm, "Topographic context": topo };
  cartoLight.addTo(state.map);
  state.labelLayer.addTo(state.map);
  L.control.layers(state.basemaps, {}, { position: "bottomright", collapsed: true }).addTo(state.map);
}

function bindEvents() {
  [
    "year-select",
    "indicator-select",
    "comparison-select",
    "classification-select",
    "scheme-select",
    "country-search",
    "labels-toggle",
    "highlight-toggle",
    "table-toggle",
  ].forEach((id) => {
    const el = $(id);
    el.addEventListener("change", updateApplication);
    if (el.tagName === "INPUT") el.addEventListener("input", updateApplication);
  });

  $("reset-btn").addEventListener("click", () => {
    const years = [...new Set(state.data.map((d) => d.Year))].sort((a, b) => a - b);
    $("year-select").value = years[years.length - 1];
    $("indicator-select").value = "Total";
    $("comparison-select").value = "Germany";
    $("classification-select").value = "quantile";
    $("scheme-select").value = "teal";
    $("country-search").value = "";
    $("labels-toggle").checked = true;
    $("highlight-toggle").checked = true;
    $("table-toggle").checked = true;
    state.selectedCountry = null;
    updateApplication();
    fitToLayer();
  });

  $("fit-map-btn").addEventListener("click", fitToLayer);
  $("print-btn").addEventListener("click", () => window.print());
  $("export-btn").addEventListener("click", exportCurrentCsv);
  $("locate-btn").addEventListener("click", locateUser);
  $("clear-selection-btn").addEventListener("click", () => {
    state.selectedCountry = null;
    updateApplication();
  });
}

function getSelections() {
  return {
    year: Number($("year-select").value),
    indicator: $("indicator-select").value,
    comparison: $("comparison-select").value,
    classification: $("classification-select").value,
    scheme: $("scheme-select").value,
    search: $("country-search").value.trim().toLowerCase(),
    showLabels: $("labels-toggle").checked,
    highlightPair: $("highlight-toggle").checked,
    showTable: $("table-toggle").checked,
  };
}

function updateApplication() {
  const selections = getSelections();
  renderMap(selections);
  renderKpis(selections);
  renderCharts(selections);
  renderTable(selections);
  renderInsight(selections);
  $("attribute-table-card").style.display = selections.showTable ? "block" : "none";
  $("map-subtitle").textContent = `${getIndicatorLabel(selections.indicator)} · ${selections.year} · ${classificationLabel(selections.classification)}`;
  $("summary-year").textContent = String(selections.year);
  setTimeout(() => state.map && state.map.invalidateSize(), 80);
}

function getCountryNames() {
  return state.geojson.features.map((f) => f.properties.name);
}

function rate(country, year, sex) {
  const rec = state.data.find((d) => d.Country === country && d.Year === year && d.Sex === sex);
  if (!rec || !Number.isFinite(rec["Employment Rate"]) || rec["Employment Rate"] === 0) return null;
  return rec["Employment Rate"];
}

function indicatorValue(country, year, indicator) {
  if (indicator === "Gap") {
    const male = rate(country, year, "Male");
    const female = rate(country, year, "Female");
    return male === null || female === null ? null : Number((male - female).toFixed(1));
  }
  return rate(country, year, indicator);
}

function getIndicatorLabel(indicator) {
  if (indicator === "Gap") return "Gender employment gap";
  return `${indicator} employment rate`;
}

function classificationLabel(method) {
  return method === "equal" ? "equal interval" : "quantile";
}

function valuesForSelection(selections) {
  return getCountryNames()
    .map((country) => ({ country, value: indicatorValue(country, selections.year, selections.indicator) }))
    .filter((d) => d.value !== null && Number.isFinite(d.value));
}

function getBreaks(values, method) {
  const clean = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (!clean.length) return [0, 1, 2, 3, 4, 5, 6];
  if (clean.length === 1) return [clean[0], clean[0], clean[0], clean[0], clean[0], clean[0], clean[0]];

  const classCount = 6;
  if (method === "equal") {
    const min = clean[0];
    const max = clean[clean.length - 1];
    const step = (max - min) / classCount || 1;
    return Array.from({ length: classCount + 1 }, (_, i) => min + step * i);
  }

  return Array.from({ length: classCount + 1 }, (_, i) => {
    const idx = Math.min(clean.length - 1, Math.round((i / classCount) * (clean.length - 1)));
    return clean[idx];
  });
}

function selectedPalette(selections) {
  if (selections.indicator === "Gap" && selections.scheme === "gap") return palettes.gap;
  return palettes[selections.scheme] || palettes.teal;
}

function colorForValue(value, breaks, palette) {
  if (value === null || value === undefined || Number.isNaN(value)) return "#e5e7eb";
  for (let i = breaks.length - 2; i >= 0; i--) {
    if (value >= breaks[i]) return palette[Math.min(i, palette.length - 1)];
  }
  return palette[0];
}

function renderMap(selections) {
  const values = valuesForSelection(selections);
  const breaks = getBreaks(values.map((d) => d.value), selections.classification);
  const palette = selectedPalette(selections);
  const valueLookup = Object.fromEntries(values.map((d) => [d.country, d.value]));

  if (state.countryLayer) state.countryLayer.remove();
  state.labelLayer.clearLayers();

  state.countryLayer = L.geoJSON(state.geojson, {
    filter: (feature) => !selections.search || feature.properties.name.toLowerCase().includes(selections.search),
    style: (feature) => {
      const country = feature.properties.name;
      const isPair = selections.highlightPair && (country === "Austria" || country === selections.comparison);
      const isSelected = state.selectedCountry === country;
      return {
        color: isSelected ? "#f97316" : isPair ? "#0f172a" : "#64748b",
        weight: isSelected ? 4 : isPair ? 3 : 1.2,
        fillColor: colorForValue(valueLookup[country], breaks, palette),
        fillOpacity: isSelected ? 0.92 : 0.78,
        opacity: 1,
        dashArray: isSelected ? "" : isPair ? "" : "2,2",
      };
    },
    onEachFeature: (feature, layer) => {
      const country = feature.properties.name;
      const selectedValue = indicatorValue(country, selections.year, selections.indicator);
      const total = rate(country, selections.year, "Total");
      const male = rate(country, selections.year, "Male");
      const female = rate(country, selections.year, "Female");
      const gap = indicatorValue(country, selections.year, "Gap");

      layer.bindPopup(`
        <div class="popup-title">${country}</div>
        <table class="popup-table">
          <tr><td>Year</td><td>${selections.year}</td></tr>
          <tr><td>Total</td><td>${formatValue(total)}</td></tr>
          <tr><td>Male</td><td>${formatValue(male)}</td></tr>
          <tr><td>Female</td><td>${formatValue(female)}</td></tr>
          <tr><td>Gender gap</td><td>${formatGap(gap)}</td></tr>
          <tr><td>Mapped value</td><td><strong>${formatByIndicator(selectedValue, selections.indicator)}</strong></td></tr>
        </table>`);
      layer.bindTooltip(`${country}: ${formatByIndicator(selectedValue, selections.indicator)}`, { sticky: true });
      layer.on("mouseover", () => layer.setStyle({ weight: 4, color: "#111827" }));
      layer.on("mouseout", () => state.countryLayer.resetStyle(layer));
      layer.on("click", () => {
        state.selectedCountry = country;
        updateApplication();
        layer.openPopup();
      });

      if (selections.showLabels) {
        const center = layer.getBounds().getCenter();
        L.marker(center, {
          icon: L.divIcon({ className: "country-label", html: country, iconSize: null }),
          interactive: false,
        }).addTo(state.labelLayer);
      }
    },
  }).addTo(state.map);

  renderLegend(breaks, palette, selections);
}

function renderLegend(breaks, palette, selections) {
  const unit = selections.indicator === "Gap" ? "pp" : "%";
  const rows = palette.map((color, i) => {
    const min = breaks[i];
    const max = breaks[i + 1] ?? breaks[i];
    return `<div class="legend-row"><span class="legend-swatch" style="background:${color}"></span><span>${formatNumber(min)} – ${formatNumber(max)} ${unit}</span></div>`;
  }).join("");
  $("legend").innerHTML = `
    <strong>${getIndicatorLabel(selections.indicator)}</strong>
    <div class="legend-row"><span>${classificationLabel(selections.classification)} classification</span></div>
    ${rows}
    <div class="legend-row"><span class="legend-swatch" style="background:#e5e7eb"></span><span>No data</span></div>`;
}

function fitToLayer() {
  if (state.countryLayer && state.countryLayer.getLayers().length) {
    state.map.fitBounds(state.countryLayer.getBounds(), { padding: [22, 22] });
  }
}

function renderKpis(selections) {
  const austria = indicatorValue("Austria", selections.year, selections.indicator);
  const comparison = indicatorValue(selections.comparison, selections.year, selections.indicator);
  const values = valuesForSelection(selections).map((d) => d.value);
  const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
  const diff = austria === null || comparison === null ? null : comparison - austria;

  $("kpi-austria").textContent = formatByIndicator(austria, selections.indicator);
  $("kpi-compare").textContent = formatByIndicator(comparison, selections.indicator);
  $("kpi-diff").textContent = diff === null ? "No data" : `${diff >= 0 ? "+" : ""}${diff.toFixed(1)} pp`;
  $("kpi-average").textContent = avg === null ? "No data" : formatByIndicator(avg, selections.indicator);
  $("kpi-compare-note").textContent = selections.comparison;
  $("kpi-austria-note").textContent = getIndicatorLabel(selections.indicator);
}

function renderCharts(selections) {
  const countries = ["Austria", selections.comparison];
  const sexes = ["Male", "Female", "Total"];

  makeChart("comparison-chart", {
    type: "bar",
    data: {
      labels: sexes,
      datasets: countries.map((country) => ({
        label: country,
        data: sexes.map((sex) => rate(country, selections.year, sex)),
        borderWidth: 1,
      })),
    },
    options: chartOptions("Employment rate (%)"),
  });

  const years = [...new Set(state.data.map((d) => d.Year))].sort((a, b) => a - b);
  makeChart("trend-chart", {
    type: "line",
    data: {
      labels: years,
      datasets: countries.map((country) => ({
        label: `${country} total`,
        data: years.map((year) => rate(country, year, "Total")),
        tension: 0.25,
        spanGaps: true,
        pointRadius: 2.5,
        borderWidth: 2,
      })),
    },
    options: chartOptions("Total employment rate (%)"),
  });

  const ranking = valuesForSelection(selections).sort((a, b) => b.value - a.value);
  makeChart("ranking-chart", {
    type: "bar",
    data: {
      labels: ranking.map((d) => d.country),
      datasets: [{ label: getIndicatorLabel(selections.indicator), data: ranking.map((d) => d.value), borderWidth: 1 }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      resizeDelay: 150,
      indexAxis: "y",
      animation: { duration: 250 },
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `${ctx.parsed.x.toFixed(1)} ${selections.indicator === "Gap" ? "pp" : "%"}` } } },
      scales: {
        x: { title: { display: true, text: selections.indicator === "Gap" ? "Percentage points" : "Employment rate (%)" }, grid: { color: "rgba(148,163,184,.22)" } },
        y: { grid: { display: false } },
      },
    },
  });
}

function chartOptions(axisTitle) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 150,
    animation: { duration: 250 },
    interaction: { intersect: false, mode: "index" },
    plugins: {
      legend: { position: "bottom", labels: { boxWidth: 12, usePointStyle: true } },
      tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y?.toFixed ? ctx.parsed.y.toFixed(1) : ctx.parsed.y}%` } },
    },
    scales: {
      y: { beginAtZero: false, title: { display: true, text: axisTitle }, grid: { color: "rgba(148,163,184,.22)" } },
      x: { grid: { display: false } },
    },
  };
}

function makeChart(id, config) {
  const canvas = $(id);
  if (state.charts[id]) {
    state.charts[id].destroy();
    state.charts[id] = null;
  }
  state.charts[id] = new Chart(canvas, config);
}

function renderTable(selections) {
  const rows = getCountryNames()
    .filter((country) => !selections.search || country.toLowerCase().includes(selections.search))
    .map((country) => ({
      Country: country,
      Year: selections.year,
      Male: rate(country, selections.year, "Male"),
      Female: rate(country, selections.year, "Female"),
      Total: rate(country, selections.year, "Total"),
      Gap: indicatorValue(country, selections.year, "Gap"),
      SelectedIndicator: indicatorValue(country, selections.year, selections.indicator),
    }))
    .sort((a, b) => (b.SelectedIndicator ?? -999) - (a.SelectedIndicator ?? -999));

  const table = $("attribute-table");
  table.querySelector("thead").innerHTML = `<tr><th>Country</th><th>Year</th><th>Male (%)</th><th>Female (%)</th><th>Total (%)</th><th>Gap (pp)</th><th>${getIndicatorLabel(selections.indicator)}</th></tr>`;
  table.querySelector("tbody").innerHTML = rows.map((r) => `
    <tr>
      <td>${r.Country}</td><td>${r.Year}</td><td>${formatPlain(r.Male)}</td><td>${formatPlain(r.Female)}</td><td>${formatPlain(r.Total)}</td><td>${formatPlain(r.Gap)}</td><td>${formatPlain(r.SelectedIndicator)}</td>
    </tr>`).join("");
}

function renderInsight(selections) {
  const subject = state.selectedCountry || selections.comparison;
  const subjectValue = indicatorValue(subject, selections.year, selections.indicator);
  const austria = indicatorValue("Austria", selections.year, selections.indicator);
  const comparison = indicatorValue(selections.comparison, selections.year, selections.indicator);
  const diff = austria === null || comparison === null ? null : comparison - austria;
  const ranking = valuesForSelection(selections).sort((a, b) => b.value - a.value);
  const top = ranking[0];
  const bottom = ranking[ranking.length - 1];

  $("selected-country").textContent = state.selectedCountry || "None";
  $("selected-value").textContent = state.selectedCountry ? formatByIndicator(subjectValue, selections.indicator) : "—";

  let text = `In ${selections.year}, Austria records ${formatByIndicator(austria, selections.indicator)} for ${getIndicatorLabel(selections.indicator).toLowerCase()}. `;
  if (comparison !== null && diff !== null) {
    text += `${selections.comparison} records ${formatByIndicator(comparison, selections.indicator)}, which is ${diff >= 0 ? "higher" : "lower"} than Austria by ${Math.abs(diff).toFixed(1)} percentage points. `;
  }
  if (top && bottom) {
    text += `Among the mapped countries, ${top.country} ranks highest (${formatByIndicator(top.value, selections.indicator)}) and ${bottom.country} ranks lowest (${formatByIndicator(bottom.value, selections.indicator)}). `;
  }
  if (state.selectedCountry && subjectValue !== null) {
    text += `The selected country on the map is ${subject}, with a mapped value of ${formatByIndicator(subjectValue, selections.indicator)}.`;
  }
  $("insight-text").textContent = text;
}

function exportCurrentCsv() {
  const selections = getSelections();
  const rows = getCountryNames().map((country) => ({
    Country: country,
    Year: selections.year,
    Male: formatPlain(rate(country, selections.year, "Male")),
    Female: formatPlain(rate(country, selections.year, "Female")),
    Total: formatPlain(rate(country, selections.year, "Total")),
    Gender_Gap: formatPlain(indicatorValue(country, selections.year, "Gap")),
    Selected_Indicator: getIndicatorLabel(selections.indicator),
    Selected_Value: formatPlain(indicatorValue(country, selections.year, selections.indicator)),
  }));

  const headers = Object.keys(rows[0]);
  const csv = [headers.join(","), ...rows.map((row) => headers.map((h) => `"${String(row[h]).replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `employment_sdi_webgis_${selections.year}_${selections.indicator}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function locateUser() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by this browser.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const latlng = [pos.coords.latitude, pos.coords.longitude];
      L.circleMarker(latlng, { radius: 8, color: "#1d4ed8", fillColor: "#60a5fa", fillOpacity: 0.85 }).addTo(state.map).bindPopup("Your approximate location").openPopup();
      state.map.setView(latlng, 6);
    },
    () => alert("Unable to access location. Please allow location access in your browser if needed.")
  );
}

function formatByIndicator(value, indicator) {
  return indicator === "Gap" ? formatGap(value) : formatValue(value);
}
function formatValue(value) {
  return value === null || value === undefined || Number.isNaN(value) ? "No data" : `${Number(value).toFixed(1)}%`;
}
function formatGap(value) {
  return value === null || value === undefined || Number.isNaN(value) ? "No data" : `${Number(value).toFixed(1)} pp`;
}
function formatPlain(value) {
  return value === null || value === undefined || Number.isNaN(value) ? "No data" : Number(value).toFixed(1);
}
function formatNumber(value) {
  return value === null || value === undefined || Number.isNaN(value) ? "—" : Number(value).toFixed(1);
}
