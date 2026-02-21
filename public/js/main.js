Promise.all([
  d3.json(
    "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson",
  ),
  d3.csv("../../data/processed/level1_data.csv"),
])
  .then(([geoData, countryData]) => {
    console.log("Data loaded successfully");

    // Parse numeric values into a consistent in-memory schema.
    countryData.forEach((d) => {
      d.gdpPerCapita = +d["GDP per capita"];
      d.lifeExpectancy = +d["Life expectancy"];
    });

    // Merge CSV into GeoJSON (faster lookup using Map).
    const dataMap = new Map();
    countryData.forEach((d) => {
      dataMap.set(d.Code, d);
    });

    geoData.features.forEach((feature) => {
      const match = dataMap.get(feature.id);
      if (match) {
        feature.properties.gdpPerCapita = match.gdpPerCapita;
        feature.properties.lifeExpectancy = match.lifeExpectancy;
      }
    });

    const YEAR = 2022;

    // =============================
    // HISTOGRAMS
    // =============================
    new Histogram({
      parentElement: "gdp-histogram",
      data: countryData,
      field: "gdpPerCapita",
      title: "Distribution of GDP per Capita",
      xLabel: "GDP per Capita (USD) →",
      year: YEAR,
      barColor: "#0a84ff",
    });

    new Histogram({
      parentElement: "life-histogram",
      data: countryData,
      field: "lifeExpectancy",
      title: "Distribution of Life Expectancy",
      xLabel: "Life Expectancy (Years) →",
      year: YEAR,
      barColor: "#ff375f",
    });

    // =============================
    // SCATTERPLOT
    // =============================
    new Scatterplot({
      parentElement: "scatterplot",
      data: countryData,
      xField: "gdpPerCapita",
      yField: "lifeExpectancy",
      title: "Life Expectancy vs GDP per Capita",
      xLabel: "GDP per Capita (USD) →",
      yLabel: "↑ Life Expectancy (Years)",
      year: YEAR,
      pointColor: "#30d158",
    });

    // =============================
    // CHOROPLETH
    // =============================
    const choropleth = new ChoroplethMap({
      parentElement: "choropleth-map",
      geoData: geoData,
      field: "gdpPerCapita",
      year: YEAR,
      legendTitle: "GDP per Capita (USD)",
    });

    const mapButtons = d3.selectAll(".map-buttons button");

    const setActiveButton = (field) => {
      mapButtons.classed("active", function () {
        return d3.select(this).attr("data-field") === field;
      });
    };

    setActiveButton("gdpPerCapita");

    // Toggle choropleth field from button data attributes.
    mapButtons.on("click", function () {
      const field = d3.select(this).attr("data-field");
      if (!field) return;
      const legendTitle =
        field === "lifeExpectancy"
          ? "Life Expectancy (Years)"
          : "GDP per Capita (USD)";
      choropleth.setField(field, legendTitle);
      setActiveButton(field);
    });
  })
  .catch((error) => {
    console.error("Error loading data:", error);
  });
