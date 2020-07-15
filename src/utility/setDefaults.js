import { forOwn } from 'object-agent';
import assign from './assign.js';

export default (defaults, settings, overrides) => {
	forOwn(defaults, (value, key) => {
		if (!(key in settings)) {
			settings[key] = value;
		}
	});

	if (overrides !== undefined) {
		assign(settings, overrides);
	}

	return settings;
};
