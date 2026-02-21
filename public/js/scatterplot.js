class Scatterplot {
  constructor(config) {
    this.config = config;
    this.initVis();
    window.addEventListener("resize", () => this.resize());
  }

  initVis() {
    const container = d3.select(`#${this.config.parentElement}`);
    const bounds = container.node().getBoundingClientRect();

    const margin = { top: 20, right: 20, bottom: 40, left: 55 };
    const width = bounds.width - margin.left - margin.right;
    const height = bounds.height - margin.top - margin.bottom;
    const xField = this.config.xField;
    const yField = this.config.yField;

    const filteredData = this.config.data.filter(
      (d) => Number.isFinite(d[xField]) && Number.isFinite(d[yField]),
    );

    if (filteredData.length === 0) return;

    const svg = container
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleLinear()
      .domain(d3.extent(filteredData, (d) => d[xField]))
      .nice()
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain(d3.extent(filteredData, (d) => d[yField]))
      .nice()
      .range([height, 0]);

    svg
      .selectAll("circle")
      .data(filteredData)
      .join("circle")
      .attr("cx", (d) => x(d[xField]))
      .attr("cy", (d) => y(d[yField]))
      .attr("r", 4.2)
      .attr("fill", this.config.pointColor || "#0ea5e9")
      .attr("fill-opacity", 0.55);

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5, "~s"));

    svg.append("g").call(d3.axisLeft(y).ticks(5));
  }

  resize() {
    d3.select(`#${this.config.parentElement}`).select("svg").remove();
    this.initVis();
  }
}
