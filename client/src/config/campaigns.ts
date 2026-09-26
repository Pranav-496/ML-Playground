export interface Campaign {
  id: string;
  title: string;
  type: "Classification" | "Regression";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  lore: string;
  description: string;
  features: string[];
  target: string;
  color: string;
}

export const campaigns: Campaign[] = [
  {
    id: "long-night-survival",
    title: "The Long Night Survival",
    type: "Classification",
    difficulty: "Beginner",
    color: "#B91C1C", // Red
    lore: "The White Walkers have breached the Wall. As the dead pour into the North, survival depends on many factors: fighting skill, wealth, house allegiance, and age. The Citadel needs a model to predict who will survive the winter and who will join the Night King's army.",
    description: "Build a binary classification model to predict passenger... err, citizen survival based on demographic and status data. (Based on the classic Titanic dataset).",
    features: ["Nobility Status (Pclass)", "Sex", "Age", "Siblings/Spouses (SibSp)", "Parents/Children (Parch)", "Gold Paid (Fare)", "Region of Origin (Embarked)"],
    target: "Survived (0 = No, 1 = Yes)"
  },
  {
    id: "iron-bank-valuations",
    title: "Iron Bank Valuations",
    type: "Regression",
    difficulty: "Intermediate",
    color: "#F59E0B", // Gold
    lore: "The Iron Bank of Braavos is looking to expand its real estate portfolio into King's Landing. They need a robust model to predict the gold value of estates based on their proximity to the Red Keep, crime rates in Flea Bottom, and structural size.",
    description: "Build a regression model to predict housing prices using various continuous and categorical features. (Based on the California/Boston Housing datasets).",
    features: ["Crime Rate", "Zoning", "Rooms", "Age of Estate", "Distance to Red Keep", "Tax Rate"],
    target: "Estate Value (in Gold Dragons)"
  }
];
