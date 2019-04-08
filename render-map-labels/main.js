//require modules
const d3 = require("d3");
const fs = require("fs");
const jsdom = require("jsdom");
const { geoPath } = require("d3-geo");
const { getProjectionFromConfig, writeFileSave, dataPathFromConfig, exportPathFromConfig } = require("../utils"); 

const { JSDOM } = jsdom;

// load the config from file
const CONFIG_FILE = process.argv[2] || "config";
const { config: CONFIG } = require(`./${CONFIG_FILE}`);

const FOLDER_EXPORT = exportPathFromConfig(CONFIG);
const FOLDER_DATA = dataPathFromConfig(CONFIG);

//SVG dimensions
const WIDTH = CONFIG.dimensions.width;
const HEIGHT = CONFIG.dimensions.height;

const PATH = geoPath(getProjectionFromConfig(CONFIG));

CONFIG.layers.forEach(function(layer) {
  runForSingleFile(layer);
});

function runForSingleFile(filePath) {
  const features = [];
  const file = fs.readFileSync(`${FOLDER_DATA}/${filePath}`, "utf8");
  const inputFile = JSON.parse(file);

  inputFile.features.forEach(function (item) {
    item.properties.featurecla = item.properties.featurecla.replace("/", "_");
    features[item.properties.featurecla] = features[item.properties.featurecla] || [];
    features[item.properties.featurecla]["s" + item.properties.scalerank] =
      features[item.properties.featurecla]["s" + item.properties.scalerank] || [];
    features[item.properties.featurecla]["s" + item.properties.scalerank].push(item);
  });

  generateLabels(features);
}

function createForArray(features, featurecla, scalerank) {
  const { document } = new JSDOM("<!doctype html>").window;
  const svg = d3
    .select(document.body)
    .append("svg")
    .attr("width", WIDTH)
    .attr("height", HEIGHT)
    .attr("xmlns", "http://www.w3.org/2000/svg");

  const outname = `${featurecla}_${scalerank}`;
  const container = svg.append("g").attr("id", outname);

  for (i = 0; i < features[featurecla][scalerank].length; i++) {
    const item = features[featurecla][scalerank][i];
    const { name } = item.properties;

    const ITEM_CENTROID = PATH.centroid(item);

    //Create an SVG path
    container
      .append("path")
      .attr("id", name)
      .attr("d", PATH(item))
      .style("stroke", "#000")
      .style("fill", "none");

    container
      .append("text")
      .attr("id", name)
      .attr("x", ITEM_CENTROID[0])
      .attr("y", ITEM_CENTROID[1])
      .attr("text-anchor", "middle")
      .text(name);
  }

  const outpath = `${FOLDER_EXPORT}/labels/rendered`;
  const outfile = `${outname}.svg`;
  const outdata = document.body.firstChild.outerHTML.replace(/textpath/gi, "textPath");
  
  writeFileSave(outpath, outfile, outdata, function(err) {
    if (err) {
      return console.log(err);
    }
    console.log("The file was saved!");
  });
}

function generateLabels(features) {
  for (let featurecla in features) {
    if (features.hasOwnProperty(featurecla)) {
      for (let scalerank in features[featurecla]) {
        if (features[featurecla].hasOwnProperty(scalerank)) {
          createForArray(
            features,
            featurecla,
            scalerank
          );
        }
      }
    }
  }
}
