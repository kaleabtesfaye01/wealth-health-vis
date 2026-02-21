class Histogram {
  constructor(config) {
    this.config = config;
    this.initVis();
    window.addEventListener("resize", () => this.resize());
  }

  initVis() {
    const container = d3.select(`#${this.config.parentElement}`);
    const bounds = container.node().getBoundingClientRect();

    const margin = { top: 14, right: 14, bottom: 44, left: 52 };
    const width = bounds.width - margin.left - margin.right;
    const height = bounds.height - margin.top - margin.bottom;

    const svg = container
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const values = this.config.data
      .map((d) => d[this.config.field])
      .filter((v) => Number.isFinite(v));

    if (values.length === 0) return;

    const barColor = this.config.barColor || this.config.color || "#0a84ff";
    const barStroke = d3.color(barColor)?.darker(0.8)?.formatHex() || "#1e293b";
    const x = d3
      .scaleLinear()
      .domain(d3.extent(values))
      .nice()
      .range([0, width]);

    const thresholdCount =
      this.config.thresholds ||
      Math.max(12, Math.min(28, Math.round(Math.sqrt(values.length))));
    const bins = d3
      .bin()
      .domain(x.domain())
      .thresholds(thresholdCount)(values);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(bins, (d) => d.length) * 1.08])
      .nice()
      .range([height, 0]);

    // Plot background improves contrast against the panel.
    svg
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#f8fafc")
      .attr("stroke", "#e2e8f0")
      .attr("rx", 6);

    svg
      .append("g")
      .attr("class", "y-grid")
      .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(""))
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .selectAll("line")
          .attr("stroke", "#e2e8f0")
          .attr("stroke-opacity", 0.9),
      );

    svg
      .append("g")
      .attr("class", "bars")
      .selectAll("rect")
      .data(bins)
      .join("rect")
      .attr("x", (d) => x(d.x0))
      .attr("y", (d) => y(d.length))
      .attr("width", (d) => Math.max(0, x(d.x1) - x(d.x0) - 1))
      .attr("height", (d) => height - y(d.length))
      .attr("fill", barColor)
      .attr("stroke", barStroke)
      .attr("stroke-width", 0.5)
      .attr("fill-opacity", 0.95);

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(6, "~s"))
      .call((g) => g.select(".domain").attr("stroke", "#64748b"))
      .call((g) =>
        g
          .selectAll("text")
          .attr("fill", "#334155")
          .attr("font-size", 11)
          .attr("font-weight", 500),
      );

    svg
      .append("g")
      .call(d3.axisLeft(y).ticks(5))
      .call((g) => g.select(".domain").attr("stroke", "#64748b"))
      .call((g) =>
        g
          .selectAll("text")
          .attr("fill", "#334155")
          .attr("font-size", 11)
          .attr("font-weight", 500),
      );

    if (this.config.xLabel) {
      svg
        .append("text")
        .attr("x", width)
        .attr("y", height + margin.bottom - 8)
        .attr("text-anchor", "end")
        .attr("fill", "#334155")
        .attr("font-size", 11)
        .attr("font-weight", 600)
        .text(this.config.xLabel);
    }
  }

  resize() {
    d3.select(`#${this.config.parentElement}`).select("svg").remove();
    this.initVis();
  }
}
