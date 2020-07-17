import { delay } from 'async-agent';
import { windowResize } from 'type-enforcer-ui';
import IsWorking from '../display/IsWorking.js';
import { IS_DESKTOP, IS_TABLET } from '../utility/browser.js';
import { BODY, FONT_SIZE, HEAD } from '../utility/domConstants.js';

const NAME_TAG = '[name]';
const ENV_TAG = '[env]';
const WORD = '(.+)';

const buildHref = (self, theme, environment, isRegEx = false) => {
	let path = self.path();

	if (isRegEx) {
		path = path.replace(/\./g, '\\.').replace(/\//g, '\\/');
	}

	return path
		.replace(NAME_TAG, theme || self.theme())
		.replace(ENV_TAG, environment || self.env());
};

const findLink = (self, theme, environment) => {
	const links = HEAD.querySelectorAll('link');
	const href = buildHref(self, theme, environment, true);
	let themeLink;

	if (links) {
		for (const link of links) {
			if (link.href.match(href)) {
				themeLink = link;
				break;
			}
		}
	}

	return themeLink;
};

const getCurrentTheme = (self) => {
	const themeLink = findLink(self, WORD, WORD);
	let theme;
	let environment;

	if (themeLink) {
		const linkMatch = themeLink.href.match(buildHref(self, WORD, WORD, true));
		const pathMatch = self.path().match(/(\[[^\]]+])/g);

		if (pathMatch.includes(NAME_TAG)) {
			theme = linkMatch[pathMatch.indexOf(NAME_TAG) + 1];
		}
		if (pathMatch.includes(ENV_TAG)) {
			environment = linkMatch[pathMatch.indexOf(ENV_TAG) + 1];
		}
	}

	return { theme, environment };
};

const newLink = (self, previousLink, isThemeChange) => {
	let isWorking;
	const done = () => {
		windowResize.trigger();

		if (isThemeChange) {
			isWorking.remove();
		}
	};
	const appendLink = () => {
		try {
			HEAD.append(link);
		}
		catch (error) {
			console.error(error);
		}

		done();
	};

	if (isThemeChange) {
		isWorking = new IsWorking({
			container: BODY,
			isWorking: true,
			label: 'Changing Theme',
			fade: true,
			css: {
				background: 'black',
				color: 'white',
				'z-index': '10000000'
			},
			onRemove() {
				isWorking = null;
			}
		});
	}

	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = buildHref(self);
	link.onload = () => {
		if (previousLink) {
			previousLink.remove();
		}

		done();

		if (self.onLoad()) {
			self.onLoad()(self.theme());
		}
	};

	if (isThemeChange) {
		delay(appendLink, 200);
	}
	else {
		appendLink();
	}
};

const setZoom = () => {
	const getBodyFontSize = () => {
		if (IS_DESKTOP) {
			return '100%';
		}
		else if (IS_TABLET) {
			return '1.5vmin';
		}

		return '3.5vmin';
	};

	document.documentElement.style[FONT_SIZE] = getBodyFontSize();
};

const ENVIRONMENT = Symbol();
const PATH = Symbol();
const THEME = Symbol();
const THEMES = Symbol();
const ON_LOAD = Symbol();

class Theme {
	constructor() {
		const self = this;

		self[ENVIRONMENT] = IS_DESKTOP ? 'desktop' : 'mobile';
		self[PATH] = '/styles/[name].[env].min.css';

		if (!IS_DESKTOP) {
			const tag = document.createElement('meta');
			HEAD.append(tag);
			tag.setAttribute('name', 'viewport');
			tag.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0');
		}

		window.addEventListener('orientationchange', setZoom);
		setZoom();
	}

	path(path) {
		const self = this;

		if (arguments.length !== 0) {
			self[PATH] = path;

			return self;
		}

		return self[PATH];
	}

	themes(themes) {
		const self = this;

		if (arguments.length !== 0) {
			self[THEMES] = themes;

			const current = getCurrentTheme(self);
			self[THEME] = current.theme;
			if (self[ENVIRONMENT] !== current.environment) {
				newLink(self, findLink(self, current.theme, WORD));
			}

			return self;
		}

		return self[THEMES];
	}

	onLoad(onLoad) {
		const self = this;

		if (arguments.length !== 0) {
			self[ON_LOAD] = onLoad;

			return self;
		}

		return self[ON_LOAD];
	}

	env(environment) {
		const self = this;

		if (arguments.length !== 0) {
			if (environment !== self[ENVIRONMENT]) {
				const previousLink = findLink(self, self.theme(), self[ENVIRONMENT]);
				self[ENVIRONMENT] = environment;
				newLink(self, previousLink);
			}

			return self;
		}

		return self[ENVIRONMENT];
	}

	theme(theme) {
		const self = this;

		if (arguments.length !== 0) {
			if (self.themes().includes(theme) && theme !== self[THEME]) {
				const previousLink = findLink(self, self[THEME], self.env());
				self[THEME] = theme;
				newLink(self, previousLink, true);
			}

			return self;
		}

		return self[THEME];
	}
}

const theme = new Theme();

export default theme;

