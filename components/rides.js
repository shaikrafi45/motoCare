// motoCare Pro-Experiences Rides View Component

import db from '../utils/db.js';
import audio from '../utils/audio.js';

let rideFilter = 'all'; // 'all' | 'track' | 'tour' | 'street'

export default function renderRides(container) {
  const rides = db.getRides();
  
  // Filter rides list
  const filteredRides = rides.filter(r => {
    if (rideFilter === 'all') return true;
    return r.type.toLowerCase() === rideFilter;
  });

  container.innerHTML = `
    <!-- Filters row -->
    <div class="glass-card" style="padding: 12px; margin-bottom: 12px;">
      <div style="display: flex; gap: 6px;">
        <button class="btn btn-secondary ride-filter-chip ${rideFilter === 'all' ? 'active' : ''}" data-filter="all" style="flex-grow:1; justify-content:center; padding: 6px 4px; font-size: 0.68rem; border-radius: 20px;">All</button>
        <button class="btn btn-secondary ride-filter-chip ${rideFilter === 'track' ? 'active' : ''}" data-filter="track" style="flex-grow:1; justify-content:center; padding: 6px 4px; font-size: 0.68rem; border-radius: 20px;">Track</button>
        <button class="btn btn-secondary ride-filter-chip ${rideFilter === 'tour' ? 'active' : ''}" data-filter="tour" style="flex-grow:1; justify-content:center; padding: 6px 4px; font-size: 0.68rem; border-radius: 20px;">Tour</button>
        <button class="btn btn-secondary ride-filter-chip ${rideFilter === 'street' ? 'active' : ''}" data-filter="street" style="flex-grow:1; justify-content:center; padding: 6px 4px; font-size: 0.68rem; border-radius: 20px;">Street</button>
      </div>
    </div>

    <!-- Rides Queue -->
    <div class="rides-list">
      ${filteredRides.length === 0 ? `
        <div class="glass-card" style="text-align: center; color: var(--text-light); padding: 32px 0;">
          No upcoming rides matching this category.
        </div>
      ` : filteredRides.map(ride => `
        <div class="glass-card ride-card">
          <div class="ride-header">
            <span class="ride-badge ${ride.type.toLowerCase()}">${ride.type}</span>
            <span style="font-size: 0.65rem; color: var(--text-light); font-family: var(--font-mono);">${ride.date}</span>
          </div>

          <h4 class="ride-title">${ride.title}</h4>
          <span style="font-size: 0.72rem; color: var(--text-muted); display:flex; align-items:center; gap:4px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            ${ride.location}
          </span>

          <div class="ride-detail-row">
            <span style="font-weight: 700; color: var(--primary); font-family: var(--font-mono);">${ride.rsvps} Bikers Joined</span>
            
            <button class="btn ride-join-btn" data-id="${ride.id}" 
                    style="padding: 6px 12px; font-size: 0.7rem; border-radius: 20px; 
                           background: ${ride.registered ? 'var(--col-success)' : 'var(--primary)'}; 
                           color: ${ride.registered ? '#fff' : '#000'};">
              ${ride.registered ? '✔ Registered' : 'RSVP Now'}
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Bind filter chips clicks
  container.querySelectorAll('.ride-filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      rideFilter = chip.getAttribute('data-filter');
      audio.playTick();
      renderRides(container); // Repaint
    });
  });

  // Bind join buttons click triggers
  container.querySelectorAll('.ride-join-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const updatedRide = db.toggleRideRegister(id);
      
      if (updatedRide.registered) {
        audio.playRegisterChime(); // Play B5-E6-G6 chime success!
      } else {
        audio.playTick();
      }

      renderRides(container); // Repaint
    });
  });
}
