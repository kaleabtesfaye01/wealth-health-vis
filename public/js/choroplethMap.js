class ChoroplethMap {
  constructor(_config) {
    this.config = {
      parentElement: _config.parentElement,
      geoData: _config.geoData,
      field: _config.field,
      title: _config.title,
      year: _config.year,
      containerWidth: _config.containerWidth || 900,
      containerHeight: _config.containerHeight || 500,
      margin: _config.margin || { top: 50, right: 20, bottom: 50, left: 20 },
      legendRectWidth: 200,
      legendRectHeight: 12,
    };

    this.initVis();
  }

  initVis() {
    const vis = this;

    vis.width =
      vis.config.containerWidth -
      vis.config.margin.left -
      vis.config.margin.right;

    vis.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;

    vis.svg = d3
      .select(`#${vis.config.parentElement}`)
      .append("svg")
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight);

    vis.chart = vis.svg
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.margin.left},${vis.config.margin.top})`,
      );

    // Title
    vis.svg
      .append("text")
      .attr("class", "chart-title")
      .attr("x", vis.config.containerWidth / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .text(`${vis.config.title} (${vis.config.year})`);

    // Projection & Path
    vis.projection = d3.geoNaturalEarth1();
    vis.geoPath = d3.geoPath().projection(vis.projection);

    // Color scale
    vis.colorScale = d3.scaleSequential().interpolator(d3.interpolateBlues);

    // Legend group
    vis.legend = vis.svg
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.containerWidth / 2 - 90}, ${
          vis.config.containerHeight - 40
        })`,
      );

    vis.defs = vis.svg.append("defs");

    vis.linearGradient = vis.defs
      .append("linearGradient")
      .attr("id", "legend-gradient");

    vis.legendRect = vis.legend
      .append("rect")
      .attr("width", vis.config.legendRectWidth)
      .attr("height", vis.config.legendRectHeight)
      .attr("fill", "url(#legend-gradient)");

    vis.legendAxisGroup = vis.legend
      .append("g")
      .attr("transform", `translate(0, ${vis.config.legendRectHeight})`);

    vis.updateVis();
  }

  updateVis() {
    const vis = this;

    const values = vis.config.geoData.features
      .map((d) => d.properties[vis.config.field])
      .filter((d) => d !== undefined && !isNaN(d));

    const extent = d3.extent(values);

    vis.colorScale.domain(extent);

    vis.renderVis(extent);
  }

  renderVis(extent) {
    const vis = this;

    vis.projection.fitSize([vis.width, vis.height], vis.config.geoData);

    // Draw countries
    vis.chart
      .selectAll(".country")
      .data(vis.config.geoData.features)
      .join("path")
      .attr("class", "country")
      .attr("d", vis.geoPath)
      .attr("fill", (d) => {
        const value = d.properties[vis.config.field];
        return value ? vis.colorScale(value) : "url(#lightstripe)";
      })
      .attr("stroke", "#ccc");

    // -------- Legend --------
    const legendScale = d3
      .scaleLinear()
      .domain(extent)
      .range([0, vis.config.legendRectWidth]);

    const legendAxis = d3
      .axisBottom(legendScale)
      .ticks(5)
      .tickFormat(d3.format(".3s"));

    vis.linearGradient
      .selectAll("stop")
      .data([
        { offset: "0%", color: d3.interpolateBlues(0) },
        { offset: "100%", color: d3.interpolateBlues(1) },
      ])
      .join("stop")
      .attr("offset", (d) => d.offset)
      .attr("stop-color", (d) => d.color);

    vis.legendAxisGroup.call(legendAxis);
  }

  setField(newField, newTitle) {
    this.config.field = newField;
    this.config.title = newTitle;

    this.svg
      .select(".chart-title")
      .text(`${this.config.title} (${this.config.year})`);

    this.updateVis();
  }
}
