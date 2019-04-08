const { Layer } = require("./Layer");

class StrokedLayer extends Layer {
  constructor(attr) {
    super(attr.renderer);
    this.data = attr.data;
    this.color = attr.style.color;
    this.width = attr.style.width;
  }

  render() {
    console.log(
      `Rendering Stroked Layer. This might take a while, please be patient…`
    );
    this.renderer.renderStrokedLayer(this.data, this.color, this.width);
  }
}

exports.StrokedLayer = StrokedLayer;
