// Convert an accent hex (e.g. an icon colour) into an rgba string,
// used for colour-matched hover glows on cards.
const hexToRgba = (hex, alpha) => {
  const h = (hex || '#000000').replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const num = parseInt(full, 16);
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
};

export default hexToRgba;
