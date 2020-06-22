import keycodes from 'keycodes/index';
import { methodBoolean, methodFunction, methodQueue, Point } from 'type-enforcer-ui';
import ContextMenuMixin from '../mixins/ContextMenuMixin';
import DragMixin from '../mixins/DragMixin';
import FocusMixin from '../mixins/FocusMixin';
import MouseMixin from '../mixins/MouseMixin';
import G from '../svg/G';
import { KEY_DOWN_EVENT, TAB_INDEX, TAB_INDEX_ENABLED } from '../utility/domConstants';
import DragPoint from './DragPoint';
import './Shape.less';

const IS_RESIZING = Symbol();

const detectChange = Symbol();
export const initDragPoint = Symbol();

export default class Shape extends MouseMixin(FocusMixin(DragMixin(ContextMenuMixin(G)))) {
	constructor(settings) {
		settings.canDrag = true;
		settings.restrictVerticalDrag = true;
		settings.restrictHorizontalDrag = true;

		super(settings);

		const self = this;
		let initialBounds;

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
			.onDragStart(() => {
				initialBounds = self.bounds();
			})
			.onDrag(() => {
				self.resize(true);
			})
			.onDragEnd(() => {
				self.resize(true);
				self[detectChange](initialBounds);
			})
			.on(KEY_DOWN_EVENT, (event) => {
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
					case keycodes('delete'):
						self.onDelete().trigger();
						break;
				}

				if (edited) {
					event.preventDefault();
					self.resize(true);
				}
			});
	}

	[detectChange](initialBounds) {
		const self = this;
		const bounds = self.bounds();

		if (!(bounds[0].isSame(initialBounds[0]) && bounds[1].isSame(initialBounds[1]))) {
			self.onChange()();
		}
	}

	[initDragPoint](cursor, onDrag, isCircle = false) {
		const self = this;
		let initialBounds;

		return new DragPoint({
			container: self.container(),
			css: { cursor: cursor },
			isCircle: isCircle,
			onDragStart() {
				self[IS_RESIZING] = true;
				initialBounds = self.bounds();
			},
			onDrag: onDrag,
			onDragEnd() {
				self[IS_RESIZING] = false;
				self[detectChange](initialBounds);
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
	onChange: methodFunction(),
	onSelect: methodQueue(),
	onDelete: methodQueue(),
	isSelected: methodBoolean({
		set(isSelected) {
			this.onSelect().trigger(null, [isSelected]);
		}
	}),
	ignore: methodBoolean({
		set(ignore) {
			this.classes('ignore', ignore);
		}
	})
});
