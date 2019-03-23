import { delay } from 'async-agent';
import { IS_DESKTOP, IS_TABLET } from '../../utility/browser';
import dom from '../../utility/dom';
import { BODY, FONT_SIZE, HEAD } from '../../utility/domConstants';
import windowResize from '../../utility/windowResize';
import IsWorking from '../display/IsWorking';

const NAME_TAG = '[name]';
const ENV_TAG = '[env]';
const WORD = '(.+)';

const buildHref = (self, theme, env, isRegEx = false) => {
	let path = self.path();

	if (isRegEx) {
		path = path.replace(/\./g, '\\.').replace(/\//g, '\\/');
	}

	return path
		.replace(NAME_TAG, theme || self.theme())
		.replace(ENV_TAG, env || self.env());
};

const findLink = (self, theme, env) => {
	const links = HEAD.getElementsByTagName('link');
	const href = buildHref(self, theme, env, true);
	let themeLink;

	if (links) {
		for (let link of links) {
			if (link.href.match(href)) {
				themeLink = link;
				break;
			}
		}
	}

	return themeLink;
};

const getCurrentTheme = (self) => {
	let themeLink = findLink(self, WORD, WORD);
	let theme;
	let env;

	if (themeLink) {
		const linkMatch = themeLink.href.match(buildHref(self, WORD, WORD, true));
		const pathMatch = self.path().match(/(\[[^\]]+])/g);

		if (pathMatch.includes(NAME_TAG)) {
			theme = linkMatch[pathMatch.indexOf(NAME_TAG) + 1];
		}
		if (pathMatch.includes(ENV_TAG)) {
			env = linkMatch[pathMatch.indexOf(ENV_TAG) + 1];
		}
	}

	return {theme, env};
};

const newLink = (self, prevLink, isThemeChange) => {
	let isWorking;
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
			onRemove: () => {
				isWorking = null;
			}
		});
	}

	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = buildHref(self);

	link.onload = () => {
		if (prevLink) {
			prevLink.parentNode.removeChild(prevLink);
		}

		windowResize.trigger();

		if (isThemeChange) {
			isWorking.remove();
		}

		if (self.onLoad()) {
			self.onLoad()(self.theme());
		}
	};

	if (isThemeChange) {
		delay(() => {
			HEAD.appendChild(link);
		}, 200);
	}
	else {
		HEAD.appendChild(link);
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
		else {
			return '3.5vmin';
		}
	};

	dom.css('html', FONT_SIZE, getBodyFontSize());
};

const ENV = Symbol();
const PATH = Symbol();
const THEME = Symbol();
const THEMES = Symbol();
const ON_LOAD = Symbol();

class Theme {
	constructor() {
		const self = this;

		self[ENV] = IS_DESKTOP ? 'desktop' : 'mobile';
		self[PATH] = '/styles/[name].[env].min.css';

		if (!IS_DESKTOP) {
			dom.attr(dom.appendNewTo(HEAD, '', 'meta'), {
				name: 'viewport',
				content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0'
			});
		}

		window.addEventListener('orientationchange', setZoom);
		setZoom();
	}

	path(path) {
		const self = this;

		if (arguments.length) {
			self[PATH] = path;

			return self;
		}

		return self[PATH];
	}

	themes(themes) {
		const self = this;

		if (arguments.length) {
			self[THEMES] = themes;

			const current = getCurrentTheme(self);
			self[THEME] = current.theme;
			if (self[ENV] !== current.env) {
				newLink(self, findLink(self, current.theme, WORD));
			}

			return self;
		}

		return self[THEMES];
	}

	onLoad(onLoad) {
		const self = this;

		if (arguments.length) {
			self[ON_LOAD] = onLoad;

			return self;
		}

		return self[ON_LOAD];
	}

	env(env) {
		const self = this;

		if (arguments.length) {
			if (env !== self[ENV]) {
				const prevLink = findLink(self, self.theme(), self[ENV]);
				self[ENV] = env;
				newLink(self, prevLink);
			}

			return self;
		}

		return self[ENV];
	}

	theme(theme) {
		const self = this;

		if (arguments.length) {
			if (self.themes().includes(theme) && theme !== self[THEME]) {
				const prevLink = findLink(self, self[THEME], self.env());
				self[THEME] = theme;
				newLink(self, prevLink, true);
			}

			return self;
		}

		return self[THEME];
	}
}

const theme = new Theme();

export default theme;

