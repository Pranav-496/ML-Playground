import os
import pandas as pd
import numpy as np
import zipfile

def create_assets():
    print("Generating Citadel Assets...")
    
    # Ensure dirs exist
    os.makedirs("assets/citadel/ground_truth", exist_ok=True)
    os.makedirs("assets/citadel/kits", exist_ok=True)
    
    # 1. The Long Night Survival
    # Create a dummy dataset (100 rows)
    np.random.seed(42)
    ids = range(1, 101)
    pclass = np.random.choice([1, 2, 3], 100)
    sex = np.random.choice(["male", "female"], 100)
    age = np.random.randint(5, 70, 100)
    fare = np.random.uniform(10, 500, 100)
    
    # Target: Survived (1 or 0)
    # Simple logic: rich females survive more, young survive more
    survived = np.where((sex == "female") | (pclass == 1) | (age < 15), 1, 0)
    
    # Train dataset (80 rows)
    train_df = pd.DataFrame({"PassengerId": ids[:80], "Pclass": pclass[:80], "Sex": sex[:80], "Age": age[:80], "Fare": fare[:80], "Survived": survived[:80]})
    
    # Test dataset (20 rows) - no target
    test_df = pd.DataFrame({"PassengerId": ids[80:], "Pclass": pclass[80:], "Sex": sex[80:], "Age": age[80:], "Fare": fare[80:]})
    
    # Ground Truth (20 rows) - target only
    gt_df = pd.DataFrame({"PassengerId": ids[80:], "Survived": survived[80:]})
    
    # Save ground truth to secure location
    gt_df.to_csv("assets/citadel/ground_truth/long-night-survival.csv", index=False)
    
    # Save train/test to tmp, then zip
    train_df.to_csv("train.csv", index=False)
    test_df.to_csv("test.csv", index=False)
    
    # Create starter notebook
    notebook_content = """{
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "# The Long Night Survival\\n",
    "Predict who will survive the winter based on their demographics."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "import pandas as pd\\n",
    "\\n",
    "train_df = pd.read_csv('train.csv')\\n",
    "test_df = pd.read_csv('test.csv')\\n",
    "\\n",
    "print(train_df.head())"
   ]
  }
 ],
 "metadata": {
  "kernelspec": {
   "display_name": "Python 3",
   "language": "python",
   "name": "python3"
  },
  "language_info": {
   "name": "python"
  }
 },
 "nbformat": 4,
 "nbformat_minor": 4
}"""
    with open("starter.ipynb", "w") as f:
        f.write(notebook_content)
        
    with open("instructions.md", "w") as f:
        f.write("# Citadel Campaign: The Long Night Survival\n\nYour task is to predict the `Survived` column for the passengers in `test.csv`. Output your predictions to a file named `predictions.csv` containing two columns: `PassengerId` and `Survived`.\n")

    # Zip it
    with zipfile.ZipFile("assets/citadel/kits/long-night-survival.zip", "w") as zf:
        zf.write("train.csv")
        zf.write("test.csv")
        zf.write("starter.ipynb")
        zf.write("instructions.md")
        
    # Cleanup
    os.remove("train.csv")
    os.remove("test.csv")
    os.remove("starter.ipynb")
    os.remove("instructions.md")
    
    print("Assets generated successfully!")

if __name__ == "__main__":
    create_assets()
