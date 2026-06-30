// motoCare Customer Portal View Component

import db from '../utils/db.js';
import audio from '../utils/audio.js';

export default function renderCustomer(container) {
  const bookings = db.getBookings();
  const brands = db.getBrands();
  const models = db.getModels();

  // Find active booking (not completed yet)
  const activeOrder = bookings.find(b => b.status !== 'completed');
  const pastOrders = bookings.filter(b => b.status === 'completed');

  if (activeOrder) {
    // 1. RENDER ACTIVE ORDER TIMELINE TRACKER
    container.innerHTML = `
      <div class="customer-grid" style="grid-template-columns: 1fr; gap: 16px;">
        
        <!-- Timeline status -->
        <div class="glass-card status-tracker-card" style="padding: 16px;">
          <div class="status-tracker-header" style="margin-bottom: 12px; padding-bottom: 8px;">
            <div>
              <h4 style="font-size: 0.82rem; font-weight: 700; color: var(--primary);">Active Service Order</h4>
              <span class="tracker-id-tag" style="font-size: 0.72rem;">${activeOrder.id}</span>
            </div>
            <span class="tech-status-badge">${activeOrder.status}</span>
          </div>

          <div class="stepper-container" style="margin-bottom: 12px;">
            <div class="stepper-line" style="left: 9px;"></div>
            
            <!-- Step 1: Received -->
            <div class="step-node completed" id="step-received">
              <div class="step-icon-box">
                <svg class="step-check-svg" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div class="step-details">
                <span class="step-title">Booking Placed</span>
                <span class="step-desc">Awaiting allocation</span>
              </div>
            </div>

            <!-- Step 2: Pickup -->
            <div class="step-node ${getStepClass(activeOrder.status, 'pickup')}" id="step-pickup">
              <div class="step-icon-box">
                <div class="step-pulse-dot" style="display:none;"></div>
                <svg class="step-check-svg" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div class="step-details">
                <span class="step-title">Home Pickup</span>
                <span class="step-desc">${activeOrder.technician ? `Technician ${activeOrder.technician} assigned` : 'Rider allocation in progress...'}</span>
              </div>
            </div>

            <!-- Step 3: Servicing -->
            <div class="step-node ${getStepClass(activeOrder.status, 'servicing')}" id="step-servicing">
              <div class="step-icon-box">
                <div class="step-pulse-dot" style="display:none;"></div>
                <svg class="step-check-svg" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div class="step-details">
                <span class="step-title">Servicing</span>
                <span class="step-desc">Mechanic diagnostics active</span>
              </div>
            </div>

            <!-- Step 4: Delivery -->
            <div class="step-node ${getStepClass(activeOrder.status, 'delivery')}" id="step-delivery">
              <div class="step-icon-box">
                <div class="step-pulse-dot" style="display:none;"></div>
                <svg class="step-check-svg" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div class="step-details">
                <span class="step-title">Out for Delivery</span>
                <span class="step-desc">Bike returning home</span>
              </div>
            </div>

            <!-- Step 5: Completed -->
            <div class="step-node ${getStepClass(activeOrder.status, 'completed')}" id="step-completed">
              <div class="step-icon-box">
                <div class="step-pulse-dot" style="display:none;"></div>
                <svg class="step-check-svg" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div class="step-details">
                <span class="step-title">Handed Over</span>
                <span class="step-desc">Delivered safely</span>
              </div>
            </div>

          </div>

          <!-- Cancellation Option -->
          ${activeOrder.status === 'received' ? `
            <button class="btn btn-danger" id="customer-cancel-booking-btn" style="justify-content: center; padding: 8px; font-size: 0.75rem;">
              Cancel Booking
            </button>
          ` : ''}
        </div>

        <!-- Servicing details & Invoice Card -->
        <div class="glass-card" style="padding: 16px;">
          <h4 style="font-size:0.82rem; font-weight:700; color:var(--primary); margin-bottom:8px;">Diagnostics & Invoice</h4>
          
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="font-size: 0.72rem; color: var(--text-muted); display:flex; flex-direction:column; gap:2px;">
              <span style="font-weight: 700; color: var(--text-main);">${activeOrder.bikeBrand} ${activeOrder.bikeModel}</span>
              <span>Sched: ${activeOrder.scheduledDate} • ${activeOrder.scheduledTime}</span>
            </div>

            <!-- Checklist checks -->
            <div>
              <span class="details-lbl" style="font-size:0.6rem; display:block; margin-bottom:4px;">Diagnostic Checks</span>
              <div class="tech-checklist-grid" style="grid-template-columns: 1fr; gap: 4px; padding: 6px; font-size: 0.7rem; background: rgba(0,0,0,0.1);">
                ${activeOrder.checklist.map(item => `
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="color: ${item.done ? 'var(--col-success)' : 'var(--text-light)'}; font-weight: 800;">
                      ${item.done ? '✔' : '○'}
                    </span>
                    <span style="color: ${item.done ? 'var(--text-main)' : 'var(--text-muted)'};">${item.task}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Billing details -->
            <div>
              <span class="details-lbl" style="font-size:0.6rem; display:block; margin-bottom:4px;">Billing Estimate</span>
              <div class="invoice-card">
                <div class="invoice-row">
                  <span>Base (${activeOrder.serviceType})</span>
                  <span>₹${activeOrder.basePrice}</span>
                </div>
                
                ${activeOrder.replacedParts.length > 0 ? `
                  <div style="border-top: 1px solid rgba(255,255,255,0.03); padding-top: 4px; display: flex; flex-direction: column; gap: 2px;">
                    ${activeOrder.replacedParts.map(part => `
                      <div class="invoice-row" style="font-size: 0.68rem; font-style: italic;">
                        <span>+ ${part.name}</span>
                        <span>₹${part.price}</span>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}

                <div class="invoice-row total">
                  <span>Grand Total</span>
                  <span>₹${activeOrder.totalPrice}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    `;

    // Apply active pulse indicator in UI
    const activeStep = container.querySelector(`.step-node.active`);
    if (activeStep) {
      const dot = activeStep.querySelector('.step-pulse-dot');
      if (dot) dot.style.display = 'block';
    }

    // Bind cancel click
    const cancelBtn = container.querySelector('#customer-cancel-booking-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        audio.playTick();
        if (confirm('Cancel this service request?')) {
          db.deleteBooking(activeOrder.id);
          window.refreshCurrentTab();
        }
      });
    }

  } else {
    // 2. RENDER BOOKING WIZARD FORM
    container.innerHTML = `
      <div class="customer-grid" style="grid-template-columns: 1fr; gap: 16px;">
        
        <!-- Booking Form -->
        <div class="glass-card" style="padding: 16px;">
          <h3 class="booking-wizard-title" style="margin-bottom: 12px; font-size: 0.9rem;">Book Service</h3>
          
          <form class="booking-form" id="booking-wizard-form" style="gap: 12px;">
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div class="form-group">
                <label for="book-brand">Bike Brand</label>
                <select id="book-brand" class="select-input" style="padding:8px; font-size:0.78rem;" required>
                  <option value="">Brand</option>
                  ${brands.map(b => `<option value="${b}">${b}</option>`).join('')}
                </select>
              </div>

              <div class="form-group">
                <label for="book-model">Model</label>
                <select id="book-model" class="select-input" style="padding:8px; font-size:0.78rem;" required disabled>
                  <option value="">Select Brand</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="book-package">Service Package</label>
              <select id="book-package" class="select-input" style="padding:8px; font-size:0.78rem;" required>
                <option value="General Service">General Service Package (₹999)</option>
                <option value="Major Repair">Major Mechanical Repair (₹2499)</option>
                <option value="Water Wash & Polish">Water Wash & Polish (₹399)</option>
              </select>
            </div>

            <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 8px;">
              <div class="form-group">
                <label for="book-date">Pickup Date</label>
                <input type="date" id="book-date" class="input-field" style="padding:8px; font-size:0.78rem;" required min="${new Date().toISOString().split('T')[0]}">
              </div>

              <div class="form-group">
                <label for="book-time">Slot</label>
                <select id="book-time" class="select-input" style="padding:8px; font-size:0.78rem;" required>
                  <option value="09:00 AM - 11:00 AM">09-11 AM</option>
                  <option value="11:00 AM - 01:00 PM">11-01 PM</option>
                  <option value="02:00 PM - 04:00 PM">02-04 PM</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="book-cust-name">Name</label>
              <input type="text" id="book-cust-name" class="input-field" style="padding:8px; font-size:0.78rem;" required placeholder="e.g. Shaik Rafi">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div class="form-group">
                <label for="book-cust-phone">Phone</label>
                <input type="tel" id="book-cust-phone" class="input-field" style="padding:8px; font-size:0.78rem;" required placeholder="10-digit number" pattern="[0-9]{10}">
              </div>
              <div class="form-group">
                <label for="book-address">Address</label>
                <input type="text" id="book-address" class="input-field" style="padding:8px; font-size:0.78rem;" required placeholder="Locality/House No">
              </div>
            </div>

            <button type="submit" class="btn" style="width: 100%; justify-content: center; padding: 10px; font-size: 0.8rem; margin-top: 6px;">
              Confirm Booking
            </button>
          </form>
        </div>

        <!-- Past receipts logs -->
        <div class="glass-card" style="padding: 16px;">
          <h4 style="font-size:0.82rem; font-weight:700; color:var(--primary); margin-bottom:8px;">Past Service Receipts</h4>
          <div style="display: flex; flex-direction: column; gap: 8px; max-height: 150px; overflow-y: auto;" id="past-receipts-list">
            ${pastOrders.length === 0 ? `
              <div style="text-align: center; color: var(--text-light); padding: 16px 0; font-size: 0.7rem;">
                No past completed bookings.
              </div>
            ` : pastOrders.map(past => `
              <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); padding: 8px; font-size: 0.72rem;">
                <div style="display: flex; justify-content: space-between; font-weight: 700; color: var(--text-main); margin-bottom: 2px;">
                  <span>${past.bikeBrand} ${past.bikeModel}</span>
                  <span style="color: var(--primary);">₹${past.totalPrice}</span>
                </div>
                <div style="color: var(--text-light); font-size: 0.65rem;">
                  ${past.scheduledDate} • ${past.serviceType}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;

    // Dynamic brand -> models binder dropdown list
    const brandSelect = container.querySelector('#book-brand');
    const modelSelect = container.querySelector('#book-model');

    brandSelect.addEventListener('change', (e) => {
      const selectedBrand = e.target.value;
      
      if (!selectedBrand) {
        modelSelect.innerHTML = '<option value="">Model</option>';
        modelSelect.disabled = true;
        return;
      }

      const filteredModels = models.filter(m => m.brand === selectedBrand);
      modelSelect.innerHTML = `
        <option value="">Select Model</option>
        ${filteredModels.map(m => `<option value="${m.name}">${m.name}</option>`).join('')}
      `;
      modelSelect.disabled = false;
    });

    // CHECK FOR PRE-FILLED BIKE MODEL SELECTIONS FROM CONFIGURATOR!
    const prefilledModel = sessionStorage.getItem('motocare_test_ride_prefill');
    if (prefilledModel) {
      sessionStorage.removeItem('motocare_test_ride_prefill');
      
      // Auto select Brand "KTM"
      brandSelect.value = 'KTM';
      
      // Filter KTM models and load dropdown
      const ktmModels = models.filter(m => m.brand === 'KTM');
      modelSelect.innerHTML = `
        <option value="">Select Model</option>
        ${ktmModels.map(m => `<option value="${m.name}" ${m.name === prefilledModel ? 'selected' : ''}>${m.name}</option>`).join('')}
      `;
      modelSelect.disabled = false;

      // Auto select wash and detailing package for test ride
      container.querySelector('#book-package').value = 'Water Wash & Polish';
    }

    // Handle form submit booking
    container.querySelector('#booking-wizard-form').addEventListener('submit', (e) => {
      e.preventDefault();
      audio.playTick();

      const customerName = container.querySelector('#book-cust-name').value.trim();
      const customerPhone = container.querySelector('#book-cust-phone').value.trim();
      const customerAddress = container.querySelector('#book-address').value.trim();
      const bikeBrand = brandSelect.value;
      const bikeModel = modelSelect.value;
      const serviceType = container.querySelector('#book-package').value;
      const scheduledDate = container.querySelector('#book-date').value;
      const scheduledTime = container.querySelector('#book-time').value;

      db.saveBooking({
        customerName,
        customerPhone,
        customerAddress,
        bikeBrand,
        bikeModel,
        serviceType,
        scheduledDate,
        scheduledTime
      });

      // Rerender customer dashboard to show tracker timeline
      window.refreshCurrentTab();
    });
  }
}

// Stepper milestone status class mapper
function getStepClass(currentStatus, stepName) {
  const statusHierarchy = ['received', 'pickup', 'servicing', 'delivery', 'completed'];
  const currentIndex = statusHierarchy.indexOf(currentStatus);
  const stepIndex = statusHierarchy.indexOf(stepName);

  if (currentIndex === stepIndex) {
    return 'active';
  } else if (currentIndex > stepIndex) {
    return 'completed';
  }
  return '';
}
