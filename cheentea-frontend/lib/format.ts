/**
 * Format a price value to display with PHP peso symbol and 2 decimal places.
 * Handles prices that might come as strings from the API.
 */
export function formatPrice(price: number | string | undefined | null): string {
    const numPrice = Number(price) || 0;
    return `₱${numPrice.toFixed(2)}`;
}

/**
 * Convert a price value to a number.
 * Handles prices that might come as strings from the API.
 */
export function toNumber(value: number | string | undefined | null): number {
    return Number(value) || 0;
}
