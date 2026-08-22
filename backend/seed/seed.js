const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });
const { supabase } = require('../config/supabase');

const categoriesData = [
  { name: 'Computer Peripherals', description: 'Keyboards, mice, webcams, and desktop accessories', status: 'active' },
  { name: 'Audio & Acoustics', description: 'Studio headphones, microphones, and wireless earbuds', status: 'active' },
  { name: 'Networking & Connectivity', description: 'Routers, switches, ethernet cabling, and USB adapters', status: 'active' },
  { name: 'Microcontrollers & IoT', description: 'Development boards, sensors, and electronic components', status: 'active' },
  { name: 'Ergonomic Office Furniture', description: 'Standing desks, mesh chairs, and monitor arms', status: 'active' },
  { name: 'Storage & Memory', description: 'NVMe SSDs, external hard drives, and flash drives', status: 'active' },
  { name: 'Power & Charging', description: 'Power banks, GaN chargers, UPS units, and surge protectors', status: 'active' },
  { name: 'Thermal & Point of Sale', description: 'Receipt printers, barcode scanners, and paper rolls', status: 'active' },
];

const suppliersData = [
  { name: 'David Vance', company: 'Apex Tech Wholesale Ltd.', email: 'orders@apextech.com', phone: '+1 (555) 234-8901', address: '742 Evergreen Terrace, San Jose, CA', status: 'active' },
  { name: 'Elena Rostova', company: 'Global Micro-Distributors', email: 'supply@globalmicro.io', phone: '+1 (555) 456-7890', address: '100 Industrial Parkway, Austin, TX', status: 'active' },
  { name: 'Marcus Sterling', company: 'ElectroHub Components', email: 'sales@electrohub.com', phone: '+1 (555) 678-1234', address: '45 Tech Boulevard, Seattle, WA', status: 'active' },
  { name: 'Sarah Lin', company: 'Nexus Office Solutions', email: 'contact@nexusoffice.org', phone: '+1 (555) 890-5678', address: '88 Commerce Street, Chicago, IL', status: 'active' },
  { name: 'Rajesh Kumar', company: 'Silicon Valley Semiconductors', email: 'orders@siliconsemi.com', phone: '+1 (555) 901-2345', address: '12 Innovation Way, Santa Clara, CA', status: 'active' },
  { name: 'Hannah Abbott', company: 'ProAudio Distribution', email: 'hannah@proaudiodist.com', phone: '+1 (555) 345-6789', address: '300 Music Row, Nashville, TN', status: 'active' },
];

const customersData = [
  { name: 'Alex Johnson', phone: '+1 (555) 111-2233', email: 'alex.j@example.com', address: '123 Main St', city: 'San Jose', state: 'CA', pincode: '95112' },
  { name: 'Sophia Miller', phone: '+1 (555) 444-5566', email: 'sophia.m@example.com', address: '456 Oak Ave', city: 'Austin', state: 'TX', pincode: '73301' },
  { name: 'Daniel Chen', phone: '+1 (555) 777-8899', email: 'daniel.c@example.com', address: '789 Pine Blvd', city: 'Seattle', state: 'WA', pincode: '98101' },
];

const generateProducts = (ownerId, categoriesMap, suppliersMap) => {
  const getCatId = (name) => categoriesMap[name]?.id || null;
  const getSupId = (comp) => suppliersMap[comp]?.id || null;

  return [
    // Computer Peripherals
    { owner_id: ownerId, name: 'Pro Wireless Mechanical Keyboard', sku: 'KB-WLS-99', category_id: getCatId('Computer Peripherals'), supplier_id: getSupId('Apex Tech Wholesale Ltd.'), price: 129.99, cost_price: 75.00, quantity: 42, min_stock: 10, max_stock: 100, unit: 'pcs' },
    { owner_id: ownerId, name: 'Ergonomic Vertical Optical Mouse', sku: 'MS-ERG-01', category_id: getCatId('Computer Peripherals'), supplier_id: getSupId('Apex Tech Wholesale Ltd.'), price: 49.99, cost_price: 22.50, quantity: 18, min_stock: 15, max_stock: 60, unit: 'pcs' },
    { owner_id: ownerId, name: '4K UltraHD Stream Webcam', sku: 'CAM-4K-05', category_id: getCatId('Computer Peripherals'), supplier_id: getSupId('Nexus Office Solutions'), price: 159.99, cost_price: 88.00, quantity: 4, min_stock: 8, max_stock: 30, unit: 'pcs' },
    { owner_id: ownerId, name: 'RGB Extended Gaming Mousepad', sku: 'PAD-RGB-02', category_id: getCatId('Computer Peripherals'), supplier_id: getSupId('Apex Tech Wholesale Ltd.'), price: 29.99, cost_price: 11.00, quantity: 85, min_stock: 20, max_stock: 150, unit: 'pcs' },

    // Audio & Acoustics
    { owner_id: ownerId, name: 'Studio Noise-Canceling Headphones', sku: 'AUD-NC-88', category_id: getCatId('Audio & Acoustics'), supplier_id: getSupId('ProAudio Distribution'), price: 249.99, cost_price: 130.00, quantity: 12, min_stock: 10, max_stock: 40, unit: 'pcs' },
    { owner_id: ownerId, name: 'USB Cardioid Condenser Microphone', sku: 'MIC-USB-44', category_id: getCatId('Audio & Acoustics'), supplier_id: getSupId('ProAudio Distribution'), price: 89.95, cost_price: 42.00, quantity: 2, min_stock: 10, max_stock: 50, unit: 'pcs' },
    { owner_id: ownerId, name: 'Hi-Fi Desktop Reference Monitors (Pair)', sku: 'SPK-REF-02', category_id: getCatId('Audio & Acoustics'), supplier_id: getSupId('ProAudio Distribution'), price: 199.00, cost_price: 115.00, quantity: 0, min_stock: 5, max_stock: 25, unit: 'pairs' },
    { owner_id: ownerId, name: 'True Wireless ANC Earbuds', sku: 'AUD-TWS-12', category_id: getCatId('Audio & Acoustics'), supplier_id: getSupId('Global Micro-Distributors'), price: 79.99, cost_price: 38.00, quantity: 34, min_stock: 12, max_stock: 80, unit: 'pcs' },

    // Networking & Connectivity
    { owner_id: ownerId, name: 'Wi-Fi 6E Tri-Band Mesh Router', sku: 'NET-WIFI-6E', category_id: getCatId('Networking & Connectivity'), supplier_id: getSupId('Global Micro-Distributors'), price: 289.99, cost_price: 160.00, quantity: 15, min_stock: 8, max_stock: 40, unit: 'pcs' },
    { owner_id: ownerId, name: 'USB-C 11-in-1 Aluminum Hub', sku: 'HUB-USBC-11', category_id: getCatId('Networking & Connectivity'), supplier_id: getSupId('Apex Tech Wholesale Ltd.'), price: 69.99, cost_price: 31.00, quantity: 65, min_stock: 15, max_stock: 120, unit: 'pcs' },
    { owner_id: ownerId, name: 'Cat6 Shielded Ethernet Cable 10m', sku: 'CAB-CAT6-10M', category_id: getCatId('Networking & Connectivity'), supplier_id: getSupId('Global Micro-Distributors'), price: 14.99, cost_price: 4.20, quantity: 140, min_stock: 30, max_stock: 250, unit: 'pcs' },
    { owner_id: ownerId, name: 'Managed 8-Port Gigabit PoE Switch', sku: 'NET-SW-8POE', category_id: getCatId('Networking & Connectivity'), supplier_id: getSupId('Global Micro-Distributors'), price: 119.99, cost_price: 65.00, quantity: 3, min_stock: 6, max_stock: 30, unit: 'pcs' },

    // Microcontrollers & IoT
    { owner_id: ownerId, name: 'ESP32 Wi-Fi + Bluetooth Dev Board', sku: 'IOT-ESP32-WROOM', category_id: getCatId('Microcontrollers & IoT'), supplier_id: getSupId('Silicon Valley Semiconductors'), price: 8.99, cost_price: 3.10, quantity: 210, min_stock: 50, max_stock: 500, unit: 'pcs' },
    { owner_id: ownerId, name: 'Raspberry Pi 4 Model B (8GB RAM)', sku: 'IOT-RPI4-8GB', category_id: getCatId('Microcontrollers & IoT'), supplier_id: getSupId('Silicon Valley Semiconductors'), price: 85.00, cost_price: 58.00, quantity: 7, min_stock: 15, max_stock: 80, unit: 'pcs' },
    { owner_id: ownerId, name: '37-in-1 Sensor Modules Kit', sku: 'IOT-KIT-37', category_id: getCatId('Microcontrollers & IoT'), supplier_id: getSupId('ElectroHub Components'), price: 34.99, cost_price: 14.50, quantity: 48, min_stock: 10, max_stock: 100, unit: 'kits' },
    { owner_id: ownerId, name: 'Solderless Breadboard 830 Points', sku: 'IOT-BB-830', category_id: getCatId('Microcontrollers & IoT'), supplier_id: getSupId('Silicon Valley Semiconductors'), price: 5.99, cost_price: 1.80, quantity: 175, min_stock: 40, max_stock: 300, unit: 'pcs' },

    // Ergonomic Office Furniture
    { owner_id: ownerId, name: 'Executive Ergonomic Mesh Chair', sku: 'FUR-CHR-MESH', category_id: getCatId('Ergonomic Office Furniture'), supplier_id: getSupId('Nexus Office Solutions'), price: 349.99, cost_price: 190.00, quantity: 9, min_stock: 5, max_stock: 25, unit: 'pcs' },
    { owner_id: ownerId, name: 'Dual Monitor Gas-Spring Arm', sku: 'FUR-ARM-DUAL', category_id: getCatId('Ergonomic Office Furniture'), supplier_id: getSupId('Nexus Office Solutions'), price: 89.99, cost_price: 41.00, quantity: 22, min_stock: 8, max_stock: 50, unit: 'pcs' },
    { owner_id: ownerId, name: 'Electric Motor Standing Desk Frame', sku: 'FUR-DESK-ELEC', category_id: getCatId('Ergonomic Office Furniture'), supplier_id: getSupId('Nexus Office Solutions'), price: 299.00, cost_price: 165.00, quantity: 1, min_stock: 4, max_stock: 15, unit: 'pcs' },
    { owner_id: ownerId, name: 'Anti-Fatigue Memory Foam Mat', sku: 'FUR-MAT-AF01', category_id: getCatId('Ergonomic Office Furniture'), supplier_id: getSupId('Nexus Office Solutions'), price: 39.99, cost_price: 16.00, quantity: 38, min_stock: 10, max_stock: 70, unit: 'pcs' },

    // Storage & Memory
    { owner_id: ownerId, name: '2TB PCIe 4.0 NVMe M.2 SSD', sku: 'STR-NVME-2TB', category_id: getCatId('Storage & Memory'), supplier_id: getSupId('ElectroHub Components'), price: 169.99, cost_price: 98.00, quantity: 28, min_stock: 10, max_stock: 75, unit: 'pcs' },
    { owner_id: ownerId, name: '4TB Rugged External Hard Drive', sku: 'STR-HDD-4TB', category_id: getCatId('Storage & Memory'), supplier_id: getSupId('ElectroHub Components'), price: 119.99, cost_price: 68.00, quantity: 0, min_stock: 8, max_stock: 40, unit: 'pcs' },
    { owner_id: ownerId, name: '128GB High-Speed USB 3.2 Flash Drive', sku: 'STR-USB-128GB', category_id: getCatId('Storage & Memory'), supplier_id: getSupId('ElectroHub Components'), price: 19.99, cost_price: 7.50, quantity: 115, min_stock: 25, max_stock: 200, unit: 'pcs' },

    // Power & Charging
    { owner_id: ownerId, name: '100W 4-Port GaN Fast Charger', sku: 'PWR-GAN-100W', category_id: getCatId('Power & Charging'), supplier_id: getSupId('Apex Tech Wholesale Ltd.'), price: 59.99, cost_price: 24.00, quantity: 55, min_stock: 15, max_stock: 100, unit: 'pcs' },
    { owner_id: ownerId, name: '20,000mAh PD Power Bank', sku: 'PWR-PB-20K', category_id: getCatId('Power & Charging'), supplier_id: getSupId('Apex Tech Wholesale Ltd.'), price: 49.99, cost_price: 21.00, quantity: 40, min_stock: 12, max_stock: 90, unit: 'pcs' },
    { owner_id: ownerId, name: '1500VA Battery Backup UPS Unit', sku: 'PWR-UPS-1500', category_id: getCatId('Power & Charging'), supplier_id: getSupId('Global Micro-Distributors'), price: 189.99, cost_price: 110.00, quantity: 5, min_stock: 6, max_stock: 20, unit: 'pcs' },

    // Thermal & POS
    { owner_id: ownerId, name: 'Wireless POS Barcode Laser Scanner', sku: 'POS-SCAN-WLS', category_id: getCatId('Thermal & Point of Sale'), supplier_id: getSupId('Nexus Office Solutions'), price: 79.99, cost_price: 35.00, quantity: 16, min_stock: 5, max_stock: 40, unit: 'pcs' },
    { owner_id: ownerId, name: '80mm Thermal Receipt Printer USB/LAN', sku: 'POS-PRN-80MM', category_id: getCatId('Thermal & Point of Sale'), supplier_id: getSupId('Nexus Office Solutions'), price: 129.99, cost_price: 62.00, quantity: 11, min_stock: 5, max_stock: 30, unit: 'pcs' },
    { owner_id: ownerId, name: '80mm Thermal Paper Rolls (Box of 50)', sku: 'POS-PPR-8050', category_id: getCatId('Thermal & Point of Sale'), supplier_id: getSupId('Nexus Office Solutions'), price: 45.00, cost_price: 18.00, quantity: 62, min_stock: 15, max_stock: 100, unit: 'boxes' },
  ];
};

const seedDatabase = async () => {
  try {
    console.log('[Seed] Initializing Supabase Seeder...');

    // 1. Create or Find Demo Admin User
    const adminEmail = 'admin@stockflow.dev';
    let { data: adminUser } = await supabase.from('users').select('*').eq('email', adminEmail).maybeSingle();

    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      const { data: newUser, error: userErr } = await supabase
        .from('users')
        .insert({
          name: 'StockFlow Admin',
          email: adminEmail,
          password: hashedPassword,
          auth_methods: ['email'],
          is_email_verified: true,
          avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=StockFlow%20Admin',
        })
        .select('*')
        .single();

      if (userErr) throw userErr;
      adminUser = newUser;
      console.log(`[Seed] Created Demo Admin User: ${adminEmail} (password: admin123)`);
    } else {
      console.log(`[Seed] Using existing Demo Admin User: ${adminEmail}`);
    }

    const ownerId = adminUser.id;

    // 2. Clear existing demo records for this owner
    console.log('[Seed] Refreshing demo workspace data...');
    await supabase.from('stock_movements').delete().eq('owner_id', ownerId);
    await supabase.from('sale_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('sales').delete().eq('owner_id', ownerId);
    await supabase.from('products').delete().eq('owner_id', ownerId);
    await supabase.from('categories').delete().eq('owner_id', ownerId);
    await supabase.from('suppliers').delete().eq('owner_id', ownerId);
    await supabase.from('customers').delete().eq('owner_id', ownerId);

    // 3. Seed Categories
    console.log('[Seed] Inserting Categories...');
    const catPayload = categoriesData.map((c) => ({ ...c, owner_id: ownerId }));
    const { data: insertedCategories, error: catErr } = await supabase
      .from('categories')
      .insert(catPayload)
      .select('*');
    if (catErr) throw catErr;

    const categoriesMap = {};
    for (const c of insertedCategories) {
      categoriesMap[c.name] = c;
    }

    // 4. Seed Suppliers
    console.log('[Seed] Inserting Suppliers...');
    const supPayload = suppliersData.map((s) => ({ ...s, owner_id: ownerId }));
    const { data: insertedSuppliers, error: supErr } = await supabase
      .from('suppliers')
      .insert(supPayload)
      .select('*');
    if (supErr) throw supErr;

    const suppliersMap = {};
    for (const s of insertedSuppliers) {
      suppliersMap[s.company] = s;
    }

    // 5. Seed Customers
    console.log('[Seed] Inserting Customers...');
    const custPayload = customersData.map((cust) => ({ ...cust, owner_id: ownerId }));
    await supabase.from('customers').insert(custPayload);

    // 6. Seed Products
    console.log('[Seed] Inserting Products...');
    const rawProducts = generateProducts(ownerId, categoriesMap, suppliersMap);
    const { data: insertedProducts, error: prodErr } = await supabase
      .from('products')
      .insert(rawProducts)
      .select('*');
    if (prodErr) throw prodErr;

    // 7. Seed Initial Stock Movements
    console.log('[Seed] Recording Initial Stock Movements...');
    const initialMovements = insertedProducts
      .filter((p) => p.quantity > 0)
      .map((p) => ({
        owner_id: ownerId,
        product_id: p.id,
        type: 'IN',
        quantity: p.quantity,
        previous_stock: 0,
        new_stock: p.quantity,
        reason: 'Initial Product Stock Creation',
        reference: `INIT-${p.sku}`,
      }));

    if (initialMovements.length > 0) {
      await supabase.from('stock_movements').insert(initialMovements);
    }

    console.log(`=================================================`);
    console.log(`  STOCKFLOW SEEDING COMPLETE!`);
    console.log(`  - Categories Created: ${insertedCategories.length}`);
    console.log(`  - Suppliers Created: ${insertedSuppliers.length}`);
    console.log(`  - Products Created: ${insertedProducts.length}`);
    console.log(`  - Target DB: Supabase (PostgreSQL)`);
    console.log(`  - Demo Login: ${adminEmail} / admin123`);
    console.log(`=================================================`);

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed Supabase database:', error);
    process.exit(1);
  }
};

seedDatabase();
