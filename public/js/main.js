Promise.all([
  d3.json("../../data/world.geojson"),
  d3.csv("../../data/processed/level1_data.csv"),
])
  .then(([geoData, countryData]) => {
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

    const gdpHist = new Histogram({
      parentElement: "gdp-histogram",
      data: countryData,
      field: "gdpPerCapita",
      xLabel: "GDP per Capita (USD)",
      barColor: "#0a84ff",
    });

    const lifeHist = new Histogram({
      parentElement: "life-histogram",
      data: countryData,
      field: "lifeExpectancy",
      xLabel: "Life Expectancy (Years)",
      barColor: "#ff375f",
    });

    const scatterplot = new Scatterplot({
      parentElement: "scatterplot",
      data: countryData,
      xField: "gdpPerCapita",
      yField: "lifeExpectancy",
      xLabel: "GDP per Capita (USD)",
      yLabel: "Life Expectancy (Years)",
      pointColor: "#30d158",
    });

    const choropleth = new ChoroplethMap({
      parentElement: "choropleth-map",
      geoData: geoData,
      field: "gdpPerCapita",
      legendTitle: "GDP per Capita (USD)",
    });

    const instances = [gdpHist, lifeHist, scatterplot, choropleth];

    d3.selectAll(".histogram-controls button").on("click", function () {
      const btn = d3.select(this);
      const container = d3.select(this.parentNode);
      const field = btn.attr("data-field");
      const targetId = container.attr("data-target");

      const targetVis = targetId === "gdp-histogram" ? gdpHist : lifeHist;

      targetVis.config.field = field;
      if (field === "gdpPerCapita") {
        targetVis.config.xLabel = "GDP per Capita (USD) →";
      } else if (field === "lifeExpectancy") {
        targetVis.config.xLabel = "Life Expectancy (Years) →";
      } else if (field === "infantMortalityRate") {
        targetVis.config.xLabel = "Under-five Mortality Rate →";
      } else if (field === "humanDevelopmentIndex") {
        targetVis.config.xLabel = "Human Development Index →";
      }
      targetVis.updateVis();

      container.selectAll("button").classed("active", false);
      btn.classed("active", true);
    });

    const updateScatter = () => {
      const x = d3.select("#x-axis-select");
      const y = d3.select("#y-axis-select");

      scatterplot.config.xField = x.property("value");
      scatterplot.config.yField = y.property("value");
      if (scatterplot.config.xField === "gdpPerCapita") {
        scatterplot.config.xLabel = "GDP per Capita (USD)";
      } else if (scatterplot.config.xField === "lifeExpectancy") {
        scatterplot.config.xLabel = "Life Expectancy (Years)";
      } else if (scatterplot.config.xField === "infantMortalityRate") {
        scatterplot.config.xLabel = "Under-five Mortality Rate";
      } else if (scatterplot.config.xField === "humanDevelopmentIndex") {
        scatterplot.config.xLabel = "Human Development Index";
      }

      if (scatterplot.config.yField === "gdpPerCapita") {
        scatterplot.config.yLabel = "GDP per Capita (USD)";
      } else if (scatterplot.config.yField === "lifeExpectancy") {
        scatterplot.config.yLabel = "Life Expectancy (Years)";
      } else if (scatterplot.config.yField === "infantMortalityRate") {
        scatterplot.config.yLabel = "Under-five Mortality Rate";
      } else if (scatterplot.config.yField === "humanDevelopmentIndex") {
        scatterplot.config.yLabel = "Human Development Index";
      }

      scatterplot.updateVis();
    };
    d3.selectAll("#x-axis-select, #y-axis-select").on("change", updateScatter);

    d3.selectAll(".map-buttons button").on("click", function () {
      const btn = d3.select(this);
      let legendTitle = "";
      if (btn.attr("data-field") === "gdpPerCapita") {
        legendTitle = "GDP per Capita (USD)";
      } else if (btn.attr("data-field") === "lifeExpectancy") {
        legendTitle = "Life Expectancy (Years)";
      } else if (btn.attr("data-field") === "infantMortalityRate") {
        legendTitle = "Under-five Mortality Rate";
      } else if (btn.attr("data-field") === "humanDevelopmentIndex") {
        legendTitle = "Human Development Index";
      }
      choropleth.setField(btn.attr("data-field"), legendTitle);
      d3.selectAll(".map-buttons button").classed("active", false);
      btn.classed("active", true);
    });

    window.addEventListener("resize", () => {
      instances.forEach((ins) => ins.updateVis());
    });
  })
  .catch((err) => console.error("Data Load Error:", err));
