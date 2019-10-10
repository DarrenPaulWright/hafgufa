import { event } from 'd3';
import keycodes from 'keycodes/index';
import { method, Point } from 'type-enforcer';
import { KEY_DOWN_EVENT, TAB_INDEX, TAB_INDEX_ENABLED } from '../../index';
import ContextMenuMixin from '../mixins/ContextMenuMixin';
import DragMixin from '../mixins/DragMixin';
import FocusMixin from '../mixins/FocusMixin';
import G from '../svg/G';
import DragPoint from './DragPoint';
import './Shape.less';

const IS_RESIZING = Symbol();

export const initDragPoint = Symbol();

export default class Shape extends FocusMixin(DragMixin(ContextMenuMixin(G))) {
	constructor(settings) {
		settings.canDrag = true;
		settings.restrictVerticalDrag = true;
		settings.restrictHorizontalDrag = true;

		super(settings);

		const self = this;
		self.addClass('shape')
			.attr(TAB_INDEX, TAB_INDEX_ENABLED)
			.onFocus(() => {
				self.isSelected(true);
			})
			.onBlur(() => {
				if (!self[IS_RESIZING]) {
					self.isSelected(false);
				}
			})
			.onDrag(() => {
				self.resize(true);
			})
			.onDragEnd(() => {
				self.resize(true)
					.onChange().call(self);
			})
			.on(KEY_DOWN_EVENT, () => {
				let edited = false;

				switch (event.keyCode) {
					case keycodes('up'):
						edited = true;
						self.top(self.top() - 1);
						break;
					case keycodes('right'):
						edited = true;
						self.left(self.left() + 1);
						break;
					case keycodes('down'):
						edited = true;
						self.top(self.top() + 1);
						break;
					case keycodes('left'):
						edited = true;
						self.left(self.left() - 1);
						break;
				}

				if (edited) {
					event.preventDefault();
					self.resize(true);
				}
			});
	}

	[initDragPoint](cursor, onDrag, isCircle = false) {
		const self = this;

		return new DragPoint({
			container: self.container(),
			css: {cursor: cursor},
			isCircle: isCircle,
			onDragStart() {
				self[IS_RESIZING] = true;
			},
			onDrag: onDrag,
			onDragEnd() {
				self[IS_RESIZING] = false;
				self.onChange().call(self);
				self.isFocused(true);
			}
		});
	}

	bounds(bounds) {
		const self = this;

		if (arguments.length) {
			const [point1, point2] = bounds;

			self.width(Math.abs(point1.x - point2.x))
				.height(Math.abs(point1.y - point2.y))
				.position(Math.min(point1.x, point2.x), Math.min(point1.y, point2.y))
				.resize(true);

			return self;
		}

		const position = self.position();

		return [position, position.add(new Point(self.width().toPixels(true), self.height().toPixels(true)))];
	}
}

Object.assign(Shape.prototype, {
	onChange: method.function(),
	onSelect: method.queue(),
	isSelected: method.boolean({
		set(isSelected) {
			this.onSelect().trigger(null, [isSelected], this);
		}
	}),
	ignore: method.boolean({
		set(ignore) {
			this.classes('ignore', ignore);
		}
	})
});
