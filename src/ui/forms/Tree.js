import { set } from 'object-agent';
import { AUTO, enforce, HUNDRED_PERCENT, isArray, method, PIXELS } from 'type-enforcer';
import dom from '../../utility/dom';
import { ABSOLUTE, BODY, EMPTY_STRING, PADDING_LEFT, POSITION } from '../../utility/domConstants';
import objectHelper from '../../utility/objectHelper';
import controlTypes from '../controlTypes';
import Heading from '../elements/Heading';
import VirtualList from '../layout/VirtualList';
import FocusMixin from '../mixins/FocusMixin';
import FormControl from './FormControl';

const ROW_WIDTH_BUFFER_RATIO = 1.1;
const AVERAGE_CHARACTER_WIDTH = 8;
const INDENT_PIXELS = 24;

const VIRTUAL_LIST = Symbol();
const EXPANDED_BRANCHES = Symbol();
const SHOW_EXPANDERS = Symbol();
const SHOW_CHECKBOXES = Symbol();
const SHOW_CHECKBOXES_ON_GROUPS = Symbol();

const renderRow = Symbol();
const processBranches = Symbol();
const preMeasureRowWidth = Symbol();
const toggleSelected = Symbol();
const toggleExpanded = Symbol();

/**
 * A tree control.
 *
 * @class Tree
 * @extends FormControl
 * @mixes FocusMixin
 * @constructor
 *
 * @param {Object} settings
 */
export default class Tree extends FocusMixin(FormControl) {
	constructor(settings = {}) {
		let self;
		settings.type = settings.type || controlTypes.TREE;
		settings.width = enforce.cssSize(settings.width, HUNDRED_PERCENT, true);

		const virtualList = new VirtualList({
			height: settings.height ? HUNDRED_PERCENT : AUTO,
			width: HUNDRED_PERCENT,
			minWidth: settings.minWidth,
			maxWidth: settings.maxWidth,
			itemControl: Heading,
			itemDefaultSettings: {
				onSelect: function() {
					self[toggleSelected](this);
				},
				onExpand: function() {
					self[toggleExpanded](this);
				},
				isFocusable: true
			},
			onItemRender: (...args) => self[renderRow](...args),
			isFocusable: true
		});

		settings.element = virtualList.element();
		settings.FocusMixin = settings.FocusMixin || {};
		settings.FocusMixin.mainControl = virtualList;

		super(settings);

		self = this;
		self.addClass('tree');

		self[VIRTUAL_LIST] = virtualList;
		self[EXPANDED_BRANCHES] = [];
		self[SHOW_EXPANDERS] = false;
		self[SHOW_CHECKBOXES] = false;
		self[SHOW_CHECKBOXES_ON_GROUPS] = false;

		objectHelper.applySettings(self, settings, null, ['width', 'title']);

		self.onResize(() => {
			const contentHeight = dom.get.height(self.contentContainer());

			self[VIRTUAL_LIST].minWidth(self.minWidth());
			self[VIRTUAL_LIST].maxWidth(self.maxWidth());
			if (contentHeight < self[VIRTUAL_LIST].height()) {
				self[VIRTUAL_LIST].height(contentHeight);
			}
		});

		self.onRemove(() => {
			self[VIRTUAL_LIST].remove();
			self[VIRTUAL_LIST] = null;
		});
	}

	/**
	 * Applies branch data to the appropriate methods on heading.
	 * @function renderRow
	 */
	[renderRow](heading, branchData) {
		const self = this;

		heading.removeClass(heading.classes());
		heading.addClass('heading');
		heading.isEnabled(heading.isEnabled(), true);

		objectHelper.applySettings(heading, branchData);

		heading.isSelected(self.value().includes(branchData.ID), true);
		heading.showExpander((!branchData.isExpandable && self[SHOW_CHECKBOXES_ON_GROUPS]) || (branchData.isExpandable && self[SHOW_EXPANDERS]));
		heading.showCheckbox((branchData.isExpandable && self[SHOW_CHECKBOXES_ON_GROUPS]) || (!branchData.isExpandable && self[SHOW_CHECKBOXES]));
	}

	/**
	 * Process the "value" data into something the virtual list control can consume
	 * @function processBranches
	 */
	[processBranches]() {
		const self = this;
		let branchWidth = 0;
		let longestWidth = 0;
		let branchWithLongestTitle;

		const processLevel = (branches, depth) => {
			let branchData;
			let output = [];

			for (let index = 0; index < branches.length; index++) {
				if (branches[index].isExpanded) {
					self[EXPANDED_BRANCHES].push(branches[index].ID);
					delete branches[index].isExpanded;
				}

				branchData = Object.assign({
					icon: ''
				}, branches[index], {
					css: set({}, PADDING_LEFT, depth ? ((depth * INDENT_PIXELS) + PIXELS) : EMPTY_STRING),
					isSelectable: self.isMultiSelect() || enforce.boolean(branches[index].isSelectable, false),
					isExpandable: !!branches[index].children,
					isExpanded: self[EXPANDED_BRANCHES].includes(branches[index].ID)
				});

				if (branchData.isExpandable) {
					self[SHOW_EXPANDERS] = true;
				}
				if (branchData.isSelectable) {
					self[SHOW_CHECKBOXES] = true;
				}
				if (branchData.isExpandable && branchData.isSelectable) {
					self[SHOW_CHECKBOXES_ON_GROUPS] = true;
				}

				branchWidth = (branchData.title.length * AVERAGE_CHARACTER_WIDTH);
				branchWidth += ((branchData.subTitle ? branchData.subTitle.length : 0) * AVERAGE_CHARACTER_WIDTH);
				branchWidth += ((branchData.level || 0) * INDENT_PIXELS);

				if (branchWidth > longestWidth) {
					longestWidth = branchWidth;
					branchWithLongestTitle = branchData;
				}

				output.push(branchData);

				if (branchData.isExpandable && branchData.isExpanded) {
					output = output.concat(processLevel(branches[index].children, depth + 1));
				}
			}

			return output;
		};

		self[SHOW_EXPANDERS] = false;
		self[SHOW_CHECKBOXES] = false;
		self[SHOW_CHECKBOXES_ON_GROUPS] = false;

		self[VIRTUAL_LIST].itemData(processLevel(self.branches(), 0));

		if (self.width().isAuto && branchWithLongestTitle) {
			self[preMeasureRowWidth](branchWithLongestTitle);
		}
	}

	/**
	 * Create a temporary branch control to measure the width.
	 * @function preMeasureRowWidth
	 */
	[preMeasureRowWidth](branchData) {
		const self = this;

		let tempBranchControl = new Heading({
			container: BODY,
			width: AUTO
		});
		let newWidth;

		tempBranchControl.css(POSITION, ABSOLUTE);
		self[renderRow](tempBranchControl, branchData);

		newWidth = tempBranchControl.width() * ROW_WIDTH_BUFFER_RATIO;
		self[VIRTUAL_LIST].width(newWidth);

		tempBranchControl.remove();
		tempBranchControl = null;
	}

	/**
	 * Callback function for when a branch is selected
	 * @function toggleSelected
	 */
	[toggleSelected](heading) {
		const self = this;

		if (self.onSelect()) {
			self.onSelect()(heading.ID());
		}
		else {
			if (heading.showCheckbox() && heading.isSelectable()) {
				if (self.value().includes(heading.ID())) {
					self.value(self.value().filter((item) => item !== heading.ID()), true);
				}
				else {
					self.value(self.value().concat(heading.ID()), true);
				}
			}
			else {
				self.value([heading.ID()]);
			}
			self.triggerChange();
			if (self[VIRTUAL_LIST]) {
				self[VIRTUAL_LIST].refresh();
			}
		}
	}

	/**
	 * Callback function for when a branch is expanded
	 * @function toggleExpanded
	 */
	[toggleExpanded](heading) {
		const self = this;

		if (self[EXPANDED_BRANCHES].includes(heading.ID())) {
			self[EXPANDED_BRANCHES] = self[EXPANDED_BRANCHES].filter((item) => item === heading.ID());
		}
		else {
			self[EXPANDED_BRANCHES].push(heading.ID());
		}
		self[processBranches]();
		objectHelper.callIfExists(self.onLayoutChange());
	}
}

Object.assign(Tree.prototype, {
	/**
	 * @method value
	 * @member module:Tree
	 * @instance
	 * @param {Array} [value]
	 * @returns {Array|this}
	 */
	value: method.any({
		init: [],
		set: function(newValue) {
			const self = this;

			if (typeof newValue === 'string') {
				if (newValue === '') {
					self.value([]);
				}
				else {
					self.value(newValue.split(','));
				}
			}
			else if (!isArray(newValue)) {
				self.value([newValue]);
			}

			self[processBranches]();
			self[VIRTUAL_LIST].refresh();
		}
	}),

	/**
	 * Get or set the array of branch data objects
	 * @method branches
	 * @member module:Tree
	 * @instance
	 * @param {Array} branches
	 * @returns {Array|this}
	 */
	branches: method.array({
		set: function() {
			this[processBranches]();
		}
	}),

	/**
	 * Get or set a function that gets called whenever the visible layout changes
	 * @method onLayoutChange
	 * @member module:Tree
	 * @instance
	 * @param {Function} onLayoutChange
	 * @returns {Function|this}
	 */
	onLayoutChange: method.function({

		other: undefined
	}),

	/**
	 * Get or set a function that gets called whenever a selectable branch is selected. If set then normal selection
	 * alogic is bypassed.
	 * @method onSelect
	 * @member module:Tree
	 * @instance
	 * @param {Function} onSelect
	 * @returns {Function|this}
	 */
	onSelect: method.function({
		other: undefined
	}),

	/**
	 * Set the height of the list to the height of the contents.
	 * @method fitHeightToContents
	 * @member module:VirtualList
	 * @instance
	 * @returns {this}
	 */
	fitHeightToContents: function() {
		const self = this;

		self[VIRTUAL_LIST].maxHeight(self.maxHeight());
		self[VIRTUAL_LIST].fitHeightToContents();
		self.height(self[VIRTUAL_LIST].height());
		self[VIRTUAL_LIST].refresh();

		return self;
	},

	emptyContentMessage: method.string({
		set: function(emptyContentMessage) {
			this[VIRTUAL_LIST].emptyContentMessage(emptyContentMessage);
		}
	}),

	isMultiSelect: method.boolean({
		set: function() {
			this[processBranches]();
		}
	})
});
