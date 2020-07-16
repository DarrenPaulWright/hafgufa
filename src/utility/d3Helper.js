import { easeQuadIn, interpolateNumber, max, select, selection } from 'd3';
import { isElement, isString } from 'type-enforcer-ui';
import { DOCUMENT, OPACITY, WINDOW } from './domConstants.js';

const EASE = easeQuadIn;
const ANIMATION_DURATION = 200;
const SLOW_ANIMATION_DURATION = 500;

const getElement = (element, isContainer = false) => {
	if (element instanceof selection) {
		return element;
	}
	if (isElement(element) || element === WINDOW) {
		return select(element);
	}
	else if (isContainer && element && element.contentContainer) {
		return select(element.contentContainer.element);
	}
	else if (element && element.element) {
		return select(element.element);
	}
	else if (isString(element)) {
		return select(DOCUMENT.querySelector(element));
	}

	return null;
};

const d3Helper = {
	ANIMATION_DURATION: ANIMATION_DURATION,
	SLOW_ANIMATION_DURATION: SLOW_ANIMATION_DURATION,
	linearGradient(id, svg, point1, point2, stops) {
		let gradient = svg.append('defs')
			.append('linearGradient')
			.attr('id', id)
			.attr('x1', point1.x)
			.attr('y1', point1.y)
			.attr('x2', point2.x)
			.attr('y2', point2.y)
			.attr('spreadMethod', 'pad');

		stops.forEach((stop) => {
			gradient.append('stop')
				.attr('offset', stop.offset + '%')
				.attr('stop-color', stop.color)
				.attr('stop-opacity', stop.opacity);
		});

		gradient = null;
	},
	animate(selection, duration) {
		return getElement(selection).transition()
			.duration(duration || ANIMATION_DURATION)
			.ease(EASE);
	},
	fade(selection, duration, opacity) {
		return d3Helper.animate(selection, duration)
			.style(OPACITY, opacity);
	},
	propertyTween(property, value) {
		return function() {
			const element = this;
			const interpolator = interpolateNumber(element[property], value);

			return (t) => {
				element[property] = interpolator(t);
			};
		};
	},
	maxTextWidth(selection) {
		return max(selection.nodes(), (t) => t.getComputedTextLength ? t.getComputedTextLength() : 0) || 0;
	},
	maxTextHeight(selection) {
		return max(selection.nodes(), (t) => parseInt(WINDOW.getComputedStyle(t).fontSize, 10)) || 0;
	}
};

export default d3Helper;
