const last = (array) => array[array.length - 1];

const Query = function() {
	const self = this;

	self.first = (selector) => window.testContainer.querySelector(selector);

	self.all = (selector) => window.testContainer.querySelectorAll(selector);

	self.last = (selector) => last(self.all(selector));

	self.count = (selector) => self.all(selector).length;

	self.nth = (selector, n) => self.all(selector)[n];

	self.nthChild = (selector, n) => self.first(selector).children[n];

	self.hasClass = (element, className) => {
		const BASE_PREFIX = '(\\s|^)';
		const BASE_SUFFIX = '(\\s|$)';

		if (element) {
			if (element.classList) {
				return element.classList.contains(className);
			}
			else {
				return new RegExp(BASE_PREFIX + className + BASE_SUFFIX).test(element.className);
			}
		}
	};
};

const query = new Query();

export default query;
