import { select } from 'd3';
import { clone } from 'object-agent';
import { castArray } from 'type-enforcer';

export default (from, to) => {
	const nextSibling = from.nextSibling;
	const previousSibling = from.previousSibling;
	const parent = from.parentNode;

	castArray(from.attributes).forEach((attr) => {
		if (attr && attr.name) {
			to.setAttribute(attr.name, attr.value);
		}
	});

	if (from.classList.value) {
		from.classList.forEach((name) => {
			to.classList.add(name);
		});
	}

	if (from.__on) {
		clone(castArray(from.__on)).forEach((event) => {
			if (event) {
				let name = event.type;
				if (event.name) {
					name += '.' + event.name;
				}
				select(to).on(name, event.value);
			}
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
