import { methodQueue, methodString } from 'type-enforcer-ui';
import { IS_DESKTOP, IS_TABLET } from '../utility/browser.js';
import { FONT_SIZE, HEAD } from '../utility/domConstants.js';

const NAME_TAG = '[name]';
const ENV_TAG = '[env]';
const WORD = '(.+)';
const ENVIRONMENTS = ['desktop', 'mobile'];

const addMeta = Symbol();
const buildHref = Symbol();
const links = Symbol();
const findLink = Symbol();
const getCurrentTheme = Symbol();
const switchLinks = Symbol();
const setZoom = Symbol();
const addLink = Symbol();

const ENVIRONMENT = Symbol();
const THEME = Symbol();
const THEMES = Symbol();

class Theme {
	constructor() {
		this[ENVIRONMENT] = ENVIRONMENTS[IS_DESKTOP ? 0 : 1];
		this[THEMES] = [];

		this[addMeta]();
	}

	[addMeta]() {
		if (!IS_DESKTOP) {
			this.setViewport('width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0');
		}

		window.addEventListener('orientationchange', this[setZoom].bind(this));
		this[setZoom]();
	}

	[buildHref](theme = this.theme(), environment = this.environment(), isForRegEx = false) {
		const self = this;
		let path = self.path();

		if (isForRegEx) {
			path = path
				.replace(/\./ug, '\\.')
				.replace(/\//ug, '\\/');
		}

		return path
			.replace(NAME_TAG, theme)
			.replace(ENV_TAG, environment);
	}

	[links]() {
		const self = this;
		const links = HEAD.querySelectorAll('link');

		return (href) => {
			if (links) {
				for (const link of links) {
					if (link.href.match(href)) {
						return link;
					}
				}
			}
		};
	}

	[findLink](theme, environment) {
		return this[links]()(this[buildHref](theme, environment, true));
	}

	[getCurrentTheme]() {
		const self = this;
		const themeLink = self[findLink](WORD, WORD);
		let theme;
		let environment;

		if (themeLink) {
			const linkMatch = themeLink.href.match(self[buildHref](WORD, WORD, true));
			const pathMatch = self.path().match(/(\[[^\]]+\])/ug);

			if (pathMatch.includes(NAME_TAG)) {
				theme = linkMatch[pathMatch.indexOf(NAME_TAG) + 1];
			}
			if (pathMatch.includes(ENV_TAG)) {
				environment = linkMatch[pathMatch.indexOf(ENV_TAG) + 1];
			}
		}

		return { theme, environment };
	}

	[switchLinks](previousLink) {
		const self = this;
		const currentLink = self[findLink]();
		const onDone = () => {
			if (previousLink) {
				previousLink.disabled = true;
			}

			if (self.onLoad()) {
				self.onLoad().trigger(null, [self.theme()]);
			}
		};

		if (currentLink === undefined) {
			self[addLink](self[buildHref](), onDone);
		}
		else {
			currentLink.disabled = false;
			onDone();
		}
	}

	[setZoom]() {
		const bodyFontSize = IS_DESKTOP ? '100%' : (IS_TABLET ? '1.5vmin' : '3.5vmin');

		document.documentElement.style[FONT_SIZE] = bodyFontSize;
	}

	[addLink](href, onLoad) {
		const self = this;

		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = href;
		link.onload = onLoad;

		try {
			HEAD.append(link);
		}
		catch (error) {
			console.error(error);
		}
	}

	themes(themes) {
		const self = this;

		if (arguments.length !== 0) {
			self[THEMES] = themes;

			const current = self[getCurrentTheme]();
			self[THEME] = current.theme;

			if (self[ENVIRONMENT] !== current.environment) {
				self[switchLinks](self[findLink](current.theme, WORD));
			}

			return self;
		}

		return self[THEMES];
	}

	environment(environment) {
		const self = this;

		if (arguments.length !== 0) {
			if (environment !== self[ENVIRONMENT]) {
				const previousLink = self[findLink](self.theme(), self[ENVIRONMENT]);
				self[ENVIRONMENT] = environment;
				self[switchLinks](previousLink);
			}

			return self;
		}

		return self[ENVIRONMENT];
	}

	theme(theme) {
		const self = this;

		if (arguments.length !== 0) {
			if (self.themes().includes(theme) && theme !== self[THEME]) {
				const previousLink = self[findLink](self[THEME], self.environment());
				self[THEME] = theme;
				self[switchLinks](previousLink);
			}

			return self;
		}

		return self[THEME];
	}

	preload() {
		const self = this;
		const environments = self.path().includes(ENV_TAG) ? ENVIRONMENTS : [''];
		const currentLinks = self[links]();

		const checkLink = (href) => {
			if (currentLinks(href) !== undefined) {
				self[addLink](href, function() {
					this.disabled = true;
				});
			}
		};

		self.themes().forEach((theme) => {
			ENVIRONMENTS.forEach((environment) => {
				checkLink(self[buildHref](theme, environment));
			});
		});

		return self;
	}

	setViewport(viewport) {
		let tag = HEAD.querySelector('meta[name="viewport"]');

		if (tag === undefined) {
			tag = document.createElement('meta');
			tag.setAttribute('name', 'viewport');
			HEAD.append(tag);
		}

		tag.setAttribute('content', viewport);
	}
}

Object.assign(Theme.prototype, {
	path: methodString({ init: '/styles/[name].[env].min.css' }),
	onLoad: methodQueue()
});

const theme = new Theme();

export default theme;

