d3.csv("../../data/processed/level1_data.csv")
  .then((data) => {
    console.log("Data loaded successfully");

    data.forEach((d) => {
      d.gdp = +d["GDP per capita"];
      d.life_expectancy = +d["Life expectancy"];
    });

    const YEAR = 2022;

    const gdpHist = new Histogram({
      parentElement: "gdp-hist",
      data: data,
      field: "gdp",
      title: "Distribution of GDP per Capita",
      year: YEAR,
    });

    const lifeExpectancyHist = new Histogram({
      parentElement: "life-expectancy-hist",
      data: data,
      field: "life_expectancy",
      title: "Distribution of Life Expectancy",
      year: YEAR,
    });

    new Scatterplot({
      parentElement: "scatterplot",
      data: data,
      xField: "gdp",
      yField: "life_expectancy",
      title: "Relationship Between GDP per Capita and Life Expectancy",
      xLabel: "GDP per Capita",
      yLabel: "Life Expectancy",
      year: YEAR,
    });
  })
  .catch((error) => {
    console.error("Error loading data:", error);
  });
