import pandas as pd
import os


def load_data():
    """Load raw datasets."""
    print("current working directory:", os.getcwd())
    gdp = pd.read_csv('data/raw/gdp-per-capita-worldbank.csv')
    life_expectancy = pd.read_csv('data/raw/life-expectancy.csv')
    child_mortality = pd.read_csv('data/raw/child-mortality.csv')
    human_development_index = pd.read_csv('data/raw/human-development-index.csv')

    return gdp, life_expectancy, child_mortality, human_development_index


def clean_data(gdp, life_expectancy, child_mortality, human_development_index):
    """Clean datasets."""

    # Remove unnecessary columns
    gdp.drop(columns=['World region according to OWID'], inplace=True)

    # Remove missing values
    life_expectancy.dropna(inplace=True)
    child_mortality.dropna(inplace=True)

    return gdp, life_expectancy, child_mortality, human_development_index


def filter_year(gdp, life_expectancy, child_mortality, human_development_index, year=2022):
    """Filter datasets for a specific year."""

    gdp_year = gdp[gdp['Year'] == year].drop(columns=['Year'])

    life_expectancy_year = (
        life_expectancy[life_expectancy['Year'] == year]
        .drop(columns=['Year'])
    )

    child_mortality_year = (
        child_mortality[child_mortality['Year'] == year]
        .drop(columns=['Year'])
    )

    hdi_year = (
        human_development_index[human_development_index['Year'] == year]
        .drop(columns=['Year', 'World region according to OWID'])
    )

    return gdp_year, life_expectancy_year, child_mortality_year, hdi_year


def merge_data(gdp, life_expectancy, child_mortality, hdi):
    """Merge datasets into a single dataframe."""

    df = gdp.merge(
        life_expectancy,
        on=['Code', 'Entity'],
        how='inner'
    )

    df = df.merge(
        child_mortality,
        on=['Code', 'Entity'],
        how='inner'
    )

    df = df.merge(
        hdi,
        on=['Code', 'Entity'],
        how='inner'
    )

    return df


def save_data(df):
    """Save processed dataset."""
    df.to_csv('data/processed/level1_data.csv', index=False)


def main():

    print("Loading datasets...")
    gdp, life_exp, child_mort, hdi = load_data()

    print("Cleaning datasets...")
    gdp, life_exp, child_mort, hdi = clean_data(
        gdp,
        life_exp,
        child_mort,
        hdi
    )

    print("Filtering for year 2022...")
    gdp_2022, life_exp_2022, child_mort_2022, hdi_2022 = filter_year(
        gdp,
        life_exp,
        child_mort,
        hdi,
        year=2022
    )

    print("Merging datasets...")
    final_df = merge_data(
        gdp_2022,
        life_exp_2022,
        child_mort_2022,
        hdi_2022
    )

    print("Saving processed dataset...")
    save_data(final_df)

    print("Done.")
    print(f"Final dataset shape: {final_df.shape}")


if __name__ == "__main__":
    main()