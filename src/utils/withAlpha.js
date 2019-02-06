const normalizeColor = require('react-native/Libraries/Color/normalizeColor');

module.exports = (color, opacity) => {
  let number = normalizeColor(color);
  if (typeof number === 'number') {
    number &= 0xffffff00;
    number |= Math.round(opacity * 255);
    number >>>= 0;
    return `#${number.toString(16).padStart(8, '0')}`;
  }
}
