Promise.all([
  d3.json(
    "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson",
  ),
  d3.csv("../../data/processed/level1_data.csv"),
])
  .then(([geoData, countryData]) => {
    console.log("Data loaded successfully");

    // Parse numeric values
    countryData.forEach((d) => {
      d.gdp = +d["GDP per capita"];
      d.lifeExpectancy = +d["Life expectancy"];
    });

    // Merge CSV into GeoJSON (faster lookup using Map)
    const dataMap = new Map();
    countryData.forEach((d) => {
      dataMap.set(d.Code, d);
    });

    geoData.features.forEach((feature) => {
      const match = dataMap.get(feature.id);
      if (match) {
        feature.properties.gdp = match.gdp;
        feature.properties.lifeExpectancy = match.lifeExpectancy;
      }
    });

    const YEAR = 2022;

    // =============================
    // HISTOGRAMS
    // =============================
    new Histogram({
      parentElement: "gdp-hist",
      data: countryData,
      field: "gdp",
      title: "Distribution of GDP per Capita",
      xLabel: "GDP per Capita (USD) →",
      year: YEAR,
    });

    new Histogram({
      parentElement: "life-expectancy-hist",
      data: countryData,
      field: "lifeExpectancy",
      title: "Distribution of Life Expectancy",
      xLabel: "Life Expectancy (Years) →",
      year: YEAR,
    });

    // =============================
    // SCATTERPLOT
    // =============================
    new Scatterplot({
      parentElement: "scatterplot",
      data: countryData,
      xField: "lifeExpectancy",
      yField: "gdp",
      title: "Life Expectancy vs GDP per Capita",
      xLabel: "Life Expectancy (Years) →",
      yLabel: "↑ GDP per Capita (USD)",
      year: YEAR,
    });

    // =============================
    // CHOROPLETH
    // =============================
    const choropleth = new ChoroplethMap({
      parentElement: "choropleth-map",
      geoData: geoData,
      field: "gdp",
      year: YEAR,
      legendTitle: "GDP per Capita (USD)",
    });

    // Toggle buttons
    d3.select("#btn-gdp").on("click", () => {
      choropleth.setField("gdp", "GDP per Capita (USD)");
    });

    d3.select("#btn-life").on("click", () => {
      choropleth.setField("lifeExpectancy", "Life Expectancy (Years)");
    });
  })
  .catch((error) => {
    console.error("Error loading data:", error);
  });
