// Absolutely not my code
export default function getForegroundColor (color) {
  color = color.hex || color;
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  const luminance = [
    0.299 * r,
    0.587 * g,
    0.114 * b
  ].reduce((a, b) => a + b) / 255;

  return luminance < 0.5 ? '#FFFFFF' : '#363636';
}
