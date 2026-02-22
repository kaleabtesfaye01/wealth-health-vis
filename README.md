## Theme

### Relationship Between Wealth and Health

This project investigates how economic prosperity relates to population health outcomes across countries. Specifically, the visualization dashboard explores whether countries with higher income levels tend to experience better health indicators.

---

## Level 1

### Quantitative Measures Selected

- **Life Expectancy** (Health indicator)
- **GDP per Capita** (Wealth indicator)

### Work Completed

- Identified project theme focusing on the relationship between wealth and health.
- Collected country-level datasets from **Our World in Data** for Life Expectancy and GDP per capita.
- Built a Python preprocessing pipeline to:
  - Select the most recent common year across datasets
  - Clean and merge the datasets using country codes
  - Export a processed dataset ready for visualization

- Set up the D3 project structure and created reusable visualization components.
- Implemented initial Level-1 visualizations:
  - Histogram of Life Expectancy distribution
  - Histogram of GDP per capita distribution
  - Scatterplot showing the relationship between GDP per capita and Life Expectancy

---

## Level 2

One choropleth map with button to toggle between Life Expectancy and GDP per Capita
Colors used and why?

- #ff375f: for Histogram 2 (Life expectancy)
- #0a84ff: for Histogram 1 (GDP per capita)
- #30d158: for Scatterplot
- InterpolatedBlues for logarithmic scales like GDP per Capita
- interpolateYlOrRd for linear scales like Life Expectancy

## Level 3

New data attributes:

- Under-five mortality rate
- Human Development Index
