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
- interpolatedBlues for logarithmic scales like GDP per Capita
- interpolateYlGnBu for linear scales like Life Expectancy

---

## Level 3

New data attributes:

- Under-five mortality rate
- Human Development Index

Same colors used as level 2.

- Display 2 histograms with buttons:
  - Histogram 1: Wealth attributes (GDP per capita and Human Development Index)
  - Histogram 2: health attributes (Life Expectancy and Under-five mortality rate)

- Display 1 choropleth map with buttons to toggle between all 4 attributes
- Display 1 scatterplot where users can select x-axis and y-axis columns to see any correlation between any two attributes.

---

## Level 4

Choropleth Map: On Hover display country name and attribute value
Histograms: On Hover display bar range and count
Scatterplot: On Hover display country name and both attribute values

## Level 5

- Filtered highlighting approach
  - highlighting method over a filtering method. Visually filtered unselected data using a light-stripe pattern and reduced opacity. It remains in the background to preserve geographic context.

- Static scales
  - scales static because if the scales move, the dots will "jump" under the cursor, making it impossible to refine a selection.
