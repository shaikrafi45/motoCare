// MotoCare Service Technician View Component

import db from '../utils/db.js';
import audio from '../utils/audio.js';

// Persist selected technician on window so it doesn't reset when switching roles
if (!window.ActiveTechnicianName) {
  window.ActiveTechnicianName = 'Vikram Rathore'; // Default seed
}

export default function renderTechnician(container) {
  const technicians = db.getTechnicians();
  const selectedTech = window.ActiveTechnicianName;

  // Filter active assignments for this tech
  const bookings = db.getBookings();
  const techJobs = bookings.filter(b => b.technician === selectedTech && b.status !== 'completed');
  const partsCatalog = db.getParts();

  container.innerHTML = `
    <div class="tech-container">
      
      <!-- Tech profile selector header -->
      <div class="tech-header-controls glass-card" style="padding: 16px 24px; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="profile-avatar" style="box-shadow: 0 0 10px var(--primary-glow); font-size: 0.8rem; font-weight: 800; background: linear-gradient(135deg, var(--primary), var(--secondary));">
            ${selectedTech.split(' ').map(n=>n[0]).join('').substr(0,2).toUpperCase()}
          </div>
          <div>
            <h4 style="font-size: 0.95rem; font-weight: 700;">Technician Dashboard</h4>
            <span style="font-size: 0.72rem; color: var(--text-light);">Active Mechanic Account</span>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <select id="tech-profile-selector" class="select-input" style="border-color: var(--primary); font-weight: 700; color: var(--primary);">
            ${technicians.map(t => `<option value="${t}" ${selectedTech === t ? 'selected' : ''}>Active Account: ${t}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Tech job listings queue -->
      <h3 class="booking-wizard-title" style="margin-bottom: 16px;">Assigned Service Queue (${techJobs.length})</h3>
      
      <div class="tech-cards-queue">
        ${techJobs.length === 0 ? `
          <div class="glass-card" style="text-align: center; color: var(--text-muted); padding: 48px; font-weight: 500;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 12px; opacity: 0.4;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <h4 style="color: var(--text-main); font-size: 0.95rem; margin-bottom: 6px;">All clean! No assigned tasks</h4>
            <p style="font-size: 0.78rem; line-height: 1.4; max-width: 320px; margin: 0 auto;">There are no active home pickup or bike servicing tasks assigned to your name right now. Switch to Manager Console to dispatch orders.</p>
          </div>
        ` : techJobs.map(job => `
          <div class="glass-card tech-order-card" data-order-id="${job.id}">
            
            <div class="tech-card-header">
              <span class="tech-bike-info">${job.bikeBrand} ${job.bikeModel}</span>
              <span class="tech-status-badge">${job.status}</span>
            </div>

            <!-- Job Specific Details -->
            <div class="tech-card-details-row">
              <div class="details-block">
                <span class="details-lbl">Customer particulars</span>
                <span class="details-val" style="color: var(--text-main); font-weight: 600;">${escapeHTML(job.customerName)}</span>
                <span class="details-val" style="font-size: 0.75rem;">Phone: <a href="tel:${job.customerPhone}" style="color: var(--primary); text-decoration: none;">${job.customerPhone}</a></span>
              </div>
              <div class="details-block">
                <span class="details-lbl">Pickup / Delivery Address</span>
                <span class="details-val">${escapeHTML(job.customerAddress)}</span>
              </div>
            </div>

            <!-- Servicing tools details (only shown during servicing stage) -->
            ${job.status === 'servicing' ? `
              <!-- Service Checklist -->
              <div class="details-block">
                <span class="details-lbl">Repair Diagnostics Checklist</span>
                <div class="tech-checklist-grid" style="margin-top: 6px;">
                  ${job.checklist.map(item => `
                    <label class="checklist-check-row">
                      <input type="checkbox" class="checklist-item-checkbox" 
                             data-task="${item.task}" 
                             data-order-id="${job.id}" 
                             ${item.done ? 'checked' : ''}>
                      <span>${item.task}</span>
                    </label>
                  `).join('')}
                </div>
              </div>

              <!-- Spare Parts Adder -->
              <div class="parts-replaced-adder-box">
                <span class="details-lbl">Body Parts Replaced (Affects Invoice)</span>
                
                <div style="display: flex; gap: 8px; align-items: center;">
                  <select class="select-input tech-parts-dropdown" style="flex-grow: 1; padding: 8px 12px; font-size: 0.8rem;">
                    <option value="">Select Spare Component</option>
                    ${partsCatalog.map(part => `<option value="${part.id}">${part.name} (₹${part.price})</option>`).join('')}
                  </select>
                  <button class="btn tech-add-part-btn" data-order-id="${job.id}" style="padding: 8px 16px; font-size: 0.8rem; flex-shrink:0;">
                    Add Spare Part
                  </button>
                </div>

                <div class="parts-pills-row" style="margin-top: 8px;">
                  ${job.replacedParts.length === 0 ? `
                    <span style="font-size: 0.72rem; color: var(--text-light);">No spare parts added to billing estimate yet.</span>
                  ` : job.replacedParts.map(part => `
                    <span class="part-pill">
                      <span>${part.name} (₹${part.price})</span>
                      <span class="part-pill-remove" data-order-id="${job.id}" data-part-name="${part.name}">&times;</span>
                    </span>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Task controls row -->
            <div style="display: flex; justify-content: flex-end; border-top: 1px solid var(--border-color); padding-top: 14px; margin-top: 6px;">
              ${getTechActionButton(job)}
            </div>

          </div>
        `).join('')}
      </div>

    </div>
  `;

  // Bind technician profile switcher
  container.querySelector('#tech-profile-selector').addEventListener('change', (e) => {
    window.ActiveTechnicianName = e.target.value;
    audio.playTick();
    renderTechnician(container); // Repaint tech view
  });

  // Bind status transitions buttons
  container.querySelectorAll('.tech-action-status-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = btn.getAttribute('data-order-id');
      const targetStatus = btn.getAttribute('data-target-status');
      
      audio.playTick();
      
      // Update DB status
      db.updateBookingStatus(orderId, targetStatus);
      
      // If service is completed, rev engine sound chimes!
      if (targetStatus === 'completed') {
        audio.playEngineRev();
        alert('Order completed! Re-routing bike handover to customer logs.');
      }
      
      renderTechnician(container); // Repaint
    });
  });

  // Bind checklist togglers
  container.querySelectorAll('.checklist-item-checkbox').forEach(chk => {
    chk.addEventListener('change', (e) => {
      const orderId = chk.getAttribute('data-order-id');
      const task = chk.getAttribute('data-task');
      const done = e.target.checked;
      
      audio.playTick();
      db.updateChecklistItem(orderId, task, done);
    });
  });

  // Bind part adder buttons
  container.querySelectorAll('.tech-add-part-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = btn.getAttribute('data-order-id');
      const card = btn.closest('.tech-order-card');
      const select = card.querySelector('.tech-parts-dropdown');
      const partId = select.value;

      if (!partId) {
        alert('Please select a spare part to add first.');
        return;
      }

      audio.playTick();
      db.addReplacedPart(orderId, partId);
      renderTechnician(container); // Repaint view
    });
  });

  // Bind part remover pills
  container.querySelectorAll('.part-pill-remove').forEach(x => {
    x.addEventListener('click', () => {
      const orderId = x.getAttribute('data-order-id');
      const partName = x.getAttribute('data-part-name');

      audio.playTick();
      db.removeReplacedPart(orderId, partName);
      renderTechnician(container); // Repaint
    });
  });
}

// Generate the correct button text and state mapping based on order status
function getTechActionButton(job) {
  if (job.status === 'pickup') {
    return `
      <button class="btn tech-action-status-btn" data-order-id="${job.id}" data-target-status="servicing">
        Confirm Pickup & Arrive at Shop
      </button>
    `;
  } else if (job.status === 'servicing') {
    // Check if checklist items are completed before letting technician finish
    const pendingChecks = job.checklist.filter(c => !c.done).length;
    let titleMsg = pendingChecks > 0 ? `Complete All Checklist Tasks (${pendingChecks} pending)` : 'Mark Servicing Done & Out for Delivery';
    let disableClass = pendingChecks > 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : '';
    
    return `
      <button class="btn tech-action-status-btn" data-order-id="${job.id}" data-target-status="delivery" ${disableClass}>
        ${titleMsg}
      </button>
    `;
  } else if (job.status === 'delivery') {
    return `
      <button class="btn tech-action-status-btn" data-order-id="${job.id}" data-target-status="completed" style="background: var(--col-success); color:#000;">
        Handover & Collect Payment (₹${job.totalPrice})
      </button>
    `;
  }
  return '';
}

// Escapes html
function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
