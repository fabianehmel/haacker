const { Layer } = require("./Layer");

class FilledLayer extends Layer {
  constructor(attr) {
    super(attr.renderer);
    this.data = attr.data;
    this.color = attr.style.color;
  }

  render() {
    console.log(
      "Rendering FilledLayer. This might take a while, please be patient…"
    );

    this.renderer.renderFilledLayer(this.data, this.color);
  }
}

exports.FilledLayer = FilledLayer;
