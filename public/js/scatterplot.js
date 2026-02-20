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

    vis.margin = { top: 35, right: 20, bottom: 35, left: 50 };
    vis.width = 928;
    vis.height = 600;

    vis.svg = d3
      .select(`#${vis.parentElement}`)
      .append("svg")
      .attr("width", vis.width)
      .attr("height", vis.height)
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

    // X label
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

    // Y label
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
          .text(vis.yLabel),
      );

    vis.updateVis();
  }

  updateVis() {
    const vis = this;

    vis.x.domain(d3.extent(vis.data, (d) => d[vis.xField])).nice();
    vis.y.domain(d3.extent(vis.data, (d) => d[vis.yField])).nice();

    vis.svg
      .append("g")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("fill", "steelblue")
      .attr("fill-opacity", 0.7)
      .selectAll()
      .data(vis.data)
      .join("circle")
      .attr("cx", (d) => vis.x(d[vis.xField]))
      .attr("cy", (d) => vis.y(d[vis.yField]))
      .attr("r", 3);

    const xAxis = d3
      .axisBottom(vis.x)
      .ticks(vis.width / 80)
      .tickSizeOuter(0);

    const yAxis = d3.axisLeft(vis.y);

    vis.svg.select(".x-axis").call(xAxis);

    vis.svg.select(".y-axis").call(yAxis);
  }
}
