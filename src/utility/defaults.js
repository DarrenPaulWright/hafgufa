import { forOwn } from 'object-agent';

export default (settings, defaults) => {
	forOwn(defaults, (value, key) => {
		if (!(key in settings)) {
			settings[key] = value;
		}
	});
};
