class ChoroplethMap {
  constructor(_config) {
    this.config = {
      parentElement: _config.parentElement,
      geoData: _config.geoData,
      field: _config.field,
      legendTitle: _config.legendTitle,
      year: _config.year,
      width: 980,
      marginTop: 60,
      legendWidth: 260,
      legendHeight: 12,
    };

    this.gradientId = `legend-gradient-${this.config.parentElement}`;
    this.initVis();
  }

  initVis() {
    const vis = this;

    vis.height = vis.config.width / 2 + vis.config.marginTop;

    // SVG
    vis.svg = d3
      .select(`#${vis.config.parentElement}`)
      .append("svg")
      .attr("width", vis.config.width)
      .attr("height", vis.height)
      .attr("viewBox", [0, 0, vis.config.width, vis.height])
      .style("max-width", "100%")
      .style("height", "auto");

    // Map group
    vis.mapGroup = vis.svg
      .append("g")
      .attr("transform", `translate(0, ${vis.config.marginTop})`);

    // Projection
    vis.projection = d3.geoNaturalEarth1();
    vis.path = d3.geoPath().projection(vis.projection);

    // Color scale
    vis.colorScale = d3.scaleSequential(d3.interpolateYlGnBu);

    // ========================
    // Legend
    // ========================
    vis.legendGroup = vis.svg
      .append("g")
      .attr("transform", `translate(40, ${vis.config.marginTop - 40})`);

    // Legend title
    vis.legendTitleText = vis.legendGroup
      .append("text")
      .attr("class", "legend-title")
      .attr("x", 0)
      .attr("y", 0)
      .style("font-size", "13px")
      .style("font-weight", "500");

    // Gradient
    vis.defs = vis.svg.append("defs");

    vis.linearGradient = vis.defs
      .append("linearGradient")
      .attr("id", vis.gradientId)
      .attr("x1", "0%")
      .attr("x2", "100%");

    // Gradient bar
    vis.legendRect = vis.legendGroup
      .append("rect")
      .attr("x", 0)
      .attr("y", 10)
      .attr("width", vis.config.legendWidth)
      .attr("height", vis.config.legendHeight)
      .attr("fill", `url(#${vis.gradientId})`);

    // Axis group
    vis.legendAxisGroup = vis.legendGroup
      .append("g")
      .attr("transform", `translate(0, ${10 + vis.config.legendHeight})`);

    vis.updateVis();
  }

  updateVis() {
    const vis = this;

    const values = vis.config.geoData.features
      .map((d) => d.properties[vis.config.field])
      .filter((d) => d != null && !isNaN(d));

    const extent = d3.extent(values);

    if (!extent || extent[0] == null) return;

    vis.colorScale.domain(extent);
    vis.renderVis(extent);
  }

  renderVis(extent) {
    const vis = this;

    // Fit projection
    vis.projection.fitSize(
      [vis.config.width, vis.height - vis.config.marginTop],
      vis.config.geoData,
    );

    // ========================
    // DRAW MAP
    // ========================
    vis.mapGroup
      .selectAll(".country")
      .data(vis.config.geoData.features)
      .join("path")
      .attr("class", "country")
      .attr("d", vis.path)
      .attr("stroke", "#ccc")
      .attr("fill", (d) => {
        const value = d.properties[vis.config.field];
        return value != null ? vis.colorScale(value) : "url(#lightstripe)";
      });

    // ========================
    // LEGEND
    // ========================
    vis.legendTitleText.text(`${vis.config.legendTitle} (${vis.config.year})`);

    const legendScale = d3
      .scaleLinear()
      .domain(extent)
      .range([0, vis.config.legendWidth]);

    const legendAxis = d3
      .axisBottom(legendScale)
      .ticks(5)
      .tickSize(-vis.config.legendHeight - 2)
      .tickFormat(d3.format("~s"));

    // Gradient stops
    const stops = d3.range(0, 1.01, 0.02).map((t) => ({
      offset: `${t * 100}%`,
      color: vis.colorScale(extent[0] + t * (extent[1] - extent[0])),
    }));

    vis.linearGradient
      .selectAll("stop")
      .data(stops)
      .join("stop")
      .attr("offset", (d) => d.offset)
      .attr("stop-color", (d) => d.color);

    vis.legendAxisGroup.call(legendAxis);

    // Clean axis style
    vis.legendAxisGroup.select(".domain").remove();
    vis.legendAxisGroup.selectAll("text").style("font-size", "11px");
  }

  setField(newField, newLegendTitle) {
    this.config.field = newField;
    this.config.legendTitle = newLegendTitle;
    this.updateVis();
  }
}
