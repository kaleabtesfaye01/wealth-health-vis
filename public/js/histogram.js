class Histogram {
  constructor(config) {
    this.config = config;
    this.margin = { top: 15, right: 15, bottom: 45, left: 50 };
    this.initVis();
  }

  initVis() {
    const vis = this;
    vis.container = d3.select(`#${vis.config.parentElement}`);
    vis.svg = vis.container
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%");
    vis.chart = vis.svg
      .append("g")
      .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

    vis.brushG = vis.chart.append("g").attr("class", "brush");
    vis.brush = d3
      .brushX()
      .handleSize(8)
      .on("brush end", (event) => vis.brushed(event));

    vis.xScale = d3.scaleLinear();
    vis.yScale = d3.scaleLinear();
    vis.xAxisG = vis.chart.append("g").attr("class", "axis x-axis");
    vis.yAxisG = vis.chart.append("g").attr("class", "axis y-axis");
    vis.xLabelText = vis.chart
      .append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", "end")
      .attr("fill", "#64748b")
      .attr("font-size", "10px");

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
    const b = vis.container.node().getBoundingClientRect();
    vis.width = b.width - vis.margin.left - vis.margin.right;
    vis.height = b.height - vis.margin.top - vis.margin.bottom;

    const values = vis.config.data
      .map((d) => d[vis.config.field])
      .filter(Number.isFinite);
    vis.xScale.domain(d3.extent(values)).nice().range([0, vis.width]);
    vis.brush.extent([
      [0, 0],
      [vis.width, vis.height],
    ]);
    vis.brushG.call(vis.brush);

    const bins = d3
      .bin()
      .domain(vis.xScale.domain())
      .thresholds(vis.xScale.ticks(20))(values);
    vis.yScale
      .domain([0, d3.max(bins, (d) => d.length)])
      .nice()
      .range([vis.height, 0]);
    vis.renderVis(bins);
  }

  renderVis(bins) {
    const vis = this;
    vis.chart
      .selectAll(".bar")
      .data(bins)
      .join("rect")
      .attr("class", "bar")
      .attr("fill", vis.config.barColor)
      .on("mouseover", (event, d) => {
        vis.tooltip
          .style("opacity", 1)
          .html(
            `<strong>Range: ${d3.format(".2s")(d.x0)} - ${d3.format(".2s")(d.x1)}</strong><br>Count: ${d.length}`,
          );
      })
      .on("mousemove", (event) => {
        // Standardized flip logic for responsive layout
        const tooltipWidth = 160;
        let xPos = event.pageX + 15;
        if (xPos + tooltipWidth > window.innerWidth)
          xPos = event.pageX - tooltipWidth - 15;

        vis.tooltip
          .style("left", xPos + "px")
          .style("top", event.pageY - 25 + "px");
      })
      .on("mouseleave", () => vis.tooltip.style("opacity", 0))
      .transition()
      .duration(600)
      .attr("x", (d) => vis.xScale(d.x0) + 1)
      .attr("y", (d) => vis.yScale(d.length))
      .attr("width", (d) =>
        Math.max(0, vis.xScale(d.x1) - vis.xScale(d.x0) - 1),
      )
      .attr("height", (d) => vis.height - vis.yScale(d.length));

    vis.xAxisG
      .attr("transform", `translate(0,${vis.height})`)
      .call(d3.axisBottom(vis.xScale).ticks(5, "~s"));
    vis.yAxisG.call(d3.axisLeft(vis.yScale).ticks(5));
    vis.xLabelText
      .attr("x", vis.width)
      .attr("y", vis.height + 35)
      .text(vis.config.xLabel);
  }

  brushed(event) {
    if (!event.sourceEvent) return;
    const selectedIDs = !event.selection
      ? null
      : this.config.data
          .filter((d) => {
            const val = d[this.config.field];
            const [x0, x1] = event.selection.map(this.xScale.invert);
            return val >= x0 && val <= x1;
          })
          .map((d) => d.country);
    this.config.onBrush(selectedIDs);
  }

  updateSelection(selectedIDs) {
    this.chart
      .selectAll(".bar")
      .transition()
      .duration(200)
      .attr("fill-opacity", (d) => {
        if (!selectedIDs) return 0.8;
        const binContainsSelected = d.some((val) =>
          selectedIDs.includes(
            this.config.data.find((c) => c[this.config.field] === val)?.country,
          ),
        );
        return binContainsSelected ? 1 : 0.1;
      })
      .style("pointer-events", selectedIDs ? "none" : "all");
  }
}
