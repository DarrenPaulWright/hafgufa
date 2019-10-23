import { castArray } from 'type-enforcer';

export default (element) => {
	return castArray(element.attributes).reduce((result, attr) => {
		result[attr.name] = attr.value;
		return result;
	}, {});
};
