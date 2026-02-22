class ChoroplethMap {
  constructor(config) {
    this.config = config;
    this.gradientId = `${this.config.parentElement}-legend-gradient`;
    this.legendTitle = config.legendTitle || "";
    this.initVis();
    window.addEventListener("resize", () => this.resize());
  }

  initVis() {
    const container = d3.select(`#${this.config.parentElement}`);
    const bounds = container.node().getBoundingClientRect();
    this.width = bounds.width;
    this.height = bounds.height;

    this.svg = container
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${this.width} ${this.height}`);

    this.mapGroup = this.svg.append("g");
    this.legendGroup = this.svg.append("g");

    this.projection = d3.geoNaturalEarth1();
    this.path = d3.geoPath().projection(this.projection);

    this.updateVis();
  }

  updateVis() {
    const values = this.config.geoData.features.map(
      (d) => d.properties[this.config.field],
    );

    if (values.length === 0) return;

    const [rawMin, rawMax] = d3.extent(values);
    const min = rawMin;
    const max = rawMax === rawMin ? rawMax + 1 : rawMax;
    const median = d3.median(values);
    const canUseLog = min > 0 && Number.isFinite(median) && median > 0;
    const skewRatio = canUseLog ? max / median : 0;

    this.scaleType = canUseLog && skewRatio > 4 ? "log" : "linear";

    this.colorScale =
      this.scaleType === "log"
        ? d3.scaleSequentialLog(d3.interpolateBlues).domain([min, max])
        : d3.scaleSequential(d3.interpolateViridis).domain([min, max]);

    this.renderVis([min, max]);
  }

  renderVis(extent) {
    const padding = 20;
    const mapWidth = Math.max(10, this.width - padding);
    const mapHeight = Math.max(10, this.height - 60);

    this.projection.fitSize([mapWidth, mapHeight], this.config.geoData);

    this.mapGroup
      .attr("transform", `translate(${padding},${padding})`)
      .selectAll("path")
      .data(this.config.geoData.features)
      .join("path")
      .attr("d", this.path)
      .attr("fill", (d) => {
        const v = d.properties[this.config.field];
        return Number.isFinite(v) ? this.colorScale(v) : "url(#lightstripe)";
      })
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 0.8);

    this.renderLegend(extent);
  }

  renderLegend(extent) {
    const legendWidth = 220;
    const legendHeight = 10;
    const min = extent[0];
    const max = extent[1];

    this.legendGroup.selectAll("*").remove();

    const defs = this.svg.selectAll("defs").data([null]).join("defs");
    const gradient = defs
      .selectAll(`linearGradient#${this.gradientId}`)
      .data([null])
      .join("linearGradient")
      .attr("id", this.gradientId)
      .attr("x1", "0%")
      .attr("x2", "100%");
    gradient.selectAll("stop").remove();

    d3.range(0, 1.01, 0.1).forEach((t) => {
      const stopValue =
        this.scaleType === "log"
          ? min * Math.pow(max / min, t)
          : min + t * (max - min);
      gradient
        .append("stop")
        .attr("offset", `${t * 100}%`)
        .attr("stop-color", this.colorScale(stopValue));
    });

    this.legendGroup.attr(
      "transform",
      `translate(${this.width - legendWidth - 30}, ${this.height - 30})`,
    );

    this.legendGroup
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .attr("rx", 4)
      .attr("fill", `url(#${this.gradientId})`);

    const scale =
      this.scaleType === "log"
        ? d3.scaleLog().domain([min, max]).range([0, legendWidth])
        : d3.scaleLinear().domain([min, max]).range([0, legendWidth]);

    this.legendGroup
      .append("g")
      .attr("transform", `translate(0, ${legendHeight})`)
      .call(d3.axisBottom(scale).ticks(5, "~s"))
      .select(".domain")
      .remove();

    if (this.config.legendTitle) {
      this.legendGroup
        .append("text")
        .attr("x", 0)
        .attr("y", -6)
        .attr("font-size", 11)
        .attr("font-weight", 600)
        .attr("fill", "#334155")
        .text(this.config.legendTitle);
    }
  }

  setField(field, legendTitle) {
    this.config.field = field;
    if (legendTitle) this.config.legendTitle = legendTitle;
    this.updateVis();
  }

  resize() {
    const container = d3.select(`#${this.config.parentElement}`);
    const bounds = container.node().getBoundingClientRect();
    this.width = bounds.width;
    this.height = bounds.height;
    this.svg.attr("viewBox", `0 0 ${this.width} ${this.height}`);
    this.updateVis();
  }
}
