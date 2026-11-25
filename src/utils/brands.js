export function clickRate(brand) {
  return brand.views ? brand.clicks / brand.views : 0;
}
