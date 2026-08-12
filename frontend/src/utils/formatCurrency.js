// utils/formatCurrency.js
// Utility to replace dollar symbols with Indian rupee symbols and format numbers
export function formatCurrencyString(str) {
  if (typeof str !== 'string') return str;
  // Replace literal $ signs with ₹
  let result = str.replace(/\$/g, '₹');
  // Optionally format numbers that follow the rupee sign to Indian locale
  // This regex finds ₹ followed by optional whitespace and a number (including decimals)
  result = result.replace(/₹\s?([0-9,.]+)/g, (_, num) => {
    const raw = parseFloat(num.replace(/,/g, ''));
    if (isNaN(raw)) return `₹${num}`;
    const formatted = raw.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `₹${formatted}`;
  });
  return result;
}
