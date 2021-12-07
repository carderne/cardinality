/* global Vue mapboxgl points */

import points from "./points.js";
import namesRaw from "./names.js";

const default_active = ["Africa"];

window.foo = namesRaw;

const names = namesRaw
  .sort((a, b) => (a.name > b.name ? 1 : -1))
  .map((n) => ({ ...n, active: true, show: true }));

const setActive = (names, active, include) => {
  if (typeof include === "undefined") include = names.map((n) => n.name);
  return names.map((n) => ({
    ...n,
    active: include.includes(n.name) ? active : false,
  }));
};

// eslint-disable-next-line no-unused-vars
const app = new Vue({
  el: "#sidebar",
  data: {
    //names: setActive(names, true, default_active),
    names: setActive(names, true),
    search: "",
  },
  computed: {
    searchLow: function () {
      return this.search.toLowerCase();
    },
    show: function () {
      return this.names
        .filter(
          (n) =>
            n.name.toLowerCase().includes(this.searchLow) |
            n.tags.toLowerCase().includes(this.searchLow)
        )
        .map((n) => n.name);
    },
  },
  watch: {
    names: {
      handler: function (names) {
        filter(names);
      },
      deep: true,
    },
  },
  methods: {
    clear: function () {
      this.names = setActive(this.names, false);
    },
    all: function () {
      this.names = setActive(this.names, true);
    },
    reset: function () {
      this.names = setActive(this.names, true, default_active);
    },
    zoom: function (name) {
      zoom(name);
    },
  },
});

const zoom = (name) => {
  const coords = points.features
    .filter((f) => f.properties.name == name)
    .map((f) => f.geometry.coordinates);
  const lons = coords.map((c) => c[0]);
  const lats = coords.map((c) => c[1]);
  const bounds = [
    [Math.min(...lons), Math.min(...lats)],
    [Math.max(...lons), Math.max(...lats)],
  ];
  map.fitBounds(bounds, {padding: {top: 10, bottom: 10, left: 360, right: 10}});
};

const filter = (names) => {
  const active = names.filter((n) => n.active == true).map((n) => n.name);
  map.setFilter("points", ["in", "name", ...active]);
};

mapboxgl.accessToken =
  "pk.eyJ1IjoiY2FyZGVybmUiLCJhIjoiY2puMXN5cnBtNG53NDN2bnhlZ3h4b3RqcCJ9.eNjrtezXwvM7Ho1VSxo06w";
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v10",
  bounds: [-80, -40, 80, 40],
  fitBoundsOptions: { padding: {top: 10, bottom: 10, left: 360, right: 10}},
});

map.on("load", () => {
  map.addSource("points", {
    type: "geojson",
    data: points,
  });

  map.addLayer({
    id: "points",
    type: "symbol",
    source: "points",
    layout: {
      "text-field": "{bearing}",
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "symbol-sort-key": ["get", "order"],
      "text-size": ["match", ["get", "order"], 1, 40, 2, 27, 3, 15, 4, 15, 3],
    },
    paint: {
      "text-halo-width": 3,
      "text-halo-color": "#fff",
      "text-halo-blur": 3,
      "text-color": "#000",
    },
  });

  filter(app.names);
});
