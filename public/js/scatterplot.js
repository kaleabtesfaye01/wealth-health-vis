class Scatterplot {
  constructor(config) {
    this.config = config;
    this.margin = { top: 15, right: 15, bottom: 40, left: 50 };
    this.initVis();
  }

  initVis() {
    let vis = this;

    // Create SVG and main group only once
    vis.container = d3.select(`#${vis.config.parentElement}`);

    vis.svg = vis.container
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%");

    vis.chart = vis.svg
      .append("g")
      .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

    // Initialize Scales
    vis.xScale = d3.scaleLinear();
    vis.yScale = d3.scaleLinear();

    // Initialize Axes groups
    vis.xAxisG = vis.chart.append("g").attr("class", "axis x-axis");

    vis.yAxisG = vis.chart.append("g").attr("class", "axis y-axis");

    // Add Axis Labels
    vis.xLabel = vis.chart
      .append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", "end")
      .attr("font-size", "10px")
      .attr("fill", "#64748b");

    vis.yLabel = vis.chart
      .append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", "start")
      .attr("font-size", "10px")
      .attr("fill", "#64748b")
      .attr("transform", "rotate(-90)")
      .attr("y", -35);

    vis.tooltip = d3
      .select("body")
      .selectAll(".chart-tooltip")
      .data([null])
      .join("div")
      .attr("class", "chart-tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background", "white")
      .style("padding", "8px")
      .style("border", "1px solid #cbd5e1")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)");

    vis.brushG = vis.chart.append("g").attr("class", "brush");
    vis.brush = d3.brush().on("brush end", (event) => vis.brushed(event));

    vis.updateVis();
  }

  updateVis() {
    let vis = this;
    const bounds = vis.container.node().getBoundingClientRect();
    vis.width = bounds.width - vis.margin.left - vis.margin.right;
    vis.height = bounds.height - vis.margin.top - vis.margin.bottom;

    vis.displayData = vis.config.data.filter(
      (d) =>
        Number.isFinite(d[vis.config.xField]) &&
        Number.isFinite(d[vis.config.yField]),
    );

    vis.xScale
      .domain(d3.extent(vis.displayData, (d) => d[vis.config.xField]))
      .range([0, vis.width])
      .nice();

    vis.yScale
      .domain(d3.extent(vis.displayData, (d) => d[vis.config.yField]))
      .range([vis.height, 0])
      .nice();

    vis.brush.extent([
      [0, 0],
      [vis.width, vis.height],
    ]);
    vis.brushG.call(vis.brush);

    vis.renderVis();
  }

  renderVis() {
    let vis = this;

    const circles = vis.chart.selectAll("circle").data(vis.displayData);

    circles
      .join("circle")
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(100)
          .attr("r", 7)
          .attr("fill-opacity", 1)
          .attr("stroke", "#000");
        vis.tooltip.style("opacity", 1).html(`
        <strong>${d.country || d.name || "Details"}</strong><br/>
        ${vis.config.xLabel}: ${d3.format(",.2f")(d[vis.config.xField])}<br/>
        ${vis.config.yLabel}: ${d3.format(",.2f")(d[vis.config.yField])}
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
        d3.select(this)
          .transition()
          .duration(100)
          .attr("r", 4)
          .attr("fill-opacity", 0.6)
          .attr("stroke", vis.config.pointColor || "#30d158");
        vis.tooltip.style("opacity", 0);
      })
      .transition()
      .duration(800)
      .ease(d3.easeCubicOut)
      .attr("cx", (d) => vis.xScale(d[vis.config.xField]))
      .attr("cy", (d) => vis.yScale(d[vis.config.yField]))
      .attr("r", 4)
      .attr("fill", vis.config.pointColor || "#30d158")
      .attr("fill-opacity", 0.6)
      .attr("stroke", vis.config.pointColor || "#30d158")
      .attr("stroke-width", 1);

    // Update Axes
    vis.xAxisG
      .attr("transform", `translate(0,${vis.height})`)
      .transition()
      .duration(800)
      .call(d3.axisBottom(vis.xScale).ticks(vis.width < 300 ? 3 : 6, "~s"));

    vis.yAxisG
      .transition()
      .duration(800)
      .call(d3.axisLeft(vis.yScale).ticks(5, "~s"));

    // Update Label Text/Position
    vis.xLabel
      .attr("x", vis.width)
      .attr("y", vis.height + 35)
      .text(vis.config.xLabel);

    vis.yLabel.attr("x", -vis.height / 2).text(vis.config.yLabel);
  }

  updateSelection(selectedIDs) {
    const vis = this;
    vis.chart
      .selectAll("circle")
      .transition()
      .duration(300)
      .attr("fill-opacity", (d) =>
        !selectedIDs || selectedIDs.includes(d.country) ? 0.8 : 0.1,
      )
      .attr("r", (d) =>
        !selectedIDs || selectedIDs.includes(d.country) ? 5 : 2.5,
      );
  }

  brushed(event) {
    const vis = this;
    if (!event.sourceEvent) return;

    if (!event.selection) {
      vis.config.onBrush(null);
      return;
    }
    const [[x0, y0], [x1, y1]] = event.selection;

    const selectedIDs = vis.displayData
      .filter((d) => {
        const px = vis.xScale(d[vis.config.xField]);
        const py = vis.yScale(d[vis.config.yField]);
        return px >= x0 && px <= x1 && py >= y0 && py <= y1;
      })
      .map((d) => d.country);

    vis.config.onBrush(selectedIDs);
  }
}
