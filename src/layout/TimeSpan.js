import { repeat } from 'object-agent';
import { applySettings, methodCssSize, methodInteger, methodString, PERCENT, PIXELS } from 'type-enforcer-ui';
import ControlRecycler from '../ControlRecycler.js';
import controlTypes from '../controlTypes.js';
import Div from '../elements/Div.js';
import Heading from '../elements/Heading.js';
import Container from '../layout/Container.js';
import { BOTTOM, LEFT, TOP } from '../utility/domConstants.js';
import setDefaults from '../utility/setDefaults.js';
import './TimeSpan.less';

const HEADING = Symbol();
const TICK_RECYCLER = Symbol();

export default class TimeSpan extends Container {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.TIME_SPAN,
			subSpans: 1
		}, settings));

		const self = this;
		self.addClass('time-span');

		self[HEADING] = new Heading({
			container: self,
			width: '100%'
		});

		self[TICK_RECYCLER] = new ControlRecycler({
			control: Div,
			defaultSettings: {
				classes: 'tick'
			}
		});

		applySettings(self, settings);

		self
			.onResize(() => {
				const lineOffset = self.lineOffset();

				if (lineOffset) {
					if (lineOffset.toPixels(true) < 0) {
						this[HEADING].css(BOTTOM, -lineOffset.toPixels(true) - this[HEADING].borderHeight() + PIXELS);
					}
					else {
						this[HEADING].css(TOP, lineOffset.toPixels());
					}
				}
			})
			.onRemove(() => {
				self[TICK_RECYCLER].remove();
			});
	}
}

Object.assign(TimeSpan.prototype, {
	title: methodString({
		set(title) {
			this[HEADING].title(title);
		}
	}),
	subTitle: methodString({
		set(subTitle) {
			this[HEADING].subTitle(subTitle);
		}
	}),
	subSpans: methodInteger({
		min: 1,
		set(subSpans) {
			const self = this;

			if (!self.isRemoved) {
				const tickWidth = 100 / subSpans;
				const isEven = subSpans % 2 === 0;
				const secondaryIndex = isEven ? Math.ceil(subSpans / 2) : subSpans + 1;

				self[TICK_RECYCLER].discardAllControls();

				repeat(subSpans, (index) => {
					self[TICK_RECYCLER]
						.getRecycledControl()
						.container(self[HEADING])
						.id(`tick_${index}`)
						.classes('primary', index === 0)
						.classes('secondary', index === secondaryIndex)
						.css(LEFT, (tickWidth * index) + PERCENT);
				});
			}
		}
	}),
	lineOffset: methodCssSize({
		set: 'resize'
	})
});
