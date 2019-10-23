export default (from, to) => {
	const nextSibling = from.nextSibling;
	const previousSibling = from.previousSibling;
	const parent = from.parentNode;

	if (from.classList.value) {
		from.classList.forEach((name) => {
			to.classList.add(name);
		});
	}

	while (from.childNodes.length) {
		if (from.childNodes[0] !== to) {
			to.appendChild(from.childNodes[0]);
		}
		else {
			from.childNodes[0].parentNode.removeChild(to);
		}
	}

	if (nextSibling) {
		nextSibling.parentNode.insertBefore(to, nextSibling);
	}
	else if (previousSibling) {
		previousSibling.parentNode.insertBefore(to, previousSibling.nextSibling);
	}
	else if (parent) {
		parent.appendChild(to);
	}

	from.remove();
	from = null;
	to = null;
};
