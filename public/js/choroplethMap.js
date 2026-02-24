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
      .style("cursor", (d) =>
        Number.isFinite(d.properties[vis.config.field]) ? "pointer" : "default",
      )
      .attr("fill", (d) => {
        const v = d.properties[vis.config.field];
        return Number.isFinite(v) ? vis.colorScale(v) : "url(#lightstripe)";
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.5)
      .attr("paint-order", "stroke")
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
        const tooltipWidth = 160;
        let xPos = event.pageX + 15;
        if (xPos + tooltipWidth > window.innerWidth)
          xPos = event.pageX - tooltipWidth - 15;
        vis.tooltip
          .style("left", xPos + "px")
          .style("top", event.pageY - 25 + "px");
      })
      .on("mouseleave", function (event, d) {
        const isSelected =
          !vis.lastSelection || vis.lastSelection.includes(d.properties.name);
        console.log(
          "Is Selected:",
          isSelected,
          "Last Selection:",
          vis.lastSelection,
        );
        d3.select(this)
          .attr("stroke", isSelected ? "#fff" : "#e2e8f0")
          .attr("stroke-width", isSelected ? 0.5 : 0.3);

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
    const paths = vis.mapGroup.selectAll("path");

    // 1. Handle Semantic Zooming
    if (selectedIDs && selectedIDs.length > 0) {
      const selectedFeatures = vis.config.geoData.features.filter((d) =>
        selectedIDs.includes(d.properties.name),
      );
      if (selectedFeatures.length > 0) {
        vis.projection.fitSize([vis.width - 40, vis.height - 80], {
          type: "FeatureCollection",
          features: selectedFeatures,
        });
      }
    } else {
      vis.projection.fitSize(
        [vis.width - 40, vis.height - 80],
        vis.config.geoData,
      );
    }

    vis.path.projection(vis.projection);

    // 2. Handle Filtered Styling and Interactivity
    paths
      .transition()
      .duration(750)
      .attr("d", vis.path)
      .attr("fill", (d) => {
        const isSelected =
          !selectedIDs || selectedIDs.includes(d.properties.name);
        if (isSelected) {
          const v = d.properties[vis.config.field];
          return Number.isFinite(v) ? vis.colorScale(v) : "url(#lightstripe)";
        }
        return "url(#lightstripe)"; // Filtered out
      })
      .attr("fill-opacity", (d) =>
        !selectedIDs || selectedIDs.includes(d.properties.name) ? 1 : 0.2,
      )
      .attr("stroke", (d) =>
        !selectedIDs || selectedIDs.includes(d.properties.name)
          ? "#fff"
          : "#e2e8f0",
      )
      .attr("stroke-width", (d) =>
        !selectedIDs || selectedIDs.includes(d.properties.name) ? 0.5 : 0.2,
      )
      .style("pointer-events", (d) =>
        !selectedIDs || selectedIDs.includes(d.properties.name)
          ? "all"
          : "none",
      );
  }
}
