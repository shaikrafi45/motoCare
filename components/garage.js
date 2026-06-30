// motoCare Garage View Component

import db from '../utils/db.js';
import audio from '../utils/audio.js';

export default function renderGarage(container) {
  const telemetry = db.getBikeTelemetry();
  const activeRole = db.getUserRole();
  const isEngineRunning = audio.isEngineRunning;

  // Render Garage details
  container.innerHTML = `
    <!-- Bike info particulars -->
    <div class="glass-card">
      <div class="garage-header">
        <div>
          <span class="bike-brand-title">${telemetry.brand}</span>
          <h3 class="bike-model-title">${telemetry.model}</h3>
          <span class="bike-reg-title">${telemetry.regNo} • Mileage: ${telemetry.mileage}</span>
        </div>
        
        <!-- Live status bar -->
        <span class="tech-status-badge" style="background: rgba(0, 230, 118, 0.08); color: var(--col-success); border-color: rgba(0, 230, 118, 0.2);">
          Linked
        </span>
      </div>

      <!-- Motor Ignition Key Switch (Programmatic Web Audio thumper trigger) -->
      <div class="ignition-panel">
        <button class="ignition-key-btn ${isEngineRunning ? 'active' : ''}" id="garage-ignition-trigger">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
            <line x1="12" y1="2" x2="12" y2="12"></line>
          </svg>
          <span class="ignition-lbl" id="ignition-state-text">${isEngineRunning ? 'RUNNING' : 'ENGINE'}</span>
        </button>
        <span style="font-size: 0.65rem; color: var(--text-light); text-align:center;">
          ${isEngineRunning ? 'Double tap to stop thumping idle' : 'Tap to start single-cylinder idle thump'}
        </span>
      </div>
    </div>

    <!-- Telemetry Gauges Row (SVG progress rings) -->
    <div class="telemetry-row">
      <!-- Fuel Gauge -->
      <div class="glass-card gauge-box">
        <div class="gauge-svg-wrap">
          <svg class="gauge-svg" width="65" height="65" viewBox="0 0 65 65">
            <circle class="gauge-bg-circle" cx="32.5" cy="32.5" r="24"></circle>
            <circle class="gauge-progress-circle" cx="32.5" cy="32.5" r="24" 
                    stroke="var(--primary)" 
                    stroke-dasharray="150.8" 
                    stroke-dashoffset="${150.8 * (1 - telemetry.fuel / 100)}"
                    style="filter: drop-shadow(0 0 3px var(--primary-glow));">
            </circle>
          </svg>
          <span class="gauge-center-val">${telemetry.fuel}%</span>
        </div>
        <span class="gauge-lbl">Fuel Level</span>
      </div>

      <!-- Battery Gauge -->
      <div class="glass-card gauge-box">
        <div class="gauge-svg-wrap">
          <svg class="gauge-svg" width="65" height="65" viewBox="0 0 65 65">
            <circle class="gauge-bg-circle" cx="32.5" cy="32.5" r="24"></circle>
            <circle class="gauge-progress-circle" cx="32.5" cy="32.5" r="24" 
                    stroke="var(--col-success)" 
                    stroke-dasharray="150.8" 
                    stroke-dashoffset="${150.8 * (1 - telemetry.battery / 100)}"
                    style="filter: drop-shadow(0 0 3px var(--col-success-glow));">
            </circle>
          </svg>
          <span class="gauge-center-val">${telemetry.battery}%</span>
        </div>
        <span class="gauge-lbl">Battery</span>
      </div>

      <!-- Temp Gauge -->
      <div class="glass-card gauge-box">
        <div class="gauge-svg-wrap">
          <svg class="gauge-svg" width="65" height="65" viewBox="0 0 65 65">
            <circle class="gauge-bg-circle" cx="32.5" cy="32.5" r="24"></circle>
            <circle class="gauge-progress-circle" cx="32.5" cy="32.5" r="24" 
                    stroke="var(--secondary)" 
                    stroke-dasharray="150.8" 
                    stroke-dashoffset="${150.8 * (1 - telemetry.temp / 120)}"
                    style="filter: drop-shadow(0 0 3px var(--secondary-glow));">
            </circle>
          </svg>
          <span class="gauge-center-val">${telemetry.temp}°C</span>
        </div>
        <span class="gauge-lbl">Coolant</span>
      </div>
    </div>

    <!-- Warnings / Alarms notifications -->
    <div class="glass-card" style="display:flex; align-items:center; gap:12px; border-left: 3px solid var(--secondary); background: rgba(234,179,8,0.03);">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" stroke-width="2.5" style="flex-shrink:0;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
      <div>
        <h4 style="font-size: 0.78rem; font-weight: 700; color: var(--secondary);">Periodic Service Overdue</h4>
        <span style="font-size: 0.65rem; color: var(--text-muted);">Servicing was scheduled in 2,400 km or 14 days ago.</span>
      </div>
    </div>

    <!-- Active Demo Swapper Profile (Interview Demo goldmine!) -->
    <div class="glass-card" style="background: rgba(255,255,255,0.01); margin-bottom: 0;">
      <span class="details-lbl" style="display:block; margin-bottom: 8px; text-align: center;">Demo Role Switcher</span>
      <div style="display: flex; gap: 6px;">
        <button class="btn btn-secondary role-swap-chip ${activeRole === 'customer' ? 'active' : ''}" data-role="customer" style="flex-grow:1; justify-content:center; padding: 8px; font-size: 0.7rem;">Customer</button>
        <button class="btn btn-secondary role-swap-chip ${activeRole === 'technician' ? 'active' : ''}" data-role="technician" style="flex-grow:1; justify-content:center; padding: 8px; font-size: 0.7rem;">Technician</button>
        <button class="btn btn-secondary role-swap-chip ${activeRole === 'manager' ? 'active' : ''}" data-role="manager" style="flex-grow:1; justify-content:center; padding: 8px; font-size: 0.7rem;">Manager</button>
      </div>
      <span style="display:block; text-align:center; font-size: 0.58rem; color: var(--text-light); margin-top: 6px;">
        Swaps the "Service" tab dashboard instantly.
      </span>
    </div>
  `;

  // Bind ignition key click
  const ignitionTrigger = container.querySelector('#garage-ignition-trigger');
  ignitionTrigger.addEventListener('click', () => {
    audio.init();
    audio.playTick();

    if (audio.isEngineRunning) {
      audio.stopEngine();
    } else {
      audio.startEngine();
    }

    renderGarage(container); // Repaint view
  });

  // Bind role chips clicks
  container.querySelectorAll('.role-swap-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const role = chip.getAttribute('data-role');
      db.setUserRole(role);
      
      // Rev engine chime
      audio.playEngineRev();

      renderGarage(container); // Repaint
    });
  });
}
