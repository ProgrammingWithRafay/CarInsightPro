/**
 * Format a number as Pakistani Rupees (PKR)
 * Examples:
 *   1800000  -> "PKR 18 Lacs"
 *   7500000  -> "PKR 75 Lacs"
 *   14500000 -> "PKR 1.45 Crore"
 *   120000000 -> "PKR 12 Crore"
 */
export const formatPKR = (price: number): string => {
  if (price >= 10000000) {
    // Crore range
    const crore = price / 10000000;
    const formatted = crore % 1 === 0 ? crore.toFixed(0) : crore.toFixed(2).replace(/\.?0+$/, '');
    return `PKR ${formatted} Crore`;
  } else if (price >= 100000) {
    // Lacs range
    const lacs = price / 100000;
    const formatted = lacs % 1 === 0 ? lacs.toFixed(0) : lacs.toFixed(2).replace(/\.?0+$/, '');
    return `PKR ${formatted} Lacs`;
  } else {
    return `PKR ${price.toLocaleString('en-PK')}`;
  }
};

/**
 * Format a number as a raw PKR string with commas (Pakistani numbering system)
 * Example: 7500000 -> "PKR 75,00,000"
 */
export const formatPKRRaw = (price: number): string => {
  // Pakistani numbering: last 3 digits, then groups of 2
  const str = price.toString();
  if (str.length <= 3) return `PKR ${str}`;
  
  const lastThree = str.slice(-3);
  const remaining = str.slice(0, -3);
  const formatted = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  return `PKR ${formatted}`;
};

/**
 * Format a price range for cars with multiple variants.
 * If priceMax is provided and different from price, shows a range.
 * Examples:
 *   (6202000, 7709000) -> "PKR 62.02 Lacs - 77.09 Lacs"
 *   (6202000, undefined) -> "PKR 62.02 Lacs"
 *   (12400000, 20500000) -> "PKR 1.24 Crore - 2.05 Crore"
 */
export const formatPriceRange = (price: number, priceMax?: number): string => {
  if (!priceMax || priceMax <= price) {
    return formatPKR(price);
  }
  return `${formatPKR(price)} - ${formatPKR(priceMax)}`;
};
