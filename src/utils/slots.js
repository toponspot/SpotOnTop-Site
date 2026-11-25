export function findSlot(slots, id) {
  return slots?.find((slot) => slot.id === id);
}

export function openPlaces(slot) {
  return Math.max(0, slot.places - slot.taken);
}

export function isBooked(slot) {
  return openPlaces(slot) <= 0;
}
