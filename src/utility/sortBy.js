export const filteredTitle = (collection, filterText) => {
	let first;
	let second;

	collection.sort((a, b) => {
		first = a.title ? a.title.toLowerCase().indexOf(filterText) === 0 : false;
		second = b.title ? b.title.toLowerCase().indexOf(filterText) === 0 : false;

		if (first && !second) {
			return -1;
		}
		else if (!first && second) {
			return 1;
		}

		return (a.title || '').localeCompare(b.title || '');
	});
};
