export const CONTENT_CONTAINER = Symbol();

/**
 * @mixin MergeContentContainerMixin
 *
 * @param {Function} Base - The class to extend
 */
export default (Base) => {
	class MergeContentContainerMixin extends Base {
		get(id) {
			return this[CONTENT_CONTAINER].get(id);
		}

		content(content) {
			this[CONTENT_CONTAINER].content(content);
			return this;
		}

		append(content) {
			this[CONTENT_CONTAINER].append(content);
			return this;
		}

		prepend(content) {
			this[CONTENT_CONTAINER].prepend(content);
			return this;
		}

		each(callback, skipDeep) {
			return this[CONTENT_CONTAINER].each(callback, skipDeep);
		}

		map(callback) {
			return this[CONTENT_CONTAINER].map(callback);
		}

		total() {
			return this[CONTENT_CONTAINER].total();
		}

		removeContent(id) {
			this[CONTENT_CONTAINER].removeContent(id);
			return this;
		}

		isWorking(isWorking) {
			if (arguments.length !== 0) {
				this[CONTENT_CONTAINER].isWorking(isWorking);
				return this;
			}

			return this[CONTENT_CONTAINER].isWorking();
		}

		isWorkingLabel(label) {
			if (arguments.length !== 0) {
				this[CONTENT_CONTAINER].isWorkingLabel(label);
				return this;
			}

			return this[CONTENT_CONTAINER].isWorking();
		}
	}

	return MergeContentContainerMixin;
};
