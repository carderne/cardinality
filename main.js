/* global Vue mapboxgl points */

import points from "./points.js";

mapboxgl.accessToken =
  "pk.eyJ1IjoiY2FyZGVybmUiLCJhIjoiY2puMXN5cnBtNG53NDN2bnhlZ3h4b3RqcCJ9.eNjrtezXwvM7Ho1VSxo06w";
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v10",
  bounds: [-180, -70, 180, 70],
  fitBoundsOptions: { padding: 50 },
});

const default_active = ["Africa"];

const names = points.features
  .map((f) => f.properties.name)
  .filter((v, i, s) => s.indexOf(v) === i)
  .sort()
  .map((n) => ({ name: n, active: default_active.includes(n) ? true : false }));

// eslint-disable-next-line no-unused-vars
const app = new Vue({
  el: "#sidebar",
  data: {
    names: names,
  },
  watch: {
    names: {
      handler: function (names) {
        filter(names);
      },
      deep: true,
    },
  },
});

const filter = (names) => {
  const active = names.filter((n) => n.active == true).map((n) => n.name)
  map.setFilter("points", ["in", "name", ...active]);
};

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

  filter(names);

  map.on("click", (e) => {
    const lng = e.lngLat.lng;
    const lat = e.lngLat.lat;
    const coords = [
      [lng + 20, lat + 20],
      [lng - 20, lat - 20],
    ];
    const data = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: coords,
      },
    };

    if (typeof myVar === "undefined") {
      map.addSource("line", {
        type: "geojson",
        data: data,
      });
      map.addLayer({
        id: "line",
        type: "line",
        source: "line",
      });
    } else {
      map.getSource("line").setData(data);
    }
  });
});
