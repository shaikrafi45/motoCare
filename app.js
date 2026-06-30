// motoCare Mobile App Controller & Router

import db from './utils/db.js';
import audio from './utils/audio.js';
import renderGarage from './components/garage.js';
import renderCustomer from './components/customer.js';
import renderTechnician from './components/technician.js';
import renderManager from './components/manager.js';
import renderConfigurator from './components/configurator.js';
import renderRides from './components/rides.js';
import renderShop from './components/shop.js';

const state = {
  activeTab: 'garage' // 'garage' | 'service' | 'config' | 'rides' | 'shop'
};

function init() {
  // Bind bottom navigation bar tabs clicks
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      switchTab(tab);
    });
  });

  // Bind mute audio button in header
  const muteBtn = document.getElementById('header-mute-btn');
  muteBtn.addEventListener('click', () => {
    audio.init();
    const isMuted = audio.toggleMute();
    document.getElementById('mute-icon-unmuted').style.display = isMuted ? 'none' : 'block';
    document.getElementById('mute-icon-muted').style.display = isMuted ? 'block' : 'none';
  });

  // Bind global modal closing events
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  
  // Initial draw defaults to Garage Dashboard
  switchTab('garage');
}

// Router switcher
function switchTab(tabName) {
  audio.init();
  audio.playTick(); // UI click tick

  state.activeTab = tabName;

  // Navigation menu active state highlight styling
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`nav-${tabName}`);
  if (activeBtn) activeBtn.classList.add('active');

  // View container panels mapping
  const panels = {
    garage: { elId: 'garage-view', renderer: renderGarage },
    service: { elId: 'service-view', renderer: renderServiceTab },
    config: { elId: 'config-view', renderer: renderConfigurator },
    rides: { elId: 'rides-view', renderer: renderRides },
    shop: { elId: 'shop-view', renderer: renderShop }
  };

  // Toggle active view panel
  Object.entries(panels).forEach(([name, panel]) => {
    const el = document.getElementById(panel.elId);
    if (name === tabName) {
      el.classList.add('active');
      panel.renderer(el);
    } else {
      el.classList.remove('active');
    }
  });
}

// Servicing tab router coordinates view based on active role
function renderServiceTab(container) {
  const role = db.getUserRole();

  if (role === 'customer') {
    renderCustomer(container);
  } else if (role === 'technician') {
    renderTechnician(container);
  } else if (role === 'manager') {
    renderManager(container);
  }
}

// Global helper: switch tabs programmatically
window.switchTab = function(tabName) {
  switchTab(tabName);
};

// Global helper: refresh active view when DB updates happen
window.refreshCurrentTab = function() {
  const activePanel = document.querySelector('.view-panel.active');
  if (activePanel) {
    const panels = {
      'garage-view': renderGarage,
      'service-view': renderServiceTab,
      'config-view': renderConfigurator,
      'rides-view': renderRides,
      'shop-view': renderShop
    };
    
    const renderer = panels[activePanel.id];
    if (renderer) renderer(activePanel);
  }
};

// Global modal helpers locked inside phone-screen
window.openModal = function(title, contentHTML, onRenderCallback) {
  document.getElementById('modal-title').innerText = title;
  const body = document.getElementById('modal-body-content');
  body.innerHTML = contentHTML;
  document.getElementById('global-modal').style.display = 'flex';
  
  if (typeof onRenderCallback === 'function') {
    onRenderCallback(body);
  }
};

window.closeModal = function() {
  document.getElementById('global-modal').style.display = 'none';
};

// Bootstrap application routing
document.addEventListener('DOMContentLoaded', init);
export { renderServiceTab };
