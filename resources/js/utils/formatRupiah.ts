/**
 * Format a number as Indonesian Rupiah currency
 * @param amount - The number to format
 * @returns Formatted string like "Rp 15.000.000"
 */
export const formatRupiah = (amount: number | string | null | undefined): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0);
    if (isNaN(num)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Math.round(num));
};
