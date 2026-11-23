
from pathlib import Path

import joblib
import pandas as pd

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


# --------------------------------------------------
# 1. Load trained machine learning models
# --------------------------------------------------

PROJECT_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = PROJECT_DIR / "models" / "ensemble_models.joblib"

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Trained model file not found: {MODEL_PATH}"
    )

model_bundle = joblib.load(MODEL_PATH)

# Reduce memory usage during prediction
for name, model in model_bundle.items():
    if hasattr(model, "n_jobs"):
        model.n_jobs = 1

feature_columns = model_bundle["feature_columns"]


# --------------------------------------------------
# 2. Create FastAPI application
# --------------------------------------------------

app = FastAPI(
    title="Ensemble Learning API",
    description="Sri Lankan Household Electricity Consumption Prediction",
    version="1.0.0"
)


# Allow requests from the React development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# 3. Prediction input structure
# --------------------------------------------------

class PredictionInput(BaseModel):
    consumption: float = Field(ge=0)
    consumption_lag_1: float = Field(ge=0)
    consumption_lag_2: float = Field(ge=0)
    consumption_lag_3: float = Field(ge=0)

    month_number: int = Field(ge=1, le=12)
    year: int = Field(ge=2000, le=2100)


# --------------------------------------------------
# 4. Model evaluation results
# --------------------------------------------------

model_metrics = [
    {
        "model": "Decision Tree",
        "mae": 21.192604,
        "mse": 2586.467901,
        "rmse": 50.857329,
        "r2": 0.847558
    },
    {
        "model": "Bagging Regressor",
        "mae": 19.045364,
        "mse": 1860.576011,
        "rmse": 43.134395,
        "r2": 0.890341
    },
    {
        "model": "Random Forest",
        "mae": 19.490006,
        "mse": 1874.094045,
        "rmse": 43.290808,
        "r2": 0.889544
    },
    {
        "model": "Gradient Boosting",
        "mae": 19.479374,
        "mse": 1882.841764,
        "rmse": 43.391725,
        "r2": 0.889029
    },
    {
        "model": "XGBoost",
        "mae": 21.126665,
        "mse": 2663.656250,
        "rmse": 51.610621,
        "r2": 0.843009
    },
    {
        "model": "Stacking Regressor",
        "mae": 19.371803,
        "mse": 1820.712782,
        "rmse": 42.669811,
        "r2": 0.892690
    }
]


# --------------------------------------------------
# 5. Feature importance
# --------------------------------------------------

feature_importance = [
    {"feature": "consumption", "importance": 0.433824},
    {"feature": "consumption_lag_1", "importance": 0.237168},
    {"feature": "consumption_lag_2", "importance": 0.183374},
    {"feature": "consumption_lag_3", "importance": 0.134558},
    {"feature": "month_number", "importance": 0.008666},
    {"feature": "year", "importance": 0.002410}
]


# --------------------------------------------------
# 6. API endpoints
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "Ensemble Learning API is running!"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "models_loaded": True
    }


@app.get("/api/metrics")
def get_metrics():
    return {
        "models": model_metrics
    }


@app.get("/api/feature-importance")
def get_feature_importance():
    return {
        "features": feature_importance
    }


# --------------------------------------------------
# 7. Predict household electricity consumption
# --------------------------------------------------

@app.post("/api/predict")
def predict_consumption(data: PredictionInput):

    try:
        input_data = pd.DataFrame(
            [[
                data.consumption,
                data.consumption_lag_1,
                data.consumption_lag_2,
                data.consumption_lag_3,
                data.month_number,
                data.year
            ]],
            columns=feature_columns
        )

        # Individual model predictions
        predictions = {}

        model_mapping = {
            "Decision Tree": "decision_tree",
            "Bagging Regressor": "bagging",
            "Random Forest": "random_forest",
            "Gradient Boosting": "gradient_boosting",
            "XGBoost": "xgboost"
        }

        for display_name, model_key in model_mapping.items():
            model = model_bundle[model_key]

            prediction = float(
                model.predict(input_data)[0]
            )

            predictions[display_name] = round(prediction, 2)

        # Stacking prediction
        stacking_features = pd.DataFrame({
            "Bagging": [
                predictions["Bagging Regressor"]
            ],
            "Random Forest": [
                predictions["Random Forest"]
            ],
            "Gradient Boosting": [
                predictions["Gradient Boosting"]
            ]
        })

        stacking_model = model_bundle["stacking_meta"]

        stacking_prediction = float(
            stacking_model.predict(stacking_features)[0]
        )

        predictions["Stacking Regressor"] = round(
            stacking_prediction, 2
        )

        return {
            "success": True,
            "predictions": predictions,
            "recommended_model": "Stacking Regressor",
            "recommended_prediction": round(
                stacking_prediction, 2
            )
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )
