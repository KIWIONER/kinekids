export function calculateKinekidsPrice(wholesalePrice: number, shippingCost: number = 0.0, amazonPrice: number | null = null) {
  const price = Math.max(0.0, wholesalePrice);
  const baseCost = price + shippingCost;
  const idealRetail = baseCost / 0.80;

  let finalRetail = idealRetail;
  let isOutOfStock = false;

  if (amazonPrice && amazonPrice > 0) {
    if (idealRetail < amazonPrice) {
      finalRetail = idealRetail;
    } else {
      finalRetail = amazonPrice - 0.05;
      const newMargin = finalRetail > 0 ? (finalRetail - baseCost) / finalRetail : 0;
      if (newMargin < 0.10) {
        isOutOfStock = true;
        finalRetail = 0.0;
      }
    }
  }

  if (!isOutOfStock) {
    finalRetail = Math.round(finalRetail / 5.0) * 5.0 - 0.05;
    if (finalRetail <= 0) finalRetail = 0;
  }

  const margin = finalRetail > 0 ? ((finalRetail - baseCost) / finalRetail) * 100 : 0;
  const profit = finalRetail > 0 ? (finalRetail - baseCost) : 0;

  return { finalRetail, isOutOfStock, margin, profit, idealRetail };
}
