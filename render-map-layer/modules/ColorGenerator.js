const bezierEasing = require("bezier-easing");

function mapValue(rangeIn, rangeOut, value) {
  let rangeIn_Min = getMinOfArray(rangeIn);
  let rangeIn_Max = getMaxOfArray(rangeIn);
  let rangeOut_Min = getMinOfArray(rangeOut);
  let rangeOut_Max = getMaxOfArray(rangeOut);
  return (
    ((value - rangeIn_Min) * (rangeOut_Max - rangeOut_Min)) /
      (rangeIn_Max - rangeIn_Min) +
    rangeOut_Min
  );
}

function getMaxOfArray(numArray) {
  return Math.max.apply(null, numArray);
}
function getMinOfArray(numArray) {
  return Math.min.apply(null, numArray);
}

class ColorGenerator {
  constructor() {
    this.colorEasing;
    this.resetColorEasing();
    this.chromaScale = {};
    this.chromaScale.min = 0;
    this.chromaScale.max = 1;
    this.inputScale = {};
    this.inputScale.min;
    this.inputScale.max;
    this.colorScheme;
  }

  setColorEasing(ea) {
    this.colorEasing = bezierEasing(ea[0], ea[1], ea[2], ea[3]);
  }

  resetColorEasing() {
    this.colorEasing = bezierEasing(0, 0, 1, 1);
  }

  setColorScheme(cs) {
    this.colorScheme = cs;
  }

  setInputScale(min, max) {
    this.inputScale.min = min;
    this.inputScale.max = max;
  }

  getColor(input) {
    let temp_val = mapValue(
      [this.inputScale.min, this.inputScale.max],
      [this.chromaScale.min, this.chromaScale.max],
      input
    );
    temp_val = this.colorEasing(temp_val);
    let val_orig = Math.round(
      mapValue(
        [this.chromaScale.min, this.chromaScale.max],
        [this.inputScale.min, this.inputScale.max],
        temp_val
      )
    );
    return this.colorScheme(val_orig).hex();
  }
}

exports.ColorGenerator = ColorGenerator;
