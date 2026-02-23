class ChoroplethMap {
  constructor(config) {
    this.config = config;
    this.gradientId = `${this.config.parentElement}-legend-gradient`;
    this.legendTitle = config.legendTitle || "";
    this.initVis();
    window.addEventListener("resize", () => this.resize());
  }

  initVis() {
    const vis = this;
    const container = d3.select(`#${vis.config.parentElement}`);
    const bounds = container.node().getBoundingClientRect();
    vis.width = bounds.width;
    vis.height = bounds.height;

    vis.svg = container
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${vis.width} ${vis.height}`);

    vis.mapGroup = vis.svg.append("g");
    vis.legendGroup = vis.svg.append("g");

    vis.projection = d3.geoNaturalEarth1();
    vis.path = d3.geoPath().projection(vis.projection);

    vis.tooltip = d3
      .select("body")
      .selectAll(".chart-tooltip")
      .data([null])
      .join("div")
      .attr("class", "chart-tooltip")
      .style("opacity", 0);

    vis.updateVis();
  }

  updateVis() {
    const vis = this;
    const values = vis.config.geoData.features.map(
      (d) => d.properties[vis.config.field],
    );
    if (values.length === 0) return;

    const [min, max] = d3.extent(values);
    const median = d3.median(values);
    const canUseLog = min > 0 && Number.isFinite(median) && median > 0;

    vis.scaleType = canUseLog && max / median > 4 ? "log" : "linear";
    vis.colorScale =
      vis.scaleType === "log"
        ? d3.scaleSequentialLog(d3.interpolateBlues).domain([min, max])
        : d3.scaleSequential(d3.interpolateYlGnBu).domain([min, max]);

    vis.renderVis([min, max]);
  }

  renderVis(extent) {
    const vis = this;
    const padding = 20;
    vis.projection.fitSize(
      [vis.width - padding, vis.height - 60],
      vis.config.geoData,
    );

    vis.mapGroup
      .attr("transform", `translate(${padding / 2},${padding})`)
      .selectAll("path")
      .data(vis.config.geoData.features)
      .join("path")
      .attr("d", vis.path)
      .style("cursor", (d) => {
        const v = d.properties[vis.config.field];
        return Number.isFinite(v) ? "pointer" : "default";
      })
      .attr("fill", (d) => {
        const v = d.properties[vis.config.field];
        return Number.isFinite(v) ? vis.colorScale(v) : "url(#lightstripe)";
      })
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 0.8)
      .on("mouseover", function (event, d) {
        const value = d.properties[vis.config.field];
        d3.select(this)
          .attr("stroke", "#334155")
          .attr("stroke-width", 2)
          .raise();

        vis.tooltip.style("opacity", 1).html(`
          <strong>${d.properties.name || "Unknown"}</strong><br/>
          ${vis.config.legendTitle}: ${Number.isFinite(value) ? d3.format(",.2s")(value) : "No Data"}
        `);
      })
      .on("mousemove", (event) => {
        const tooltipWidth = 160;
        let xPos = event.pageX + 15;
        if (xPos + tooltipWidth > window.innerWidth)
          xPos = event.pageX - tooltipWidth - 15;
        vis.tooltip
          .style("left", xPos + "px")
          .style("top", event.pageY - 25 + "px");
      })
      .on("mouseleave", function () {
        d3.select(this).attr("stroke", "#ffffff").attr("stroke-width", 0.8);
        vis.tooltip.style("opacity", 0);
      });

    vis.renderLegend(extent);
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
