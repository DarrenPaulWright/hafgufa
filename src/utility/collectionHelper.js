import { compare } from 'hord';
import { clone, erase, forOwn } from 'object-agent';
import { enforceString, isArray } from 'type-enforcer-ui';

const find = (array, item, start, end, increment) => {
	while (start !== end) {
		if (forOwn(array[start], (value, key) => item[key] === value)) {
			return start;
		}
		start += increment;
	}

	return -1;
};

const findIndex = (array, item) => {
	return find(array, item, 0, array.length + 1, 1);
};

const findLastIndex = (array, item) => {
	return find(array, item, array.length, -1, -1);
};

/**
 * Object helper functions.
 * @module collectionHelper
 */
const collectionHelper = {
	/**
	 * Like array.slice, but finds the first and last items via filters
	 * @method slice
	 * @member module:collectionHelper
	 * @static
	 * @arg {Object[]} collection
	 * @arg {Object} startFilter
	 * @arg {Object} [endFilter=collection.length]
	 */
	slice(collection, startFilter, endFilter) {
		let startIndex = Math.max(findIndex(collection, startFilter), 0);
		let endIndex = endFilter ? findLastIndex(collection, endFilter) : collection.length;

		if (endIndex < startIndex) {
			endIndex = [startIndex, startIndex = endIndex][0];
		}

		return collection.slice(startIndex, endIndex + 1);
	},
	/**
	 * Returns a flattened collection
	 * @method flatten
	 * @member module:collectionHelper
	 * @static
	 * @arg {Object[]} collection
	 * @arg {Object}   settings
	 * @arg {String}   [settings.childProperty=children]
	 * @arg {String}   [settings.idProperty] - if set, then saves the parent's id to each child
	 * @arg {Boolean}  [settings.saveDepth=false] - if true appends a property "depth" to each returned object with
	 *     the nested depth of the original object
	 * @arg {String}   [settings.ignoreChildrenProperty] - If this key is present and truthy on a parent then don't
	 *     include any children
	 * @arg {String}   [settings.ignoreChildrenPropertyFalse] - If this key is falsey on a parent then don't include
	 *     any children
	 * @arg {Function} [settings.onEachParent]
	 * @arg {Function} [settings.onEachChild]
	 */
	flatten(collection, settings = {}) {
		let childProperty = enforceString(settings.childProperty, 'children');
		let childItem;

		const innerFlatten = (innerCollection, depth, parent) => {
			let flatCollection = [];

			if (isArray(innerCollection)) {
				for (let index = 0; index < innerCollection.length; index++) {
					flatCollection = flatCollection.concat(
						innerFlatten(innerCollection[index], depth, parent)
					);
				}
			}
			else {
				childItem = clone(innerCollection);
				if (settings.saveDepth) {
					childItem.depth = depth;
				}
				if (settings.idProperty && parent) {
					childItem.parent = parent[settings.idProperty];
				}

				if (innerCollection[childProperty]) {
					if (settings.onEachParent) {
						settings.onEachParent(childItem, parent);
					}
					erase(childItem, childProperty);
					flatCollection.push(childItem);

					if ((!settings.ignoreChildrenProperty || !childItem[settings.ignoreChildrenProperty]) &&
						(!settings.ignoreChildrenPropertyFalse || childItem[settings.ignoreChildrenPropertyFalse])) {
						flatCollection = flatCollection.concat(
							innerFlatten(innerCollection[childProperty], depth + 1, innerCollection)
						);
					}
				}
				else {
					if (settings.onEachChild) {
						settings.onEachChild(childItem, parent);
					}
					flatCollection.push(childItem);
				}
			}

			return flatCollection;
		};

		return collection ? innerFlatten(collection, 0) : collection;
	},
	/**
	 * Returns a nested collection
	 *
	 * @method nest
	 * @member module:collectionHelper
	 * @static
	 *
	 * @arg {Object[]} collection
	 * @arg {Object}   settings
	 * @arg {String}   [settings.idProperty=id]
	 * @arg {String}   [settings.parentProperty=parent]
	 * @arg {String}   [settings.childProperty=children]
	 * @arg {String}   [settings.deleteParentProperty=false]
	 */
	nest(collection, settings = {}) {
		const idKey = settings.idProperty || 'id';
		const parentKey = settings.parentProperty || 'parent';
		const childKey = settings.childProperty || 'children';

		const innerNest = (parentId) => {
			let output = collection.filter((item) => {
				return item[parentKey] === parentId || item[parentKey] === '';
			});
			collection = collection.filter((item) => !output.includes(item));

			output.forEach((item) => {
				const children = innerNest(item[idKey]);

				if (children.length) {
					item[childKey] = children;
				}

				if (settings.deleteParentProperty) {
					erase(item, parentKey);
				}
			});

			return output;
		};

		return collection ? innerNest() : collection;
	},
	/**
	 * trigger a callback for each child object that doesn't have children
	 * @method eachChild
	 * @member module:collectionHelper
	 * @static
	 * @arg {Object[]} collection
	 * @arg {Function} onEachChild
	 * @arg {Object}   [settings]
	 * @arg {String}   [settings.childProperty=children]
	 * @arg {Function} [settings.onEachParent]
	 */
	eachChild(collection, onEachChild, settings = {}) {
		let isCancelled = false;
		const childProperty = enforceString(settings.childProperty, 'children');
		let returnValue;

		const each = (innerCollection, depth, parent) => {
			if (isArray(innerCollection)) {
				for (let index = 0, length = innerCollection.length; index < length; index++) {
					isCancelled = each(innerCollection[index], depth, parent);
					if (isCancelled === false) {
						break;
					}
				}
				return isCancelled;
			}
			else {
				if (innerCollection && innerCollection[childProperty]) {
					returnValue = each(innerCollection[childProperty], depth + 1, innerCollection);
					if (settings.onEachParent) {
						settings.onEachParent(innerCollection, depth);
					}
					return returnValue;
				}
				else {
					return onEachChild(innerCollection, depth, parent);
				}
			}
		};

		each(collection, 0);
	},
	count(collection, countKey) {
		const output = [];
		let index;

		collection.forEach((item) => {
			index = findIndex(output, item);

			if (index === -1) {
				item[countKey] = 1;
				output.push(item);
			}
			else {
				output[index][countKey]++;
			}
		});

		index = null;
		collection = null;
		countKey = null;

		return output;
	},
	zipById(values, idKey, zipFunction) {
		let valuesIndex;
		let itemIndex;
		let innerValueIndex;
		let findObject = {};
		let output = [];
		let matches;
		let matchIndex;
		let matchInnerIndex;
		let matchesMax;
		let zipObjects;
		let zippedIds = [];

		for (valuesIndex = 0; valuesIndex < values.length; valuesIndex++) {
			values[valuesIndex].sort(compare(idKey));
		}

		for (valuesIndex = 0; valuesIndex < values.length; valuesIndex++) {
			for (itemIndex = 0; itemIndex < values[valuesIndex].length; itemIndex++) {
				findObject[idKey] = values[valuesIndex][itemIndex][idKey];

				if (findObject[idKey] && !zippedIds.includes(findObject[idKey])) {
					matches = [];
					matchesMax = 0;

					for (innerValueIndex = 0; innerValueIndex < values.length; innerValueIndex++) {
						matches.push(collectionHelper.slice(values[innerValueIndex], findObject, findObject));
						matchesMax = Math.max(matchesMax, matches[matches.length - 1].length - 1);
					}

					for (; matchesMax >= 0; matchesMax--) {
						zipObjects = [];

						for (matchIndex = 0; matchIndex < matches.length; matchIndex++) {
							matchInnerIndex = Math.min(matchesMax, matches[matchIndex].length - 1);
							zipObjects.push(matches[matchIndex][matchInnerIndex]);
						}

						output.push(zipFunction.apply(null, zipObjects));
					}

					zippedIds.push(findObject[idKey]);
				}
			}
		}

		findObject = null;
		zipObjects = null;

		return output;
	}
};

export default collectionHelper;
