import { applySettings, method } from 'type-enforcer';
import dom from '../../utility/dom';
import Control from '../Control';
import controlTypes from '../controlTypes';
import Source from './Source';

const SOURCES = Symbol();

const methodProperty = (property) => function(value) {
	if (arguments.length) {
		this.element()[property] = value;
		return this;
	}
	return this.element()[property];
};

export default class Video extends Control {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.VIDEO;
		settings.element = dom.buildNew(null, 'video');
		settings.skipWindowResize = true;

		super(settings);

		const self = this;
		self[SOURCES] = [];

		applySettings(self, settings);

		self.on({
			loadedmetadata: () => {
				if (self.onReady().length) {
					self.onReady().trigger(null, [self.duration()], self);
				}
			},
			timeupdate: () => {
				if (self.onTimeUpdate().length) {
					self.onTimeUpdate().trigger(null, [self.currentTime()], self);
				}
			},
			ended: () => {
				if (self.onEnd().length) {
					self.onEnd().trigger(null, [], self);
				}
			},
			error: () => {
				self.onError().trigger(null, [self.element().error], self);
			}
		});
	}

	play() {
		this.element().play();
	}

	pause() {
		this.element().pause();
	}
}

Object.assign(Video.prototype, {
	showControls: method.boolean({
		set: function(showControls) {
			this.element().controls = showControls;
		}
	}),
	sources: method.array({
		init: [],
		before: function() {
			const self = this;

			self[SOURCES].forEach((source) => {
				source.remove();
			});
			self[SOURCES].length = 0;

			self.element().textContent = '';
		},
		set: function(sources) {
			const self = this;

			if (sources.length > 1) {
				sources.forEach((source) => {
					self[SOURCES].push(new Source({
						container: self,
						attr: {
							src: source.source || source,
							type: source.type || ''
						}
					}));
				});
			}
			else {
				self.attr('src', sources[0].source || sources[0]);
			}
		}
	}),
	onReady: method.queue(),
	onTimeUpdate: method.queue(),
	onEnd: method.queue(),
	onError: method.queue(),
	currentTime: methodProperty('currentTime'),
	volume: methodProperty('volume'),
	duration: methodProperty('duration'),
	muted: methodProperty('muted')
});
