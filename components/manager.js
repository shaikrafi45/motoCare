// motoCare Shop Manager Control Panel Component

import db from '../utils/db.js';
import audio from '../utils/audio.js';

let activeTab = 'dashboard'; // 'dashboard' | 'assignments' | 'inventory'

export default function renderManager(container) {
  // Stats
  const stats = db.getManagerStats();
  const bookings = db.getBookings();
  const unassignedJobs = bookings.filter(b => b.technician === null);
  const parts = db.getParts();
  const brands = db.getBrands();
  const models = db.getModels();
  const technicians = db.getTechnicians();

  container.innerHTML = `
    <!-- Manager Tab Navigation Header -->
    <div class="manager-tabs-header" style="margin-bottom: 16px; font-size: 0.8rem; gap: 8px;">
      <button class="manager-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard" style="font-size: 0.78rem; padding: 8px 2px;">Analytics</button>
      <button class="manager-tab-btn ${activeTab === 'assignments' ? 'active' : ''}" data-tab="assignments" style="font-size: 0.78rem; padding: 8px 2px;">Dispatch (${unassignedJobs.length})</button>
      <button class="manager-tab-btn ${activeTab === 'inventory' ? 'active' : ''}" data-tab="inventory" style="font-size: 0.78rem; padding: 8px 2px;">Catalog</button>
    </div>

    <!-- Panel 1: Analytics -->
    <div class="manager-tab-panel ${activeTab === 'dashboard' ? 'active' : ''}" id="tabpanel-dashboard">
      <div class="manager-analytics-cards" style="grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 16px;">
        <div class="glass-card analytics-card" style="padding: 10px 4px; flex-direction: column; text-align: center; gap: 4px;">
          <div class="analytics-info">
            <span class="analytics-val" style="font-size: 1rem;">₹${stats.totalEarnings}</span>
            <span class="analytics-lbl" style="font-size: 0.55rem;">Revenue</span>
          </div>
        </div>
        <div class="glass-card analytics-card" style="padding: 10px 4px; flex-direction: column; text-align: center; gap: 4px;">
          <div class="analytics-info">
            <span class="analytics-val" style="font-size: 1rem;">${stats.completedCount}</span>
            <span class="analytics-lbl" style="font-size: 0.55rem;">Serviced</span>
          </div>
        </div>
        <div class="glass-card analytics-card" style="padding: 10px 4px; flex-direction: column; text-align: center; gap: 4px;">
          <div class="analytics-info">
            <span class="analytics-val" style="font-size: 1rem;">${stats.activeJobs}</span>
            <span class="analytics-lbl" style="font-size: 0.55rem;">Active</span>
          </div>
        </div>
      </div>

      <div class="manager-charts-grid" style="grid-template-columns: 1fr; gap: 16px;">
        <!-- SVG Line chart (weekly revenues) -->
        <div class="glass-card" style="padding: 12px;">
          <div class="chart-header" style="margin-bottom: 8px;">
            <h4 style="font-size: 0.8rem; font-weight: 700;">Revenue Curve (Last 7 Days)</h4>
          </div>
          <div class="chart-canvas-box" id="manager-earnings-line-chart" style="height: 140px;"></div>
        </div>

        <!-- SVG Donut Chart (popular brands) -->
        <div class="glass-card" style="padding: 12px;">
          <div class="chart-header" style="margin-bottom: 8px;">
            <h4 style="font-size: 0.8rem; font-weight: 700;">Brand Service Share</h4>
          </div>
          <div class="manager-ring-box" id="manager-brands-donut-chart" style="height: 120px;"></div>
        </div>
      </div>
    </div>

    <!-- Panel 2: Assignments -->
    <div class="manager-tab-panel ${activeTab === 'assignments' ? 'active' : ''}" id="tabpanel-assignments">
      <div class="glass-card" style="min-height: 250px; padding: 16px;">
        <h3 class="booking-wizard-title" style="margin-bottom: 12px; font-size: 0.9rem;">Dispatch Queue</h3>
        
        <div class="assignment-grid-cards">
          ${unassignedJobs.length === 0 ? `
            <div style="text-align: center; color: var(--text-muted); padding: 48px 0; font-weight: 500;">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 8px; opacity: 0.5;"><polyline points="20 6 9 17 4 12"/></svg>
              <h4 style="color: var(--text-main); font-size: 0.8rem; margin-bottom: 4px;">Queue Empty</h4>
              <p style="font-size: 0.7rem; line-height: 1.4;">All booking requests have assigned mechanics.</p>
            </div>
          ` : unassignedJobs.map(job => `
            <div class="assignment-order-row" style="flex-direction: column; align-items: stretch; gap: 10px; padding: 12px;">
              <div>
                <span class="assign-bike-txt" style="font-size: 0.8rem;">${job.bikeBrand} ${job.bikeModel}</span>
                <div style="color: var(--text-muted); font-size: 0.68rem; margin-top: 2px;">
                  Cust: ${escapeHTML(job.customerName)} (${job.customerPhone})
                </div>
              </div>
              <div style="display: flex; gap: 6px;">
                <select class="select-input tech-assign-dropdown" style="flex-grow:1; padding: 6px 10px; font-size: 0.75rem;">
                  <option value="">Choose Mechanic</option>
                  ${technicians.map(t => `<option value="${t}">${t}</option>`).join('')}
                </select>
                <button class="btn assign-task-btn" data-order-id="${job.id}" style="padding: 6px 12px; font-size: 0.75rem;">
                  Assign
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Panel 3: Inventory catalog -->
    <div class="manager-tab-panel ${activeTab === 'inventory' ? 'active' : ''}" id="tabpanel-inventory">
      <div class="catalog-inventory-grid" style="grid-template-columns: 1fr; gap: 16px;">
        
        <!-- Replaced spare parts list -->
        <div class="glass-card" style="padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
            <h4 style="font-size: 0.82rem; font-weight: 700; color: var(--primary);">Spare Parts</h4>
            <button class="btn" id="manager-add-part-btn" style="padding: 4px 8px; font-size: 0.7rem;">+ Add</button>
          </div>

          <div class="inv-table-wrap">
            <table class="inv-table" style="font-size: 0.75rem;">
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Price</th>
                  <th style="text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${parts.map(p => `
                  <tr>
                    <td style="font-weight: 600; color: var(--text-main);">${escapeHTML(p.name)}</td>
                    <td style="font-family: var(--font-mono); font-weight: 700;">₹${p.price}</td>
                    <td style="text-align: right; display: flex; gap: 4px; justify-content: flex-end;">
                      <button class="btn btn-secondary edit-part-action-btn" data-id="${p.id}" style="padding: 3px 6px; font-size: 0.65rem;">Edit</button>
                      <button class="btn btn-danger delete-part-action-btn" data-id="${p.id}" style="padding: 3px 6px; font-size: 0.65rem;">&times;</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Brands & Models manager -->
        <div class="glass-card" style="display: flex; flex-direction: column; gap: 16px; padding: 16px;">
          
          <!-- Brands block -->
          <div>
            <h4 style="font-size: 0.82rem; font-weight: 700; color: var(--primary); border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 8px;">Brands</h4>
            
            <div style="display: flex; gap: 6px; margin-bottom: 8px;">
              <input type="text" id="manager-brand-input" class="input-field" placeholder="e.g. Kawasaki" style="flex-grow:1; padding: 6px 10px; font-size: 0.75rem;">
              <button class="btn" id="manager-add-brand-btn" style="padding: 6px 10px; font-size: 0.75rem;">Add</button>
            </div>

            <div class="parts-pills-row" style="gap: 4px;">
              ${brands.map(b => `
                <span class="part-pill" style="border-radius: var(--border-radius-sm); padding: 2px 6px; font-size: 0.68rem;">
                  <span>${b}</span>
                  <span class="part-pill-remove delete-brand-btn" data-brand="${b}">&times;</span>
                </span>
              `).join('')}
            </div>
          </div>

          <!-- Models block -->
          <div>
            <h4 style="font-size: 0.82rem; font-weight: 700; color: var(--primary); border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 8px;">Models</h4>
            
            <form id="manager-model-form" style="display: grid; grid-template-columns: 1fr 1fr 50px; gap: 6px; margin-bottom: 8px; align-items: center;">
              <select id="manager-model-brand-select" class="select-input" required style="padding: 6px; font-size: 0.75rem;">
                <option value="">Brand</option>
                ${brands.map(b => `<option value="${b}">${b}</option>`).join('')}
              </select>
              <input type="text" id="manager-model-name-input" class="input-field" required placeholder="e.g. Ninja 300" style="padding: 6px; font-size: 0.75rem;">
              <button type="submit" class="btn" style="padding: 6px; font-size: 0.75rem; justify-content: center; height:28px;">Add</button>
            </form>

            <div style="max-height: 120px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); padding: 4px;">
              ${models.map(m => `
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem; padding: 4px; border-bottom: 1px solid rgba(255,255,255,0.01);">
                  <span style="font-weight: 600; color: var(--text-main);">${m.brand} <span style="color: var(--text-muted); font-weight:400;">${m.name}</span></span>
                  <span class="part-pill-remove delete-model-btn" data-brand="${m.brand}" data-model="${m.name}">&times;</span>
                </div>
              `).join('')}
            </div>
          </div>

        </div>

      </div>
    </div>
  `;

  // Draw Charts
  drawRevenuesLineChart(stats.dailyEarnings, document.getElementById('manager-earnings-line-chart'));
  drawBrandsDonutChart(stats.brandChartData, document.getElementById('manager-brands-donut-chart'));

  // Bind tab switching
  container.querySelectorAll('.manager-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.getAttribute('data-tab');
      audio.playTick();
      renderManager(container);
    });
  });

  // Bind task assignments
  container.querySelectorAll('.assign-task-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = btn.getAttribute('data-order-id');
      const row = btn.closest('.assignment-order-row');
      const techSelect = row.querySelector('.tech-assign-dropdown');
      const techName = techSelect.value;

      if (!techName) {
        alert('Please choose a technician to assign.');
        return;
      }

      audio.playTick();
      db.assignTechnician(orderId, techName);
      
      btn.innerText = 'Assigned!';
      btn.style.background = 'var(--col-success)';
      setTimeout(() => {
        renderManager(container);
      }, 1000);
    });
  });

  // Bind inventory add part button
  container.querySelector('#manager-add-part-btn')?.addEventListener('click', () => {
    audio.playTick();
    openPartModal(null, container);
  });

  // Bind edit parts
  container.querySelectorAll('.edit-part-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      audio.playTick();
      openPartModal(id, container);
    });
  });

  // Bind delete parts
  container.querySelectorAll('.delete-part-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      audio.playTick();
      if (confirm('Delete this spare component?')) {
        db.deletePart(id);
        renderManager(container);
      }
    });
  });

  // Bind add brand button
  container.querySelector('#manager-add-brand-btn')?.addEventListener('click', () => {
    const input = container.querySelector('#manager-brand-input');
    const brand = input.value.trim();
    if (!brand) return;

    audio.playTick();
    db.addBrand(brand);
    renderManager(container);
  });

  // Bind delete brand button
  container.querySelectorAll('.delete-brand-btn').forEach(x => {
    x.addEventListener('click', () => {
      const brand = x.getAttribute('data-brand');
      audio.playTick();
      if (confirm(`Delete manufacturer ${brand}?`)) {
        db.deleteBrand(brand);
        renderManager(container);
      }
    });
  });

  // Bind model form addition
  container.querySelector('#manager-model-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const brand = container.querySelector('#manager-model-brand-select').value;
    const name = container.querySelector('#manager-model-name-input').value.trim();
    
    if (!brand || !name) return;

    audio.playTick();
    db.addModel(brand, name);
    renderManager(container);
  });

  // Bind delete model button
  container.querySelectorAll('.delete-model-btn').forEach(x => {
    x.addEventListener('click', () => {
      const brand = x.getAttribute('data-brand');
      const model = x.getAttribute('data-model');
      audio.playTick();
      if (confirm(`Delete variant ${brand} ${model}?`)) {
        db.deleteModel(brand, model);
        renderManager(container);
      }
    });
  });
}

// Draw dynamic earnings line chart (SVG coordinates)
function drawRevenuesLineChart(data, container) {
  const width = container.clientWidth || 310;
  const height = 140;
  
  const paddingLeft = 40;
  const paddingRight = 10;
  const paddingTop = 10;
  const paddingBottom = 20;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxEarnings = Math.max(...data.map(d => d.earnings), 2000);
  const roundedMax = Math.ceil(maxEarnings / 1000) * 1000;

  const xStep = chartWidth / (data.length - 1);

  const points = data.map((d, i) => {
    const x = paddingLeft + i * xStep;
    const y = paddingTop + chartHeight - (d.earnings / roundedMax) * chartHeight;
    return { x, y, label: d.label, earnings: d.earnings };
  });

  // Gridlines
  let gridHTML = '';
  const yTicks = 3;
  for (let i = 0; i <= yTicks; i++) {
    const y = paddingTop + (chartHeight / yTicks) * i;
    const value = Math.round(roundedMax - (roundedMax / yTicks) * i);
    gridHTML += `
      <line class="graph-grid-line" x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}"></line>
      <text class="graph-axis-text" x="${paddingLeft - 6}" y="${y + 3}" text-anchor="end" style="font-size:7px;">₹${value}</text>
    `;
  }

  // Ticks labels
  let labelsHTML = '';
  points.forEach(p => {
    labelsHTML += `
      <text class="graph-axis-text" x="${p.x}" y="${height - 4}" style="font-size:7px;">${p.label}</text>
      <line class="graph-grid-line" x1="${p.x}" y1="${paddingTop}" x2="${p.x}" y2="${height - paddingBottom}"></line>
    `;
  });

  // Paths
  let linePath = `M ${points[0].x} ${points[0].y}`;
  let areaPath = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    linePath += ` L ${points[i].x} ${points[i].y}`;
    areaPath += ` L ${points[i].x} ${points[i].y}`;
  }
  areaPath += ` L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

  // Draw points
  let dotsHTML = '';
  points.forEach((p, idx) => {
    dotsHTML += `
      <circle class="graph-point" cx="${p.x}" cy="${p.y}" r="3.5" data-index="${idx}">
        <title>${p.label}: ₹${p.earnings}</title>
      </circle>
      <text class="graph-point-lbl" x="${p.x}" y="${p.y - 8}" font-family="var(--font-mono)" font-size="8" fill="var(--primary)" text-anchor="middle" style="display:none;" id="mgr-tooltip-${idx}">₹${p.earnings}</text>
    `;
  });

  container.innerHTML = `
    <svg class="svg-graph" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="graph-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="var(--primary)" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
      ${gridHTML}
      ${labelsHTML}
      <line class="graph-axis-line" x1="${paddingLeft}" y1="${height - paddingBottom}" x2="${width - paddingRight}" y2="${height - paddingBottom}"></line>
      <line class="graph-axis-line" x1="${paddingLeft}" y1="${paddingTop}" x2="${paddingLeft}" y2="${height - paddingBottom}"></line>
      <path class="graph-area" d="${areaPath}"></path>
      <path class="graph-line" d="${linePath}"></path>
      ${dotsHTML}
    </svg>
  `;

  // Tooltips
  const dots = container.querySelectorAll('.graph-point');
  dots.forEach(dot => {
    dot.addEventListener('mouseenter', (e) => {
      const idx = e.target.getAttribute('data-index');
      const tooltip = container.querySelector(`#mgr-tooltip-${idx}`);
      if (tooltip) tooltip.style.display = 'block';
    });
    dot.addEventListener('mouseleave', (e) => {
      const idx = e.target.getAttribute('data-index');
      const tooltip = container.querySelector(`#mgr-tooltip-${idx}`);
      if (tooltip) tooltip.style.display = 'none';
    });
  });
}

// Draw dynamic brand donut pie chart (SVG dasharray)
function drawBrandsDonutChart(data, container) {
  if (data.length === 0) {
    container.innerHTML = `<span style="color: var(--text-light); font-size: 0.72rem;">No completed jobs.</span>`;
    return;
  }

  const radius = 30;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius; // ~188.5
  const total = data.reduce((sum, item) => sum + item.count, 0);

  const colors = ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#ffd600', '#64748b'];

  let cumulativeOffset = 0;
  let slicesHTML = '';
  let legendHTML = '';

  data.forEach((item, idx) => {
    const fraction = item.count / total;
    const strokeDash = fraction * circumference;
    const color = colors[idx % colors.length];
    const offset = circumference - strokeDash + cumulativeOffset;

    slicesHTML += `
      <circle class="manager-ring-slice"
        cx="45" cy="45" r="${radius}"
        stroke="${color}"
        stroke-width="${strokeWidth}"
        stroke-dasharray="${strokeDash} ${circumference}"
        stroke-dashoffset="${offset}">
        <title>${item.brand}: ${item.count} bikes</title>
      </circle>
    `;

    cumulativeOffset -= strokeDash;

    legendHTML += `
      <div style="display:flex; align-items:center; gap:4px; font-size:0.65rem; color:var(--text-muted);">
        <span style="width:6px; height:6px; border-radius:50%; background-color:${color};"></span>
        <span>${item.brand} (${item.count})</span>
      </div>
    `;
  });

  container.innerHTML = `
    <div style="display:flex; align-items:center; gap:16px; width:100%; justify-content:center;">
      <div class="manager-ring-box" style="width:90px; height:90px; flex-shrink:0;">
        <svg class="manager-ring-svg" width="90" height="90" viewBox="0 0 90 90">
          <circle class="manager-ring-bg" cx="45" cy="45" r="${radius}" stroke-width="${strokeWidth}"></circle>
          ${slicesHTML}
        </svg>
        <div class="manager-ring-center-txt">
          <span style="font-family:var(--font-mono); font-size:1rem; font-weight:700;">${total}</span>
          <span style="font-size:0.5rem; color:var(--text-light); text-transform:uppercase;">Bikes</span>
        </div>
      </div>
      <div style="display:flex; flex-direction:column; gap:4px;">
        ${legendHTML}
      </div>
    </div>
  `;
}

// Edit/Add modal dialog for parts
function openPartModal(partId = null, managerContainer) {
  const part = partId ? db.getPart(partId) : null;
  const isEdit = !!part;

  const html = `
    <form class="modal-form" id="part-modal-form">
      <div class="form-group">
        <label for="part-name-input">Component Name</label>
        <input type="text" id="part-name-input" class="input-field" value="${isEdit ? escapeHTML(part.name) : ''}" required placeholder="e.g. Led Headlight">
      </div>
      <div class="form-group">
        <label for="part-price-input">Catalog Price (₹)</label>
        <input type="number" id="part-price-input" class="input-field" value="${isEdit ? part.price : ''}" required placeholder="Price in Rupees" min="10" max="25000">
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn">${isEdit ? 'Update' : 'Add'}</button>
      </div>
    </form>
  `;

  window.openModal(isEdit ? 'Modify Price' : 'Add Component', html, (modalBody) => {
    modalBody.querySelector('#part-modal-form').addEventListener('submit', (e) => {
      e.preventDefault();
      audio.playTick();

      const name = modalBody.querySelector('#part-name-input').value.trim();
      const price = parseInt(modalBody.querySelector('#part-price-input').value) || 0;

      const updatedPart = { name, price };
      if (isEdit) updatedPart.id = partId;

      db.savePart(updatedPart);
      window.closeModal();
      renderManager(managerContainer); // Repaint
    });
  });
}

// Helpers
function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
