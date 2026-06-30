// motoCare PowerShop Apparel & Accessories View Component

import db from '../utils/db.js';
import audio from '../utils/audio.js';

// Persist sizing selected for item cards
if (!window.ShopSelectedSizes) {
  window.ShopSelectedSizes = {}; // Mapped itemId -> size
}

export default function renderShop(container) {
  const items = db.getShopItems();
  const totals = db.getCartTotals();

  container.innerHTML = `
    <!-- Shop Items Grid -->
    <div class="shop-grid">
      ${items.map(item => {
        const selectedSize = window.ShopSelectedSizes[item.id] || 'M';
        return `
          <div class="glass-card shop-card">
            <div class="shop-img-box">
              ${getItemSVG(item.imageType)}
            </div>
            
            <span class="shop-name">${item.name}</span>

            <!-- Sizing selection (only show for helmet, gloves, jacket) -->
            ${item.type !== 'maintenance' ? `
              <div class="size-pills-row">
                <span class="size-pill ${selectedSize === 'M' ? 'active' : ''}" data-item-id="${item.id}" data-size="M">M</span>
                <span class="size-pill ${selectedSize === 'L' ? 'active' : ''}" data-item-id="${item.id}" data-size="L">L</span>
                <span class="size-pill ${selectedSize === 'XL' ? 'active' : ''}" data-item-id="${item.id}" data-size="XL">XL</span>
              </div>
            ` : '<div style="height:20px;"></div>'}

            <div class="shop-price-row">
              <span class="shop-price">₹${item.price.toLocaleString('en-IN')}</span>
              <button class="shop-add-btn" data-id="${item.id}" title="Add to cart">+</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <!-- Floating Shopping Cart indicator -->
    ${totals.itemsCount > 0 ? `
      <div class="cart-floating-indicator" id="shop-cart-trigger">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
        <span class="cart-float-badge">${totals.itemsCount}</span>
      </div>
    ` : ''}
  `;

  // Bind size selection clicks
  container.querySelectorAll('.size-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.stopPropagation();
      const itemId = pill.getAttribute('data-item-id');
      const size = pill.getAttribute('data-size');
      
      window.ShopSelectedSizes[itemId] = size;
      audio.playTick();
      renderShop(container); // Repaint card sizing
    });
  });

  // Bind add to cart buttons
  container.querySelectorAll('.shop-add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const size = window.ShopSelectedSizes[id] || 'M';

      db.addToCart(id, size);
      audio.playRegisterChime(); // Play shopping tick chime!
      renderShop(container); // Repaint to update badge
    });
  });

  // Bind floating cart trigger to open overlay modal
  const cartTrigger = container.querySelector('#shop-cart-trigger');
  if (cartTrigger) {
    cartTrigger.addEventListener('click', () => {
      audio.playTick();
      openCartDrawer(container);
    });
  }
}

// Render dynamic SVGs for catalog items
function getItemSVG(type) {
  if (type === 'helmet') {
    return `<svg class="shop-img-svg" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="1.8"><path d="M12 2a10 10 0 0 0-10 10v2a4 4 0 0 0 4 4h12a4 4 0 0 0 4-4v-2a10 10 0 0 0-10-10z"></path><path d="M2 12h20"></path><path d="M12 2v10"></path></svg>`;
  } else if (type === 'gloves') {
    return `<svg class="shop-img-svg" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="1.8"><path d="M6 10V4a2 2 0 0 1 4 0v6M10 8V3a2 2 0 0 1 4 0v5M14 9V4a2 2 0 0 1 4 0v5M18 11V6a2 2 0 0 1 4 0v8a8 8 0 0 1-16 0v-4a2 2 0 0 1 4 0v2"></path></svg>`;
  } else if (type === 'jacket') {
    return `<svg class="shop-img-svg" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="1.8"><path d="M20.38 3.46L16 2l-4 3-4-3-4.38 1.46A2 2 0 0 0 2 5.38V12a8 8 0 0 0 8 8h4a8 8 0 0 0 8-8V5.38a2 2 0 0 0-1.62-1.92z"></path><path d="M12 5v15"></path></svg>`;
  }
  return `<svg class="shop-img-svg" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="1.8"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
}

// Open shopping cart drawer modal
function openCartDrawer(shopContainer) {
  const cart = db.getCart();
  const totals = db.getCartTotals();
  const address = db.getAddress();

  const cartItemsHTML = cart.map(c => {
    const item = db.getShopItem(c.itemId);
    if (!item) return '';
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.03);">
        <div>
          <span style="font-weight:700; color: var(--text-main);">${item.name}</span>
          <div style="font-size:0.68rem; color:var(--text-light); margin-top:2px;">Size: ${c.size}</div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <button class="btn btn-secondary cart-qty-btn decrease" data-item-id="${item.id}" data-size="${c.size}" style="padding: 2px 8px; font-size: 0.7rem;">-</button>
          <span style="font-family: var(--font-mono); font-weight:700;">${c.quantity}</span>
          <button class="btn btn-secondary cart-qty-btn increase" data-item-id="${item.id}" data-size="${c.size}" style="padding: 2px 8px; font-size: 0.7rem;">+</button>
          <span style="font-family:var(--font-mono); color: var(--primary); margin-left:6px; font-weight:700; min-width: 50px; text-align:right;">₹${(item.price * c.quantity).toLocaleString('en-IN')}</span>
        </div>
      </div>
    `;
  }).join('');

  const modalHTML = `
    <div style="display:flex; flex-direction:column; gap:16px;">
      
      <!-- Cart List -->
      <div style="max-height: 220px; overflow-y:auto; padding-right:4px;">
        ${cartItemsHTML}
      </div>

      <!-- Ship Address Details -->
      <div class="form-group" style="margin-bottom:0;">
        <label>Shipping Home Address</label>
        <textarea id="cart-checkout-address" class="input-field" style="padding:8px; font-size:0.75rem; resize:none; height:45px;">${address}</textarea>
      </div>

      <!-- Checkout Invoice -->
      <div class="invoice-card" style="margin-top:4px;">
        <div class="invoice-row">
          <span>Items Total (${totals.itemsCount})</span>
          <span style="font-family:var(--font-mono);">₹${totals.grandTotal.toLocaleString('en-IN')}</span>
        </div>
        <div class="invoice-row" style="color: var(--col-success); font-size:0.7rem;">
          <span>Delivery charge</span>
          <span>FREE</span>
        </div>
        <div class="invoice-row total" style="font-size:0.85rem;">
          <span>Grand Total</span>
          <span style="font-family:var(--font-mono);">₹${totals.grandTotal.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="modal-actions" style="margin-top:4px;">
        <button type="button" class="btn btn-secondary" onclick="closeModal()" style="padding:8px 14px; font-size:0.75rem;">Continue Shopping</button>
        <button type="button" id="cart-checkout-submit" class="btn" style="padding:8px 14px; font-size:0.75rem;">Place Order</button>
      </div>

    </div>
  `;

  window.openModal('Cart Summary & Checkout', modalHTML, (modalBody) => {
    // Bind plus/minus buttons inside modal
    modalBody.querySelectorAll('.cart-qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-item-id');
        const size = btn.getAttribute('data-size');
        
        if (btn.classList.contains('increase')) {
          db.addToCart(id, size);
        } else {
          db.removeFromCart(id, size);
        }
        
        audio.playTick();
        
        // Redraw cart overlay and shop view
        const currentTotals = db.getCartTotals();
        if (currentTotals.itemsCount <= 0) {
          window.closeModal();
        } else {
          openCartDrawer(shopContainer);
        }
        renderShop(shopContainer);
      });
    });

    // Bind checkout submit button click
    modalBody.querySelector('#cart-checkout-submit').addEventListener('click', () => {
      const updatedAddress = modalBody.querySelector('#cart-checkout-address').value.trim();
      if (!updatedAddress) {
        alert('Please specify a delivery address.');
        return;
      }

      db.setAddress(updatedAddress);
      db.clearCart();
      
      audio.playRegisterChime(); // Play checkout chime pops
      window.closeModal();
      
      alert('Order Placed Successfully! Your KTM gear will arrive at your home shortly.');
      renderShop(shopContainer); // Repaint
    });
  });
}
