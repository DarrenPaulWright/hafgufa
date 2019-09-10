import { CONTENT_CONTAINER } from './ControlHeadingMixin';

const methodPass = (options = {}) => {
	return function(...args) {
		if (args.length) {
			if (this[options.class]) {
				this[options.class][options.method](...args);
			}

			return this;
		}

		return this[options.class][options.method]();
	};
};

export default (Base) => {
	class MergeContentContainerMixin extends Base {
		get(id) {
			return this[CONTENT_CONTAINER].get(id);
		}
	}

	Object.assign(MergeContentContainerMixin.prototype, {
		each: methodPass({
			class: CONTENT_CONTAINER,
			method: 'each'
		}),

		content: methodPass({
			class: CONTENT_CONTAINER,
			method: 'content'
		}),

		append: methodPass({
			class: CONTENT_CONTAINER,
			method: 'append'
		}),

		prepend: methodPass({
			class: CONTENT_CONTAINER,
			method: 'prepend'
		}),

		removeContent: methodPass({
			class: CONTENT_CONTAINER,
			method: 'removeContent'
		}),

		isWorking: methodPass({
			class: CONTENT_CONTAINER,
			method: 'isWorking'
		})
	});

	return MergeContentContainerMixin;
};
