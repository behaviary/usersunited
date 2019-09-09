const a = [1, 2, 3, 4, 5];
// Implement this
a.__proto__.multiply = function() {
  const a = [...this];
  this.push(...a.map(b => b * b));
};
a.multiply();
console.log(a); // [1, 2, 3, 4, 5, 1, 4, 9, 16, 25]

console.log(0.2 + 0.1 === 0.3);
console.log(1 + 2 === 3);
console.log(0.1 + 0.2);
