# 💧 AquaPure IoT - Clean Water and Sanitation (UN SDG 6)

A complete project and interactive presentation website addressing **UN Sustainable Development Goal 6 (Clean Water and Sanitation)** using IoT sensing, automated edge shutoff, and community health protection.

---

## 🚀 How to Run the Website

You don't need any complex setup or node installation!

### Option 1: Direct Browser Launch (Easiest)
Simply double-click the **`index.html`** file inside this folder (`c:\Users\praka\OneDrive\Desktop - Copy\Desktop\IBM`), or right-click and choose **"Open with Chrome / Edge / Firefox"**.

### Option 2: Run a Local Server (Recommended for Presentations)
Open PowerShell or Command Prompt in this folder and run:
```powershell
python -m http.server 8000
```
Then open your browser and visit: `http://localhost:8000`

---

## 📁 Project Structure

```
IBM/
├── index.html       # Main responsive website layout & content
├── style.css        # Modern glassmorphism UI, grid layout, gauges & themes
├── app.js           # Live IoT sensor telemetry simulation & WHO safety logic
└── README.md        # Documentation and presentation guide
```

---

## 🌟 Key Website Features Included

1. **Interactive IoT Water Quality Simulator:**
   - **Live Gauges:** pH Level, TDS (Total Dissolved Solids in ppm), Turbidity (NTU), and Flow Rate (L/min).
   - **4 Condition Presets:** Pure Treated Water, Municipal Tap, Monsoon Flood Runoff, and Acidic Contamination.
   - **Solenoid Valve Auto-Cutoff:** Demonstrates how the system automatically shuts off water within 1.5 seconds if toxic thresholds are breached.
   - **Manual Calibration Sliders:** Allows judges/evaluators to manually move sliders to test the safety boundaries.

2. **Complete 10-Block Lean Canvas:**
   - Matches the exact 10 blocks from your uploaded templates:
     1. **Problem** (Contamination, lack of real-time testing, broken infrastructure)
     2. **Customer Segments** (Rural households, schools, WASH NGOs, CSR programs)
     3. **Unique Value Proposition** (Solar IoT system with live safety verification)
     4. **Solution** (Multi-sensor node, auto shutoff, field hygiene app)
     5. **Channels** (Panchayats, CSR, water kiosks, SMS)
     6. **Revenue Streams** (CSR grants, Water ATM micro-payments, AMC, B2G SaaS)
     7. **Cost Structure** (Sensors, ESP32, cloud hosting, field operations)
     8. **Key Metrics** (Liters dispensed, illnesses prevented, uptime)
     9. **Unfair Advantage** (Edge drift algorithm, offline LoRa/GSM fallback)
     10. **High-Level Concept** ("Fitbit + Smart Water ATM for Community Health")

3. **Technical Architecture & Bill of Materials (BOM):**
   - Shows the 4-step pipeline: Physical filtration ➔ Edge sensing ➔ Instant local shutoff ➔ Cloud sync.
   - Includes real component specifications and realistic low-cost pricing (under $30 / ₹2,500 total).

4. **Community Health & Financial Impact Calculator:**
   - Move the family count slider to dynamically calculate liters dispensed, lives touched, waterborne illnesses prevented, and community financial savings.

---

## 🎓 Tips for Presenting to Evaluators / Judges

- **Start with the Problem:** Highlight that 2.2 billion people drink water without knowing if it is contaminated until someone gets sick.
- **Show the Live Simulator:** Click on **"Monsoon Flood Runoff"** or **"Acid Spillage"** to show how the **VALVE automatically locks** to prevent disease outbreaks.
- **Show the Lean Canvas Grid:** Emphasize that the project is financially sustainable through micro-payments and CSR/government partnerships.
