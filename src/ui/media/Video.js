import { applySettings, method } from 'type-enforcer';
import dom from '../../utility/dom';
import Control from '../Control';
import controlTypes from '../controlTypes';
import Source from './Source';

const IS_PLAYING = Symbol();
const SOURCES = Symbol();
const SECONDS_PER_FRAME = Symbol();

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
		self[IS_PLAYING] = false;
		self[SOURCES] = [];
		self[SECONDS_PER_FRAME] = 0;

		applySettings(self, settings);

		self.on({
			loadedmetadata: () => {
				self.onReady().trigger(null, [self.duration()], self);
			},
			timeupdate: () => {
				self.onTimeUpdate().trigger(null, [self.currentTime()], self);
			},
			ended: () => {
				self[IS_PLAYING] = false;
				self.onPause().trigger(null, [], self);
			},
			error: () => {
				self.onError().trigger(null, [self.element().error], self);
			}
		});
	}

	play() {
		const self = this;

		self[IS_PLAYING] = true;
		self.element().play();
		self.onPlay().trigger(null, [], self);
	}

	pause() {
		const self = this;

		self[IS_PLAYING] = false;
		self.element().pause();
		self.onPause().trigger(null, [], self);
	}

	nextFrame() {
		const self = this;

		if (!self[IS_PLAYING]) {
			self.currentTime(Math.min(self.currentTime() + self[SECONDS_PER_FRAME], self.duration()));
		}
	}

	prevFrame() {
		const self = this;

		if (!self[IS_PLAYING]) {
			self.currentTime(Math.max(self.currentTime() - self[SECONDS_PER_FRAME], 0));
		}
	}

	get isPlaying() {
		return this[IS_PLAYING];
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
				self[SOURCES] = sources.map((source) => new Source({
					container: self,
					attr: {
						src: source.source || source,
						type: source.type || ''
					}
				}));
			}
			else {
				self.attr('src', sources[0].source || sources[0]);
			}
		}
	}),
	onReady: method.queue(),
	onTimeUpdate: method.queue(),
	onError: method.queue(),
	onPlay: method.queue(),
	onPause: method.queue(),
	fps: method.number({
		set: function(fps) {
			this[SECONDS_PER_FRAME] = 1 / fps;
		}
	}),
	currentTime: methodProperty('currentTime'),
	volume: methodProperty('volume'),
	duration: methodProperty('duration'),
	muted: methodProperty('muted')
});
