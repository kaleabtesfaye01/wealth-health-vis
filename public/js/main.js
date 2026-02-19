Promise.all([
  d3.json(
    "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson",
  ),
  d3.csv("../../data/processed/level1_data.csv"),
])
  .then((data) => {
    console.log("Data loaded successfully");

    geoData = data[0];
    countryData = data[1];

    countryData.forEach((d) => {
      d.gdp = +d["GDP per capita"];
      d.lifeExpectancy = +d["Life expectancy"];
    });

    geoData.features.forEach((d) => {
      for (let i = 0; i < countryData.length; i++) {
        if (d.id === countryData[i].Code) {
          d.properties.gdp = countryData[i].gdp;
          d.properties.lifeExpectancy = countryData[i].lifeExpectancy;
        }
      }
    });

    const YEAR = 2022;

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

    new Scatterplot({
      parentElement: "scatterplot",
      data: countryData,
      xField: "gdp",
      yField: "lifeExpectancy",
      title: "Relationship Between GDP per Capita and Life Expectancy",
      xLabel: "GDP per Capita",
      yLabel: "Life Expectancy",
      year: YEAR,
    });

    const choropleth = new ChoroplethMap({
      parentElement: "choropleth-map",
      geoData: geoData,
      field: "gdp",
      title: "GDP per Capita Across Countries",
      year: YEAR,
    });

    d3.select("#btn-gdp").on("click", () => {
      choropleth.setField("gdp", "GDP per Capita Across Countries");
    });

    d3.select("#btn-life").on("click", () => {
      choropleth.setField("lifeExpectancy", "Life Expectancy Across Countries");
    });
  })
  .catch((error) => {
    console.error("Error loading data:", error);
  });
