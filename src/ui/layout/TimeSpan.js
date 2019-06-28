import { method, PERCENT, PIXELS } from 'type-enforcer';
import { BOTTOM, LEFT, TOP } from '../../utility/domConstants';
import objectHelper from '../../utility/objectHelper';
import ControlRecycler from '../ControlRecycler';
import Div from '../elements/Div';
import Heading from '../elements/Heading';
import Container from '../layout/Container';
import './TimeSpan.less';

const HEADING = Symbol();
const TICK_RECYCLER = Symbol();

export default class TimeSpan extends Container {
	constructor(settings = {}) {
		settings.type = settings.type || 'timeSpan';
		settings.subSpans = settings.subSpans || 1;

		super(settings);

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

		objectHelper.applySettings(self, settings);

		self
			.onResize(() => {
				const lineOffset = self.lineOffset();

				if (lineOffset.toPixels(true) < 0) {
					this[HEADING].css(BOTTOM, -lineOffset.toPixels(true) - this[HEADING].borderHeight() + PIXELS);
				}
				else {
					this[HEADING].css(TOP, lineOffset.toPixels());
				}
			})
			.onRemove(() => {
				self[HEADING].remove();
				self[TICK_RECYCLER].remove();
			});
	}
}

Object.assign(TimeSpan.prototype, {
	title: method.string({
		set: function(title) {
			this[HEADING].title(title);
		}
	}),
	subTitle: method.string({
		set: function(subTitle) {
			this[HEADING].subTitle(subTitle);
		}
	}),
	subSpans: method.integer({
		min: 1,
		set: function(subSpans) {
			const self = this;
			const tickWidth = 100 / subSpans;

			if (!self.isRemoved) {
				self[TICK_RECYCLER].discardAllControls();

				for (let index = 0; index < subSpans; index++) {
					self[TICK_RECYCLER]
						.getRecycledControl()
						.container(self[HEADING])
						.ID(`tick_${index}`)
						.classes('sub', !!index)
						.css(LEFT, (tickWidth * index) + PERCENT);
				}
			}
		}
	}),
	lineOffset: method.cssSize({
		set: function() {
			this.resize();
		}
	})
});
