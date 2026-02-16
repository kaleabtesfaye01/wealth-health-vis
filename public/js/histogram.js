class Histogram {
  constructor({ parentElement, data, field, title, xLabel, year }) {
    this.parentElement = parentElement;
    this.data = data;
    this.field = field;
    this.title = title;
    this.xLabel = xLabel;
    this.year = year;

    this.initVis();
  }

  initVis() {
    const vis = this;

    vis.margin = { top: 60, right: 20, bottom: 60, left: 70 };
    vis.width = 500 - vis.margin.left - vis.margin.right;
    vis.height = 350 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3
      .select(`#${vis.parentElement}`)
      .append("svg")
      .attr("width", vis.width + vis.margin.left + vis.margin.right)
      .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
      .append("g")
      .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

    vis.x = d3.scaleLinear().range([0, vis.width]);
    vis.y = d3.scaleLinear().range([vis.height, 0]);

    vis.svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${vis.height})`);

    vis.svg.append("g").attr("class", "y-axis");

    // Chart Title
    vis.svg
      .append("text")
      .attr("class", "chart-title")
      .attr("x", vis.width / 2)
      .attr("y", -35)
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .text(vis.title);

    // Year subtitle
    vis.svg
      .append("text")
      .attr("class", "chart-year")
      .attr("x", vis.width / 2)
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text(`Year: ${vis.year}`);

    // X-axis label
    vis.svg
      .append("text")
      .attr("class", "x-label")
      .attr("x", vis.width / 2)
      .attr("y", vis.height + 45)
      .attr("text-anchor", "middle")
      .text(vis.xLabel);

    // Y-axis label
    vis.svg
      .append("text")
      .attr("class", "y-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -vis.height / 2)
      .attr("y", -50)
      .attr("text-anchor", "middle")
      .text("Number of Countries");

    vis.updateVis();
  }

  updateVis() {
    const vis = this;

    const values = vis.data.map((d) => d[vis.field]);

    vis.bins = d3.bin().thresholds(30)(values);

    vis.x.domain([vis.bins[0].x0, vis.bins[vis.bins.length - 1].x1]).nice();

    vis.y.domain([0, d3.max(vis.bins, (d) => d.length)]).nice();

    const bars = vis.svg.selectAll(".bar").data(vis.bins);

    bars
      .enter()
      .append("rect")
      .attr("class", "bar")
      .merge(bars)
      .attr("x", (d) => vis.x(d.x0) + 1)
      .attr("width", (d) => vis.x(d.x1) - vis.x(d.x0) - 1)
      .attr("y", (d) => vis.y(d.length))
      .attr("height", (d) => vis.height - vis.y(d.length))
      .attr("fill", "steelblue");

    bars.exit().remove();

    const xAxis = d3.axisBottom(vis.x).tickFormat(d3.format(".2s"));

    vis.svg.select(".x-axis").call(xAxis);

    vis.svg.select(".y-axis").call(d3.axisLeft(vis.y));
  }
}
