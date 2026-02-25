class ChoroplethMap {
  constructor(config) {
    this.config = config;
    this.gradientId = `${this.config.parentElement}-legend-gradient`;
    this.legendTitle = config.legendTitle || "";
    this.lastSelection = null;
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

    vis.brushG = vis.svg.append("g").attr("class", "brush");

    vis.mapGroup = vis.svg.append("g");
    vis.legendGroup = vis.svg.append("g");

    vis.projection = d3.geoNaturalEarth1();
    vis.path = d3.geoPath().projection(vis.projection);

    vis.brush = d3.brush().on("brush end", (event) => vis.brushed(event));

    vis.tooltip = d3
      .select("body")
      .selectAll(".chart-tooltip")
      .data([null])
      .join("div")
      .attr("class", "chart-tooltip")
      .style("opacity", 0);

    const defs = vis.svg.append("defs");

    defs
      .append("pattern")
      .attr("id", "striped-pattern")
      .attr("patternUnits", "userSpaceOnUse")
      .attr("width", 5)
      .attr("height", 5)
      .append("image")
      .attr(
        "xlink:href",
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc1JyBoZWlnaHQ9JzUnPgogIDxyZWN0IHdpZHRoPSc1JyBoZWlnaHQ9JzUnIGZpbGw9J3doaXRlJy8+CiAgPHBhdGggZD0nTTAgNUw1IDBaTTYgNEw0IDZaTS0xIDFMMSAtMVonIHN0cm9rZT0nIzg4OCcgc3Ryb2tlLXdpZHRoPScxJy8+Cjwvc3ZnPg==",
      )
      .attr("width", 5)
      .attr("height", 5);

    vis.updateVis();
  }

  updateVis() {
    const vis = this;
    const values = vis.config.geoData.features.map(
      (d) => d.properties[vis.config.field],
    );
    if (values.length === 0) return;

    vis.brush.extent([
      [0, 0],
      [vis.width, vis.height],
    ]);
    vis.brushG.call(vis.brush);

    const [min, max] = d3.extent(values);
    const median = d3.median(values);
    const canUseLog = min > 0 && Number.isFinite(median) && median > 0;

    vis.scaleType = canUseLog && max / median > 4 ? "log" : "linear";
    vis.colorScale =
      vis.scaleType === "log"
        ? d3.scaleSequentialLog(d3.interpolateBlues).domain([min, max])
        : d3.scaleSequential(d3.interpolateYlGnBu).domain([min, max]);

    vis.renderVis(d3.extent(values.filter(Number.isFinite)));
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
      .attr("fill", (d) => {
        const v = d.properties[vis.config.field];
        return Number.isFinite(v) ? vis.colorScale(v) : "url(#striped-pattern)";
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.5)
      .on("mouseover", function (event, d) {
        d3.select(this)
          .raise()
          .attr("stroke", "#0f172a")
          .attr("stroke-width", 1.5);
        vis.tooltip.style("opacity", 1).html(`
          <strong>${d.properties.name || "Unknown"}</strong><br/>
          ${vis.config.legendTitle}: ${Number.isFinite(d.properties[vis.config.field]) ? d3.format(",.2s")(d.properties[vis.config.field]) : "No Data"}
        `);
      })
      .on("mousemove", (event) => {
        vis.tooltip
          .style("left", event.pageX + 15 + "px")
          .style("top", event.pageY - 25 + "px");
      })
      .on("mouseleave", function (event, d) {
        const isSelected =
          !vis.lastSelection || vis.lastSelection.includes(d.properties.name);
        d3.select(this)
          .attr("stroke", isSelected ? "#fff" : "#e2e8f0")
          .attr("stroke-width", 0.5);
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

  updateSelection(selectedIDs) {
    const vis = this;
    vis.lastSelection = selectedIDs;
    vis.mapGroup
      .selectAll("path")
      .transition()
      .duration(400)
      .attr("fill-opacity", (d) =>
        !selectedIDs || selectedIDs.includes(d.properties.name) ? 1 : 0.2,
      )
      .attr("fill", (d) => {
        const v = d.properties[vis.config.field];
        if (!Number.isFinite(v)) {
          return "url(#striped-pattern)";
        }
        return vis.colorScale(v);
      })
      .style("pointer-events", (d) =>
        !selectedIDs || selectedIDs.includes(d.properties.name)
          ? "all"
          : "none",
      );
  }

  brushed(event) {
    const vis = this;
    if (!event.sourceEvent) return;
    if (!event.selection) {
      vis.config.onBrush(null);
      return;
    }

    // Define padding used in renderVis
    const paddingX = 20 / 2;
    const paddingY = 20;

    const [[x0, y0], [x1, y1]] = event.selection;

    const selectedIDs = vis.config.geoData.features
      .filter((d) => {
        const bounds = vis.path.bounds(d);

        const countryLeft = bounds[0][0] + paddingX;
        const countryTop = bounds[0][1] + paddingY;
        const countryRight = bounds[1][0] + paddingX;
        const countryBottom = bounds[1][1] + paddingY;

        return (
          countryRight >= x0 &&
          countryLeft <= x1 &&
          countryBottom >= y0 &&
          countryTop <= y1
        );
      })
      .map((d) => d.properties.name);

    vis.config.onBrush(selectedIDs);
  }
}
