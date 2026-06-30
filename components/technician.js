// motoCare Service Technician View Component

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
      <div class="glass-card" style="padding: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div class="profile-avatar" style="width: 32px; height: 32px; border-radius: 50%; font-size: 0.72rem; font-weight: 800; background: linear-gradient(135deg, var(--primary), #eab308); color: #000; display:flex; align-items:center; justify-content:center;">
            ${selectedTech.split(' ').map(n=>n[0]).join('').substr(0,2).toUpperCase()}
          </div>
          <div>
            <h4 style="font-size: 0.8rem; font-weight: 700;">Technician Queue</h4>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <select id="tech-profile-selector" class="select-input" style="padding: 6px; font-size: 0.75rem; border-color: var(--primary); font-weight: 700; color: var(--primary);">
            ${technicians.map(t => `<option value="${t}" ${selectedTech === t ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Tech job listings queue -->
      <h4 style="font-size:0.85rem; font-weight: 700; margin-bottom: 12px; color: var(--text-light); text-transform: uppercase;">Active Jobs (${techJobs.length})</h4>
      
      <div class="tech-cards-queue">
        ${techJobs.length === 0 ? `
          <div class="glass-card" style="text-align: center; color: var(--text-muted); padding: 40px 16px;">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 8px; opacity: 0.4;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <h4 style="color: var(--text-main); font-size: 0.82rem; margin-bottom: 4px;">Queue Empty</h4>
            <p style="font-size: 0.7rem; line-height: 1.4; max-width: 250px; margin: 0 auto;">No active service bookings assigned to your name. Switch to Manager inside Garage to dispatch jobs.</p>
          </div>
        ` : techJobs.map(job => `
          <div class="glass-card tech-order-card" data-order-id="${job.id}" style="padding: 16px; gap: 12px;">
            
            <div class="tech-card-header" style="padding-bottom: 8px;">
              <span class="tech-bike-info" style="font-size: 0.9rem;">${job.bikeBrand} ${job.bikeModel}</span>
              <span class="tech-status-badge">${job.status}</span>
            </div>

            <!-- Job Specific Details -->
            <div class="tech-card-details-row" style="grid-template-columns: 1fr; gap: 8px; font-size:0.75rem;">
              <div class="details-block">
                <span class="details-lbl" style="font-size:0.6rem;">Customer</span>
                <span class="details-val" style="color: var(--text-main); font-weight: 600;">${escapeHTML(job.customerName)} (${job.customerPhone})</span>
              </div>
              <div class="details-block">
                <span class="details-lbl" style="font-size:0.6rem;">Address</span>
                <span class="details-val">${escapeHTML(job.customerAddress)}</span>
              </div>
            </div>

            <!-- Servicing tools details (only shown during servicing stage) -->
            ${job.status === 'servicing' ? `
              <!-- Service Checklist -->
              <div class="details-block">
                <span class="details-lbl" style="font-size:0.6rem; margin-bottom: 4px;">Checklist</span>
                <div class="tech-checklist-grid" style="grid-template-columns: 1fr; padding: 8px; gap: 6px;">
                  ${job.checklist.map(item => `
                    <label class="checklist-check-row" style="font-size: 0.72rem;">
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
              <div class="parts-replaced-adder-box" style="padding: 10px; gap: 8px;">
                <span class="details-lbl" style="font-size:0.6rem;">Add Spare Parts</span>
                
                <div style="display: flex; gap: 6px; align-items: center;">
                  <select class="select-input tech-parts-dropdown" style="flex-grow: 1; padding: 6px; font-size: 0.75rem;">
                    <option value="">Select component</option>
                    ${partsCatalog.map(part => `<option value="${part.id}">${part.name} (₹${part.price})</option>`).join('')}
                  </select>
                  <button class="btn tech-add-part-btn" data-order-id="${job.id}" style="padding: 6px 10px; font-size: 0.75rem; flex-shrink:0;">
                    Add
                  </button>
                </div>

                <div class="parts-pills-row" style="margin-top: 4px; gap: 4px;">
                  ${job.replacedParts.length === 0 ? `
                    <span style="font-size: 0.68rem; color: var(--text-light);">No parts replaced yet.</span>
                  ` : job.replacedParts.map(part => `
                    <span class="part-pill" style="padding: 2px 6px; font-size: 0.65rem;">
                      <span>${part.name}</span>
                      <span class="part-pill-remove" data-order-id="${job.id}" data-part-name="${part.name}">&times;</span>
                    </span>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Task controls row -->
            <div style="display: flex; justify-content: flex-end; border-top: 1px solid var(--border-color); padding-top: 10px; margin-top: 4px;">
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
      db.updateBookingStatus(orderId, targetStatus);
      
      if (targetStatus === 'completed') {
        audio.playEngineRev(); // Exhaust rev sounds!
        alert('Order completed! Payment logged.');
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
      
      // Auto enable button if checklist is complete
      renderTechnician(container);
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
        alert('Please select a spare part.');
        return;
      }

      audio.playTick();
      db.addReplacedPart(orderId, partId);
      renderTechnician(container);
    });
  });

  // Bind part remover pills
  container.querySelectorAll('.part-pill-remove').forEach(x => {
    x.addEventListener('click', () => {
      const orderId = x.getAttribute('data-order-id');
      const partName = x.getAttribute('data-part-name');

      audio.playTick();
      db.removeReplacedPart(orderId, partName);
      renderTechnician(container);
    });
  });
}

// Generate the correct button text and state mapping based on order status
function getTechActionButton(job) {
  if (job.status === 'pickup') {
    return `
      <button class="btn tech-action-status-btn" data-order-id="${job.id}" data-target-status="servicing" style="padding: 6px 12px; font-size: 0.75rem;">
        Arrive at Shop
      </button>
    `;
  } else if (job.status === 'servicing') {
    const pendingChecks = job.checklist.filter(c => !c.done).length;
    let titleMsg = pendingChecks > 0 ? `Pending checks (${pendingChecks})` : 'Dispatch & Deliver';
    let disableClass = pendingChecks > 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed; padding: 6px 12px; font-size: 0.75rem;"' : 'style="padding: 6px 12px; font-size: 0.75rem;"';
    
    return `
      <button class="btn tech-action-status-btn" data-order-id="${job.id}" data-target-status="delivery" ${disableClass}>
        ${titleMsg}
      </button>
    `;
  } else if (job.status === 'delivery') {
    return `
      <button class="btn tech-action-status-btn" data-order-id="${job.id}" data-target-status="completed" style="background: var(--col-success); color:#000; padding: 6px 12px; font-size: 0.75rem;">
        Handover (₹${job.totalPrice})
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
