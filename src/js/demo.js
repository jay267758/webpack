function nums(...arr) {
  return arr.reduce((num, m) => num + m, 0);
}

export default nums