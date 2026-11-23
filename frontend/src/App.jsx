
import {
  Activity,
  Zap,
  LayoutDashboard,
  BarChart3,
  BrainCircuit,
  Settings,
  Users,
  TrendingUp,
  Gauge,
  Menu,
  X,
  Home,
  Cpu,
  ChevronRight,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import "./App.css";
import { useState, useEffect } from "react";
import {
  getMetrics,
  getFeatureImportance,
  predictConsumption
} from "./services/api";


const modelData = [
  { name: "Stacking", mae: 19.37, rmse: 42.67, r2: 89.27 },
  { name: "Bagging", mae: 19.05, rmse: 43.13, r2: 89.03 },
  { name: "Random Forest", mae: 19.49, rmse: 43.29, r2: 88.95 },
  { name: "Gradient Boosting", mae: 19.48, rmse: 43.39, r2: 88.90 },
  { name: "Decision Tree", mae: 21.19, rmse: 50.86, r2: 84.76 },
  { name: "XGBoost", mae: 21.13, rmse: 51.61, r2: 84.30 },
];

const featureData = [
  { name: "Current consumption", value: 43.38 },
  { name: "Previous month", value: 23.72 },
  { name: "Two months ago", value: 18.34 },
  { name: "Three months ago", value: 13.46 },
  { name: "Month number", value: 0.87 },
  { name: "Year", value: 0.24 },
];

const COLORS = ["#2563eb", "#0d9488", "#8b5cf6", "#f59e0b", "#64748b", "#cbd5e1"];

function Sidebar({ activePage, setActivePage, open, setOpen }) {
  const navigation = [
    { name: "Overview", icon: LayoutDashboard },
    { name: "Model Comparison", icon: BarChart3 },
    { name: "Feature Analysis", icon: BrainCircuit },
    { name: "Prediction", icon: Zap },
  ];

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon"><Zap size={22} /></div>
          <div>
            <h2>EnsembleLab</h2>
            <span>Electricity Analytics</span>
          </div>
          <button className="close-sidebar" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <nav>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                className={`nav-item ${activePage === item.name ? "active" : ""}`}
                onClick={() => {
                  setActivePage(item.name);
                  setOpen(false);
                }}
              >
                <Icon size={19} />
                <span>{item.name}</span>
                {activePage === item.name && <ChevronRight size={16} />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="dataset-status">
            <div className="status-dot" />
            <div>
              <strong>Dataset loaded</strong>
              <span>RECON-SL Dataset</span>
            </div>
          </div>
          <div className="sidebar-footer">Machine Learning Project · 2026</div>
        </div>
      </aside>
    </>
  );
}

function Header({ activePage, setOpen }) {
  return (
    <header className="topbar">
      <button className="menu-button" onClick={() => setOpen(true)}>
        <Menu size={22} />
      </button>
      <div>
        <div className="breadcrumb">Dashboard <span>/</span> {activePage}</div>
        <h1>{activePage}</h1>
      </div>
      <div className="topbar-right">
        <div className="online-indicator"><span /> ML Models Ready</div>
        <div className="avatar">SL</div>
      </div>
    </header>
  );
}

function MetricCard({ title, value, description, icon: Icon, color }) {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${color}`}><Icon size={21} /></div>
      <p className="metric-title">{title}</p>
      <h2>{value}</h2>
      <span className="metric-description">{description}</span>
    </div>
  );
}


function Overview() {
  const [modelData, setModelData] = useState([]);
  const [featureData, setFeatureData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [metrics, features] = await Promise.all([
          getMetrics(),
          getFeatureImportance()
        ]);

        const formattedModels = metrics.models.map((model) => ({
          name: model.model,
          mae: model.mae,
          mse: model.mse,
          rmse: model.rmse,
          r2: model.r2 * 100
        }));

        const formattedFeatures = features.features.map((feature) => ({
          name: feature.feature,
          value: feature.importance * 100
        }));

        setModelData(formattedModels);
        setFeatureData(formattedFeatures);
      } catch (err) {
        console.error("Dashboard API error:", err);
        setError("Unable to load dashboard data. Please check the backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="panel">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="panel">{error}</div>;
  }

  const bestModel = [...modelData].sort(
    (a, b) => b.r2 - a.r2
  )[0];

  const lowestMAE = [...modelData].sort(
    (a, b) => a.mae - b.mae
  )[0];

  return (
    <>
      <div className="welcome-section">
        <div>
          <p className="eyebrow">SRI LANKA · HOUSEHOLD ENERGY</p>
          <h2>Electricity Consumption Analytics</h2>
          <p>
            Explore ensemble learning models and predict household
            electricity consumption.
          </p>
        </div>
        <div className="welcome-icon">
          <Activity size={36} />
        </div>
      </div>

      <div className="metrics-grid">
        <MetricCard
          title="Total Households"
          value="4,063"
          description="RECON-SL dataset"
          icon={Users}
          color="blue"
        />

        <MetricCard
          title="Models Evaluated"
          value={modelData.length}
          description="Regression models"
          icon={Cpu}
          color="purple"
        />

        <MetricCard
          title="Best R² Score"
          value={`${bestModel.r2.toFixed(2)}%`}
          description={bestModel.name}
          icon={TrendingUp}
          color="green"
        />

        <MetricCard
          title="Lowest MAE"
          value={lowestMAE.mae.toFixed(2)}
          description={lowestMAE.name}
          icon={Gauge}
          color="orange"
        />
      </div>

      <div className="content-grid">
        <div className="panel comparison-panel">
          <div className="panel-heading">
            <div>
              <h3>Model Performance</h3>
              <p>RMSE comparison across six models</p>
            </div>
            <span className="panel-tag">RMSE</span>
          </div>

          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={modelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis
                dataKey="name"
                type="category"
                width={130}
                tick={{ fontSize: 10 }}
              />
              <Tooltip />
              <Bar
                dataKey="rmse"
                name="RMSE"
                fill="#3978e8"
                radius={[0, 5, 5, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel best-model-panel">
          <div className="panel-heading">
            <div>
              <h3>Top Performing Model</h3>
              <p>Based on R² score</p>
            </div>
            <span className="best-badge">Best R²</span>
          </div>

          <div className="best-model-content">
            <div className="best-model-icon">
              <BrainCircuit size={30} />
            </div>

            <h2>{bestModel.name}</h2>

            <div className="score">
              {bestModel.r2.toFixed(2)}<span>%</span>
            </div>

            <p>Coefficient of determination (R²)</p>

            <div className="best-model-stats">
              <div>
                <span>MAE</span>
                <strong>{bestModel.mae.toFixed(2)}</strong>
              </div>
              <div>
                <span>RMSE</span>
                <strong>{bestModel.rmse.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel feature-panel">
        <div className="panel-heading">
          <div>
            <h3>Feature Importance</h3>
            <p>Random Forest model · Relative importance (%)</p>
          </div>
          <span className="panel-tag">FEATURES</span>
        </div>

        <ResponsiveContainer width="100%" height={270}>
          <BarChart data={featureData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10 }}
              angle={-15}
              textAnchor="end"
            />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="value"
              name="Importance (%)"
              fill="#0d9488"
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}


function ModelComparison() {
  return (
    <div className="panel">
      <div className="panel-heading">
        <div>
          <h3>Ensemble Model Comparison</h3>
          <p>Evaluation results on the test dataset</p>
        </div>
        <span className="panel-tag">6 MODELS</span>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>Model</th><th>MAE ↓</th><th>MSE ↓</th><th>RMSE ↓</th><th>R² Score ↑</th></tr>
          </thead>
          <tbody>
            {[
              ["Stacking Regressor", 19.371803, 1820.712782, 42.669811, 0.892690],
              ["Bagging Regressor", 19.045364, 1860.576011, 43.134395, 0.890341],
              ["Random Forest", 19.490006, 1874.094045, 43.290808, 0.889544],
              ["Gradient Boosting", 19.479374, 1882.841764, 43.391725, 0.889029],
              ["Decision Tree", 21.192604, 2586.467901, 50.857329, 0.847558],
              ["XGBoost", 21.126665, 2663.656250, 51.610621, 0.843009],
            ].map((row, index) => (
              <tr key={row[0]}>
                <td><strong>{row[0]}</strong>{index === 0 && <span className="table-best">Best RMSE</span>}</td>
                <td>{row[1].toFixed(2)}</td>
                <td>{row[2].toFixed(2)}</td>
                <td>{row[3].toFixed(2)}</td>
                <td>{(row[4] * 100).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FeatureAnalysis() {
  return (
    <div className="panel">
      <div className="panel-heading">
        <div>
          <h3>Random Forest Feature Importance</h3>
          <p>Contribution of each input feature to model predictions</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={380}>
        <BarChart data={featureData} layout="vertical" margin={{ left: 30, right: 30 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" unit="%" />
          <YAxis dataKey="name" type="category" width={145} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
          <Bar dataKey="value" name="Importance" fill="#0d9488" radius={[0, 5, 5, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="analysis-note">
        Historical consumption features account for approximately 98.09% of the total feature importance.
      </p>
    </div>
  );
}

function Prediction() {
  const [values, setValues] = useState({
    consumption: "120",
    consumption_lag_1: "115",
    consumption_lag_2: "110",
    consumption_lag_3: "105",
    month_number: "10",
    year: "2024",
  });

  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePredict = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setPredictions([]);

    try {
      const inputData = {
        consumption: Number(values.consumption),
        consumption_lag_1: Number(values.consumption_lag_1),
        consumption_lag_2: Number(values.consumption_lag_2),
        consumption_lag_3: Number(values.consumption_lag_3),
        month_number: Number(values.month_number),
        year: Number(values.year),
      };

      const response = await predictConsumption(inputData);

      const result = response.predictions ?? response.results;

      if (!result) {
        throw new Error("The API response does not contain predictions.");
      }

      const formattedPredictions = Array.isArray(result)
        ? result.map((item) => ({
            name: item.model,
            value: Number(item.prediction ?? item.value),
          }))
        : Object.entries(result).map(([name, value]) => ({
            name: name.replaceAll("_", " "),
            value: Number(
              typeof value === "object"
                ? value.prediction ?? value.value
                : value
            ),
          }));

      if (
        formattedPredictions.length === 0 ||
        formattedPredictions.some((item) => !Number.isFinite(item.value))
      ) {
        throw new Error("The API returned an unexpected prediction format.");
      }

      setPredictions(formattedPredictions);
    } catch (err) {
      console.error("Prediction API error:", err);
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Unable to generate predictions. Please check the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prediction-layout">
      <div className="panel prediction-panel">
        <div className="panel-heading">
          <div>
            <h3>Predict Household Consumption</h3>
            <p>Enter the household's recent monthly consumption values.</p>
          </div>
          <Zap color="#2563eb" />
        </div>

        <form onSubmit={handlePredict}>
          {[
            {
              name: "consumption",
              label: "Current month consumption",
            },
            {
              name: "consumption_lag_1",
              label: "Previous month consumption",
            },
            {
              name: "consumption_lag_2",
              label: "Two months ago",
            },
            {
              name: "consumption_lag_3",
              label: "Three months ago",
            },
            {
              name: "month_number",
              label: "Current month number (1–12)",
            },
            {
              name: "year",
              label: "Current year",
            },
          ].map((field) => (
            <label className="form-field" key={field.name}>
              {field.label}
              <input
                type="number"
                name={field.name}
                min={
                  field.name === "month_number"
                    ? "1"
                    : field.name === "year"
                    ? "2000"
                    : "0"
                }
                max={
                  field.name === "month_number"
                    ? "12"
                    : field.name === "year"
                    ? "2100"
                    : undefined
                }
                step="any"
                required
                value={values[field.name]}
                onChange={handleChange}
              />
            </label>
          ))}

          <button
            className="primary-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Generating Predictions..." : "Predict Next Month"}
            {!loading && <ChevronRight size={18} />}
          </button>
        </form>

        {error && (
          <p className="prediction-message" style={{ color: "#dc2626" }}>
            {error}
          </p>
        )}

        {predictions.length > 0 && (
          <div className="prediction-results">
            <h3>Prediction Results</h3>
            <p>Estimated next month's electricity consumption</p>

            {predictions.map((item) => (
              <div className="prediction-result-row" key={item.name}>
                <strong>{item.name}</strong>
                <span>{item.value.toFixed(2)}</span>
              </div>
            ))}

            <p className="analysis-note">
              Predictions are generated using your trained machine learning models.
            </p>
          </div>
        )}
      </div>

      <div className="prediction-info">
        <div className="info-icon">
          <Activity size={25} />
        </div>

        <h3>How does it work?</h3>

        <p>
          The system uses the household's recent electricity consumption
          history and calendar information to predict the next month's
          consumption using six trained models.
        </p>

        <div className="info-divider" />

        <strong>Prediction target</strong>
        <span>Next month's household electricity consumption</span>
      </div>
    </div>
  );
}

function App() {
  const [activePage, setActivePage] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      <main className="main-area">
        <Header activePage={activePage} setOpen={setSidebarOpen} />
        <div className="page-content">
          {activePage === "Overview" && <Overview />}
          {activePage === "Model Comparison" && <ModelComparison />}
          {activePage === "Feature Analysis" && <FeatureAnalysis />}
          {activePage === "Prediction" && <Prediction />}
        </div>
        <footer className="page-footer">
          <span>EnsembleLab · Sri Lankan Household Electricity Consumption</span>
          <span>Machine Learning Dashboard · 2026</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
