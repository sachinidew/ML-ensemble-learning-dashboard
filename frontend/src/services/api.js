
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  timeout: 30000,
});

export const getMetrics = async () => {
  const response = await API.get("/api/metrics");
  return response.data;
};

export const getFeatureImportance = async () => {
  const response = await API.get("/api/feature-importance");
  return response.data;
};

export const predictConsumption = async (data) => {
  const response = await API.post("/api/predict", data);
  return response.data;
};

export const getHealth = async () => {
  const response = await API.get("/api/health");
  return response.data;
};

export default API;
