// MotoCare Database Manager

const DB_KEY = 'motocare_db_state';

const INITIAL_STATE = {
  brands: ['Royal Enfield', 'Yamaha', 'Honda', 'KTM', 'Suzuki'],
  models: [
    { brand: 'Royal Enfield', name: 'Classic 350' },
    { brand: 'Royal Enfield', name: 'Himalayan 450' },
    { brand: 'Yamaha', name: 'YZF R15' },
    { brand: 'Yamaha', name: 'MT-15' },
    { brand: 'KTM', name: 'Duke 390' },
    { brand: 'KTM', name: 'RC 200' },
    { brand: 'Honda', name: 'Activa 6G' },
    { brand: 'Honda', name: 'CB Unicorn 160' },
    { brand: 'Suzuki', name: 'Access 125' },
    { brand: 'Suzuki', name: 'Gixser SF 150' }
  ],
  parts: [
    { id: 'part-1', name: 'Engine Oil (Motul 15W50)', price: 650 },
    { id: 'part-2', name: 'Front Brake Pads', price: 450 },
    { id: 'part-3', name: 'NGK Spark Plug', price: 180 },
    { id: 'part-4', name: 'Rolon Chain & Sprocket Kit', price: 1800 },
    { id: 'part-5', name: 'Air Filter', price: 320 },
    { id: 'part-6', name: 'Clutch Cable', price: 250 },
    { id: 'part-7', name: 'Rear Brake Shoes', price: 380 },
    { id: 'part-8', name: 'Carburetor Jet Cleaned', price: 150 }
  ],
  technicians: ['Rohan Sharma', 'Sandeep Singh', 'Vikram Rathore'],
  bookings: [
    // Completed Bookings (Past 7 days) to drive manager charts
    {
      id: 'MC-ORD-119283',
      customerName: 'Amit Verma',
      customerPhone: '9810293847',
      customerAddress: 'A-42, Sector 62, Noida',
      bikeBrand: 'Yamaha',
      bikeModel: 'MT-15',
      serviceType: 'General Service',
      status: 'completed',
      technician: 'Rohan Sharma',
      scheduledDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      scheduledTime: '10:00 AM - 12:00 PM',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      checklist: [
        { task: 'Oil Change', done: true },
        { task: 'Chain Lubrication', done: true },
        { task: 'Brake Adjustment', done: true },
        { task: 'Air Filter Check', done: true },
        { task: 'Wash & Polish', done: true }
      ],
      replacedParts: [
        { name: 'Engine Oil (Motul 15W50)', price: 650 },
        { name: 'Front Brake Pads', price: 450 }
      ],
      basePrice: 999,
      totalPrice: 2099
    },
    {
      id: 'MC-ORD-115982',
      customerName: 'Sanjay Dutt',
      customerPhone: '9848022338',
      customerAddress: 'J-120, Rajouri Garden, New Delhi',
      bikeBrand: 'Royal Enfield',
      bikeModel: 'Classic 350',
      serviceType: 'Major Repair',
      status: 'completed',
      technician: 'Vikram Rathore',
      scheduledDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      scheduledTime: '02:00 PM - 04:00 PM',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      checklist: [
        { task: 'Oil Change', done: true },
        { task: 'Chain Lubrication', done: true },
        { task: 'Brake Adjustment', done: true },
        { task: 'Air Filter Check', done: true },
        { task: 'Wash & Polish', done: true }
      ],
      replacedParts: [
        { name: 'Rolon Chain & Sprocket Kit', price: 1800 },
        { name: 'Engine Oil (Motul 15W50)', price: 650 }
      ],
      basePrice: 2499,
      totalPrice: 4949
    },
    {
      id: 'MC-ORD-112038',
      customerName: 'Kunal Kapoor',
      customerPhone: '9988776655',
      customerAddress: 'Flat 503, Tulip Heights, Gurugram',
      bikeBrand: 'KTM',
      bikeModel: 'Duke 390',
      serviceType: 'Water Wash & Polish',
      status: 'completed',
      technician: 'Sandeep Singh',
      scheduledDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      scheduledTime: '09:00 AM - 11:00 AM',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      checklist: [
        { task: 'Oil Change', done: false },
        { task: 'Chain Lubrication', done: true },
        { task: 'Brake Adjustment', done: false },
        { task: 'Air Filter Check', done: false },
        { task: 'Wash & Polish', done: true }
      ],
      replacedParts: [],
      basePrice: 399,
      totalPrice: 399
    },
    
    // Seeded active order for demo
    {
      id: 'MC-ORD-882910',
      customerName: 'Priya Sharma',
      customerPhone: '9560123456',
      customerAddress: 'E-12, Greater Kailash-I, New Delhi',
      bikeBrand: 'Honda',
      bikeModel: 'CB Unicorn 160',
      serviceType: 'General Service',
      status: 'pickup',
      technician: 'Rohan Sharma',
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
  ]
};

class MotoCareDB {
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
      console.error('Failed to parse MotoCare localStorage', e);
    }
    this._save(INITIAL_STATE);
    return INITIAL_STATE;
  }

  _save(state) {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to write MotoCare localStorage', e);
    }
  }

  commit() {
    this._save(this.state);
  }

  // --- BRANDS & MODELS API ---
  getBrands() {
    return this.state.brands;
  }

  addBrand(brand) {
    if (!this.state.brands.includes(brand)) {
      this.state.brands.push(brand);
      this.commit();
    }
  }

  deleteBrand(brand) {
    this.state.brands = this.state.brands.filter(b => b !== brand);
    this.state.models = this.state.models.filter(m => m.brand !== brand);
    this.commit();
  }

  getModels() {
    return this.state.models;
  }

  addModel(brand, modelName) {
    const exists = this.state.models.some(m => m.brand === brand && m.name === modelName);
    if (!exists) {
      this.state.models.push({ brand, name: modelName });
      this.commit();
    }
  }

  deleteModel(brand, name) {
    this.state.models = this.state.models.filter(m => !(m.brand === brand && m.name === name));
    this.commit();
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

  // --- TECHNICIANS API ---
  getTechnicians() {
    return this.state.technicians;
  }

  addTechnician(name) {
    if (!this.state.technicians.includes(name)) {
      this.state.technicians.push(name);
      this.commit();
    }
  }

  // --- BOOKINGS API ---
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
      
      // Calculate base price
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

  // Assign technician to order
  assignTechnician(bookingId, techName) {
    const booking = this.getBooking(bookingId);
    if (booking) {
      booking.technician = techName;
      booking.status = 'pickup'; // Auto-transition to pickup once driver is assigned
      this.commit();
    }
    return booking;
  }

  // Status transitions: received -> pickup -> servicing -> delivery -> completed
  updateBookingStatus(bookingId, newStatus) {
    const booking = this.getBooking(bookingId);
    if (booking) {
      booking.status = newStatus;
      this.commit();
    }
    return booking;
  }

  // Checklist updates
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

  // Replaced parts addition (affects final pricing invoice)
  addReplacedPart(bookingId, partId) {
    const booking = this.getBooking(bookingId);
    const part = this.getPart(partId);
    
    if (booking && part) {
      // Prevent duplicates
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

  // --- ANALYTICS FOR MANAGER ---
  getManagerStats() {
    const bookings = this.state.bookings;
    const completed = bookings.filter(b => b.status === 'completed');

    // Calculated metrics
    const totalEarnings = completed.reduce((sum, b) => sum + b.totalPrice, 0);
    const activeJobs = bookings.filter(b => b.status !== 'completed').length;
    const completedCount = completed.length;

    // Groups brand metrics
    const brandShares = {};
    completed.forEach(b => {
      brandShares[b.bikeBrand] = (brandShares[b.bikeBrand] || 0) + 1;
    });
    const brandChartData = Object.entries(brandShares).map(([brand, count]) => ({ brand, count }));

    // Weekly earnings grid (last 7 days)
    const dailyEarnings = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-CA');
      
      const earnings = completed
        .filter(b => new Date(b.createdAt).toLocaleDateString('en-CA') === dateStr)
        .reduce((sum, b) => sum + b.totalPrice, 0);

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

const db = new MotoCareDB();
export default db;
