// MotoCare Customer Portal View Component

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
      <div class="customer-grid">
        
        <!-- Timeline status -->
        <div class="glass-card status-tracker-card">
          <div class="status-tracker-header">
            <div>
              <h3 class="store-section-title">Active Service Order</h3>
              <span class="tracker-id-tag">${activeOrder.id}</span>
            </div>
            <span class="tech-status-badge" style="background: var(--primary-glow); color: var(--primary);">${activeOrder.status}</span>
          </div>

          <div class="tracker-timeline">
            <div class="timeline-line"></div>
            
            <!-- Step 1: Received -->
            <div class="timeline-step completed" id="step-received">
              <div class="step-icon-box">
                <svg class="step-check-svg" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div class="step-details">
                <span class="step-title">Booking Placed</span>
                <span class="step-desc">Awaiting manager review & technician allocation</span>
              </div>
            </div>

            <!-- Step 2: Pickup -->
            <div class="timeline-step ${getStepClass(activeOrder.status, 'pickup')}" id="step-pickup">
              <div class="step-icon-box">
                <div class="step-pulse-dot" style="display:none;"></div>
                <svg class="step-check-svg" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div class="step-details">
                <span class="step-title">Home Pickup</span>
                <span class="step-desc">${activeOrder.technician ? `Technician ${activeOrder.technician} assigned for home pickup` : 'Rider allocation in progress...'}</span>
              </div>
            </div>

            <!-- Step 3: Servicing -->
            <div class="timeline-step ${getStepClass(activeOrder.status, 'servicing')}" id="step-servicing">
              <div class="step-icon-box">
                <div class="step-pulse-dot" style="display:none;"></div>
                <svg class="step-check-svg" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div class="step-details">
                <span class="step-title">Workshop Servicing</span>
                <span class="step-desc">Mechanic diagnostics and repair checklist active</span>
              </div>
            </div>

            <!-- Step 4: Delivery -->
            <div class="timeline-step ${getStepClass(activeOrder.status, 'delivery')}" id="step-delivery">
              <div class="step-icon-box">
                <div class="step-pulse-dot" style="display:none;"></div>
                <svg class="step-check-svg" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div class="step-details">
                <span class="step-title">Out for Delivery</span>
                <span class="step-desc">Service completed, returning bike to your home</span>
              </div>
            </div>

            <!-- Step 5: Completed -->
            <div class="timeline-step ${getStepClass(activeOrder.status, 'completed')}" id="step-completed">
              <div class="step-icon-box">
                <div class="step-pulse-dot" style="display:none;"></div>
                <svg class="step-check-svg" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div class="step-details">
                <span class="step-title">Handed Over</span>
                <span class="step-desc">Bike delivered safely with invoices settled</span>
              </div>
            </div>

          </div>

          <!-- Customer Cancellation option if manager hasn't assigned technician -->
          ${activeOrder.status === 'received' ? `
            <button class="btn btn-danger" id="customer-cancel-booking-btn" style="margin-top: auto; justify-content: center;">
              Cancel Booking Request
            </button>
          ` : ''}
        </div>

        <!-- Servicing details & Invoice Card -->
        <div class="tracker-panel">
          <div class="glass-card" style="height: 100%;">
            <h3 class="booking-wizard-title">Job Details & Invoice</h3>
            
            <div style="display: flex; flex-direction: column; gap: 16px;">
              <!-- Vehicle particulars -->
              <div class="tech-card-details-row" style="grid-template-columns: 1fr 1fr;">
                <div class="details-block">
                  <span class="details-lbl">Vehicle Particulars</span>
                  <span class="details-val" style="color: var(--text-main); font-weight: 600;">${activeOrder.bikeBrand} ${activeOrder.bikeModel}</span>
                </div>
                <div class="details-block">
                  <span class="details-lbl">Scheduled Booking</span>
                  <span class="details-val">${activeOrder.scheduledDate} • ${activeOrder.scheduledTime}</span>
                </div>
              </div>

              <!-- Replaced checklist details -->
              <div class="details-block">
                <span class="details-lbl">Service Progress Checks</span>
                <div class="tech-checklist-grid" style="grid-template-columns: 1fr; gap: 6px; background: rgba(0,0,0,0.1); margin-top: 6px;">
                  ${activeOrder.checklist.map(item => `
                    <div style="display: flex; align-items: center; gap: 8px; font-size: 0.76rem;">
                      <span style="color: ${item.done ? 'var(--col-success)' : 'var(--text-light)'}; font-weight: 800;">
                        ${item.done ? '✔' : '○'}
                      </span>
                      <span style="color: ${item.done ? 'var(--text-main)' : 'var(--text-muted)'}; text-decoration: ${item.done ? 'none' : 'none'};">
                        ${item.task}
                      </span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Replaced parts invoice details -->
              <div class="details-block">
                <span class="details-lbl">Billing Invoice Breakdown</span>
                <div class="invoice-card" style="margin-top: 6px;">
                  <div class="invoice-row">
                    <span>Base package (${activeOrder.serviceType})</span>
                    <span style="font-family: var(--font-mono);">₹${activeOrder.basePrice}</span>
                  </div>
                  
                  ${activeOrder.replacedParts.length > 0 ? `
                    <div style="border-top: 1px solid rgba(255,255,255,0.03); padding-top: 6px; display: flex; flex-direction: column; gap: 4px;">
                      <span style="font-size: 0.65rem; color: var(--text-light); text-transform: uppercase;">Replaced Components</span>
                      ${activeOrder.replacedParts.map(part => `
                        <div class="invoice-row parts">
                          <span>+ ${part.name}</span>
                          <span style="font-family: var(--font-mono);">₹${part.price}</span>
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}

                  <div class="invoice-row total">
                    <span>Total Estimate</span>
                    <span style="font-family: var(--font-mono);">₹${activeOrder.totalPrice}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    `;

    // Apply active pulse indicator in UI
    const activeStep = container.querySelector(`.timeline-step.active`);
    if (activeStep) {
      const dot = activeStep.querySelector('.step-pulse-dot');
      if (dot) dot.style.display = 'block';
    }

    // Bind cancel click
    const cancelBtn = container.querySelector('#customer-cancel-booking-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        audio.playTick();
        if (confirm('Cancel this bike service booking?')) {
          db.deleteBooking(activeOrder.id);
          window.refreshCurrentView();
        }
      });
    }

  } else {
    // 2. RENDER BOOKING WIZARD FORM
    container.innerHTML = `
      <div class="customer-grid">
        
        <!-- Left: Booking Form -->
        <div class="glass-card">
          <h3 class="booking-wizard-title">Book Bike Service</h3>
          
          <form class="booking-form" id="booking-wizard-form">
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <!-- Brand -->
              <div class="form-group">
                <label for="book-brand">Bike Brand</label>
                <select id="book-brand" class="select-input" required>
                  <option value="">Select Brand</option>
                  ${brands.map(b => `<option value="${b}">${b}</option>`).join('')}
                </select>
              </div>

              <!-- Model -->
              <div class="form-group">
                <label for="book-model">Bike Model</label>
                <select id="book-model" class="select-input" required disabled>
                  <option value="">Choose Brand First</option>
                </select>
              </div>
            </div>

            <!-- Service Package -->
            <div class="form-group">
              <label for="book-package">Service Package</label>
              <select id="book-package" class="select-input" required>
                <option value="General Service">General Service Package (₹999)</option>
                <option value="Major Repair">Major Mechanical Repair (₹2499)</option>
                <option value="Water Wash & Polish">Water Wash & Detailing (₹399)</option>
              </select>
            </div>

            <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 12px;">
              <!-- Date -->
              <div class="form-group">
                <label for="book-date">Pickup Date</label>
                <input type="date" id="book-date" class="input-field" required min="${new Date().toISOString().split('T')[0]}">
              </div>

              <!-- Time slot -->
              <div class="form-group">
                <label for="book-time">Pickup Slot</label>
                <select id="book-time" class="select-input" required>
                  <option value="09:00 AM - 11:00 AM">09 AM - 11 AM</option>
                  <option value="11:00 AM - 01:00 PM">11 AM - 01 PM</option>
                  <option value="02:00 PM - 04:00 PM">02 PM - 04 PM</option>
                  <option value="04:00 PM - 06:00 PM">04 PM - 06 PM</option>
                </select>
              </div>
            </div>

            <!-- Client Info Details -->
            <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 12px;">
              <div class="form-group">
                <label for="book-cust-name">Your Name</label>
                <input type="text" id="book-cust-name" class="input-field" required placeholder="e.g. Rahul Sen">
              </div>
              <div class="form-group">
                <label for="book-cust-phone">Phone Number</label>
                <input type="tel" id="book-cust-phone" class="input-field" required placeholder="10-digit number" pattern="[0-9]{10}">
              </div>
            </div>

            <!-- Pickup Address -->
            <div class="form-group">
              <label for="book-address">Pickup Home Address</label>
              <input type="text" id="book-address" class="input-field" required placeholder="House No., Street, Locality...">
            </div>

            <button type="submit" class="btn" style="width: 100%; justify-content: center; margin-top: 8px;">
              Confirm Booking & Rev Engine
            </button>
          </form>
        </div>

        <!-- Right: Past orders list -->
        <div class="tracker-panel">
          <div class="glass-card" style="height: 100%;">
            <h3 class="booking-wizard-title">Service Receipt Logs</h3>
            <div style="display: flex; flex-direction: column; gap: 12px; max-height: 380px; overflow-y: auto;" id="past-receipts-list">
              ${pastOrders.length === 0 ? `
                <div style="text-align: center; color: var(--text-light); padding: 32px 0; font-size: 0.8rem;">
                  No past completed bookings logged on this system yet.
                </div>
              ` : pastOrders.map(past => `
                <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); padding: 12px; font-size: 0.78rem;">
                  <div style="display: flex; justify-content: space-between; font-weight: 700; color: var(--text-main); margin-bottom: 4px;">
                    <span>${past.bikeBrand} ${past.bikeModel}</span>
                    <span style="color: var(--primary); font-family: var(--font-mono);">₹${past.totalPrice}</span>
                  </div>
                  <div style="color: var(--text-muted); display: flex; gap: 8px; font-size: 0.72rem;">
                    <span>${past.scheduledDate}</span>
                    <span>•</span>
                    <span>${past.serviceType}</span>
                  </div>
                  ${past.replacedParts.length > 0 ? `
                    <div style="margin-top: 6px; color: var(--text-light); font-size: 0.7rem; font-style: italic;">
                      Parts: ${past.replacedParts.map(p => p.name).join(', ')}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
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
        modelSelect.innerHTML = '<option value="">Choose Brand First</option>';
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
      window.refreshCurrentView();
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
