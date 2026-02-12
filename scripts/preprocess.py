import pandas as pd

# File paths
POVERTY_PATH = 'data/raw/share-of-population-in-extreme-poverty.csv'
EDUCATION_PATH = 'data/raw/mean-years-of-schooling-long-run.csv'
OUTPUT_PATH = 'data/processed/level1_data.csv'

TARGET_YEAR = 2020

def load_data():
    poverty_data = pd.read_csv(POVERTY_PATH)
    education_data = pd.read_csv(EDUCATION_PATH)
    return poverty_data, education_data

def filter_poverty(poverty_data):
    poverty_2020 = poverty_data[poverty_data['Year'] == TARGET_YEAR]
    poverty_2020 = poverty_2020[['Entity', 'Code', 'Share of population in poverty ($3 a day)']]
    poverty_2020 = poverty_2020.dropna()
    return poverty_2020

def filter_education(education_data):
    education_2020 = education_data[education_data['Year'] == TARGET_YEAR]
    education_2020 = education_2020[['Entity', 'Code', 'Average years of schooling']]
    education_2020 = education_2020.dropna()
    return education_2020

def merge_data(poverty_2020, education_2020):
    level1_data = pd.merge(poverty_2020, education_2020, on=['Entity', 'Code'], how='inner')
    return level1_data

def save_data(level1_data):
    level1_data.to_csv(OUTPUT_PATH, index=False)
    print(f'Processed data saved to {OUTPUT_PATH}')
    print(f'Total countries in final dataset: {len(level1_data)}')
    
def main():
    poverty_data, education_data = load_data()
    poverty_2020 = filter_poverty(poverty_data)
    education_2020 = filter_education(education_data)
    level1_data = merge_data(poverty_2020, education_2020)
    save_data(level1_data)
    
if __name__ == "__main__":
    main()