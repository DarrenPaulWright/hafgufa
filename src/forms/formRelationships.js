import { debounce } from 'async-agent';
import { deepEqual, erase, get } from 'object-agent';
import { isArray, isString } from 'type-enforcer';

/**
 * Handle relationships between form controls. This is used by {@link module:FormControlBase}. formRelationships is
 * a singleton so that all callbacks added are processed together.
 *
 * @module formRelationships
 */
const FormRelationshipHandler = function() {
	const self = this;
	let relationships = [];
	let currentId = 0;

	/**
	 * Add a relationship
	 *
	 * @method add
	 * @member module:formRelationships
	 * @instance
	 * @param {object} [newData]
	 * @param {object} newData.control - A valid js reference back to the control adding this relationship
	 * @param {string} newData.controlId - unique id of the control adding this relationship
	 * @param {object[]} newData.relationships
	 * @param {string} newData.relationships.targetId
	 * @param {string[]} newData.relationships.targetIds
	 * @param {number|string} newData.relationships.type - 'int' | 'text'
	 * @param {string} newData.relationships.condition - 'equals|anyEquals|greaterThan'
	 * @param {Array.<object[]>} newData.relationships.ranges - Only use this if caseThen.value or
	 * caseElse.value is sumRange. Each inner array corresponds to one of the target controls in the same order
	 * provided in targetIds
	 * @param {number} newData.relationships.ranges.bottom
	 * @param {number} newData.relationships.ranges.top
	 * @param {number} newData.relationships.ranges.score
	 * @param {object} newData.relationships.caseThen
	 * @param {boolean} newData.relationships.caseThen.isEnabled
	 * @param {string} newData.relationships.caseThen.value - 'value|sum|sumRange|null' | literal
	 * @param {object} newData.relationships.caseElse
	 * @param {boolean} newData.relationships.caseElse.isEnabled
	 * @param {string} newData.relationships.caseElse.value - 'value|sum|sumRange|null' | literal
	 * @returns {number} - A unique id that should be used to reference this relationship in the future
	 */
	self.add = (newData) => {
		newData.relationships = newData.relationships || [];

		relationships.push({
			id: ++currentId,
			data: newData
		});

		return currentId;
	};

	/**
	 * Remove a relationship
	 *
	 * @method remove
	 * @member module:formRelationships
	 * @instance
	 * @param {number} id - The formRelationshipId passed back when the relationship is first added.
	 */
	self.remove = (id) => {
		relationships = relationships.filter((item) => item.id !== id);
	};

	/**
	 * Force formRelationships to process all relationships or the relationships on one control
	 *
	 * @method trigger
	 * @member module:formRelationships
	 * @instance
	 * @param {number} [id] - The formRelationshipId passed back when the relationship is first added.
	 */
	self.trigger = (id) => {
		if (id) {
			processRelationships(relationships.find((item) => item.id === id).data);
		}
		else {
			processAllRelationships();
		}
	};

	/**
	 * Update the value of a property of a relationship
	 *
	 * @method update
	 * @member module:formRelationships
	 * @instance
	 * @param {number} id - The formRelationshipId passed back when the relationship is first added.
	 * @param {object} updateObject
	 * @param {string} updateObject.name - The name of the relationship to be updated
	 * @param {string} updateObject.property - The property to be updated
	 * @param {string} updateObject.value - The new value of the property to be updated
	 */
	self.update = (id, updateObject) => {
		const relationship = relationships.find((item) => item.id === id);

		if (updateObject.value) {
			relationship.data.relationships[updateObject.name][updateObject.property] = updateObject.value;
		}
	};

	/**
	 * Process all relationships on all controls. This function is debounced to prevent being executed by multiple
	 * controls at the same time.
	 *
	 * @function processAllRelationships
	 */
	const processAllRelationships = debounce(() => {
		relationships.forEach((data) => {
			processRelationships(data.data);
		});
	}, 1);

	/**
	 * Process the relationships for one control
	 *
	 * @function processRelationships
	 * @param {object} data - The original data object passed into formRelationships.add
	 */
	const processRelationships = (data) => {
		data.relationships.forEach((relationship) => {
			if (relationship.targetId) {
				if (!relationship.target) {
					relationship.target = getControlById(relationship.targetId);
				}

				if (relationship.type === 'int') {
					relationship.targetValues = [getIntValue(relationship.target)];
				}
				else if (relationship.type === 'text') {
					relationship.targetValues = [getValue(relationship.target)];
				}
			}
			else if (relationship.targetIds) {
				if (!relationship.targets) {
					relationship.targets = [];
					for (let idCount = 0, idTotal = relationship.targetIds.length; idCount < idTotal; idCount++) {
						relationship.targets.push(getControlById(relationship.targetIds[idCount]));
					}
				}

				relationship.targetValues = [];

				for (let targetCount = 0, targetTotal = relationship.targets.length; targetCount < targetTotal; targetCount++) {
					if (relationship.type === 'int') {
						relationship.targetValues.push(getIntValue(relationship.targets[targetCount]));
					}
					else if (relationship.type === 'text') {
						relationship.targetValues.push(getValue(relationship.targets[targetCount]));
					}
				}
			}

			switch (relationship.condition) {
				case 'equals':
					if (allEquals(relationship)) {
						processThen(relationship.caseThen, data.control, relationship, data);
					}
					else if (relationship.caseElse) {
						processThen(relationship.caseElse, data.control, relationship, data);
					}

					break;

				case 'anyEquals':
					if (anyEquals(relationship)) {
						processThen(relationship.caseThen, data.control, relationship, data);
					}
					else if (relationship.caseElse) {
						processThen(relationship.caseElse, data.control, relationship, data);
					}

					break;

				case 'greaterThan':
					if (allGreaterThan(relationship)) {
						processThen(relationship.caseThen, data.control, relationship, data);
					}
					else if (relationship.caseElse) {
						processThen(relationship.caseElse, data.control, relationship, data);
					}

					break;

				case 'exists':
					if (exists(relationship)) {
						processThen(relationship.caseThen, data.control, relationship, data);
					}
					else if (relationship.caseElse) {
						processThen(relationship.caseElse, data.control, relationship, data);
					}
					break;

				case 'simpleEquals':
					if (simpleEquals(relationship)) {
						processThen(relationship.caseThen, data.control, relationship, data);
					}
					else if (relationship.caseElse) {
						processThen(relationship.caseElse, data.control, relationship, data);
					}
					break;

				case 'simpleInArray':
					if (simpleInArray(relationship)) {
						processThen(relationship.caseThen, data.control, relationship, data);
					}
					else if (relationship.caseElse) {
						processThen(relationship.caseElse, data.control, relationship, data);
					}
					break;

				case 'inRange':
					if (inRange(relationship)) {
						processThen(relationship.caseThen, data.control, relationship, data);
					}
					else if (relationship.caseElse) {
						processThen(relationship.caseElse, data.control, relationship, data);
					}
					break;
			}
		});
	};

	/**
	 * Get the value of a control.
	 *
	 * @function getValue
	 * @param {object} target - A reference to a control
	 * @returns {string} - If the control returns an array of values then only get the first value
	 */
	const getValue = (target) => {
		let targetValue = target.value();

		if (isArray(targetValue)) {
			targetValue = targetValue[0];
		}

		return targetValue;
	};

	/**
	 * Get the value of a control if the expected data type is int.
	 *
	 * @function getIntValue
	 * @param {object} target - A reference to a control
	 * @returns {number} - If the control returns an array of values then only get the first value. If the control
	 * returns an object with an id property, use the id property. If the value is a string with at least one '.',
	 * then return everything after the last '.'. (eg. 'myControl.10.3' will return 3)
	 */
	const getIntValue = (target) => {
		let targetValue = target.value();

		if (isArray(targetValue)) {
			targetValue = targetValue[0];
		}

		if (targetValue && targetValue.id) {
			targetValue = targetValue.id;
		}

		if (targetValue && !parseInt(targetValue, 10) && isString(targetValue)) {
			targetValue = targetValue.split('.');
			targetValue = parseInt(targetValue[targetValue.length - 1], 10);
		}

		return targetValue;
	};

	/**
	 * Determines if the target control has a value.
	 *
	 * @param relationship
	 * @function exists
	 * @returns {boolean}
	 */
	const exists = (relationship) => relationship.targetValues.length > 0 && relationship.targetValues[0] !== undefined;

	/**
	 * Determines if the target controls value is equal to the value provided in relationship.options.
	 *
	 * @param relationship
	 * @function simpleEquals
	 * @returns {boolean}
	 */
	const simpleEquals = (relationship) => {
		const target = get(relationship.targetValues.find((item) => item.id), 'id');

		return (target === undefined || target === relationship.options);
	};

	/**
	 * Determines if the target controls value is equal to a value in the array provided in relationship.options.
	 *
	 * @param relationship
	 * @function simpleInArray
	 * @returns {boolean}
	 */
	const simpleInArray = (relationship) => {
		let inArray = false;

		const target = get(relationship.targetValues.find((item) => item.id), 'id');
		if (relationship.options) {
			relationship.options.forEach((option) => {
				if (target !== undefined && target === option) {
					inArray = true;
				}
			});
		}

		return inArray;
	};

	/**
	 * Determines if the values of all the target controls are greater than the value provided in relationship.options.
	 *
	 * @param relationship
	 * @function allGreaterThan
	 * @returns {boolean}
	 */
	const allGreaterThan = (relationship) => {
		let areAllGreaterThan = true;

		relationship.targetValues.forEach((targetValue, targetCount) => {
			if (relationship.options.length < relationship.targetValues.length) {
				targetCount = 0;
			}

			if (targetValue === undefined || targetValue === null || targetValue <= relationship.options[targetCount]) {
				areAllGreaterThan = false;
				return false;
			}
		});

		return areAllGreaterThan;
	};

	/**
	 * Determines if the values of all the target controls are equal to the value provided in relationship.options.
	 *
	 * @param relationship
	 * @function allEquals
	 * @returns {boolean}
	 */
	const allEquals = (relationship) => {
		let allEquals = true;

		relationship.targetValues.forEach((targetValue, targetCount) => {
			if (relationship.options !== undefined) {
				if (relationship.options.length < relationship.targetValues.length) {
					targetCount = 0;
				}

				if (targetValue !== undefined) {
					if (targetValue.displayOrder !== undefined) {
						erase(targetValue, 'displayOrder');
					}
				}

				if (!targetValue) {
					allEquals = false;
					return false;
				}
				else if (relationship.options[targetCount].id) {
					if (targetValue.id !== relationship.options[targetCount].id) {
						allEquals = false;
						return false;
					}
				}
				else if (!deepEqual(targetValue, relationship.options[targetCount])) {
					allEquals = false;
					return false;
				}
			}
		});

		return allEquals;
	};

	/**
	 * Determines if the values of any of the target controls are equal to the value provided in relationship.options.
	 *
	 * @param relationship
	 * @function anyEquals
	 * @returns {boolean}
	 */
	const anyEquals = (relationship) => {
		let anyEquals = false;

		relationship.targetValues.forEach((targetValue, targetCount) => {
			if (relationship.options.length < relationship.targetValues.length) {
				targetCount = 0;
			}

			if (targetValue === relationship.options[targetCount]) {
				anyEquals = true;
				return false;
			}
		});

		return anyEquals;
	};

	const inRange = (relationship) => {
		let inRange = false;

		relationship.targetValues.forEach((targetValue, targetCount) => {
			relationship.ranges.forEach((controlRange) => {
				controlRange.forEach((range) => {
					if (targetValue[targetCount] !== undefined && targetValue[targetCount] !== null && targetValue[targetCount] >= range.bottom && targetValue[targetCount] <= range.top) {
						inRange = true;
					}
				});
			});
		});

		return inRange;
	};

	/**
	 * Process 'caseThen' or 'caseElse' depending on the outcome of the condition
	 *
	 * @function processThen
	 * @param {string} caseThen
	 * @param {object} control
	 * @param {object} relationship
	 * @param {object} data
	 */
	const processThen = (caseThen, control, relationship, data) => {
		let isNested = true;

		if ('isVisible' in caseThen) {
			isNested = false;
			control.isVisible(caseThen.isVisible === 'true' || caseThen.isVisible === true);
		}
		if ('isEnabled' in caseThen) {
			isNested = false;
			control.isEnabled(caseThen.isEnabled === 'true' || caseThen.isEnabled === true);
		}
		if ('value' in caseThen) {
			isNested = false;
			if (caseThen.value === 'value') {
				control.value(relationship.targetValues[0]);
			}
			else if (caseThen.value === 'sum') {
				control.value(relationship.targetValues.reduce((result, value) => result + value, 0));
			}
			else if (caseThen.value === 'sumRange') {
				control.value(sumRange(relationship.ranges, relationship.targetValues));
			}
			else if (caseThen.value === 'rangeValue') {
				control.value(getRangeValue(relationship.ranges, relationship.targetValues));
			}
			else if (caseThen.value === 'clearSelection') {
				control.unselectAll();
			}
			else if (caseThen.value === 'null' || caseThen.value === null) {
				control.value(null);
			}
			else {
				control.value(caseThen.value);
			}
		}

		if (isNested) {
			processRelationships({
				control: data.control,
				controlId: data.controlId,
				relationships: caseThen
			});
		}
	};

	/**
	 * Calulate the value based on the sumRange object
	 *
	 * @function sumRange
	 * @param {Array} relationshipRanges
	 * @param {string} values
	 */
	const sumRange = (relationshipRanges, values) => {
		let sum = 0;
		let rangeMatched = false;

		relationshipRanges.forEach((controlRange, controlCount) => {
			rangeMatched = false;

			controlRange.forEach((range) => {
				if ((values[controlCount] || values[controlCount] === 0 || values[controlCount] === '0') &&
					values[controlCount] >= range.bottom && values[controlCount] <= range.top) {
					sum += range.score;
					rangeMatched = true;
					return false;
				}
			});

			if (!rangeMatched) {
				sum = null;
				return false;
			}
		});

		return sum;
	};

	const getRangeValue = (relationshipRanges, values) => {
		let rangeValue = 0;

		relationshipRanges.forEach((controlRange, controlCount) => {
			controlRange.forEach((range) => {
				if (values[controlCount] >= range.bottom && values[controlCount] <= range.top) {
					rangeValue = range.score;
				}
			});
		});

		return rangeValue;
	};

	/**
	 * Gets a reference to a control given that controls id
	 *
	 * @function getControlById
	 * @param {string} controlId
	 * @returns {object|boolean} - If no control is found that matches the provided id then return false.
	 */
	const getControlById = (controlId) => {
		if (controlId) {
			for (let relationshipCount = 0, relationshipTotal = relationships.length; relationshipCount < relationshipTotal; relationshipCount++) {
				if (relationships[relationshipCount].data.controlId === controlId) {
					return relationships[relationshipCount].data.control;
				}
			}
		}

		return false;
	};
};

const formRelationshipHandler = new FormRelationshipHandler();

export default formRelationshipHandler;
