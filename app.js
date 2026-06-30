// MotoCare Application Controller & View Router

import db from './utils/db.js';
import audio from './utils/audio.js';
import renderCustomer from './components/customer.js';
import renderTechnician from './components/technician.js';
import renderManager from './components/manager.js';

// Authentication & Screen Routing States
const state = {
  isLoggedIn: false,
  userRole: null, // 'customer' | 'technician' | 'manager'
  currentScreen: 'home', // 'home' | 'login' | 'app'
  activeLoginTab: 'customer' // selected login role card
};

function init() {
  // Bind top navbar brand link (go home)
  document.getElementById('header-logo-home').addEventListener('click', () => {
    audio.playTick();
    if (state.isLoggedIn) {
      // Keep inside app view
      switchScreen('app');
    } else {
      switchScreen('home');
    }
  });

  // Bind top landing header links
  document.querySelectorAll('.guest-nav-item').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      audio.playTick();
      
      document.querySelectorAll('.guest-nav-item').forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      switchScreen('home');

      // Scroll to specific section ID on landing page
      const targetId = link.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Bind landing booking CTA buttons
  document.getElementById('hero-book-now-btn').addEventListener('click', () => {
    audio.playTick();
    openLoginView('customer');
  });

  document.querySelectorAll('.pricing-book-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      audio.playTick();
      const pkg = btn.getAttribute('data-pkg');
      // Save desired pkg to session to pre-select it after login
      sessionStorage.setItem('motocare_preselected_pkg', pkg);
      openLoginView('customer');
    });
  });

  // Bind top header Sign In trigger
  document.getElementById('guest-login-trigger-btn').addEventListener('click', () => {
    audio.playTick();
    openLoginView('customer');
  });

  // Bind Login Tab toggle buttons
  document.querySelectorAll('.login-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      audio.playTick();
      
      document.querySelectorAll('.login-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const role = btn.getAttribute('data-role');
      state.activeLoginTab = role;
      
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
    let targetRole = state.activeLoginTab;

    // Standard credential validations
    if (targetRole === 'customer' && email === 'customer@motocare.com' && pass === 'password') {
      loginSuccessful = true;
    } else if (targetRole === 'technician' && email === 'mechanic@motocare.com' && pass === 'password') {
      loginSuccessful = true;
      window.ActiveTechnicianName = selectedTech; // Set active driver
    } else if (targetRole === 'manager' && email === 'manager@motocare.com' && pass === 'password') {
      loginSuccessful = true;
    }

    if (loginSuccessful) {
      performLogin(targetRole);
    } else {
      alert('Authentication failed! Please check your credentials or use the Quick login shortcuts below.');
    }
  });

  // Bind Quick developer credentials login shortcuts
  document.getElementById('quick-login-customer').addEventListener('click', (e) => {
    e.preventDefault();
    audio.playTick();
    performLogin('customer');
  });

  document.getElementById('quick-login-mechanic').addEventListener('click', (e) => {
    e.preventDefault();
    audio.playTick();
    window.ActiveTechnicianName = 'Vikram Rathore'; // Default quick tech
    performLogin('technician');
  });

  document.getElementById('quick-login-manager').addEventListener('click', (e) => {
    e.preventDefault();
    audio.playTick();
    performLogin('manager');
  });

  // Bind App Logout button
  document.getElementById('app-logout-btn').addEventListener('click', () => {
    audio.playTick();
    performLogout();
  });

  // Bind role selector dropdown inside App
  document.getElementById('app-role-selector').addEventListener('change', (e) => {
    audio.playTick();
    const newRole = e.target.value;
    state.userRole = newRole;
    renderAppRolePanel();
  });

  // Initialize view
  switchScreen('home');
}

// Open Login view
function openLoginView(defaultTab = 'customer') {
  switchScreen('login');
  
  // Trigger active tab selection click
  const tabBtn = document.querySelector(`.login-tab-btn[data-role="${defaultTab}"]`);
  if (tabBtn) {
    const event = new Event('click');
    tabBtn.dispatchEvent(event);
  }
}

// Routing Swapper
function switchScreen(screenName) {
  state.currentScreen = screenName;
  
  const homePanel = document.getElementById('home-view');
  const loginPanel = document.getElementById('login-view');
  const custPanel = document.getElementById('customer-view');
  const techPanel = document.getElementById('technician-view');
  const mgrPanel = document.getElementById('manager-view');
  
  const guestHeaderNav = document.getElementById('guest-navigation-bar');
  const guestHeaderLoginBtn = document.getElementById('guest-login-trigger-btn');
  const appHeaderStatus = document.getElementById('app-status-bar');
  const appHeaderProfile = document.getElementById('logged-in-profile-widget');

  // Deactivate all panels
  homePanel.classList.remove('active');
  loginPanel.classList.remove('active');
  custPanel.classList.remove('active');
  techPanel.classList.remove('active');
  mgrPanel.classList.remove('active');

  if (screenName === 'home') {
    document.body.className = 'landing-active';
    homePanel.classList.add('active');
    
    // Header config
    guestHeaderNav.style.display = 'flex';
    guestHeaderLoginBtn.style.display = 'block';
    appHeaderStatus.style.display = 'none';
    appHeaderProfile.style.display = 'none';

  } else if (screenName === 'login') {
    document.body.className = 'login-active';
    loginPanel.classList.add('active');
    
    // Header config
    guestHeaderNav.style.display = 'flex';
    guestHeaderLoginBtn.style.display = 'none';
    appHeaderStatus.style.display = 'none';
    appHeaderProfile.style.display = 'none';

  } else if (screenName === 'app') {
    // Header config
    guestHeaderNav.style.display = 'none';
    guestHeaderLoginBtn.style.display = 'none';
    appHeaderStatus.style.display = 'block';
    appHeaderProfile.style.display = 'block';

    // Renders active role panel
    renderAppRolePanel();
  }
}

// Render active app dashboard
function renderAppRolePanel() {
  const role = state.userRole;
  document.body.className = `role-${role}-active`;

  const panels = {
    customer: { elId: 'customer-view', renderer: renderCustomer, label: 'CUSTOMER PORTAL' },
    technician: { elId: 'technician-view', renderer: renderTechnician, label: 'TECHNICIAN DASHBOARD' },
    manager: { elId: 'manager-view', renderer: renderManager, label: 'SHOP MANAGER CONSOLE' }
  };

  // Sync role selector select value
  document.getElementById('app-role-selector').value = role;

  // Toggle active dashboard
  Object.entries(panels).forEach(([name, p]) => {
    const el = document.getElementById(p.elId);
    if (name === role) {
      el.classList.add('active');
      document.getElementById('header-status-indicator').innerText = p.label;
      p.renderer(el);
    } else {
      el.classList.remove('active');
    }
  });
}

// Login trigger
function performLogin(role) {
  audio.init();
  audio.playEngineRev(); // Dynamic motorbike throttle sound!

  state.isLoggedIn = true;
  state.userRole = role;
  
  switchScreen('app');

  // If customer logged in and has pre-selected package, select it in booking form!
  const preSelectedPkg = sessionStorage.getItem('motocare_preselected_pkg');
  if (role === 'customer' && preSelectedPkg) {
    sessionStorage.removeItem('motocare_preselected_pkg');
    setTimeout(() => {
      const selectPkg = document.getElementById('book-package');
      if (selectPkg) {
        selectPkg.value = preSelectedPkg;
      }
    }, 200);
  }
}

// Logout trigger
function performLogout() {
  state.isLoggedIn = false;
  state.userRole = null;
  switchScreen('home');
}

// Global helpers attached to window
window.switchScreen = function(screenName) {
  switchScreen(screenName);
};

window.refreshCurrentView = function() {
  if (state.isLoggedIn && state.currentScreen === 'app') {
    renderAppRolePanel();
  }
};

// Bootstrap application routing
document.addEventListener('DOMContentLoaded', init);
