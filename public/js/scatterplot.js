class Scatterplot {
  constructor({
    parentElement,
    data,
    xField,
    yField,
    title,
    xLabel,
    yLabel,
    year,
  }) {
    this.parentElement = parentElement;
    this.data = data;
    this.xField = xField;
    this.yField = yField;
    this.title = title;
    this.xLabel = xLabel;
    this.yLabel = yLabel;
    this.year = year;

    this.initVis();
  }

  initVis() {
    const vis = this;

    vis.margin = { top: 60, right: 20, bottom: 60, left: 70 };
    vis.width = 550 - vis.margin.left - vis.margin.right;
    vis.height = 400 - vis.margin.top - vis.margin.bottom;

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

    // Title
    vis.svg
      .append("text")
      .attr("class", "chart-title")
      .attr("x", vis.width / 2)
      .attr("y", -35)
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .text(vis.title);

    // Year
    vis.svg
      .append("text")
      .attr("x", vis.width / 2)
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text(`Year: ${vis.year}`);

    // X label
    vis.svg
      .append("text")
      .attr("x", vis.width / 2)
      .attr("y", vis.height + 45)
      .attr("text-anchor", "middle")
      .text(vis.xLabel);

    // Y label
    vis.svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -vis.height / 2)
      .attr("y", -50)
      .attr("text-anchor", "middle")
      .text(vis.yLabel);

    vis.updateVis();
  }

  updateVis() {
    const vis = this;

    vis.x.domain(d3.extent(vis.data, (d) => d[vis.xField])).nice();
    vis.y.domain(d3.extent(vis.data, (d) => d[vis.yField])).nice();

    const circles = vis.svg.selectAll("circle").data(vis.data);

    circles
      .enter()
      .append("circle")
      .merge(circles)
      .attr("cx", (d) => vis.x(d[vis.xField]))
      .attr("cy", (d) => vis.y(d[vis.yField]))
      .attr("r", 4)
      .attr("fill", "steelblue")
      .attr("opacity", 0.7);

    circles.exit().remove();

    const xAxis = d3.axisBottom(vis.x).tickFormat(d3.format(".2s"));

    vis.svg.select(".x-axis").call(xAxis);

    vis.svg.select(".y-axis").call(d3.axisLeft(vis.y));
  }
}
