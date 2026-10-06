/**
 * AquaPure IoT - Smart Clean Water & Sanitation Dashboard
 * Handles live sensor simulation, WHO threshold evaluation,
 * interactive preset changes, and impact calculations.
 */

// Application State
const state = {
  isSimulating: true,
  currentPreset: "pure",
  ph: 7.2,
  tds: 185,
  turbidity: 1.4,
  flowRate: 14.5,
  totalDispensed: 4280.5,
  solenoidOpen: true,
  audioMuted: true
};

// Thresholds according to WHO / BIS standard for potable water
const THRESHOLDS = {
  ph: { min: 6.5, max: 8.5, ideal: 7.2 },
  tds: { safeMax: 300, warningMax: 500 }, // ppm
  turbidity: { safeMax: 5.0, warningMax: 10.0 } // NTU
};

// Presets data
const PRESETS = {
  pure: { ph: 7.2, tds: 160, turbidity: 1.2, flowRate: 15.0, name: "Pure Treated Water" },
  tap: { ph: 7.6, tds: 280, turbidity: 2.8, flowRate: 12.5, name: "Municipal Tap Water" },
  runoff: { ph: 6.3, tds: 450, turbidity: 16.5, flowRate: 6.0, name: "Monsoon Flood Runoff" },
  industrial: { ph: 4.6, tds: 820, turbidity: 12.0, flowRate: 0.0, name: "Acidic Chemical Contamination" }
};

// DOM Elements
let elPhVal, elPhBar, elPhStatus;
let elTdsVal, elTdsBar, elTdsStatus;
let elTurbVal, elTurbBar, elTurbStatus;
let elFlowVal, elFlowBar, elFlowStatus;
let elTotalDispensed;
let elMasterBanner, elBannerIcon, elBannerTitle, elBannerSub, elValveStatus;
let sliderPh, sliderTds, sliderTurb, sliderFlow;

// Initialize on DOM Load
document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  bindEvents();
  startSimulationLoop();
  updateImpactCalculator(250); // default 250 families
});

function cacheElements() {
  elPhVal = document.getElementById("ph-val");
  elPhBar = document.getElementById("ph-bar");
  elPhStatus = document.getElementById("ph-status");

  elTdsVal = document.getElementById("tds-val");
  elTdsBar = document.getElementById("tds-bar");
  elTdsStatus = document.getElementById("tds-status");

  elTurbVal = document.getElementById("turb-val");
  elTurbBar = document.getElementById("turb-bar");
  elTurbStatus = document.getElementById("turb-status");

  elFlowVal = document.getElementById("flow-val");
  elFlowBar = document.getElementById("flow-bar");
  elFlowStatus = document.getElementById("flow-status");

  elTotalDispensed = document.getElementById("total-dispensed");

  elMasterBanner = document.getElementById("master-banner");
  elBannerIcon = document.getElementById("banner-icon");
  elBannerTitle = document.getElementById("banner-title");
  elBannerSub = document.getElementById("banner-sub");
  elValveStatus = document.getElementById("valve-status");

  sliderPh = document.getElementById("slider-ph");
  sliderTds = document.getElementById("slider-tds");
  sliderTurb = document.getElementById("slider-turb");
  sliderFlow = document.getElementById("slider-flow");
}

function bindEvents() {
  // Scenario Preset Buttons
  document.querySelectorAll(".scenario-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".scenario-btn").forEach((b) => b.classList.remove("active"));
      e.currentTarget.classList.add("active");
      const scenarioKey = e.currentTarget.getAttribute("data-scenario");
      applyScenario(scenarioKey);
    });
  });

  // Manual Sliders
  if (sliderPh) {
    sliderPh.addEventListener("input", (e) => {
      state.ph = parseFloat(e.target.value);
      state.isSimulating = false;
      renderDashboard();
    });
  }
  if (sliderTds) {
    sliderTds.addEventListener("input", (e) => {
      state.tds = parseFloat(e.target.value);
      state.isSimulating = false;
      renderDashboard();
    });
  }
  if (sliderTurb) {
    sliderTurb.addEventListener("input", (e) => {
      state.turbidity = parseFloat(e.target.value);
      state.isSimulating = false;
      renderDashboard();
    });
  }
  if (sliderFlow) {
    sliderFlow.addEventListener("input", (e) => {
      state.flowRate = parseFloat(e.target.value);
      state.isSimulating = false;
      renderDashboard();
    });
  }

  // Impact Slider
  const familiesSlider = document.getElementById("families-slider");
  if (familiesSlider) {
    familiesSlider.addEventListener("input", (e) => {
      updateImpactCalculator(parseInt(e.target.value, 10));
    });
  }
}

function applyScenario(key) {
  const p = PRESETS[key];
  if (!p) return;
  state.currentPreset = key;
  state.ph = p.ph;
  state.tds = p.tds;
  state.turbidity = p.turbidity;
  state.flowRate = p.flowRate;
  state.isSimulating = true;

  // Sync sliders
  if (sliderPh) sliderPh.value = state.ph;
  if (sliderTds) sliderTds.value = state.tds;
  if (sliderTurb) sliderTurb.value = state.turbidity;
  if (sliderFlow) sliderFlow.value = state.flowRate;

  renderDashboard();
}

// Background simulation ticker for live telemetry feel
function startSimulationLoop() {
  setInterval(() => {
    if (!state.isSimulating) return;

    // Small realistic micro-fluctuation (+/- 1-2%)
    const phNoise = (Math.random() - 0.5) * 0.06;
    const tdsNoise = (Math.random() - 0.5) * 4;
    const turbNoise = (Math.random() - 0.5) * 0.15;

    state.ph = Math.max(3, Math.min(12, +(state.ph + phNoise).toFixed(2)));
    state.tds = Math.max(20, Math.min(1500, +(state.tds + tdsNoise).toFixed(0)));
    state.turbidity = Math.max(0.1, Math.min(50, +(state.turbidity + turbNoise).toFixed(1)));

    // Cumulative volume calculation if solenoid is open
    if (state.solenoidOpen && state.flowRate > 0) {
      const addedLiters = (state.flowRate / 60) * 1.5; // per 1.5s
      state.totalDispensed += addedLiters;
      if (elTotalDispensed) {
        elTotalDispensed.innerText = Math.round(state.totalDispensed).toLocaleString() + " L";
      }
    }

    renderDashboard();
  }, 1500);
}

// Evaluate Safety & Render UI
function renderDashboard() {
  // Update numerical texts
  if (elPhVal) elPhVal.innerText = state.ph.toFixed(1);
  if (elTdsVal) elTdsVal.innerText = state.tds;
  if (elTurbVal) elTurbVal.innerText = state.turbidity.toFixed(1);
  if (elFlowVal) elFlowVal.innerText = state.solenoidOpen ? state.flowRate.toFixed(1) : "0.0";

  // Progress Bar Percentages
  // pH (0 to 14)
  const phPct = Math.min(100, Math.max(0, (state.ph / 14) * 100));
  if (elPhBar) elPhBar.style.width = phPct + "%";

  // TDS (0 to 1000 ppm)
  const tdsPct = Math.min(100, Math.max(0, (state.tds / 800) * 100));
  if (elTdsBar) elTdsBar.style.width = tdsPct + "%";

  // Turbidity (0 to 25 NTU)
  const turbPct = Math.min(100, Math.max(0, (state.turbidity / 25) * 100));
  if (elTurbBar) elTurbBar.style.width = turbPct + "%";

  // Flow (0 to 25 L/min)
  const flowPct = Math.min(100, Math.max(0, (state.flowRate / 25) * 100));
  if (elFlowBar) elFlowBar.style.width = (state.solenoidOpen ? flowPct : 0) + "%";

  // Evaluate individual parameters
  const isPhSafe = state.ph >= THRESHOLDS.ph.min && state.ph <= THRESHOLDS.ph.max;
  const isTdsSafe = state.tds <= THRESHOLDS.tds.safeMax;
  const isTdsWarning = state.tds > THRESHOLDS.tds.safeMax && state.tds <= THRESHOLDS.tds.warningMax;
  const isTurbSafe = state.turbidity <= THRESHOLDS.turbidity.safeMax;
  const isTurbWarning = state.turbidity > THRESHOLDS.turbidity.safeMax && state.turbidity <= THRESHOLDS.turbidity.warningMax;

  // Set individual tags
  updateTag(elPhStatus, isPhSafe ? "Safe (6.5-8.5)" : "Abnormal pH", isPhSafe ? "safe" : "danger");
  updateTag(elTdsStatus, isTdsSafe ? "Optimal (<300)" : isTdsWarning ? "Moderate TDS" : "Hazardous TDS", isTdsSafe ? "safe" : isTdsWarning ? "warning" : "danger");
  updateTag(elTurbStatus, isTurbSafe ? "Crystal Clear (<5)" : isTurbWarning ? "Turbid Water" : "Unsafe Turbidity", isTurbSafe ? "safe" : isTurbWarning ? "warning" : "danger");
  updateTag(elFlowStatus, state.solenoidOpen ? "Dispensing Normal" : "Valve Cut-Off", state.solenoidOpen ? "safe" : "danger");

  // Determine Master System Status
  let overallStatus = "SAFE"; // SAFE | WARNING | DANGER
  let statusMsg = "Water parameters are within WHO potability limits.";

  if (!isPhSafe || state.tds > THRESHOLDS.tds.warningMax || state.turbidity > THRESHOLDS.turbidity.warningMax) {
    overallStatus = "DANGER";
    statusMsg = "CRITICAL CONTAMINATION DETECTED! Solenoid valve engaged emergency shut-off.";
    state.solenoidOpen = false;
  } else if (isTdsWarning || isTurbWarning) {
    overallStatus = "WARNING";
    statusMsg = "Water purity slightly degraded. Filtration cycle intensified.";
    state.solenoidOpen = true;
  } else {
    overallStatus = "SAFE";
    statusMsg = "Pure & Safe for drinking. Meets WHO & BIS standards.";
    state.solenoidOpen = true;
  }

  // Update Master Banner
  if (elMasterBanner) {
    elMasterBanner.className = "master-status-banner " + (overallStatus === "DANGER" ? "danger" : overallStatus === "WARNING" ? "warning" : "");
    if (elBannerIcon) elBannerIcon.innerText = overallStatus === "DANGER" ? "🚨" : overallStatus === "WARNING" ? "⚠️" : "🛡️";
    if (elBannerTitle) elBannerTitle.innerText = overallStatus === "DANGER" ? "EMERGENCY SAFETY LOCKOUT" : overallStatus === "WARNING" ? "WATER QUALITY WARNING" : "WATER SOURCE POTABLE & SECURE";
    if (elBannerSub) elBannerSub.innerText = statusMsg;
  }

  // Solenoid Badge
  if (elValveStatus) {
    if (state.solenoidOpen) {
      elValveStatus.className = "valve-tag";
      elValveStatus.innerText = "VALVE: OPEN (ACTIVE)";
    } else {
      elValveStatus.className = "valve-tag closed";
      elValveStatus.innerText = "VALVE: CLOSED (LOCKED)";
    }
  }
}

function updateTag(element, text, level) {
  if (!element) return;
  element.innerText = text;
  element.className = "gauge-status-sub text-" + level;
}

// Impact Calculator
function updateImpactCalculator(families) {
  const familiesVal = document.getElementById("calc-families-val");
  if (familiesVal) familiesVal.innerText = families + " Families";

  // Formulas
  // Average 4.5 persons per family, 5L clean drinking water per person/day
  const litersPerDay = Math.round(families * 4.5 * 5);
  // Estimate ~18% illness incident rate drop based on WHO WASH studies
  const casesPrevented = Math.round(families * 4.5 * 0.45);
  // Financial savings on bottled water/medical treatment (~$24/month per household)
  const dollarsSaved = Math.round(families * 24);

  const resLiters = document.getElementById("res-liters");
  const resLives = document.getElementById("res-lives");
  const resCases = document.getElementById("res-cases");
  const resSavings = document.getElementById("res-savings");

  if (resLiters) resLiters.innerText = litersPerDay.toLocaleString() + " L";
  if (resLives) resLives.innerText = Math.round(families * 4.5).toLocaleString();
  if (resCases) resCases.innerText = casesPrevented + " / yr";
  if (resSavings) resSavings.innerText = "$" + dollarsSaved.toLocaleString() + " / mo";
}
