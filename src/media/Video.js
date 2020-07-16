import { applySettings, methodArray, methodBoolean, methodNumber, methodQueue } from 'type-enforcer-ui';
import Control from '../Control.js';
import controlTypes from '../controlTypes.js';
import setDefaults from '../utility/setDefaults.js';
import Source from './Source.js';

const IS_PLAYING = Symbol();
const SOURCES = Symbol();
const SECONDS_PER_FRAME = Symbol();

const methodProperty = (property) => function(value) {
	if (arguments.length) {
		this.element[property] = value;
		return this;
	}
	return this.element[property];
};

export default class Video extends Control {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.VIDEO,
			element: 'video'
		}, settings));

		const self = this;
		self[IS_PLAYING] = false;
		self[SOURCES] = [];
		self[SECONDS_PER_FRAME] = 0;

		applySettings(self, settings);

		self.on({
			loadedmetadata() {
				self.onReady().trigger(null, [self.duration()]);
			},
			timeupdate() {
				self.onTimeUpdate().trigger(null, [self.currentTime()]);
			},
			ended() {
				self[IS_PLAYING] = false;
				self.onPause().trigger();
			},
			error() {
				self.onError().trigger(null, [self.element.error]);
			}
		});
	}

	play() {
		const self = this;

		self[IS_PLAYING] = true;
		self.element.play();
		self.onPlay().trigger();
	}

	pause() {
		const self = this;

		self[IS_PLAYING] = false;
		self.element.pause();
		self.onPause().trigger();
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
	showControls: methodBoolean({
		set(showControls) {
			this.element.controls = showControls;
		}
	}),
	sources: methodArray({
		init: [],
		before() {
			const self = this;

			self[SOURCES].forEach((source) => {
				source.remove();
			});
			self[SOURCES].length = 0;

			self.element.textContent = '';
		},
		set(sources) {
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
	onReady: methodQueue(),
	onTimeUpdate: methodQueue(),
	onError: methodQueue(),
	onPlay: methodQueue(),
	onPause: methodQueue(),
	fps: methodNumber({
		set(fps) {
			this[SECONDS_PER_FRAME] = 1 / fps;
		}
	}),
	currentTime: methodProperty('currentTime'),
	volume: methodProperty('volume'),
	duration: methodProperty('duration'),
	muted: methodProperty('muted')
});
