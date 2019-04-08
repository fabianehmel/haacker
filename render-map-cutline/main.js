//require modules
const d3 = require("d3")
const fs = require("fs");
const jsdom = require("jsdom");
const { geoPath } = require("d3-geo");
const { getProjectionFromConfig, writeFileSave, exportPathFromConfig } = require("../utils"); 

const { JSDOM } = jsdom;
const { document } = new JSDOM("<!doctype html>").window;

// load the config from file
const CONFIG_FILE = process.argv[2] || "config";
const { config: CONFIG } = require(`./${CONFIG_FILE}`);

const FOLDER_EXPORT = exportPathFromConfig(CONFIG);

//SVG dimensions
const WIDTH = CONFIG.dimensions.width;
const HEIGHT = CONFIG.dimensions.height;

const PATH = geoPath(getProjectionFromConfig(CONFIG));

const SVG = d3
  .select(document.body)
  .append("svg")
  .attr("width", WIDTH)
  .attr("height", HEIGHT)
  .attr("xmlns", "http://www.w3.org/2000/svg");

SVG
  .append("path")
  .attr("d", PATH({ type: "Sphere" }))

const outpath = `${FOLDER_EXPORT}/cutline/rendered`;
const outfile = 'cutline.svg';
const outdata = document.body.firstChild.outerHTML;

writeFileSave(outpath, outfile, outdata, function (err) {
  if (err) {
    return console.log(err);
  }
  console.log("The file was saved!");
});