exports.config = {
  dimensions: {
    height: 1000,
    width: 1000
  },
  projection: {
    name: "mercator",
    settings: {
      rotate: [0, 0],
      precision: 0
    }
  },
  layers: [
    "path/to/file.geojson",
    "path/to/file.geojson"
  ]
};
