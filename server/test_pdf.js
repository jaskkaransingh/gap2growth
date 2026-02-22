const pdf = require('pdf-parse');
console.log('Type of pdf:', typeof pdf);
console.log('Is pdf a function?', typeof pdf === 'function');
console.log('pdf exports:', pdf);

if (typeof pdf !== 'function') {
    console.log('Attempting default export:', typeof pdf.default);
}
