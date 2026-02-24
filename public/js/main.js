Promise.all([
  d3.json("../../data/world.geojson"),
  d3.csv("../../data/processed/level1_data.csv"),
])
  .then(([geoData, countryData]) => {
    // Data Preprocessing
    countryData.forEach((d) => {
      d.gdpPerCapita = +d["GDP per capita"] || 0;
      d.lifeExpectancy = +d["Life expectancy"] || 0;
      d.infantMortalityRate = +d["Under-five mortality rate (selected)"] || 0;
      d.humanDevelopmentIndex = +d["Human Development Index"] || 0;
      d.country = d.Entity;
    });

    const dataMap = new Map(countryData.map((d) => [d.Code, d]));
    geoData.features.forEach((feature) => {
      const match = dataMap.get(feature.id);
      if (match) Object.assign(feature.properties, match);
    });

    const handleSelection = (selectedEntities) => {
      instances.forEach((ins) => ins.updateSelection(selectedEntities));
    };

    const gdpHist = new Histogram({
      parentElement: "gdp-histogram",
      data: countryData,
      field: "gdpPerCapita",
      xLabel: "GDP per Capita (USD)",
      barColor: "#0a84ff",
      onBrush: handleSelection,
    });

    const lifeHist = new Histogram({
      parentElement: "life-histogram",
      data: countryData,
      field: "lifeExpectancy",
      xLabel: "Life Expectancy (Years)",
      barColor: "#ff375f",
      onBrush: handleSelection,
    });

    const scatterplot = new Scatterplot({
      parentElement: "scatterplot",
      data: countryData,
      xField: "gdpPerCapita",
      yField: "lifeExpectancy",
      xLabel: "GDP per Capita (USD)",
      yLabel: "Life Expectancy (Years)",
      pointColor: "#30d158",
      onBrush: handleSelection,
    });

    const choropleth = new ChoroplethMap({
      parentElement: "choropleth-map",
      geoData: geoData,
      field: "gdpPerCapita",
      legendTitle: "GDP per Capita (USD)",
    });

    const instances = [gdpHist, lifeHist, scatterplot, choropleth];

    // UI Event Handlers
    const labels = {
      gdpPerCapita: "GDP per Capita (USD)",
      lifeExpectancy: "Life Expectancy (Years)",
      infantMortalityRate: "Under-five Mortality Rate",
      humanDevelopmentIndex: "Human Development Index",
    };

    d3.selectAll(".histogram-controls button").on("click", function () {
      const btn = d3.select(this);
      const field = btn.attr("data-field");
      const targetVis =
        d3.select(this.parentNode).attr("data-target") === "gdp-histogram"
          ? gdpHist
          : lifeHist;

      targetVis.config.field = field;
      targetVis.config.xLabel =
        labels[field] + (targetVis instanceof Histogram ? " →" : "");
      targetVis.updateVis();

      d3.select(this.parentNode).selectAll("button").classed("active", false);
      btn.classed("active", true);
    });

    d3.selectAll("#x-axis-select, #y-axis-select").on("change", () => {
      const x = d3.select("#x-axis-select").property("value");
      const y = d3.select("#y-axis-select").property("value");
      scatterplot.config.xField = x;
      scatterplot.config.yField = y;
      scatterplot.config.xLabel = labels[x];
      scatterplot.config.yLabel = labels[y];
      scatterplot.updateVis();
    });

    d3.selectAll(".map-buttons button").on("click", function () {
      const btn = d3.select(this);
      const field = btn.attr("data-field");
      choropleth.setField(field, labels[field]);
      d3.selectAll(".map-buttons button").classed("active", false);
      btn.classed("active", true);
    });

    window.addEventListener("resize", () =>
      instances.forEach((ins) => (ins.resize ? ins.resize() : ins.updateVis())),
    );
  })
  .catch((err) => console.error("Dashboard Load Error:", err));
