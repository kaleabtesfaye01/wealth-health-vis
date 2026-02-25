## Theme

### Relationship Between Wealth and Health

This project investigates how economic prosperity relates to population health outcomes across countries. Specifically, the visualization dashboard explores whether countries with higher income levels tend to experience better health indicators.

---

## Level 1

### Quantitative Measures Selected

- **Life Expectancy** (Health indicator)
- **GDP per Capita** (Wealth indicator)

### Implemented initial Level-1 visualizations

- Histogram of Life Expectancy distribution
- Histogram of GDP per capita distribution
- Scatterplot showing the relationship between GDP per capita and Life Expectancy

---

## Level 2

One choropleth map with buttons to toggle between Life Expectancy and GDP per Capita.

Colors used and why?

- **#ff375f**: for Histogram 2 (Life expectancy) — high contrast pink for health metrics.
- **#0a84ff**: for Histogram 1 (GDP per capita) — standard blue for wealth metrics.
- **#30d158**: for Scatterplot — vibrant green for combined data points.
- **d3.interpolateBlues**: for logarithmic scales like GDP per Capita to show depth in high-value ranges.
- **d3.interpolateYlGnBu**: for linear scales like Life Expectancy to provide a clear color gradient for health progress.

---

## Level 3

New data attributes:

- **Under-five mortality rate**
- **Human Development Index**

Same colors used as level 2.

- Display 2 histograms with buttons:
- Histogram 1: Wealth attributes (**GDP per capita** and **Human Development Index**)
- Histogram 2: Health attributes (**Life Expectancy** and **Under-five mortality rate**)

- Display 1 choropleth map with buttons to toggle between all 4 attributes.
- Display 1 scatterplot where users can select x-axis and y-axis columns via dropdowns to see correlations between any two attributes.

---

## Level 4

- **Choropleth Map**: On Hover display country name and active attribute value.
- **Histograms**: On Hover display the specific bin's range and count.
- **Scatterplot**: On Hover display country name and both selected axis values.

---

## Level 5

### Filtered highlighting approach

- Highlighting method over a filtering method. Visually filtered unselected data using a light-stripe pattern on the map and reduced opacity across all charts. It remains in the background to preserve the global and statistical context.

### Static scales

- Scales remain static because if axes shift during interaction, data points will "jump" under the cursor, making it impossible to refine a selection or maintain a consistent mental model of the distribution.

---

## Level 6

Brushing within the choropleth map and selecting a set of countries.

- **Highlighting approach** was used to preserve geographic and statistical context across all linked views.
- **Static scales** used to keep consistency and allow comparison between different selection sets.
