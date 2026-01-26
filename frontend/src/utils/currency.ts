export const formatCurrency = (amount: string | number, currency: string) => {
  const value = Number(amount);

  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2,
  }).format(value);
};
