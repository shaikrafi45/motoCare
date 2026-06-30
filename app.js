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
  isLoggedIn: false,
  activeTab: 'login', // starts at login screen
  activeLoginRole: 'customer' // 'customer' | 'technician' | 'manager'
};

function init() {
  // Bind bottom navigation bar tabs clicks (only active if logged in)
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!state.isLoggedIn) return;
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

  // Bind logout button in header
  document.getElementById('header-logout-btn').addEventListener('click', () => {
    performLogout();
  });

  // Bind Login Tab toggle buttons
  document.querySelectorAll('.login-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      audio.playTick();
      
      document.querySelectorAll('.login-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const role = btn.getAttribute('data-role');
      state.activeLoginRole = role;
      
      // Update form defaults based on tab selection
      const emailInput = document.getElementById('login-email');
      const techDropdown = document.getElementById('login-tech-dropdown-wrap');
      
      if (role === 'customer') {
        emailInput.value = 'customer@motocare.com';
        techDropdown.style.display = 'none';
      } else if (role === 'technician') {
        emailInput.value = 'mechanic@motocare.com';
        techDropdown.style.display = 'block';
      } else if (role === 'manager') {
        emailInput.value = 'manager@motocare.com';
        techDropdown.style.display = 'none';
      }
    });
  });

  // Bind login form submission
  document.getElementById('app-login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    audio.playTick();

    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-password').value;
    const selectedTech = document.getElementById('login-tech-profile').value;

    let loginSuccessful = false;
    let targetRole = state.activeLoginRole;

    if (targetRole === 'customer' && email === 'customer@motocare.com' && pass === 'password') {
      loginSuccessful = true;
    } else if (targetRole === 'technician' && email === 'mechanic@motocare.com' && pass === 'password') {
      loginSuccessful = true;
      window.ActiveTechnicianName = selectedTech; // Set active mechanic profile
    } else if (targetRole === 'manager' && email === 'manager@motocare.com' && pass === 'password') {
      loginSuccessful = true;
    }

    if (loginSuccessful) {
      performLogin(targetRole);
    } else {
      alert('Login failed! Invalid credentials.\n\nUse: customer@motocare.com / password\nor click the Quick Shortcuts below.');
    }
  });

  // Bind Quick login developer chips
  document.getElementById('quick-login-customer').addEventListener('click', (e) => {
    e.preventDefault();
    audio.playTick();
    performLogin('customer');
  });

  document.getElementById('quick-login-mechanic').addEventListener('click', (e) => {
    e.preventDefault();
    audio.playTick();
    window.ActiveTechnicianName = 'Vikram Rathore';
    performLogin('technician');
  });

  document.getElementById('quick-login-manager').addEventListener('click', (e) => {
    e.preventDefault();
    audio.playTick();
    performLogin('manager');
  });

  // Bind global modal closing events
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  
  // Start on the login screen
  switchTab('login');
}

// Router switcher
function switchTab(tabName) {
  audio.init();
  
  // Strict auth guard
  if (!state.isLoggedIn && tabName !== 'login') {
    tabName = 'login';
  }

  state.activeTab = tabName;

  // Navigation menu active state highlight styling
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`nav-${tabName}`);
  if (activeBtn) activeBtn.classList.add('active');

  // View container panels mapping
  const panels = {
    login: { elId: 'login-view', renderer: () => {} }, // rendered in html
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

// Perform Sign In
function performLogin(role) {
  state.isLoggedIn = true;
  db.setUserRole(role);

  // Play throttle rev alert
  audio.playEngineRev();

  // Show header logout and bottom navbar
  document.getElementById('header-logout-btn').style.display = 'block';
  document.querySelector('.phone-navbar').style.display = 'grid';
  document.getElementById('header-conn-tag').innerText = role.toUpperCase();

  // Route to Garage Dashboard
  switchTab('garage');
}

// Perform Logout
function performLogout() {
  state.isLoggedIn = false;
  
  // Stop motor thump if running
  audio.stopEngine();

  // Hide header logout and bottom navbar
  document.getElementById('header-logout-btn').style.display = 'none';
  document.querySelector('.phone-navbar').style.display = 'none';
  document.getElementById('header-conn-tag').innerText = 'CONNECT';

  // Route back to Login Portal
  switchTab('login');
}

// Global helper: switch tabs programmatically
window.switchTab = function(tabName) {
  switchTab(tabName);
};

// Global helper: refresh active view when DB updates happen
window.refreshCurrentTab = function() {
  if (!state.isLoggedIn) return;
  
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

// =========================================================================
// REAL-TIME SERVICE SIMULATION ENGINE (Automated Walkthrough)
// =========================================================================
let simTimers = [];

function clearAllSimulationTimers() {
  simTimers.forEach(t => clearTimeout(t));
  simTimers = [];
}

window.onNewBookingCreated = function(bookingId) {
  clearAllSimulationTimers();
  
  // STEP 1: After 3.5 seconds - Dispatch (Technician Vikram Rathore assigned)
  simTimers.push(setTimeout(() => {
    const booking = db.getBooking(bookingId);
    if (!booking) return;
    
    db.assignTechnician(bookingId, 'Vikram Rathore');
    audio.playRegisterChime(); // alert chime sound
    window.refreshCurrentTab();
  }, 3500));

  // STEP 2: After 7.5 seconds - Arrive at shop (Transition status to servicing)
  simTimers.push(setTimeout(() => {
    const booking = db.getBooking(bookingId);
    if (!booking) return;

    db.updateBookingStatus(bookingId, 'servicing');
    audio.playTick();
    window.refreshCurrentTab();
  }, 7500));

  // STEP 3: After 11 seconds - Check off task "Oil Change"
  simTimers.push(setTimeout(() => {
    const booking = db.getBooking(bookingId);
    if (!booking) return;

    db.updateChecklistItem(bookingId, 'Oil Change', true);
    audio.playTick();
    window.refreshCurrentTab();
  }, 11000));

  // STEP 4: After 14.5 seconds - Replaced part added: "Engine Oil" (₹650)
  simTimers.push(setTimeout(() => {
    const booking = db.getBooking(bookingId);
    if (!booking) return;

    db.addReplacedPart(bookingId, 'part-1'); // Engine oil
    audio.playRegisterChime(); // play shopping checkout pop sound!
    window.refreshCurrentTab();
  }, 14500));

  // STEP 5: After 18 seconds - Check off "Brake Adjustment" & "Chain Lubrication"
  simTimers.push(setTimeout(() => {
    const booking = db.getBooking(bookingId);
    if (!booking) return;

    db.updateChecklistItem(bookingId, 'Brake Adjustment', true);
    db.updateChecklistItem(bookingId, 'Chain Lubrication', true);
    audio.playTick();
    window.refreshCurrentTab();
  }, 18000));

  // STEP 6: After 21.5 seconds - Replaced part added: "Front Brake Pads" (₹450)
  simTimers.push(setTimeout(() => {
    const booking = db.getBooking(bookingId);
    if (!booking) return;

    db.addReplacedPart(bookingId, 'part-2'); // Brake pads
    audio.playRegisterChime();
    window.refreshCurrentTab();
  }, 21500));

  // STEP 7: After 25 seconds - Check off remaining tasks: "Air Filter Check" & "Wash & Polish"
  simTimers.push(setTimeout(() => {
    const booking = db.getBooking(bookingId);
    if (!booking) return;

    db.updateChecklistItem(bookingId, 'Air Filter Check', true);
    db.updateChecklistItem(bookingId, 'Wash & Polish', true);
    audio.playTick();
    window.refreshCurrentTab();
  }, 25000));

  // STEP 8: After 28 seconds - Out for delivery (status: delivery)
  simTimers.push(setTimeout(() => {
    const booking = db.getBooking(bookingId);
    if (!booking) return;

    db.updateBookingStatus(bookingId, 'delivery');
    audio.playEngineRev();
    window.refreshCurrentTab();
  }, 28000));

  // STEP 9: After 32 seconds - Completed & Delivered!
  simTimers.push(setTimeout(() => {
    const booking = db.getBooking(bookingId);
    if (!booking) return;

    db.updateBookingStatus(bookingId, 'completed');
    audio.playEngineRev(); // loud exhaust rev completion feedback!
    window.refreshCurrentTab();
    
    setTimeout(() => {
      alert(`🎉 Service Completed!\n\nYour KTM Duke 390 has been successfully serviced and delivered back to: ${booking.customerAddress}.\n\nTotal price: ₹${booking.totalPrice} paid via Cash on Delivery.`);
    }, 200);
  }, 32000));
};

// Hook cancel booking to clear simulation timers!
const originalDeleteBooking = db.deleteBooking.bind(db);
db.deleteBooking = function(id) {
  clearAllSimulationTimers();
  originalDeleteBooking(id);
};

// Bootstrap application routing
document.addEventListener('DOMContentLoaded', init);
export { renderServiceTab };
