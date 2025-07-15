export const formatNumberShort = number => {
  if (number >= 1_000_000_000) return (number / 1_000_000_000).toFixed(1) + 'B';
  if (number >= 1_000_000) return (number / 1_000_000).toFixed(1) + 'M';
  if (number >= 1_000) return (number / 1_000).toFixed(1) + 'K';
  return number.toString();
};
