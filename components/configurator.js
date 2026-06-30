// motoCare Bike Configurator View Component

import db from '../utils/db.js';
import audio from '../utils/audio.js';

// Persist selection states
if (!window.ActiveConfigModelId) {
  window.ActiveConfigModelId = 'cfg-duke';
}
if (!window.ActiveConfigColor) {
  window.ActiveConfigColor = '#ff5400'; // Default Orange
}

export default function renderConfigurator(container) {
  const models = db.getConfigModels();
  const activeId = window.ActiveConfigModelId;
  const activeColor = window.ActiveConfigColor;

  const currentModel = models.find(m => m.id === activeId) || models[0];

  container.innerHTML = `
    <!-- Top model selector dropdown -->
    <div class="glass-card" style="padding: 12px; margin-bottom: 12px;">
      <div class="form-group" style="margin-bottom: 0;">
        <label for="config-model-selector" style="font-size: 0.65rem;">Select Motorcycle Model</label>
        <select id="config-model-selector" class="select-input" style="padding: 8px 12px; font-weight: 700; color: var(--primary); border-color: var(--primary);">
          ${models.map(m => `<option value="${m.id}" ${m.id === activeId ? 'selected' : ''}>${m.name}</option>`).join('')}
        </select>
      </div>
    </div>

    <!-- Configuration Canvas: Shows interactive customizable bike SVG -->
    <div class="config-canvas">
      <!-- Interactive Bike SVG layers -->
      <svg class="config-bike-svg" viewBox="0 0 100 80">
        <!-- Rear wheel tires -->
        <circle cx="20" cy="55" r="14" stroke="#111" stroke-width="4" fill="none"></circle>
        <circle cx="20" cy="55" r="11" stroke="#222" stroke-width="1.5" fill="none"></circle>
        
        <!-- Front wheel tires -->
        <circle cx="80" cy="55" r="14" stroke="#111" stroke-width="4" fill="none"></circle>
        <circle cx="80" cy="55" r="11" stroke="#222" stroke-width="1.5" fill="none"></circle>

        <!-- Alloy Rims (Highlights orange or white dynamically depending on customization!) -->
        <circle class="bike-rim" cx="20" cy="55" r="9" stroke="${activeColor === '#ffffff' ? '#ffffff' : 'var(--primary)'}" stroke-width="1.2" fill="none"></circle>
        <circle class="bike-rim" cx="80" cy="55" r="9" stroke="${activeColor === '#ffffff' ? '#ffffff' : 'var(--primary)'}" stroke-width="1.2" fill="none"></circle>

        <!-- Front Fork suspension -->
        <line x1="80" y1="55" x2="68" y2="28" stroke="#666" stroke-width="2.5"></line>
        <line x1="80" y1="55" x2="68" y2="28" stroke="#aaa" stroke-width="1" stroke-dasharray="8 4"></line>

        <!-- Rear Swingarm & Shock absorber -->
        <line x1="20" y1="55" x2="48" y2="48" stroke="#333" stroke-width="3"></line>
        <line x1="42" y1="48" x2="36" y2="30" stroke="#ffd600" stroke-width="2"></line> <!-- yellow shock -->

        <!-- Engine block & exhaust pipe -->
        <rect x="36" y="44" width="18" height="13" rx="2" fill="#2d2d2d" stroke="#111" stroke-width="1"></rect>
        <circle cx="45" cy="50" r="4" fill="#1e1e1e"></circle>
        <path d="M 46,55 Q 60,60 70,54" stroke="#777" stroke-width="2" fill="none" stroke-linecap="round"></path> <!-- exhaust -->

        <!-- Steel Trellis Frame (Classic KTM feature!) -->
        <path d="M 28,30 L 42,48 L 52,28 L 38,30 Z M 38,30 L 48,48 L 64,30 L 52,28 Z" 
              stroke="${activeColor === '#ff5400' ? '#ff5400' : '#ff5400'}" 
              stroke-width="1.2" fill="none" stroke-linejoin="round"></path>

        <!-- Fairing tank panels (Dynamic color fill layers!) -->
        <path class="bike-fairing" d="M 42,28 Q 50,18 64,28 L 56,36 Q 48,40 42,28 Z" 
              fill="${activeColor}" stroke="#111" stroke-width="1" style="transition: fill 0.4s ease;"></path>
        
        <!-- Rear seat cowl tail panel (Dynamic color fill layers!) -->
        <path class="bike-fairing" d="M 24,28 L 38,30 L 32,36 Z" 
              fill="${activeColor}" stroke="#111" stroke-width="0.8" style="transition: fill 0.4s ease;"></path>

        <!-- Headlight cowl mask -->
        <polygon points="68,28 72,25 74,31 68,34" fill="${activeColor}" stroke="#111" stroke-width="0.5"></polygon>
        <polygon points="72,27 75,28 73,31" fill="#fff" opacity="0.9"></polygon> <!-- LED beam -->
      </svg>
    </div>

    <!-- Color Customization swatches selection -->
    <div class="glass-card" style="padding: 16px; margin-bottom: 12px; text-align: center;">
      <span class="details-lbl" style="display:block; margin-bottom: 10px;">Select Color Theme</span>
      <div class="color-swatches-row">
        <div class="color-swatch-dot swatch-orange ${activeColor === '#ff5400' ? 'active' : ''}" data-color="#ff5400"></div>
        <div class="color-swatch-dot swatch-white ${activeColor === '#ffffff' ? 'active' : ''}" data-color="#ffffff"></div>
        <div class="color-swatch-dot swatch-black ${activeColor === '#111111' ? 'active' : ''}" data-color="#111111"></div>
      </div>
      <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: capitalize;">
        Current Accent: ${activeColor === '#ff5400' ? 'KTM High-Octane Orange' : activeColor === '#ffffff' ? 'Factory Pure White' : 'Stealth Carbon Black'}
      </span>
    </div>

    <!-- Technical Specifications Sheets -->
    <div class="glass-card" style="padding: 16px;">
      <span class="details-lbl" style="display:block; margin-bottom: 10px;">Specifications</span>
      <div class="config-specs-grid">
        <div class="spec-item">
          <span class="spec-lbl">Engine Power</span>
          <span class="spec-val">${currentModel.power}</span>
        </div>
        <div class="spec-item">
          <span class="spec-lbl">Max Torque</span>
          <span class="spec-val">${currentModel.torque}</span>
        </div>
        <div class="spec-item">
          <span class="spec-lbl">Dry Weight</span>
          <span class="spec-val">${currentModel.dryWeight}</span>
        </div>
        <div class="spec-item">
          <span class="spec-lbl">Base Color</span>
          <span class="spec-val" style="color: var(--primary);">KTM Orange</span>
        </div>
      </div>
      
      <button class="btn" id="config-book-ride-btn" style="width:100%; justify-content:center; margin-top: 14px;">
        Book Test Ride
      </button>
    </div>
  `;

  // Bind model selector change
  container.querySelector('#config-model-selector').addEventListener('change', (e) => {
    window.ActiveConfigModelId = e.target.value;
    audio.playTick();
    renderConfigurator(container);
  });

  // Bind color swatch clicks
  container.querySelectorAll('.color-swatch-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const color = dot.getAttribute('data-color');
      window.ActiveConfigColor = color;
      
      // Dynamic vector transitions
      audio.playTick();
      renderConfigurator(container);
    });
  });

  // Bind test ride booking trigger
  container.querySelector('#config-book-ride-btn').addEventListener('click', () => {
    audio.playTick();
    
    // Save bike model selection to sessionStorage to pre-fill service form
    sessionStorage.setItem('motocare_test_ride_prefill', currentModel.name);
    
    // Re-route user to Servicing Hub tab
    window.switchTab('service');
  });
}
