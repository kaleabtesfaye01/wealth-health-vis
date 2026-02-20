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

    vis.margin = { top: 30, right: 20, bottom: 30, left: 40 };
    vis.width = 960;
    vis.height = 500;

    vis.svg = d3
      .select(`#${vis.parentElement}`)
      .append("svg")
      .attr("viewBox", [0, 0, vis.width, vis.height])
      .attr("style", "max-width: 100%; height: auto;");

    vis.x = d3
      .scaleLinear()
      .range([vis.margin.left, vis.width - vis.margin.right]);
    vis.y = d3
      .scaleLinear()
      .range([vis.height - vis.margin.bottom, vis.margin.top]);

    // Chart Title
    vis.svg
      .append("text")
      .attr("class", "chart-title")
      .attr("x", vis.width / 2)
      .attr("y", vis.margin.top - 10)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .text(vis.title);

    // Year subtitle
    vis.svg
      .append("text")
      .attr("class", "chart-year")
      .attr("x", vis.width / 2)
      .attr("y", vis.margin.top + 10)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text(`Year: ${vis.year}`);

    // X-axis label
    vis.svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${vis.height - vis.margin.bottom})`)
      .call((g) =>
        g
          .append("text")
          .attr("class", "x-label")
          .attr("x", vis.width)
          .attr("y", vis.margin.bottom - 2)
          .attr("fill", "currentColor")
          .attr("text-anchor", "end")
          .text(vis.xLabel),
      );

    // Y-axis label
    vis.svg
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${vis.margin.left},0)`)
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .append("text")
          .attr("class", "y-label")
          .attr("x", -vis.margin.left)
          .attr("y", vis.margin.top - 15)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text("↑ Number of Countries"),
      );

    vis.updateVis();
  }

  updateVis() {
    const vis = this;

    const values = vis.data.map((d) => d[vis.field]);

    vis.bins = d3.bin().thresholds(40)(values);

    vis.x.domain([vis.bins[0].x0, vis.bins[vis.bins.length - 1].x1]);

    vis.y.domain([0, d3.max(vis.bins, (d) => d.length)]);

    vis.svg
      .append("g")
      .attr("fill", "steelblue")
      .selectAll()
      .data(vis.bins)
      .join("rect")
      .attr("x", (d) => vis.x(d.x0) + 1)
      .attr("width", (d) => vis.x(d.x1) - vis.x(d.x0) - 1)
      .attr("y", (d) => vis.y(d.length))
      .attr("height", (d) => vis.y(0) - vis.y(d.length));

    const xAxis = d3
      .axisBottom(vis.x)
      .ticks(vis.width / 80)
      .tickSizeOuter(0);

    const yAxis = d3.axisLeft(vis.y).ticks(vis.height / 40);

    vis.svg.select(".x-axis").call(xAxis);

    vis.svg.select(".y-axis").call(yAxis);
  }
}
