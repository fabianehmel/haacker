exports.config = {
  dimensions: {
    height: 1000,
    width: 1000
  },
  projection: {
    name: "geoMercator",
    settings: {
      rotate: [0, 0],
      precision: 0
    }
  },
  filepaths: {
    data: "data",
    export: "export"
  },
  layers: [
    {
      type: "levels",
      properties: {
        path: "path/to/levels/in/geojson/format",
        style: {
          color: {
            easing: [1.0, 1.0, 1.0, 1.0],
            scale: ["#000000", "#ffffff"]
          }
        }
      }
    },
    {
      type: "filled",
      properties: {
        data: "path/to/some/file.geojson",
        style: {
          color: "#ffffff"
        }
      }
    },
    {
      type: "stroked",
      properties: {
        data: "path/to/some/file.geojson",
        style: {
          color: "#ffffff",
          width: 1
        }
      }
    }
  ]
};
