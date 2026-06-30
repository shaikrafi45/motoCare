// MotoCare Application Controller & View Switcher

import db from './utils/db.js';
import audio from './utils/audio.js';
import renderCustomer from './components/customer.js';
import renderTechnician from './components/technician.js';
import renderManager from './components/manager.js';

const state = {
  activeRole: 'customer' // 'customer' | 'technician' | 'manager'
};

function init() {
  // Bind role selector dropdown
  const selector = document.getElementById('app-role-selector');
  selector.addEventListener('change', (e) => {
    switchRole(e.target.value);
  });

  // Bind mute toggle
  const muteBtn = document.getElementById('header-mute-btn');
  muteBtn.addEventListener('click', () => {
    audio.init();
    const isMuted = audio.toggleMute();
    document.getElementById('mute-icon-unmuted').style.display = isMuted ? 'none' : 'block';
    document.getElementById('mute-icon-muted').style.display = isMuted ? 'block' : 'none';
  });

  // Setup global modal closing
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('global-modal').addEventListener('click', (e) => {
    if (e.target.id === 'global-modal') closeModal();
  });

  // Initial draw
  switchRole('customer');
}

// Perform Role Transition
function switchRole(roleName) {
  audio.init();
  
  // Rev motorcycle engine startup sound! (Zero-asset audio highlight)
  audio.playEngineRev();

  state.activeRole = roleName;
  
  // Sync select input display value (in case triggered programmatically)
  document.getElementById('app-role-selector').value = roleName;

  // Swap Body classes for styling targets
  document.body.className = `role-${roleName}-active`;

  // Define panels
  const panels = {
    customer: { elId: 'customer-view', renderer: renderCustomer, label: 'CUSTOMER PORTAL' },
    technician: { elId: 'technician-view', renderer: renderTechnician, label: 'TECHNICIAN DASHBOARD' },
    manager: { elId: 'manager-view', renderer: renderManager, label: 'SHOP MANAGER CONSOLE' }
  };

  // Swap displays
  Object.entries(panels).forEach(([name, panel]) => {
    const el = document.getElementById(panel.elId);
    if (name === roleName) {
      el.classList.add('active');
      document.getElementById('header-status-indicator').innerText = panel.label;
      panel.renderer(el);
    } else {
      el.classList.remove('active');
    }
  });
}

// Global helper: switch role programmatically
window.switchScreen = function(roleName) {
  switchRole(roleName);
};

// Global helper: refresh active view when DB states change
window.refreshCurrentView = function() {
  const selector = document.getElementById('app-role-selector');
  switchRole(selector.value);
};

// Global modal helpers
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
export { switchRole };
