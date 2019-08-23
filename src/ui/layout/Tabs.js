import { debounce, delay } from 'async-agent';
import { event } from 'd3';
import { clone } from 'object-agent';
import { applySettings, AUTO, enforce, HUNDRED_PERCENT, method } from 'type-enforcer';
import { IS_DESKTOP } from '../../utility/browser';
import dom from '../../utility/dom';
import { HEIGHT } from '../../utility/domConstants';
import windowResize from '../../utility/windowResize';
import controlTypes from '../controlTypes';
import Button from '../elements/Button';
import Div from '../elements/Div';
import GroupedButtons from '../forms/GroupedButtons';
import { COLLAPSE_LEFT_ICON, UN_COLLAPSE_RIGHT_ICON } from '../icons';
import Toolbar from '../layout/Toolbar';
import { ORIENTATION } from '../uiConstants';
import Container from './Container';
import './Tabs.less';

const TAB_CONTAINER = Symbol();
const TOOLBAR = Symbol();
const CONTENT_CONTAINER = Symbol();
const TABS = Symbol();
const GROUPS = Symbol();
const CURRENT_TAB = Symbol();
const SHOULD_SKIP_NEXT_ON_CLICK = Symbol();
const IS_TAB_CONTAINER_COLLAPSED = Symbol();
const COLLAPSE_BUTTON = Symbol();
const IS_VERTICAL = Symbol();

const toggleTabContainer = Symbol();
const getGroup = Symbol();
const setGroupOrientation = Symbol();
const onTabClick = Symbol();
const clickTab = Symbol();

const methodPass = (options = {}) => {
	return function(...args) {
		if (args.length) {
			this[options.class][options.method](...args);

			return this;
		}

		return this[options.class][options.method]();
	};
};

/**
 * Displays a tabbed content control.
 *
 * @class Tabs
 * @extends Container
 * @constructor
 *
 * @args {object} [settings]
 */
export default class Tabs extends Div {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.TABS;
		settings.width = enforce.cssSize(settings.width, HUNDRED_PERCENT, true);
		settings.height = enforce.cssSize(settings.height, HUNDRED_PERCENT, true);

		super(settings);

		const self = this;
		self.addClass('tabs');

		self[TABS] = [];
		self[GROUPS] = [];
		self[CURRENT_TAB] = null;
		self[SHOULD_SKIP_NEXT_ON_CLICK] = false;
		self[IS_TAB_CONTAINER_COLLAPSED] = false;
		self[COLLAPSE_BUTTON];
		self[IS_VERTICAL] = false;
		self[TAB_CONTAINER] = dom.appendNewTo(self.element(), 'tab-container');
		self[CONTENT_CONTAINER] = new Container({
			container: self.element(),
			classes: 'tabs-content'
		});

		applySettings(self, {
			hideToolbar: false,
			orientation: ORIENTATION.HORIZONTAL,
			...settings
		});

		self.onResize(() => {
				const availableHeight = self.borderHeight();

				if (self[IS_VERTICAL]) {
					dom.css(self[TAB_CONTAINER], HEIGHT, availableHeight);
					self[CONTENT_CONTAINER].height(availableHeight);
				}
				else if (self.height().isPercent) {
					self[CONTENT_CONTAINER].height(availableHeight - dom.get.outerHeight(self[TAB_CONTAINER]) - (self[TOOLBAR] ? self[TOOLBAR].borderHeight() : 0));
				}
			})
			.resize();

		self.onRemove(() => {
			self.canCollapseTabContainer(false);
			self.hideToolbar(true);
			self[CONTENT_CONTAINER].remove();
			self[CONTENT_CONTAINER] = null;
			self.tabs([]);
		});
	}

	[toggleTabContainer]() {
		const self = this;

		self[IS_TAB_CONTAINER_COLLAPSED] = !self[IS_TAB_CONTAINER_COLLAPSED];
		dom.classes(self[TAB_CONTAINER], 'collapsed', self[IS_TAB_CONTAINER_COLLAPSED]);
		self[CONTENT_CONTAINER].classes('collapsed', self[IS_TAB_CONTAINER_COLLAPSED]);
		self[COLLAPSE_BUTTON].icon(self[IS_TAB_CONTAINER_COLLAPSED] ? UN_COLLAPSE_RIGHT_ICON : COLLAPSE_LEFT_ICON);

		delay(() => {
			windowResize.trigger();
		}, 200);
	}

	[getGroup](groupTitle) {
		const self = this;

		let group = self[GROUPS].find((item) => item.title === groupTitle);

		if (!group) {
			self[GROUPS].push({
				title: groupTitle,
				control: new GroupedButtons({
					ID: groupTitle + '_tab',
					container: self[TAB_CONTAINER],
					title: groupTitle,
					width: HUNDRED_PERCENT,
					isMultiSelect: false
				})
			});
			group = self[GROUPS][self[GROUPS].length - 1];
			self[setGroupOrientation](group);
		}

		return group.control;
	}

	[setGroupOrientation](group) {
		const self = this;

		group.control
			.orientation(self[IS_VERTICAL] ? GroupedButtons.ORIENTATION.VERTICAL : GroupedButtons.ORIENTATION.HORIZONTAL)
			.width(self[IS_VERTICAL] ? HUNDRED_PERCENT : AUTO)
			.height(AUTO)
			.resize();
	}

	[onTabClick](Button) {
		const self = this;
		let previousTab;

		event.preventDefault();

		if (self[CURRENT_TAB] !== null) {
			previousTab = self[CURRENT_TAB];
			if (previousTab.data.onRemove) {
				previousTab.data.onRemove(self[CONTENT_CONTAINER]);
			}
			self.removeContent();
		}

		self[CURRENT_TAB] = self[TABS].find((item) => item.ID === Button.ID());

		if (previousTab && previousTab.group !== self[CURRENT_TAB].group) {
			previousTab.group.value([]);
		}

		if (!self[SHOULD_SKIP_NEXT_ON_CLICK]) {
			if (self[CURRENT_TAB].data.content) {
				self.content(clone(self[CURRENT_TAB].data.content));
			}
			if (self[CURRENT_TAB].data.onClick) {
				self[CURRENT_TAB].data.onClick(self[CONTENT_CONTAINER], self[CURRENT_TAB].data.data, self[CURRENT_TAB].ID);
			}
		}
		self[SHOULD_SKIP_NEXT_ON_CLICK] = false;
		self.resize();
	}
}

Object.assign(Tabs.prototype, {
	[clickTab]: debounce(function(ID) {
		const self = this;

		if (self[TABS].length > 0) {
			const tab = self[TABS].find((item) => item.ID === ID);
			if (tab) {
				tab.group.getButton(ID).click();
			}
		}
	}, 20),

	orientation: method.enum({
		enum: ORIENTATION,
		set: function(orientation) {
			const self = this;

			self[IS_VERTICAL] = orientation === ORIENTATION.VERTICAL;

			self.classes('vertical', self[IS_VERTICAL])
				.classes('horizontal', !self[IS_VERTICAL]);

			self[GROUPS].forEach((group) => self[setGroupOrientation](group));

			self.resize();
		}
	}),

	hideToolbar: method.boolean({
		init: true,
		set: function(hideToolbar) {
			const self = this;

			if (hideToolbar) {
				if (self[TOOLBAR]) {
					self[TOOLBAR].remove();
					self[TOOLBAR] = null;
				}
			}
			else {
				self[TOOLBAR] = new Toolbar({
					container: self.element()
				});
				dom.appendAfter(self[TAB_CONTAINER], self[TOOLBAR]);
			}
		}
	}),

	canCollapseTabContainer: method.boolean({
		set: function(newValue) {
			const self = this;

			if (newValue) {
				self[COLLAPSE_BUTTON] = new Button({
					container: self[TAB_CONTAINER],
					icon: COLLAPSE_LEFT_ICON,
					classes: 'icon-button tabs-collapse-button',
					onClick: function() {
						self[toggleTabContainer]();
					}
				});
				dom.prependTo(self[TAB_CONTAINER], self[COLLAPSE_BUTTON]);

				if (!IS_DESKTOP) {
					self[COLLAPSE_BUTTON].click();
				}
			}
			else if (self[COLLAPSE_BUTTON]) {
				self[COLLAPSE_BUTTON].remove();
			}
		}
	}),

	/**
	 * @method tabs
	 * @member module:Tabs
	 * @instance
	 *
	 * @arg {Array}    [newTabs]
	 * @arg {string}   [newTabs.ID]
	 * @arg {string}   [newTabs.title]
	 * @arg {string}   [newTabs.icon]
	 * @arg {string}   [newTabs.group]
	 * @arg {function} [newTabs.content] - content is applied before onClick is called
	 * @arg {function} [newTabs.onClick]
	 * @arg {function} [newTabs.onRemove]
	 *
	 * @returns {Array|this}
	 */
	tabs: method.array({
		before: function() {
			const self = this;

			self[GROUPS].forEach((group) => {
				group.control.remove();
			});
			self[GROUPS].length = 0;
			self[TABS].length = 0;
		},
		set: function(newTabs) {
			const self = this;

			newTabs.forEach((tab, index) => {
				const tabId = (tab.ID !== undefined) ? tab.ID : ('tab' + index);
				const group = self[getGroup](tab.group);

				group.addButton({
					ID: tabId,
					icon: tab.icon,
					label: tab.title,
					onClick: (button) => self[onTabClick](button)
				});

				self[TABS].push({
					group: group,
					ID: tabId,
					order: index,
					data: tab
				});
			});

			if (self[TABS].length) {
				self.selectTab(self[TABS][0].ID);
			}
		}
	}),

	selectTab: function(ID, skipOnClick) {
		const self = this;

		self[SHOULD_SKIP_NEXT_ON_CLICK] = skipOnClick;

		self[clickTab](ID);

		return self;
	},

	toolbar: function() {
		return this[TOOLBAR];
	},

	currentTab: function() {
		return this[CURRENT_TAB] ? this[CURRENT_TAB].ID : undefined;
	},

	get: function(id) {
		return this[CONTENT_CONTAINER].get(id);
	},

	each: methodPass({
		class: CONTENT_CONTAINER,
		method: 'each'
	}),

	content: methodPass({
		class: CONTENT_CONTAINER,
		method: 'content'
	}),

	append: methodPass({
		class: CONTENT_CONTAINER,
		method: 'append'
	}),

	prepend: methodPass({
		class: CONTENT_CONTAINER,
		method: 'prepend'
	}),

	removeContent: methodPass({
		class: CONTENT_CONTAINER,
		method: 'removeContent'
	}),

	isWorking: methodPass({
		class: CONTENT_CONTAINER,
		method: 'isWorking'
	})
});

Tabs.ORIENTATION = ORIENTATION;
