import { clear, delay } from 'async-agent';
import { List } from 'hord';
import { isNumber } from 'type-enforcer';
import { BODY, CLICK_EVENT, MOUSE_ENTER_EVENT, MOUSE_LEAVE_EVENT } from '../../utility/domConstants';
import objectHelper from '../../utility/objectHelper';
import Div from '../elements/Div';
import Heading from '../elements/Heading';
import { CHECK_ICON, CLEAR_ICON, DELETE_ALL_ICON, DELETE_ICON, ERROR_ICON, INFO_ICON, WARNING_ICON } from '../icons';
import ContextMenuMixin from '../mixins/ContextMenuMixin';
import './toast.less';

let wrapper;
let currentID = 1;
const slices = new List().sorter(List.sorter.id.asc);
const REMOVE_THIS = 'removeThis';
const REMOVE_ALL = 'removeAll';

const TIMER = Symbol();
const DURATION = Symbol();

const stopTimer = Symbol();
const startTimer = Symbol();

class Slice extends ContextMenuMixin(Heading) {
	constructor(settings) {
		Object.assign(settings, {
			container: wrapper,
			classes: 'toast inverse ' + settings.class,
			isInline: false,
			canWrap: true,
			fade: true,
			buttons: [{
				icon: CLEAR_ICON,
				onClick: () => {
					self.remove();
				}
			}]
		});

		super(settings);

		const self = this;
		self[DURATION] = settings.duration;

		self
			.on(CLICK_EVENT, () => {
				objectHelper.callIfExists(settings.onClick);
				self.remove();
			})
			.on(MOUSE_ENTER_EVENT, () => self[stopTimer]())
			.on(MOUSE_LEAVE_EVENT, () => self[startTimer]())
			.contextMenu([{
				id: REMOVE_THIS,
				title: 'Remove Message',
				icon: DELETE_ICON,
				isMultiSelect: false,
				classes: '',
				onSelect: () => {
					self.remove();
				}
			}, {
				id: REMOVE_ALL,
				title: 'Remove All Messages',
				icon: DELETE_ALL_ICON,
				isMultiSelect: false,
				classes: '',
				onSelect: () => toast.clear()
			}]);

		self[startTimer]();

		self.onRemove(() => {
			self[stopTimer]();
			removeSlice(settings.id);
		});
	}

	[stopTimer]() {
		clear(this[TIMER]);
	}

	[startTimer]() {
		const self = this;

		if (!self.isRemoved && isNumber(self[DURATION])) {
			self[stopTimer]();
			self[TIMER] = delay(() => {
				self.remove();
			}, self[DURATION] * 1000);
		}
	}
}

const addSlice = (settings) => {
	if (!wrapper) {
		wrapper = new Div({
			container: BODY,
			classes: 'toast-wrapper'
		});
	}

	settings.id = currentID++;

	slices.add({
		id: settings.id,
		slice: new Slice(settings)
	});
};

const removeSlice = (sliceID) => {
	slices.discard({
		id: sliceID
	});

	if (!slices.length) {
		wrapper.remove();
		wrapper = null;
	}
};

const toast = {
	info: (settings) => {
		addSlice(Object.assign({
			icon: INFO_ICON,
			class: 'toast-info',
			duration: 10
		}, settings));
	},
	success: (settings) => {
		addSlice(Object.assign({
			icon: CHECK_ICON,
			class: 'toast-success',
			duration: 10
		}, settings));
	},
	warning: (settings) => {
		addSlice(Object.assign({
			icon: WARNING_ICON,
			class: 'toast-warning',
			duration: 60
		}, settings));
	},
	error: (settings) => {
		addSlice(Object.assign({
			icon: ERROR_ICON,
			class: 'toast-error',
			requireClose: true
		}, settings));
	},
	clear: () => {
		slices.forEach((item) => {
			item.slice.remove();
		});
	}
};

export default toast;
