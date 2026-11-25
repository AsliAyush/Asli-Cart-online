/**
 * Safely format monetary amount with ISO currency code using Intl.NumberFormat.
 * Supports any ISO 4217 currency code (INR, USD, EUR, GBP, AED, SGD, etc.)
 * Preserves UNKNOWN currency explicitly without defaulting or hardcoding $ or ₹.
 */
export function formatAffiliateCurrency(
  amount: number | string | null | undefined,
  currency?: string | null,
  options: { showUnknownLabel?: boolean; maximumFractionDigits?: number } = {}
): string {
  const { showUnknownLabel = true, maximumFractionDigits = 2 } = options;

  if (amount === null || amount === undefined || amount === '') {
    return '—';
  }

  const num = Number(amount);
  if (isNaN(num)) {
    return '—';
  }

  const cleanCurrency = (currency || 'UNKNOWN').trim().toUpperCase();

  // Handle explicitly unknown or non-ISO currency code
  if (cleanCurrency === 'UNKNOWN' || cleanCurrency === '' || !/^[A-Z]{3}$/.test(cleanCurrency)) {
    const formatted = num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits,
    });
    return showUnknownLabel ? `${formatted} (Currency Unknown)` : formatted;
  }

  try {
    // Select appropriate locale based on currency for native symbols
    const locale = cleanCurrency === 'INR' ? 'en-IN' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: cleanCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits,
    }).format(num);
  } catch {
    // Fallback if Intl does not support the specific 3-letter currency code
    return `${cleanCurrency} ${num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits,
    })}`;
  }
}

/**
 * Get currency symbol or 3-letter ISO code for chart axes and tooltips.
 */
export function getAffiliateCurrencySymbol(currency?: string | null): string {
  if (!currency || currency === 'UNKNOWN') return '';
  const clean = currency.trim().toUpperCase();

  try {
    const parts = new Intl.NumberFormat(clean === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: clean,
    }).formatToParts(0);
    const symbolPart = parts.find((p) => p.type === 'currency');
    return symbolPart ? symbolPart.value : `${clean} `;
  } catch {
    return `${clean} `;
  }
}
