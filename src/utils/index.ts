export const fromTokenAmount = (amount: number, decimals = 5): string => {
  return (amount / (10**decimals)).toFixed(decimals);
};