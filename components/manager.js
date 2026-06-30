// MotoCare Shop Manager Control Panel Component

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
    <div class="manager-tabs-header">
      <button class="manager-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">Business Analytics</button>
      <button class="manager-tab-btn ${activeTab === 'assignments' ? 'active' : ''}" data-tab="assignments">Technician Dispatch (${unassignedJobs.length})</button>
      <button class="manager-tab-btn ${activeTab === 'inventory' ? 'active' : ''}" data-tab="inventory">Inventory & Price Catalog</button>
    </div>

    <!-- Panel 1: Analytics -->
    <div class="manager-tab-panel ${activeTab === 'dashboard' ? 'active' : ''}" id="tabpanel-dashboard">
      <div class="manager-analytics-cards">
        <div class="glass-card analytics-card">
          <div class="analytics-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <div class="analytics-info">
            <span class="analytics-val">₹${stats.totalEarnings}</span>
            <span class="analytics-lbl">Total Revenue</span>
          </div>
        </div>
        <div class="glass-card analytics-card">
          <div class="analytics-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <div class="analytics-info">
            <span class="analytics-val">${stats.completedCount} Jobs</span>
            <span class="analytics-lbl">Completed Services</span>
          </div>
        </div>
        <div class="glass-card analytics-card">
          <div class="analytics-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div class="analytics-info">
            <span class="analytics-val">${stats.activeJobs} Active</span>
            <span class="analytics-lbl">Servicing Queue</span>
          </div>
        </div>
      </div>

      <div class="manager-charts-grid">
        <!-- SVG Line chart (weekly revenues) -->
        <div class="glass-card">
          <div class="chart-header" style="margin-bottom: 12px;">
            <h4 style="font-size: 0.95rem; font-weight: 700;">Revenue Curve (Last 7 Days)</h4>
            <span style="font-size: 0.72rem; color: var(--text-light);">Daily business earnings flow</span>
          </div>
          <div class="chart-canvas-box" id="manager-earnings-line-chart"></div>
        </div>

        <!-- SVG Donut Chart (popular brands) -->
        <div class="glass-card">
          <div class="chart-header" style="margin-bottom: 12px;">
            <h4 style="font-size: 0.95rem; font-weight: 700;">Brand Service Share</h4>
            <span style="font-size: 0.72rem; color: var(--text-light);">Bike volume distribution</span>
          </div>
          <div class="manager-ring-box" id="manager-brands-donut-chart"></div>
        </div>
      </div>
    </div>

    <!-- Panel 2: Assignments -->
    <div class="manager-tab-panel ${activeTab === 'assignments' ? 'active' : ''}" id="tabpanel-assignments">
      <div class="glass-card" style="min-height: 350px;">
        <h3 class="booking-wizard-title" style="margin-bottom: 16px;">Pending Dispatch Requests</h3>
        
        <div class="assignment-grid-cards">
          ${unassignedJobs.length === 0 ? `
            <div style="text-align: center; color: var(--text-muted); padding: 64px 0; font-weight: 500;">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 10px; opacity: 0.5;"><polyline points="20 6 9 17 4 12"/></svg>
              <h4 style="color: var(--text-main); font-size: 0.95rem; margin-bottom: 4px;">No unassigned bookings!</h4>
              <p style="font-size: 0.78rem; line-height: 1.4;">All booking requests are dispatched and assigned to active service technicians.</p>
            </div>
          ` : unassignedJobs.map(job => `
            <div class="assignment-order-row">
              <div style="max-width: 60%;">
                <span class="assign-bike-txt">${job.bikeBrand} ${job.bikeModel}</span>
                <div style="color: var(--text-muted); font-size: 0.75rem; margin-top: 2px;">
                  Customer: ${escapeHTML(job.customerName)} (${job.customerPhone}) • Address: ${escapeHTML(job.customerAddress)}
                </div>
              </div>
              <div style="display: flex; gap: 8px; align-items: center;">
                <select class="select-input tech-assign-dropdown" style="padding: 8px 12px; font-size: 0.8rem;">
                  <option value="">Choose Mechanic</option>
                  ${technicians.map(t => `<option value="${t}">${t}</option>`).join('')}
                </select>
                <button class="btn assign-task-btn" data-order-id="${job.id}" style="padding: 8px 16px; font-size: 0.8rem;">
                  Dispatch
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Panel 3: Inventory catalog -->
    <div class="manager-tab-panel ${activeTab === 'inventory' ? 'active' : ''}" id="tabpanel-inventory">
      <div class="catalog-inventory-grid">
        
        <!-- Left: Replaced spare parts list -->
        <div class="glass-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
            <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--primary);">Spare Parts Inventory</h4>
            <button class="btn" id="manager-add-part-btn" style="padding: 6px 12px; font-size: 0.75rem;">+ Add Spare Component</button>
          </div>

          <div class="inv-table-wrap">
            <table class="inv-table">
              <thead>
                <tr>
                  <th>Spare Component Name</th>
                  <th>Price (₹)</th>
                  <th style="text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${parts.map(p => `
                  <tr>
                    <td style="font-weight: 600; color: var(--text-main);">${escapeHTML(p.name)}</td>
                    <td style="font-family: var(--font-mono); font-weight: 700;">₹${p.price}</td>
                    <td style="text-align: right; display: flex; gap: 8px; justify-content: flex-end;">
                      <button class="btn btn-secondary edit-part-action-btn" data-id="${p.id}" style="padding: 4px 8px; font-size: 0.7rem;">Edit</button>
                      <button class="btn btn-danger delete-part-action-btn" data-id="${p.id}" style="padding: 4px 8px; font-size: 0.7rem;">&times;</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right: Brands & Models manager -->
        <div class="glass-card" style="display: flex; flex-direction: column; gap: 20px;">
          
          <!-- Brands block -->
          <div>
            <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--primary); border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 12px;">Active Manufacturers</h4>
            
            <div style="display: flex; gap: 8px; margin-bottom: 12px;">
              <input type="text" id="manager-brand-input" class="input-field" placeholder="e.g. Kawasaki" style="flex-grow:1; padding: 8px 12px; font-size: 0.8rem;">
              <button class="btn" id="manager-add-brand-btn" style="padding: 8px 16px; font-size: 0.8rem;">Add Brand</button>
            </div>

            <div class="parts-pills-row">
              ${brands.map(b => `
                <span class="part-pill" style="border-radius: var(--border-radius-sm);">
                  <span>${b}</span>
                  <span class="part-pill-remove delete-brand-btn" data-brand="${b}">&times;</span>
                </span>
              `).join('')}
            </div>
          </div>

          <!-- Models block -->
          <div>
            <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--primary); border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 12px;">Bike Model Variants</h4>
            
            <form id="manager-model-form" style="display: grid; grid-template-columns: 1fr 1fr 80px; gap: 8px; margin-bottom: 12px; align-items: center;">
              <select id="manager-model-brand-select" class="select-input" required style="padding: 8px 12px; font-size: 0.8rem;">
                <option value="">Brand</option>
                ${brands.map(b => `<option value="${b}">${b}</option>`).join('')}
              </select>
              <input type="text" id="manager-model-name-input" class="input-field" required placeholder="e.g. Ninja 300" style="padding: 8px 12px; font-size: 0.8rem;">
              <button type="submit" class="btn" style="padding: 8px; font-size: 0.8rem; justify-content: center; height:34px;">Add</button>
            </form>

            <div style="max-height: 180px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); padding: 8px;">
              ${models.map(m => `
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; padding: 6px 8px; border-bottom: 1px solid rgba(255,255,255,0.02);">
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
      
      // Toast notice
      btn.innerText = 'Dispatched!';
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
      if (confirm('Delete this spare component from catalog?')) {
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
      if (confirm(`Delete manufacturer ${brand}? This will also delete all associated models!`)) {
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
  const width = container.clientWidth || 500;
  const height = 200;
  
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

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
  const yTicks = 4;
  for (let i = 0; i <= yTicks; i++) {
    const y = paddingTop + (chartHeight / yTicks) * i;
    const value = Math.round(roundedMax - (roundedMax / yTicks) * i);
    gridHTML += `
      <line class="graph-grid-line" x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}"></line>
      <text class="graph-axis-text" x="${paddingLeft - 8}" y="${y + 3}" text-anchor="end">₹${value}</text>
    `;
  }

  // Ticks labels
  let labelsHTML = '';
  points.forEach(p => {
    labelsHTML += `
      <text class="graph-axis-text" x="${p.x}" y="${height - 8}">${p.label}</text>
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
      <circle class="graph-point" cx="${p.x}" cy="${p.y}" r="4.5" data-index="${idx}">
        <title>${p.label}: ₹${p.earnings}</title>
      </circle>
      <text class="graph-point-lbl" x="${p.x}" y="${p.y - 10}" font-family="var(--font-mono)" font-size="9" fill="var(--primary)" text-anchor="middle" style="display:none;" id="mgr-tooltip-${idx}">₹${p.earnings}</text>
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
    container.innerHTML = `<span style="color: var(--text-light); font-size: 0.78rem;">No completed jobs recorded yet.</span>`;
    return;
  }

  const radius = 40;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius; // ~251.3
  const total = data.reduce((sum, item) => sum + item.count, 0);

  const colors = ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#f59e0b', '#64748b'];

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
        cx="55" cy="55" r="${radius}"
        stroke="${color}"
        stroke-dasharray="${strokeDash} ${circumference}"
        stroke-dashoffset="${offset}">
        <title>${item.brand}: ${item.count} bikes</title>
      </circle>
    `;

    cumulativeOffset -= strokeDash;

    legendHTML += `
      <div style="display:flex; align-items:center; gap:6px; font-size:0.75rem; color:var(--text-muted);">
        <span style="width:8px; height:8px; border-radius:50%; background-color:${color};"></span>
        <span>${item.brand} (${item.count})</span>
      </div>
    `;
  });

  container.innerHTML = `
    <div style="display:flex; align-items:center; gap:20px; width:100%; justify-content:center;">
      <div class="manager-ring-box" style="width:110px; height:110px;">
        <svg class="manager-ring-svg" width="110" height="110" viewBox="0 0 110 110">
          <circle class="manager-ring-bg" cx="55" cy="55" r="${radius}"></circle>
          ${slicesHTML}
        </svg>
        <div class="manager-ring-center-txt">
          <span style="font-family:var(--font-mono); font-size:1.3rem; font-weight:700;">${total}</span>
          <span style="font-size:0.6rem; color:var(--text-light); text-transform:uppercase;">Bikes</span>
        </div>
      </div>
      <div style="display:flex; flex-direction:column; gap:6px;">
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
        <label for="part-name-input">Spare Component Name</label>
        <input type="text" id="part-name-input" class="input-field" value="${isEdit ? escapeHTML(part.name) : ''}" required placeholder="e.g. LED Headlight Unit">
      </div>
      <div class="form-group">
        <label for="part-price-input">Catalog Price (₹)</label>
        <input type="number" id="part-price-input" class="input-field" value="${isEdit ? part.price : ''}" required placeholder="Price in Rupees" min="10" max="25000">
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn">${isEdit ? 'Update Price' : 'Add to Catalog'}</button>
      </div>
    </form>
  `;

  window.openModal(isEdit ? 'Modify Component Cost' : 'Register New Spare Component', html, (modalBody) => {
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
