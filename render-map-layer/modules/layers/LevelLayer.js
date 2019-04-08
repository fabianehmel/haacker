const fs = require("fs");
const chroma = require("chroma-js");
const { Layer } = require("./Layer");

class LevelLayer extends Layer {
  constructor(attr) {
    if (attr !== null && typeof attr === "object") {
      // set renderer
      if (attr.hasOwnProperty("renderer") && attr.renderer !== null) {
        super(attr.renderer);
      }

      this.layers = [];
      this.colorScale = [];
      this.colorEasing = [];
      this.domain = [];
      this.chroma;
      this.path;

      // set data path and load geojsons
      if (attr.hasOwnProperty("path") && attr.path !== null) {
        this.path = attr.path;
        this.loadGEOJSONs();
      }

      // filter the levels
      if (attr.hasOwnProperty("filters") && Array.isArray(attr.filters)) {
        this.filters = attr.filters;
        for (let i = 0; i < this.filters.length; i++) {
          this.layers = this.layers.filter(this.filters[i]);
        }
      }

      // sort by desc or asc (default)
      if (
        attr.hasOwnProperty("sort") &&
        attr.sort !== null &&
        attr.sort === "desc"
      ) {
        this.sortDESC();
      } else {
        this.sortASC();
      }

      // set domain if it is set
      if (attr.hasOwnProperty("domain") && Array.isArray(attr.domain)) {
        this.explicitDomain(attr.domain);
      } else {
        this.basicDomain();
      }

      // reverse domain if needed
      if (attr.hasOwnProperty("reverseDomain") && attr.reverseDomain === true) {
        this.reverseDomain();
      }

      // defines color
      if (
        attr.style.hasOwnProperty("color") &&
        attr.style.color !== null &&
        typeof attr.style.color === "object"
      ) {
        // easing
        if (
          attr.style.color.hasOwnProperty("easing") &&
          Array.isArray(attr.style.color.easing)
        ) {
          this.colorEasing = attr.style.color.easing;
        }
        // scale
        if (
          attr.style.color.hasOwnProperty("scale") &&
          Array.isArray(attr.style.color.scale)
        ) {
          this.colorScale = attr.style.color.scale;
        }
      }

      // generate Chroma
      this.generateChroma();
    }
  }

  loadGEOJSONs() {
    fs.readdirSync(this.path).forEach(file => {
      let filenameWithoutExtension = file.replace(/\.[^/.]+$/, "");
      if (file.indexOf(".geojson") >= 0) {
        this.layers.push(parseInt(filenameWithoutExtension));
      }
    });
  }

  setColorScale(cs) {
    this.colorScale = cs;
  }
  setColorEasing(ce) {
    this.colorEasing = ce;
  }
  setPath(p) {
    this.path = p;
  }

  reverseDomain() {
    this.domain.reverse();
  }

  basicDomain() {
    this.domain = [
      getMinOfLayerList(this.layers),
      getMaxOfLayerList(this.layers)
    ];
  }

  explicitDomain(dmn) {
    for (let i = 0; i < dmn.length; i++) {
      if (dmn[i] == "min") {
        dmn[i] = getMinOfLayerList(this.layers);
      }
      if (dmn[i] == "max") {
        dmn[i] = getMaxOfLayerList(this.layers);
      }
    }
    this.domain = dmn;
  }

  generateChroma() {
    this.chroma = chroma
      .scale(this.colorScale)
      .mode("lab")
      .domain(this.domain);
  }

  sortASC() {
    this.layers.sort(sortNumber);
  }
  sortDESC() {
    this.layers.sort(sortNumber).reverse();
  }

  // GETTER
  getPath() {
    return this.path;
  }
  getLayers() {
    return this.layers;
  }
  getChroma() {
    return this.chroma;
  }
  getColorEasing() {
    return this.colorEasing;
  }

  render() {
    // this.layers = this.layers.filter((_, i) => i % 20 === 0);

    console.log(
      `Rendering LevelLayer for path ${this.path} for ${
        this.layers.length
      } layers. This might take a while, please be patient…`
    );
    this.renderer.renderLevelLayer(this);
  }
}

function sortNumber(a, b) {
  return a - b;
}

function getMaxOfLayerList(layer) {
  let max = 0;
  for (let i = 0; i < layer.length; i++) {
    let currentInt = parseInt(layer[i]);
    if (currentInt > max) {
      max = currentInt;
    }
  }
  return max;
}

function getMinOfLayerList(layer) {
  let min = 0;
  for (let i = 0; i < layer.length; i++) {
    let currentInt = parseInt(layer[i]);
    if (currentInt < min) {
      min = currentInt;
    }
  }
  return min;
}

exports.LevelLayer = LevelLayer;
