import os
import zipfile
import pandas as pd
import numpy as np

print("Generating Citadel Mock Datasets...")

os.makedirs('assets/citadel/kits', exist_ok=True)
os.makedirs('assets/citadel/ground_truth', exist_ok=True)

# 1. The Long Night (Titanic) - Classification
np.random.seed(42)
n_samples = 891
data = {
    'PassengerId': range(1, n_samples + 1),
    'Pclass': np.random.choice([1, 2, 3], size=n_samples, p=[0.24, 0.21, 0.55]),
    'Sex': np.random.choice(['male', 'female'], size=n_samples, p=[0.65, 0.35]),
    'Age': np.random.normal(29, 14, size=n_samples).clip(1, 80).round(),
    'SibSp': np.random.choice([0, 1, 2, 3, 4, 5, 8], size=n_samples, p=[0.68, 0.23, 0.03, 0.02, 0.02, 0.01, 0.01]),
    'Parch': np.random.choice([0, 1, 2, 3, 4, 5, 6], size=n_samples, p=[0.76, 0.13, 0.09, 0.01, 0.005, 0.003, 0.002]),
    'Fare': np.random.exponential(32, size=n_samples).clip(0, 500).round(2)
}
df_long_night = pd.DataFrame(data)

# Survival logic
prob = np.zeros(n_samples)
prob += np.where(df_long_night['Sex'] == 'female', 0.5, -0.3)
prob += np.where(df_long_night['Pclass'] == 1, 0.4, np.where(df_long_night['Pclass'] == 2, 0.1, -0.3))
prob += np.where(df_long_night['Age'] < 10, 0.3, 0)
prob = 1 / (1 + np.exp(-prob)) # Sigmoid
df_long_night['Survived'] = (np.random.rand(n_samples) < prob).astype(int)

train_mask = np.random.rand(n_samples) < 0.8
df_train = df_long_night[train_mask]
df_test = df_long_night[~train_mask].copy()

# Save Ground Truth
gt_df = df_test[['PassengerId', 'Survived']]
gt_df.to_csv('assets/citadel/ground_truth/long-night-survival.csv', index=False)
df_test = df_test.drop(columns=['Survived'])

df_train.to_csv('assets/citadel/kits/train.csv', index=False)
df_test.to_csv('assets/citadel/kits/test.csv', index=False)

with open('assets/citadel/kits/instructions.txt', 'w') as f:
    f.write('Task: Binary Classification\n')
    f.write('Predict the Survived column (0 = No, 1 = Yes) for the test.csv data.\n')
    f.write('Submit a CSV with exactly two columns: PassengerId and Survived (your prediction).\n')

with zipfile.ZipFile('assets/citadel/kits/long-night-survival.zip', 'w') as zf:
    zf.write('assets/citadel/kits/train.csv', 'train.csv')
    zf.write('assets/citadel/kits/test.csv', 'test.csv')
    zf.write('assets/citadel/kits/instructions.txt', 'instructions.txt')

os.remove('assets/citadel/kits/train.csv')
os.remove('assets/citadel/kits/test.csv')
os.remove('assets/citadel/kits/instructions.txt')

# 2. Iron Bank Valuation - Regression
n_samples_ib = 1460
data_ib = {
    'PropertyId': range(1, n_samples_ib + 1),
    'LotArea': np.random.normal(10500, 5000, size=n_samples_ib).clip(1300, 50000).astype(int),
    'OverallQual': np.random.choice(range(1, 11), size=n_samples_ib, p=[0.01, 0.02, 0.05, 0.1, 0.3, 0.25, 0.15, 0.08, 0.03, 0.01]),
    'YearBuilt': np.random.randint(1880, 2010, size=n_samples_ib),
    'TotalBsmtSF': np.random.normal(1050, 400, size=n_samples_ib).clip(0, 3000).astype(int),
    'GrLivArea': np.random.normal(1500, 500, size=n_samples_ib).clip(334, 5642).astype(int),
    'GarageCars': np.random.choice([0, 1, 2, 3, 4], size=n_samples_ib, p=[0.05, 0.25, 0.55, 0.1, 0.05])
}
df_ib = pd.DataFrame(data_ib)

base_price = 50000
price = base_price + (df_ib['LotArea'] * 1.5) + (df_ib['OverallQual'] * 15000) + ((df_ib['YearBuilt'] - 1880) * 200) + (df_ib['TotalBsmtSF'] * 40) + (df_ib['GrLivArea'] * 60) + (df_ib['GarageCars'] * 10000)
price = price * np.random.normal(1, 0.1, size=n_samples_ib)
df_ib['SalePrice'] = price.astype(int)

train_mask_ib = np.random.rand(n_samples_ib) < 0.8
df_train_ib = df_ib[train_mask_ib]
df_test_ib = df_ib[~train_mask_ib].copy()

gt_df_ib = df_test_ib[['PropertyId', 'SalePrice']]
gt_df_ib.to_csv('assets/citadel/ground_truth/iron-bank-valuations.csv', index=False)
df_test_ib = df_test_ib.drop(columns=['SalePrice'])

df_train_ib.to_csv('assets/citadel/kits/train.csv', index=False)
df_test_ib.to_csv('assets/citadel/kits/test.csv', index=False)

with open('assets/citadel/kits/instructions.txt', 'w') as f:
    f.write('Task: Regression\n')
    f.write('Predict the SalePrice column for the test.csv data.\n')
    f.write('Submit a CSV with exactly two columns: PropertyId and SalePrice (your prediction).\n')

with zipfile.ZipFile('assets/citadel/kits/iron-bank-valuations.zip', 'w') as zf:
    zf.write('assets/citadel/kits/train.csv', 'train.csv')
    zf.write('assets/citadel/kits/test.csv', 'test.csv')
    zf.write('assets/citadel/kits/instructions.txt', 'instructions.txt')

os.remove('assets/citadel/kits/train.csv')
os.remove('assets/citadel/kits/test.csv')
os.remove('assets/citadel/kits/instructions.txt')

print("Success! Created zip files and ground truth for 'long-night-survival' and 'iron-bank-valuations'.")
