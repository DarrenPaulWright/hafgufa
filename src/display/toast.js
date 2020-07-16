import { clear, delay } from 'async-agent';
import { List } from 'hord';
import { isNumber } from 'type-enforcer-ui';
import Div from '../elements/Div.js';
import Heading from '../elements/Heading.js';
import { CHECK_ICON, CLEAR_ICON, DELETE_ALL_ICON, DELETE_ICON, ERROR_ICON, INFO_ICON, WARNING_ICON } from '../icons.js';
import ContextMenuMixin from '../mixins/ContextMenuMixin.js';
import assign from '../utility/assign.js';
import { BODY, CLICK_EVENT, MOUSE_ENTER_EVENT, MOUSE_LEAVE_EVENT } from '../utility/domConstants.js';
import './toast.less';

let wrapper;
let currentId = 1;
const slices = new List().comparer(List.comparers.id.asc);
const REMOVE_THIS = 'removeThis';
const REMOVE_ALL = 'removeAll';

const TIMER = Symbol();
const DURATION = Symbol();

const stopTimer = Symbol();
const startTimer = Symbol();

class Slice extends ContextMenuMixin(Heading) {
	constructor(settings) {
		super(assign(settings, {
			container: wrapper,
			classes: 'toast inverse ' + settings.class,
			isInline: false,
			canWrap: true,
			fade: true,
			buttons: [{
				icon: CLEAR_ICON,
				onClick() {
					self.remove();
				}
			}]
		}));

		const self = this;
		self[DURATION] = settings.duration;

		self
			.on(CLICK_EVENT, () => {
				if (settings.onClick) {
					settings.onClick();
				}
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
				onSelect() {
					self.remove();
				}
			}, {
				id: REMOVE_ALL,
				title: 'Remove All Messages',
				icon: DELETE_ALL_ICON,
				isMultiSelect: false,
				classes: '',
				onSelect() {
					toast.clear();
				}
			}])
			.onRemove(() => {
				self[stopTimer]();
				removeSlice(settings.id);
			});

		self[startTimer]();
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

	settings.id = currentId++;

	slices.add({
		id: settings.id,
		slice: new Slice(settings)
	});
};

const removeSlice = (sliceId) => {
	slices.discard({
		id: sliceId
	});

	if (!slices.length) {
		wrapper.remove();
		wrapper = null;
	}
};

const toast = {
	info(settings) {
		addSlice({
			icon: INFO_ICON,
			class: 'toast-info',
			duration: 10,
			...settings
		});
	},
	success(settings) {
		addSlice({
			icon: CHECK_ICON,
			class: 'toast-success',
			duration: 10,
			...settings
		});
	},
	warning(settings) {
		addSlice({
			icon: WARNING_ICON,
			class: 'toast-warning',
			duration: 60,
			...settings
		});
	},
	error(settings) {
		addSlice({
			icon: ERROR_ICON,
			class: 'toast-error',
			requireClose: true,
			...settings
		});
	},
	clear() {
		slices.values().slice().forEach((item) => item.slice.remove());
	}
};

export default toast;
