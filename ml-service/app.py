# ml-service/app.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sklearn.ensemble import RandomForestRegressor
import pandas as pd
import numpy as np

app = FastAPI()

# Allow your React app to talk to this Python server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. GENERATE TRAINING DATA ---
print("Training AI Model on historical data... Please wait.")
np.random.seed(42)
data_size = 2000

# Create fake past bookings
data = {
    'hour_of_day': np.random.randint(0, 24, data_size),
    'day_of_week': np.random.randint(0, 7, data_size),
    'station_id': np.random.randint(1, 5, data_size), 
}
df = pd.DataFrame(data)

# Create a realistic "busyness" pattern: Busy at 9 AM and 6 PM
df['busyness'] = 20 + 60 * np.exp(-0.1 * (df['hour_of_day'] - 9)**2) + \
                 70 * np.exp(-0.1 * (df['hour_of_day'] - 18)**2) + \
                 np.random.normal(0, 10, data_size)
df['busyness'] = df['busyness'].clip(0, 100) # Keep percentage between 0 and 100

# --- 2. TRAIN THE AI (Random Forest) ---
features = ['hour_of_day', 'day_of_week', 'station_id']
X = df[features]
y = df['busyness']

# This is the actual AI model learning the patterns
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X, y)
print("Model training complete! The AI Brain is online.")

# --- 3. THE API ROUTE FOR REACT ---
@app.get("/api/predict")
def predict_wait_time(hour: int, day: int, station_id: int = 1):
    # Ask the trained model to predict the future!
    prediction = model.predict([[hour, day, station_id]])
    busyness_score = round(prediction[0], 1)
    
    # Decide if it's low, medium, or high traffic
    status = "Low"
    color = "green"
    if busyness_score > 50:
        status = "High"
        color = "yellow"
    if busyness_score > 80:
        status = "Peak"
        color = "red"
        
    return {
        "hour": hour,
        "busyness_percentage": busyness_score,
        "status": status,
        "color": color
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)