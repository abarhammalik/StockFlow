/**
 * Converts snake_case keys in an object to camelCase and ensures both `id` and `_id` exist.
 */
function formatRecord(record) {
  if (!record || typeof record !== 'object') return record;
  if (Array.isArray(record)) return record.map(formatRecord);

  const formatted = {};
  for (const [key, value] of Object.entries(record)) {
    // Transform nested objects or arrays
    let val = value;
    if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
      val = formatRecord(val);
    } else if (Array.isArray(val)) {
      val = val.map(formatRecord);
    }

    // Convert snake_case to camelCase
    const camelKey = key.replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase());
    formatted[camelKey] = val;

    // Preserve original key as well if needed
    formatted[key] = val;
  }

  // Ensure both _id and id are present
  if (formatted.id && !formatted._id) {
    formatted._id = formatted.id;
  } else if (formatted._id && !formatted.id) {
    formatted.id = formatted._id;
  }

  return formatted;
}

/**
 * Normalizes a product record with virtual calculations (inventoryValue, stockStatus)
 * and joins category/supplier references.
 */
function formatProduct(product) {
  if (!product) return null;
  const p = formatRecord(product);

  const price = Number(p.price) || 0;
  const costPrice = Number(p.costPrice) || 0;
  const quantity = Number(p.quantity) || 0;
  const minStock = Number(p.minStock) || 5;
  const maxStock = Number(p.maxStock) || 100;

  p.price = price;
  p.costPrice = costPrice;
  p.quantity = quantity;
  p.minStock = minStock;
  p.maxStock = maxStock;

  // Calculated virtual properties
  p.inventoryValue = quantity * price;

  if (quantity === 0) {
    p.stockStatus = 'out_of_stock';
  } else if (quantity <= minStock) {
    p.stockStatus = 'low_stock';
  } else if (maxStock > 0 && quantity >= maxStock) {
    p.stockStatus = 'overstocked';
  } else {
    p.stockStatus = 'healthy';
  }

  // Handle joined category/supplier objects from Supabase
  if (p.categories) {
    p.categoryId = formatRecord(p.categories);
  }
  if (p.suppliers) {
    p.supplierId = formatRecord(p.suppliers);
  }

  return p;
}

/**
 * Normalizes a sale record with formatted nested sale_items and customer details.
 */
function formatSale(sale) {
  if (!sale) return null;
  const s = formatRecord(sale);

  s.subtotal = Number(s.subtotal) || 0;
  s.discountRate = Number(s.discountRate) || 0;
  s.discountAmount = Number(s.discountAmount) || 0;
  s.taxRate = Number(s.taxRate) || 0;
  s.taxAmount = Number(s.taxAmount) || 0;
  s.grandTotal = Number(s.grandTotal) || 0;

  if (Array.isArray(s.saleItems) || Array.isArray(s.sale_items)) {
    const items = s.saleItems || s.sale_items;
    s.items = items.map((item) => {
      const formattedItem = formatRecord(item);
      formattedItem.price = Number(formattedItem.price) || 0;
      formattedItem.costPrice = Number(formattedItem.costPrice) || 0;
      formattedItem.quantity = Number(formattedItem.quantity) || 0;
      formattedItem.subtotal = Number(formattedItem.subtotal) || 0;
      return formattedItem;
    });
  } else if (!s.items) {
    s.items = [];
  }

  return s;
}

module.exports = {
  formatRecord,
  formatProduct,
  formatSale,
};
