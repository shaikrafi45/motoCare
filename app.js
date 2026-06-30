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
