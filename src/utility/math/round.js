export default (number, accuracy = 0) => {
	const multiplier = Math.pow(10, accuracy);
	return Math.round(number * multiplier) / multiplier;
}
