export default (number, min, max) => number < min ? min : (number > max ? max : number);
