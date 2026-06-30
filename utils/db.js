// motoCare Mobile-First Database Manager

const DB_KEY = 'motocare_mobile_db_state';

const INITIAL_STATE = {
  ownerBike: {
    brand: 'KTM',
    model: 'Duke 390 Gen 3',
    regNo: 'DL 3S CQ 7739',
    mileage: '12,450 km',
    battery: 92, // %
    fuel: 75, // %
    temp: 84 // °C
  },
  configModels: [
    { id: 'cfg-duke', name: 'Duke 390 Gen 3', power: '45 PS', torque: '39 Nm', dryWeight: '154 kg', baseColor: '#ff5400' },
    { id: 'cfg-adventure', name: 'Adventure 390', power: '43.5 PS', torque: '37 Nm', dryWeight: '177 kg', baseColor: '#ff5400' },
    { id: 'cfg-rc', name: 'RC 390 Racing', power: '43.5 PS', torque: '37 Nm', dryWeight: '155 kg', baseColor: '#ff5400' }
  ],
  rides: [
    { id: 'ride-1', title: 'Orange Cup Track Day', type: 'Track', date: 'July 12, 2026', location: 'Buddh International Circuit', rsvps: 142, registered: false },
    { id: 'ride-2', title: 'Himalayan Escape Trail', type: 'Tour', date: 'August 05, 2026', location: 'Manali to Leh Highway', rsvps: 28, registered: false },
    { id: 'ride-3', title: 'Urban Ride Night Out', type: 'Street', date: 'July 05, 2026', location: 'Connaught Place Outer Ring', rsvps: 84, registered: false }
  ],
  shopItems: [
    { id: 'shop-1', name: 'KTM Duke Street Helmet', price: 6500, type: 'helmet', imageType: 'helmet' },
    { id: 'shop-2', name: 'Racing Leather Gloves', price: 3200, type: 'gloves', imageType: 'gloves' },
    { id: 'shop-3', name: 'All-Weather Riding Jacket', price: 12500, type: 'jacket', imageType: 'jacket' },
    { id: 'shop-4', name: 'Chain Lube & Clean Kit', price: 450, type: 'maintenance', imageType: 'lube' }
  ],
  parts: [
    { id: 'part-1', name: 'Engine Oil (Motul 15W50)', price: 650 },
    { id: 'part-2', name: 'Front Brake Pads', price: 450 },
    { id: 'part-3', name: 'NGK Spark Plug', price: 180 },
    { id: 'part-4', name: 'Chain & Sprocket Kit', price: 1800 },
    { id: 'part-5', name: 'Air Filter Element', price: 320 }
  ],
  technicians: ['Vikram Rathore', 'Rohan Sharma', 'Sandeep Singh'],
  bookings: [
    {
      id: 'MC-ORD-928102',
      customerName: 'Shaik Rafi',
      customerPhone: '9876543210',
      customerAddress: 'H-21, Green Park Ext., New Delhi',
      bikeBrand: 'KTM',
      bikeModel: 'Duke 390 Gen 3',
      serviceType: 'General Service',
      status: 'pickup',
      technician: 'Vikram Rathore',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '11:00 AM - 01:00 PM',
      createdAt: new Date().toISOString(),
      checklist: [
        { task: 'Oil Change', done: false },
        { task: 'Chain Lubrication', done: false },
        { task: 'Brake Adjustment', done: false },
        { task: 'Air Filter Check', done: false },
        { task: 'Wash & Polish', done: false }
      ],
      replacedParts: [],
      basePrice: 999,
      totalPrice: 999
    }
  ],
  cart: [], // Array of { itemId, quantity, size }
  settings: {
    userRole: 'customer', // 'customer' | 'technician' | 'manager'
    address: 'H-21, Green Park Ext., New Delhi - 110016'
  }
};

class MotoCareMobileDB {
  constructor() {
    this.state = this._load();
  }

  _load() {
    try {
      const stored = localStorage.getItem(DB_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse localStorage', e);
    }
    this._save(INITIAL_STATE);
    return INITIAL_STATE;
  }

  _save(state) {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  commit() {
    this._save(this.state);
  }

  // --- GARAGE TELEMETRY API ---
  getBikeTelemetry() {
    return this.state.ownerBike;
  }

  // --- ROLE / SETTINGS API ---
  getUserRole() {
    return this.state.settings.userRole;
  }

  setUserRole(role) {
    this.state.settings.userRole = role;
    this.commit();
  }

  getAddress() {
    return this.state.settings.address;
  }

  setAddress(address) {
    this.state.settings.address = address;
    this.commit();
  }

  // --- CONFIGURATOR API ---
  getConfigModels() {
    return this.state.configModels;
  }

  // --- PRO RIDES API ---
  getRides() {
    return this.state.rides;
  }

  toggleRideRegister(rideId) {
    const ride = this.state.rides.find(r => r.id === rideId);
    if (ride) {
      ride.registered = !ride.registered;
      ride.rsvps += ride.registered ? 1 : -1;
      this.commit();
    }
    return ride;
  }

  // --- SHOP / CART API ---
  getShopItems() {
    return this.state.shopItems;
  }

  getShopItem(id) {
    return this.state.shopItems.find(item => item.id === id) || null;
  }

  getCart() {
    return this.state.cart;
  }

  addToCart(itemId, size = 'M') {
    const cartItem = this.state.cart.find(c => c.itemId === itemId && c.size === size);
    if (cartItem) {
      cartItem.quantity++;
    } else {
      this.state.cart.push({ itemId, quantity: 1, size });
    }
    this.commit();
  }

  removeFromCart(itemId, size = 'M') {
    const cartItem = this.state.cart.find(c => c.itemId === itemId && c.size === size);
    if (cartItem) {
      cartItem.quantity--;
      if (cartItem.quantity <= 0) {
        this.state.cart = this.state.cart.filter(c => !(c.itemId === itemId && c.size === size));
      }
    }
    this.commit();
  }

  clearCart() {
    this.state.cart = [];
    this.commit();
  }

  getCartTotals() {
    let total = 0;
    this.state.cart.forEach(c => {
      const item = this.getShopItem(c.itemId);
      if (item) {
        total += item.price * c.quantity;
      }
    });
    return {
      itemsCount: this.state.cart.reduce((sum, c) => sum + c.quantity, 0),
      grandTotal: total
    };
  }

  // --- BOOKINGS & SERVICE JOBS API ---
  getBookings() {
    return this.state.bookings;
  }

  getBooking(id) {
    return this.state.bookings.find(b => b.id === id) || null;
  }

  saveBooking(booking) {
    if (booking.id) {
      const idx = this.state.bookings.findIndex(b => b.id === booking.id);
      if (idx !== -1) {
        this.state.bookings[idx] = { ...this.state.bookings[idx], ...booking };
      }
    } else {
      booking.id = 'MC-ORD-' + Math.floor(100000 + Math.random() * 900000);
      booking.status = 'received';
      booking.technician = null;
      booking.createdAt = new Date().toISOString();
      booking.replacedParts = [];
      booking.checklist = [
        { task: 'Oil Change', done: false },
        { task: 'Chain Lubrication', done: false },
        { task: 'Brake Adjustment', done: false },
        { task: 'Air Filter Check', done: false },
        { task: 'Wash & Polish', done: false }
      ];
      
      if (booking.serviceType === 'General Service') booking.basePrice = 999;
      else if (booking.serviceType === 'Major Repair') booking.basePrice = 2499;
      else booking.basePrice = 399; // Water wash

      booking.totalPrice = booking.basePrice;
      this.state.bookings.push(booking);
    }
    this.commit();
    return booking;
  }

  deleteBooking(id) {
    this.state.bookings = this.state.bookings.filter(b => b.id !== id);
    this.commit();
  }

  assignTechnician(bookingId, techName) {
    const booking = this.getBooking(bookingId);
    if (booking) {
      booking.technician = techName;
      booking.status = 'pickup';
      this.commit();
    }
    return booking;
  }

  updateBookingStatus(bookingId, newStatus) {
    const booking = this.getBooking(bookingId);
    if (booking) {
      booking.status = newStatus;
      this.commit();
    }
    return booking;
  }

  updateChecklistItem(bookingId, task, done) {
    const booking = this.getBooking(bookingId);
    if (booking) {
      const item = booking.checklist.find(c => c.task === task);
      if (item) {
        item.done = done;
        this.commit();
      }
    }
    return booking;
  }

  // --- SPARE PARTS (INVENTORY) API ---
  getParts() {
    return this.state.parts;
  }

  getPart(id) {
    return this.state.parts.find(p => p.id === id) || null;
  }

  savePart(part) {
    if (part.id) {
      const idx = this.state.parts.findIndex(p => p.id === part.id);
      if (idx !== -1) {
        this.state.parts[idx] = { ...this.state.parts[idx], ...part };
      }
    } else {
      part.id = 'part-' + Math.random().toString(36).substr(2, 9);
      this.state.parts.push(part);
    }
    this.commit();
    return part;
  }

  deletePart(id) {
    this.state.parts = this.state.parts.filter(p => p.id !== id);
    this.commit();
  }

  addReplacedPart(bookingId, partId) {
    const booking = this.getBooking(bookingId);
    const part = this.getPart(partId);
    if (booking && part) {
      const exists = booking.replacedParts.some(p => p.name === part.name);
      if (!exists) {
        booking.replacedParts.push({ name: part.name, price: part.price });
        this.calculateTotalPrice(booking);
        this.commit();
      }
    }
    return booking;
  }

  removeReplacedPart(bookingId, partName) {
    const booking = this.getBooking(bookingId);
    if (booking) {
      booking.replacedParts = booking.replacedParts.filter(p => p.name !== partName);
      this.calculateTotalPrice(booking);
      this.commit();
    }
    return booking;
  }

  calculateTotalPrice(booking) {
    const partsTotal = booking.replacedParts.reduce((sum, p) => sum + p.price, 0);
    booking.totalPrice = booking.basePrice + partsTotal;
  }

  getManagerStats() {
    const bookings = this.state.bookings;
    const completed = bookings.filter(b => b.status === 'completed');

    const totalEarnings = completed.reduce((sum, b) => sum + b.totalPrice, 0) + 12450; // Add pre-seeded past earnings
    const activeJobs = bookings.filter(b => b.status !== 'completed').length;
    const completedCount = completed.length + 3; // Add pre-seeded past count

    // Brand distributions
    const brandShares = { 'KTM': 3, 'Yamaha': 1, 'Royal Enfield': 1 };
    completed.forEach(b => {
      brandShares[b.bikeBrand] = (brandShares[b.bikeBrand] || 0) + 1;
    });
    const brandChartData = Object.entries(brandShares).map(([brand, count]) => ({ brand, count }));

    // Weekly earnings
    const dailyEarnings = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-CA');
      
      let earnings = completed
        .filter(b => new Date(b.createdAt).toLocaleDateString('en-CA') === dateStr)
        .reduce((sum, b) => sum + b.totalPrice, 0);

      // Pre-seeded bumps for aesthetic line graph
      if (i === 5) earnings += 2099;
      if (i === 3) earnings += 4949;
      if (i === 1) earnings += 399;

      const label = date.toLocaleDateString('en-US', { weekday: 'short' });
      dailyEarnings.push({ label, earnings });
    }

    return {
      totalEarnings,
      activeJobs,
      completedCount,
      brandChartData,
      dailyEarnings
    };
  }
}

const db = new MotoCareMobileDB();
export default db;
