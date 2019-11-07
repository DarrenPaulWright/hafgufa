import { clone, forOwn } from 'object-agent';
import { applySettings, AUTO, enforceCssSize, HUNDRED_PERCENT, method } from 'type-enforcer-ui';
import Control from '../Control';
import controlTypes from '../controlTypes';
import Button from '../elements/Button';
import GroupedButtons from '../forms/GroupedButtons';
import { COLLAPSE_LEFT_ICON, UN_COLLAPSE_RIGHT_ICON } from '../icons';
import Toolbar from '../layout/Toolbar';
import { CONTENT_CONTAINER } from '../mixins/ControlHeadingMixin';
import MergeContentContainerMixin from '../mixins/MergeContentContainerMixin';
import { ORIENTATION } from '../uiConstants';
import { IS_DESKTOP } from '../utility/browser';
import Container from './Container';
import './Tabs.less';

const TAB_CONTAINER = Symbol();
const TOOLBAR = Symbol();
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

/**
 * Displays a tabbed content control.
 *
 * @class Tabs
 * @extends Container
 * @constructor
 *
 * @args {object} [settings]
 */
export default class Tabs extends MergeContentContainerMixin(Control) {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.TABS;
		settings.width = enforceCssSize(settings.width, HUNDRED_PERCENT, true);
		settings.height = enforceCssSize(settings.height, HUNDRED_PERCENT, true);

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
		self[TAB_CONTAINER] = new Container({
			container: self.element(),
			classes: 'tab-container'
		});
		self[CONTENT_CONTAINER] = new Container({
			container: self.element(),
			classes: 'tabs-content'
		});

		applySettings(self, {
			hideToolbar: false,
			orientation: ORIENTATION.HORIZONTAL,
			...settings
		});

		self.onResize((width, height) => {
				const availableHeight = height;

				if (self[IS_VERTICAL]) {
					self[TAB_CONTAINER].height(availableHeight);
					self[CONTENT_CONTAINER].height(availableHeight);
				}
				else if (self.height().isPercent) {
					self[CONTENT_CONTAINER].height(availableHeight - self[TAB_CONTAINER].outerHeight() - (self[TOOLBAR] ? self[TOOLBAR].borderHeight() : 0));
				}

				self[TAB_CONTAINER].resize(true);
				self[CONTENT_CONTAINER].resize(true);
			})
			.resize();
	}

	[toggleTabContainer]() {
		const self = this;

		self[IS_TAB_CONTAINER_COLLAPSED] = !self[IS_TAB_CONTAINER_COLLAPSED];
		self[TAB_CONTAINER].classes('collapsed', self[IS_TAB_CONTAINER_COLLAPSED]);
		self[CONTENT_CONTAINER].classes('collapsed', self[IS_TAB_CONTAINER_COLLAPSED]);
		self[COLLAPSE_BUTTON].icon(self[IS_TAB_CONTAINER_COLLAPSED] ? UN_COLLAPSE_RIGHT_ICON : COLLAPSE_LEFT_ICON);
		self.resize(true);
	}

	[getGroup](groupTitle) {
		const self = this;

		let group = self[GROUPS].find((item) => item.title === groupTitle);

		if (!group) {
			self[GROUPS].push({
				title: groupTitle,
				control: new GroupedButtons({
					id: groupTitle + '_tab',
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
			.height(AUTO);
	}

	[onTabClick](Button, event) {
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

		self[CURRENT_TAB] = self[TABS].find((item) => item.id === Button.id());

		if (previousTab && previousTab.group !== self[CURRENT_TAB].group) {
			previousTab.group.value([]);
		}

		if (!self[SHOULD_SKIP_NEXT_ON_CLICK]) {
			if (self[CURRENT_TAB].data.content) {
				self.content(clone(self[CURRENT_TAB].data.content));
			}
			if (self[CURRENT_TAB].data.onClick) {
				self[CURRENT_TAB].data.onClick(self[CONTENT_CONTAINER], self[CURRENT_TAB].data.data, self[CURRENT_TAB].id);
			}
		}
		self[SHOULD_SKIP_NEXT_ON_CLICK] = false;
		self.resize();
	}
}

Object.assign(Tabs.prototype, {
	[clickTab](id) {
		const self = this;

		if (self[TABS].length > 0) {
			const tab = self[TABS].find((item) => item.id === id);
			if (tab) {
				tab.group.getButton(id).click();
			}
		}
	},

	orientation: method.enum({
		enum: ORIENTATION,
		set(orientation) {
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
		set(hideToolbar) {
			const self = this;

			if (hideToolbar) {
				if (self[TOOLBAR]) {
					self[TOOLBAR].remove();
					self[TOOLBAR] = null;
				}
			}
			else {
				self[TOOLBAR] = new Toolbar({
					container: self.element(),
					prepend: self[CONTENT_CONTAINER].element()
				});
			}
		}
	}),

	canCollapseTabContainer: method.boolean({
		set(newValue) {
			const self = this;

			if (newValue) {
				self[COLLAPSE_BUTTON] = new Button({
					container: self[TAB_CONTAINER],
					icon: COLLAPSE_LEFT_ICON,
					classes: 'icon-button tabs-collapse-button',
					onClick() {
						self[toggleTabContainer]();
					},
					prepend: true
				});

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
	 * @arg {string}   [newTabs.id]
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
		before() {
			const self = this;

			self[GROUPS].forEach((group) => {
				group.control.remove();
			});
			self[GROUPS].length = 0;
			self[TABS].length = 0;
		},
		set(newTabs) {
			const self = this;
			const groups = {};

			newTabs.forEach((tab, index) => {
				const tabId = (tab.id !== undefined) ? tab.id : ('tab' + index);
				const group = self[getGroup](tab.group);

				if (!groups[tab.group]) {
					groups[tab.group] = {
						group: self[getGroup](tab.group),
						buttons: []
					};
				}

				groups[tab.group].buttons.push({
					id: tabId,
					icon: tab.icon,
					label: tab.title,
					onClick(event) {
						self[onTabClick](this, event);
					}
				});

				self[TABS].push({
					group: group,
					id: tabId,
					order: index,
					data: tab
				});
			});

			forOwn(groups, (data) => {
				data.group.buttons(data.buttons);
			});
		}
	}),

	selectTab(id, skipOnClick) {
		const self = this;

		self[SHOULD_SKIP_NEXT_ON_CLICK] = skipOnClick;

		self[clickTab](id);

		return self;
	},

	toolbar() {
		return this[TOOLBAR];
	},

	currentTab() {
		return this[CURRENT_TAB] ? this[CURRENT_TAB].id : undefined;
	}
});

Tabs.ORIENTATION = ORIENTATION;
