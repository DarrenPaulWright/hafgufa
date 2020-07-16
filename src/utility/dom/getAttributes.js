import { castArray } from 'type-enforcer-ui';

export default (element) => {
	return castArray(element.attributes).reduce((result, attribute) => {
		result[attribute.name] = attribute.value;
		return result;
	}, {});
};
