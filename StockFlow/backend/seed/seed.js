const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stockflow';

const categoriesData = [
  { name: 'Computer Peripherals', description: 'Keyboards, mice, webcams, and desktop accessories', status: 'active' },
  { name: 'Audio & Acoustics', description: 'Studio headphones, microphones, and wireless earbuds', status: 'active' },
  { name: 'Networking & Connectivity', description: 'Routers, switches, ethernet cabling, and USB adapters', status: 'active' },
  { name: 'Microcontrollers & IoT', description: 'Development boards, sensors, and electronic components', status: 'active' },
  { name: 'Ergonomic Office Furniture', description: 'Standing desks, mesh chairs, and monitor arms', status: 'active' },
  { name: 'Storage & Memory', description: 'NVMe SSDs, external hard drives, and flash drives', status: 'active' },
  { name: 'Power & Charging', description: 'Power banks, GaN chargers, UPS units, and surge protectors', status: 'active' },
  { name: 'Thermal & Point of Sale', description: 'Receipt printers, barcode scanners, and paper rolls', status: 'active' }
];

const suppliersData = [
  { name: 'David Vance', company: 'Apex Tech Wholesale Ltd.', email: 'orders@apextech.com', phone: '+1 (555) 234-8901', address: '742 Evergreen Terrace, San Jose, CA', status: 'active' },
  { name: 'Elena Rostova', company: 'Global Micro-Distributors', email: 'supply@globalmicro.io', phone: '+1 (555) 456-7890', address: '100 Industrial Parkway, Austin, TX', status: 'active' },
  { name: 'Marcus Sterling', company: 'ElectroHub Components', email: 'sales@electrohub.com', phone: '+1 (555) 678-1234', address: '45 Tech Boulevard, Seattle, WA', status: 'active' },
  { name: 'Sarah Lin', company: 'Nexus Office Solutions', email: 'contact@nexusoffice.org', phone: '+1 (555) 890-5678', address: '88 Commerce Street, Chicago, IL', status: 'active' },
  { name: 'Rajesh Kumar', company: 'Silicon Valley Semiconductors', email: 'orders@siliconsemi.com', phone: '+1 (555) 901-2345', address: '12 Innovation Way, Santa Clara, CA', status: 'active' },
  { name: 'Hannah Abbott', company: 'ProAudio Distribution', email: 'hannah@proaudiodist.com', phone: '+1 (555) 345-6789', address: '300 Music Row, Nashville, TN', status: 'active' }
];

// Helper to seed products linked to categories and suppliers
const generateProducts = (categoriesMap, suppliersMap) => {
  const getCatId = (name) => categoriesMap[name]._id;
  const getSupId = (comp) => suppliersMap[comp]._id;

  return [
    // Computer Peripherals
    { name: 'Pro Wireless Mechanical Keyboard', sku: 'KB-WLS-99', categoryId: getCatId('Computer Peripherals'), supplierId: getSupId('Apex Tech Wholesale Ltd.'), price: 129.99, costPrice: 75.00, quantity: 42, minStock: 10, maxStock: 100, unit: 'pcs' },
    { name: 'Ergonomic Vertical Optical Mouse', sku: 'MS-ERG-01', categoryId: getCatId('Computer Peripherals'), supplierId: getSupId('Apex Tech Wholesale Ltd.'), price: 49.99, costPrice: 22.50, quantity: 18, minStock: 15, maxStock: 60, unit: 'pcs' },
    { name: '4K UltraHD Stream Webcam', sku: 'CAM-4K-05', categoryId: getCatId('Computer Peripherals'), supplierId: getSupId('Nexus Office Solutions'), price: 159.99, costPrice: 88.00, quantity: 4, minStock: 8, maxStock: 30, unit: 'pcs' }, // Low stock
    { name: 'RGB Extended Gaming Mousepad', sku: 'PAD-RGB-02', categoryId: getCatId('Computer Peripherals'), supplierId: getSupId('Apex Tech Wholesale Ltd.'), price: 29.99, costPrice: 11.00, quantity: 85, minStock: 20, maxStock: 150, unit: 'pcs' },

    // Audio & Acoustics
    { name: 'Studio Noise-Canceling Headphones', sku: 'AUD-NC-88', categoryId: getCatId('Audio & Acoustics'), supplierId: getSupId('ProAudio Distribution'), price: 249.99, costPrice: 130.00, quantity: 12, minStock: 10, maxStock: 40, unit: 'pcs' },
    { name: 'USB Cardioid Condenser Microphone', sku: 'MIC-USB-44', categoryId: getCatId('Audio & Acoustics'), supplierId: getSupId('ProAudio Distribution'), price: 89.95, costPrice: 42.00, quantity: 2, minStock: 10, maxStock: 50, unit: 'pcs' }, // Low stock
    { name: 'Hi-Fi Desktop Reference Monitors (Pair)', sku: 'SPK-REF-02', categoryId: getCatId('Audio & Acoustics'), supplierId: getSupId('ProAudio Distribution'), price: 199.00, costPrice: 115.00, quantity: 0, minStock: 5, maxStock: 25, unit: 'pairs' }, // Out of stock
    { name: 'True Wireless ANC Earbuds', sku: 'AUD-TWS-12', categoryId: getCatId('Audio & Acoustics'), supplierId: getSupId('Global Micro-Distributors'), price: 79.99, costPrice: 38.00, quantity: 34, minStock: 12, maxStock: 80, unit: 'pcs' },

    // Networking & Connectivity
    { name: 'Wi-Fi 6E Tri-Band Mesh Router', sku: 'NET-WIFI-6E', categoryId: getCatId('Networking & Connectivity'), supplierId: getSupId('Global Micro-Distributors'), price: 289.99, costPrice: 160.00, quantity: 15, minStock: 8, maxStock: 40, unit: 'pcs' },
    { name: 'USB-C 11-in-1 Aluminum Hub', sku: 'HUB-USBC-11', categoryId: getCatId('Networking & Connectivity'), supplierId: getSupId('Apex Tech Wholesale Ltd.'), price: 69.99, costPrice: 31.00, quantity: 65, minStock: 15, maxStock: 120, unit: 'pcs' },
    { name: 'Cat6 Shielded Ethernet Cable 10m', sku: 'CAB-CAT6-10M', categoryId: getCatId('Networking & Connectivity'), supplierId: getSupId('Global Micro-Distributors'), price: 14.99, costPrice: 4.20, quantity: 140, minStock: 30, maxStock: 250, unit: 'pcs' },
    { name: 'Managed 8-Port Gigabit PoE Switch', sku: 'NET-SW-8POE', categoryId: getCatId('Networking & Connectivity'), supplierId: getSupId('Global Micro-Distributors'), price: 119.99, costPrice: 65.00, quantity: 3, minStock: 6, maxStock: 30, unit: 'pcs' }, // Low stock

    // Microcontrollers & IoT
    { name: 'ESP32 Wi-Fi + Bluetooth Dev Board', sku: 'IOT-ESP32-WROOM', categoryId: getCatId('Microcontrollers & IoT'), supplierId: getSupId('Silicon Valley Semiconductors'), price: 8.99, costPrice: 3.10, quantity: 210, minStock: 50, maxStock: 500, unit: 'pcs' },
    { name: 'Raspberry Pi 4 Model B (8GB RAM)', sku: 'IOT-RPI4-8GB', categoryId: getCatId('Microcontrollers & IoT'), supplierId: getSupId('Silicon Valley Semiconductors'), price: 85.00, costPrice: 58.00, quantity: 7, minStock: 15, maxStock: 80, unit: 'pcs' }, // Low stock
    { name: '37-in-1 Sensor Modules Kit', sku: 'IOT-KIT-37', categoryId: getCatId('Microcontrollers & IoT'), supplierId: getSupId('ElectroHub Components'), price: 34.99, costPrice: 14.50, quantity: 48, minStock: 10, maxStock: 100, unit: 'kits' },
    { name: 'Solderless Breadboard 830 Points', sku: 'IOT-BB-830', categoryId: getCatId('Microcontrollers & IoT'), supplierId: getSupId('Silicon Valley Semiconductors'), price: 5.99, costPrice: 1.80, quantity: 175, minStock: 40, maxStock: 300, unit: 'pcs' },

    // Ergonomic Office Furniture
    { name: 'Executive Ergonomic Mesh Chair', sku: 'FUR-CHR-MESH', categoryId: getCatId('Ergonomic Office Furniture'), supplierId: getSupId('Nexus Office Solutions'), price: 349.99, costPrice: 190.00, quantity: 9, minStock: 5, maxStock: 25, unit: 'pcs' },
    { name: 'Dual Monitor Gas-Spring Arm', sku: 'FUR-ARM-DUAL', categoryId: getCatId('Ergonomic Office Furniture'), supplierId: getSupId('Nexus Office Solutions'), price: 89.99, costPrice: 41.00, quantity: 22, minStock: 8, maxStock: 50, unit: 'pcs' },
    { name: 'Electric Motor Standing Desk Frame', sku: 'FUR-DESK-ELEC', categoryId: getCatId('Ergonomic Office Furniture'), supplierId: getSupId('Nexus Office Solutions'), price: 299.00, costPrice: 165.00, quantity: 1, minStock: 4, maxStock: 15, unit: 'pcs' }, // Low stock
    { name: 'Anti-Fatigue Memory Foam Mat', sku: 'FUR-MAT-AF01', categoryId: getCatId('Ergonomic Office Furniture'), supplierId: getSupId('Nexus Office Solutions'), price: 39.99, costPrice: 16.00, quantity: 38, minStock: 10, maxStock: 70, unit: 'pcs' },

    // Storage & Memory
    { name: '2TB PCIe 4.0 NVMe M.2 SSD', sku: 'STR-NVME-2TB', categoryId: getCatId('Storage & Memory'), supplierId: getSupId('ElectroHub Components'), price: 169.99, costPrice: 98.00, quantity: 28, minStock: 10, maxStock: 75, unit: 'pcs' },
    { name: '4TB Rugged External Hard Drive', sku: 'STR-HDD-4TB', categoryId: getCatId('Storage & Memory'), supplierId: getSupId('ElectroHub Components'), price: 119.99, costPrice: 68.00, quantity: 0, minStock: 8, maxStock: 40, unit: 'pcs' }, // Out of stock
    { name: '128GB High-Speed USB 3.2 Flash Drive', sku: 'STR-USB-128GB', categoryId: getCatId('Storage & Memory'), supplierId: getSupId('ElectroHub Components'), price: 19.99, costPrice: 7.50, quantity: 115, minStock: 25, maxStock: 200, unit: 'pcs' },

    // Power & Charging
    { name: '100W 4-Port GaN Fast Charger', sku: 'PWR-GAN-100W', categoryId: getCatId('Power & Charging'), supplierId: getSupId('Apex Tech Wholesale Ltd.'), price: 59.99, costPrice: 24.00, quantity: 55, minStock: 15, maxStock: 100, unit: 'pcs' },
    { name: '20,000mAh PD Power Bank', sku: 'PWR-PB-20K', categoryId: getCatId('Power & Charging'), supplierId: getSupId('Apex Tech Wholesale Ltd.'), price: 49.99, costPrice: 21.00, quantity: 40, minStock: 12, maxStock: 90, unit: 'pcs' },
    { name: '1500VA Battery Backup UPS Unit', sku: 'PWR-UPS-1500', categoryId: getCatId('Power & Charging'), supplierId: getSupId('Global Micro-Distributors'), price: 189.99, costPrice: 110.00, quantity: 5, minStock: 6, maxStock: 20, unit: 'pcs' }, // Low stock

    // Thermal & POS
    { name: 'Wireless POS Barcode Laser Scanner', sku: 'POS-SCAN-WLS', categoryId: getCatId('Thermal & Point of Sale'), supplierId: getSupId('Nexus Office Solutions'), price: 79.99, costPrice: 35.00, quantity: 16, minStock: 5, maxStock: 40, unit: 'pcs' },
    { name: '80mm Thermal Receipt Printer USB/LAN', sku: 'POS-PRN-80MM', categoryId: getCatId('Thermal & Point of Sale'), supplierId: getSupId('Nexus Office Solutions'), price: 129.99, costPrice: 62.00, quantity: 11, minStock: 5, maxStock: 30, unit: 'pcs' },
    { name: '80mm Thermal Paper Rolls (Box of 50)', sku: 'POS-PPR-8050', categoryId: getCatId('Thermal & Point of Sale'), supplierId: getSupId('Nexus Office Solutions'), price: 45.00, costPrice: 18.00, quantity: 62, minStock: 15, maxStock: 100, unit: 'boxes' }
  ];
};

const generateStockMovements = (products) => {
  const movements = [];
  const movementTypes = ['IN', 'OUT', 'RETURN', 'ADJUSTMENT'];
  const reasons = {
    IN: ['Supplier Delivery', 'Restock PO #1042', 'Bulk Warehouse Receipt'],
    OUT: ['Customer Order Sale', 'Retail Dispatch', 'Corporate Transfer'],
    RETURN: ['Customer Return - Defect Verified', 'Order Cancellation Return'],
    ADJUSTMENT: ['Quarterly Stock Audit', 'Damaged Packaging Write-off', 'Inventory Correction']
  };

  const now = new Date();
  
  // Generate 120 historic movements across past 30 days
  products.forEach((prod, pIdx) => {
    // Generate 3-5 historic movements per product
    const count = 3 + (pIdx % 3);
    let runningStock = Math.max(10, prod.quantity + (count * 4));

    for (let i = count; i >= 1; i--) {
      const type = movementTypes[(pIdx + i) % movementTypes.length];
      let qty = 1 + ((i * 3 + pIdx * 2) % 15);
      
      let prev = runningStock;
      let next = runningStock;

      if (type === 'IN') {
        next = prev + qty;
      } else if (type === 'OUT') {
        qty = Math.min(qty, Math.max(1, prev - 2));
        next = prev - qty;
      } else if (type === 'RETURN') {
        qty = Math.min(qty, 5);
        next = prev + qty;
      } else if (type === 'ADJUSTMENT') {
        qty = Math.min(qty, 4);
        next = Math.max(0, prev - qty);
      }

      runningStock = next;

      // Random date within past 30 days
      const daysAgo = Math.floor((i * 7 + pIdx * 2) % 28);
      const movementDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - (i * 3600000));

      const reasonArr = reasons[type];
      const reasonStr = reasonArr[i % reasonArr.length];
      const refStr = `${type}-${1000 + (pIdx * 10) + i}`;

      movements.push({
        productId: prod._id,
        type,
        quantity: qty,
        previousStock: prev,
        newStock: next,
        reason: reasonStr,
        reference: refStr,
        createdAt: movementDate
      });
    }
  });

  return movements;
};

const seedDatabase = async () => {
  try {
    console.log(`[Seed] Connecting to local MongoDB at: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed] Database connected successfully.');

    console.log('[Seed] Clearing existing collections...');
    await Category.deleteMany({});
    await Supplier.deleteMany({});
    await Product.deleteMany({});
    await StockMovement.deleteMany({});

    console.log('[Seed] Inserting Categories...');
    const insertedCategories = await Category.insertMany(categoriesData);
    const categoriesMap = {};
    insertedCategories.forEach(cat => {
      categoriesMap[cat.name] = cat;
    });

    console.log('[Seed] Inserting Suppliers...');
    const insertedSuppliers = await Supplier.insertMany(suppliersData);
    const suppliersMap = {};
    insertedSuppliers.forEach(sup => {
      suppliersMap[sup.company] = sup;
    });

    console.log('[Seed] Inserting Products...');
    const rawProducts = generateProducts(categoriesMap, suppliersMap);
    const insertedProducts = await Product.insertMany(rawProducts);

    console.log('[Seed] Inserting Stock Movements...');
    const rawMovements = generateStockMovements(insertedProducts);
    await StockMovement.insertMany(rawMovements);

    console.log('[Seed] Ensuring collection indexes...');
    await Category.syncIndexes();
    await Supplier.syncIndexes();
    await Product.syncIndexes();
    await StockMovement.syncIndexes();

    console.log(`=================================================`);
    console.log(`  STOCKFLOW SEEDING COMPLETE!`);
    console.log(`  - Categories Created: ${insertedCategories.length}`);
    console.log(`  - Suppliers Created: ${insertedSuppliers.length}`);
    console.log(`  - Products Created: ${insertedProducts.length}`);
    console.log(`  - Stock Movements Created: ${rawMovements.length}`);
    console.log(`  - Local Database: stockflow`);
    console.log(`=================================================`);

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    process.exit(1);
  }
};

seedDatabase();
