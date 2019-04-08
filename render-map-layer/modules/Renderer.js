const fs = require("fs");
const { createCanvas } = require('canvas');
const ora = require("ora");
const { ColorGenerator } = require("./ColorGenerator");
const { geoPath } = require("d3-geo");
const { getProjectionFromConfig, createFolderIfNotExists, exportPathFromConfig } = require("../../utils"); 

class Renderer {
  constructor(config) {
    this.width = config.dimensions.width;
    this.height = config.dimensions.height;
    this.exportPath = exportPathFromConfig(config);

    this.title = config.title;
    
    this.canvas = createCanvas(this.width, this.height);
    this.context = this.canvas.getContext("2d");

    this.path = this.generatePath(config);

    this.clipContextBySphere();
  }

  generatePath(config) {
    return geoPath(getProjectionFromConfig(config), this.context);
  }

  clipContextBySphere() {
    this.context.clearRect(0, 0, this.width, this.height);
    this.context.beginPath();
    this.path({ type: "Sphere" });
    this.context.clip();
    this.context.closePath();
  }

  exportPNG() {
    const fullExportFolder = `${this.exportPath}/layers/rendered`;
    createFolderIfNotExists(fullExportFolder);

    const file = `${fullExportFolder}/${this.title}.png`;
    const out = fs.createWriteStream(file);
    const stream = this.canvas.pngStream();
    const exportSpinner = ora("Exporting PNG…").start();

    stream.on("data", function(chunk) {
      out.write(chunk);
    });

    stream.on("end", function() {
      exportSpinner.succeed(`Export done! Find the file at: ${file}`);
    });
  }

  renderFilledLayer(data, color) {
    this.context.beginPath();
    this.path(data);
    this.context.fillStyle = color;
    this.context.fill();
    this.context.closePath();
  }

  renderStrokedLayer(data, color, strokeWidth) {
    this.context.beginPath();
    this.path(data);
    this.context.strokeStyle = color;
    this.context.lineWidth = strokeWidth;
    this.context.stroke();
    this.context.closePath();
  }

  renderLevelLayer(item) {
    const layerList = item.getLayers();
    const colorScheme = item.getChroma();
    const path = item.getPath();
    const easing = item.getColorEasing();

    const cG = new ColorGenerator();
    cG.setColorScheme(colorScheme);
    cG.setColorEasing(easing);
    cG.setInputScale(
      getMinOfLayerList(layerList),
      getMaxOfLayerList(layerList)
    );

    for (i = 0; i < layerList.length; i++) {
      // cache current Height
      const currentHeight = layerList[i];
      // retreive color
      const color = cG.getColor(currentHeight);
      // logging
      console.log(
        `    ${i + 1}/${
          layerList.length
        } — Rendering level ${currentHeight} — color ${color}`
      );
      // load the data
      const data = JSON.parse(
        fs.readFileSync(`${path}/${currentHeight}.geojson`, "utf8")
      );
      // render
      this.renderFilledLayer(data, color);
    }
  }
}

function getMaxOfLayerList(layer) {
  let max = 0;
  for (i = 0; i < layer.length; i++) {
    let currentInt = parseInt(layer[i]);
    if (currentInt > max) {
      max = currentInt;
    }
  }
  return max;
}

function getMinOfLayerList(layer) {
  let min = 0;
  for (i = 0; i < layer.length; i++) {
    let currentInt = parseInt(layer[i]);
    if (currentInt < min) {
      min = currentInt;
    }
  }
  return min;
}

exports.Renderer = Renderer;
