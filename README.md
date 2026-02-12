### Theme

**How Does Education Relate to Poverty Around the World?**

This project explores the relationship between educational attainment and poverty levels across countries using interactive visualizations built with D3.js.

---

### Progress Update (Level 1 – In Progress)

The following components have been completed so far:

- Project repository initialized with structured folders for data, scripts, and web assets.
- Python virtual environment created and configured with required preprocessing libraries.
- Country-level datasets downloaded from **Our World in Data**:
  - Share of population living in poverty ($3/day)
  - Average years of schooling

- A Python preprocessing pipeline (`scripts/preprocess.py`) was developed to:
  - Select the most recent common year (2020)
  - Clean both datasets
  - Merge them using country codes
  - Export a processed dataset (`data/processed/level1_data.csv`) ready for D3 visualizations

---

### Level 1

**Attributes chosen:**

1. Share of population living in poverty ($3/day)
2. Average years of schooling (educational attainment)

Next steps include building:

- Two distribution visualizations (histograms) for each attribute
- A scatterplot to examine the correlation between poverty and education across countries
- Initial dashboard layout integrating the three visualizations
