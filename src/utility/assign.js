// TODO: remove this when it gets added to object-agent
export default (settings, ...args) => {
	return Object.assign(settings === undefined ? {} : settings, ...args);
};
