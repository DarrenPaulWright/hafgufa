import { easeQuadIn, interpolateNumber, max, select, selection } from 'd3';
import { isElement, isString } from 'type-enforcer';
import dom from './dom';
import { DIV, OPACITY, WINDOW } from './domConstants';

export const DRAG_START_EVENT = 'start';
export const DRAG_MOVE_EVENT = 'drag';
export const DRAG_END_EVENT = 'end';

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
		return select(element.contentContainer());
	}
	else if (element && element.elementD3) {
		return element.elementD3();
	}
	else if (element && element.element) {
		return select(element.element());
	}
	else if (isString(element)) {
		return select(dom.find(element));
	}

	return null;
};

const d3Helper = {
	ANIMATION_DURATION: ANIMATION_DURATION,
	SLOW_ANIMATION_DURATION: SLOW_ANIMATION_DURATION,
	appendNewTo: function(container, className, element) {
		if (!(container instanceof selection)) {
			container = getElement(container, true);
		}
		return container
			.append(element || DIV)
			.classed(className, true);
	},
	linearGradient: function(ID, svg, point1, point2, stops) {
		let gradient = svg.append('defs')
			.append('linearGradient')
			.attr('id', ID)
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
	animate: function(selection, duration) {
		return getElement(selection).transition()
			.duration(duration || ANIMATION_DURATION)
			.ease(EASE);
	},
	fade: function(selection, duration, opacity) {
		return d3Helper.animate(selection, duration)
			.style(OPACITY, opacity);
	},
	propertyTween: function(property, value) {
		return function() {
			const element = this;
			const interpolator = interpolateNumber(element[property], value);

			return (t) => {
				element[property] = interpolator(t);
			};
		};
	},
	maxTextWidth: function(selection) {
		return max(selection.nodes(), (t) => t.getComputedTextLength ? t.getComputedTextLength() : 0) || 0;
	},
	maxTextHeight: function(selection) {
		return max(selection.nodes(), (t) => parseInt(WINDOW.getComputedStyle(t).fontSize, 10)) || 0;
	}
};

export default d3Helper;
