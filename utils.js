const d3 = Object.assign(
  {},
  require("d3"),
  require("d3-scale"),
  require("d3-geo"),
  require("d3-geo-projection")
);
const fs = require("fs");
var mkdirp = require('mkdirp');

function getProjectionFromConfig(config) {
  const { dimensions, projection } = config;
  const { width, height } = dimensions;
  let finalProjection;

  if ("projection" in config) {
    const { scalefactor, settings } = projection;
    finalProjection = d3[projection.name]();

    for (let setting in settings) {
      if (settings.hasOwnProperty(setting)) {
        finalProjection[setting](settings[setting]);
      }
    }

    finalProjection.scale(width / scalefactor);
  } else {
    finalProjection = d3.geoMercator();
    finalProjection.scale(width / 2 / Math.PI);
  }

  return finalProjection.translate([width / 2, height / 2]);
}

function createFolderIfNotExists(folder) {
  if (!fs.existsSync(folder)) {
    mkdirp.sync(folder, function (err) {
      if (err) console.error(err)
    });
  }
}

function writeFileSave(path, file, data, callback) {
  mkdirp(path, function (err) {
    if (err) return callback(err);
    fs.writeFile(`${path}/${file}`, data, callback);
  });
}

function exportPathFromConfig(config) {
  return config.hasOwnProperty("filepath") ? config.filepaths.export || "export" : "export";
}

function dataPathFromConfig(config) {
  return config.hasOwnProperty("filepath") ? config.filepaths.data || "data" : "data";
}


module.exports = {
  getProjectionFromConfig,
  createFolderIfNotExists,
  writeFileSave,
  exportPathFromConfig,
  dataPathFromConfig
}