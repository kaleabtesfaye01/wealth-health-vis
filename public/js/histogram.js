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

    // Scales
    vis.xScale = d3.scaleLinear();
    vis.yScale = d3.scaleLinear();

    // Axes groups
    vis.xAxisG = vis.chart.append("g").attr("class", "axis x-axis");
    vis.yAxisG = vis.chart.append("g").attr("class", "axis y-axis");

    // Axis Label
    vis.xLabelText = vis.chart
      .append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", "end")
      .attr("fill", "#64748b")
      .attr("font-size", "10px")
      .attr("font-weight", "600");

    vis.tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "hist-tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background", "rgba(255, 255, 255, 0.95)")
      .style("padding", "8px")
      .style("border", "1px solid #cbd5e1")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("color", "#1e293b")
      .style("box-shadow", "0 4px 6px -1px rgb(0 0 0 / 0.1)");

    vis.updateVis();
  }

  updateVis() {
    const vis = this;

    const bounds = vis.container.node().getBoundingClientRect();
    vis.width = bounds.width - vis.margin.left - vis.margin.right;
    vis.height = bounds.height - vis.margin.top - vis.margin.bottom;

    let thresholdCount;
    if (vis.width < 300) {
      thresholdCount = 10;
    } else if (vis.width < 500) {
      thresholdCount = 20;
    } else if (vis.width < 700) {
      thresholdCount = 30;
    } else {
      thresholdCount = 40;
    }
    const values = vis.config.data
      .map((d) => d[vis.config.field])
      .filter((v) => Number.isFinite(v));

    vis.xScale.domain(d3.extent(values)).nice().range([0, vis.width]);

    const bins = d3
      .bin()
      .domain(vis.xScale.domain())
      .thresholds(vis.xScale.ticks(thresholdCount))(values);

    vis.yScale
      .domain([0, d3.max(bins, (d) => d.length)])
      .nice()
      .range([vis.height, 0]);

    vis.renderVis(bins);
  }

  renderVis(bins) {
    const vis = this;
    const barColor = vis.config.barColor || "#3b82f6";

    // Bind data to bars
    const bars = vis.chart.selectAll(".bar").data(bins);

    bars
      .join("rect")
      .attr("class", "bar")
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(100)
          .attr("fill-opacity", 1)
          .attr("stroke", "#1e293b")
          .attr("stroke-width", 1);
        vis.tooltip.style("opacity", 1).html(`
        <strong>Range: ${d3.format(".2s")(d.x0)} - ${d3.format(".2s")(d.x1)}</strong><br/>
        Count: ${d.length}
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
          .attr("fill-opacity", 0.8)
          .attr("stroke", "none");
        vis.tooltip.style("opacity", 0);
      })
      .transition()
      .duration(600)
      .attr("x", (d) => vis.xScale(d.x0) + 1)
      .attr("y", (d) => vis.yScale(d.length))
      .attr("width", (d) =>
        Math.max(0, vis.xScale(d.x1) - vis.xScale(d.x0) - 1),
      )
      .attr("height", (d) => vis.height - vis.yScale(d.length))
      .attr("fill", barColor)
      .attr("fill-opacity", 0.8);

    vis.xAxisG
      .attr("transform", `translate(0,${vis.height})`)
      .transition()
      .duration(600)
      .call(d3.axisBottom(vis.xScale).ticks(5, "~s"));

    vis.yAxisG
      .transition()
      .duration(600)
      .call(d3.axisLeft(vis.yScale).ticks(5));

    vis.xLabelText
      .attr("x", vis.width)
      .attr("y", vis.height + 35)
      .text(vis.config.xLabel || "");
  }
}
