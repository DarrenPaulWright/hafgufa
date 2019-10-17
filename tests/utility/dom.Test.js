import { assert } from 'chai';
import { forOwn } from 'object-agent';
import { INITIAL, isElement } from 'type-enforcer';
import { ABSOLUTE, BODY, BORDER_BOX, dom } from '../../src';
import TestUtil from '../TestUtil';

describe('dom', () => {
	const testUtil = new TestUtil(dom);

	describe('.buildNew', () => {
		it('should build a div when buildNew is called without any parameters', () => {
			const div = dom.buildNew();

			assert.equal(div.tagName, 'DIV');
		});

		it('should return a DOM element when buildNew is called without any parameters', () => {
			const div = dom.buildNew();

			assert.isTrue(isElement(div));
		});

		it('should build a span when buildNew is called with \'span\' provided as the element', () => {
			const span = dom.buildNew('', 'span');

			assert.equal(span.tagName, 'SPAN');
		});

		it('should build a div with two classes when buildNew is called with two classes provided', () => {
			const div = dom.buildNew('test1 test2');

			assert.isTrue(div.classList.contains('test1') && div.classList.contains('test2'));
		});

		it('should build a span with a class when buildNew is called with \'span\' provided as the element', () => {
			const span = dom.buildNew('test1', 'span');

			assert.isTrue(span.classList.contains('test1'));
		});

		it('should build an svg element when buildNew is called with \'svg:svg\' provided as the element', () => {
			const svg = dom.buildNew('', 'svg:svg');

			assert.equal(svg.tagName, 'svg');
		});
	});

	const runAppendNew_DefaultTests = (methodName) => {
		it('should return a DOM element', () => {
			const div = dom.appendNewTo(testUtil.container);
			const div2 = dom[methodName](div);

			assert.isTrue(isElement(div2));
		});

		it('should build an element with a class', () => {
			const div = dom.appendNewTo(testUtil.container);
			dom[methodName](div, 'test-class');

			assert.equal(testUtil.count('.test-class'), 1);
		});

		it('should build an element with a class of a specific element type', () => {
			const div = dom.appendNewTo(testUtil.container);
			dom[methodName](div, 'test-class', 'button');

			assert.equal(testUtil.count('button.test-class'), 1);
		});
	};

	describe('.appendNewTo', () => {
		runAppendNew_DefaultTests('appendNewTo');

		it('should build a new DOM element and add it as the last child of the container', () => {
			const container = testUtil.container;
			dom.appendNewTo(container);
			const span = dom.appendNewTo(container, undefined, 'span');

			assert.equal(container.children[1], span);
		});
	});

	describe('.prependTo', () => {
		it('should NOT prepend an element if the first argument is a string', () => {
			const element = dom.buildNew('test_class', 'div');

			dom.prependTo('.test_class', element);

			assert.equal(testUtil.container.childNodes.length, 0);
		});

		it('should NOT prepend an element if the second argument is a string', () => {
			const container = dom.appendNewTo(testUtil.container, null, 'div');

			dom.prependTo(container, '.test_class');

			assert.equal(container.childNodes.length, 0);
		});
	});

	describe('.appendTo', () => {
		it('should NOT append an element if the first argument is a string', () => {
			const element = dom.buildNew('test_class', 'div');

			dom.appendTo('.test_class', element);

			assert.equal(testUtil.container.childNodes.length, 0);
		});

		it('should NOT append an element if the second argument is a string', () => {
			const container = dom.appendNewTo(testUtil.container, null, 'div');

			dom.appendTo(container, '.test_class');

			assert.equal(container.childNodes.length, 0);
		});
	});

	describe('.appendBefore', () => {
		it('should NOT append an element if the first argument is a string', () => {
			const element = dom.buildNew('test_class', 'div');

			dom.appendBefore('.test_class', element);

			assert.equal(testUtil.container.childNodes.length, 0);
		});

		it('should NOT append an element if the second argument is a string', () => {
			const container = dom.appendNewTo(testUtil.container, null, 'div');

			dom.appendBefore(container, '.test_class');

			assert.equal(container.childNodes.length, 0);
		});
	});

	describe('.appendAfter', () => {
		it('should NOT append an element if the first argument is a string', () => {
			const element = dom.buildNew('test_class', 'div');

			dom.appendAfter('.test_class', element);

			assert.equal(testUtil.container.childNodes.length, 0);
		});

		it('should NOT append an element if the second argument is a string', () => {
			const container = dom.appendNewTo(testUtil.container);

			dom.appendAfter(container, '.test_class');

			assert.equal(container.childNodes.length, 0);
		});
	});

	describe('.prepDomIdString', () => {
		it('should strip characters that can\'t be in an elements id', () => {
			const idString = 'TestId1234567890 -=.,/\;:"_+';
			const preppedIdString = 'TestId1234567890-.:_';

			assert.equal(dom.prepDomIdString(idString), preppedIdString);
		});
	});

	describe('.addClass', () => {
		it('should do nothing if the second argument is not provided', () => {
			const div = dom.appendNewTo(testUtil.container);
			dom.addClass(div, 'test1');
			dom.addClass(div);

			assert.equal(testUtil.count('.test1'), 1);
		});

		it('should add a class to an element', () => {
			const div = dom.appendNewTo(testUtil.container);
			dom.addClass(div, 'test1');

			assert.equal(testUtil.count('.test1'), 1);
		});

		it('should add a class to an SVG element', () => {
			const div = dom.appendNewTo(testUtil.container, null, 'svg:svg');
			dom.addClass(div, 'test1');

			assert.equal(testUtil.count('.test1'), 1);
		});

		it('should add a class to an element that already has a class', () => {
			const div = dom.appendNewTo(testUtil.container);
			dom.addClass(div, 'test1');
			dom.addClass(div, 'test2');

			assert.equal(testUtil.count('.test1.test2'), 1);
		});

		it('should add two classes to an element if two are provided', () => {
			const div = dom.appendNewTo(testUtil.container);
			dom.addClass(div, 'test1 test2');

			assert.equal(testUtil.count('.test1.test2'), 1);
		});
	});

	describe('.removeClass', () => {
		it('should do nothing if the second argument is not provided', () => {
			const body = testUtil.container;
			const div = dom.appendNewTo(body);
			dom.addClass(div, 'test1');
			dom.removeClass(div);

			assert.equal(testUtil.count('.test1'), 1);
		});

		it('should remove a class from an element', () => {
			const body = testUtil.container;
			const div = dom.appendNewTo(body);
			dom.addClass(div, 'test1');
			dom.removeClass(div, 'test1');

			assert.equal(testUtil.count('.test1'), 0);
		});

		it('should remove a class from an SVG element', () => {
			const body = testUtil.container;
			const div = dom.appendNewTo(body, null, 'svg:svg');
			dom.addClass(div, 'test1');
			dom.removeClass(div, 'test1');

			assert.equal(testUtil.count('.test1'), 0);
		});

		it('should remove a class from an element that has more than one class', () => {
			const body = testUtil.container;
			const div = dom.appendNewTo(body);
			dom.addClass(div, 'test1 test2');
			dom.removeClass(div, 'test1');

			assert.equal(testUtil.count('.test2'), 1);
		});

		it('should remove two classes from an element if two are provided', () => {
			const body = testUtil.container;
			const div = dom.appendNewTo(body);
			dom.addClass(div, 'test1 test2');
			dom.removeClass(div, 'test1 test2');

			assert.equal(testUtil.count('.test1.test2'), 0);
		});
	});

	describe('.classes', () => {
		it('should add a class to an element if the third argument is not provided', () => {
			const body = testUtil.container;
			const div = dom.appendNewTo(body);
			dom.classes(div, 'test1');

			assert.equal(testUtil.count('.test1'), 1);
		});

		it('should add a class to an element if the third argument is true', () => {
			const body = testUtil.container;
			const div = dom.appendNewTo(body);
			dom.classes(div, 'test1', true);

			assert.equal(testUtil.count('.test1'), 1);
		});

		it('should add a class to an element that already has a class', () => {
			const body = testUtil.container;
			const div = dom.appendNewTo(body);
			dom.classes(div, 'test1');
			dom.classes(div, 'test2');

			assert.equal(testUtil.count('.test1.test2'), 1);
		});

		it('should remove a class from an element if the third argument is false', () => {
			const body = testUtil.container;
			const div = dom.appendNewTo(body);
			dom.classes(div, 'test1', true);
			dom.classes(div, 'test1', false);

			assert.equal(testUtil.count('.test1'), 0);
		});
	});

	describe('.get', () => {
		const testWrapper = dom.buildNew();
		dom.appendTo(BODY, testWrapper);
		const testElement = dom.buildNew();
		dom.appendTo(testWrapper, testElement);

		BODY.style.padding = '0';

		forOwn({
			position: ABSOLUTE,
			'box-sizing': BORDER_BOX,
			top: '300px',
			left: '400px'
		}, (value, key) => {
			testWrapper.style[key] = value;
		});

		forOwn({
			position: ABSOLUTE,
			'box-sizing': BORDER_BOX,
			height: '100px',
			width: '200px',
			'margin-top': '10px',
			'margin-right': '20px',
			'margin-bottom': '30px',
			'margin-left': '40px',
			'padding-top': '5px',
			'padding-right': '6px',
			'padding-bottom': '7px',
			'padding-left': '8px',
			'border-top-width': '1px',
			'border-right-width': '2px',
			'border-bottom-width': '3px',
			'border-left-width': '4px',
			'border-color': 'red',
			'border-style': 'solid',
			'line-height': '67px',
			top: '300px',
			left: '400px'
		}, (value, key) => {
			testElement.style[key] = value;
		});

		beforeEach(() => {
			dom.appendTo(BODY, testWrapper);
		});

		afterEach(() => {
			BODY.style.padding = INITIAL;
		});

		describe('.width', () => {
			it('should calculate properly', () => {
				assert.equal(dom.get.width(testElement), 200);
			});
		});

		describe('.height', () => {
			it('should calculate properly', () => {
				assert.equal(dom.get.height(testElement), 100);
			});
		});

		describe('.top', () => {
			it('should calculate properly', () => {
				assert.equal(dom.get.top(testElement), 310);
			});
			it('should calculate properly if the second argument is true', () => {
				assert.equal(dom.get.top(testElement, true), 610);
			});
		});

		describe('.left', () => {
			it('should calculate properly', () => {
				assert.equal(dom.get.left(testElement), 440);
			});
			it('should calculate properly if the second argument is true', () => {
				assert.equal(dom.get.left(testElement, true), 840);
			});
		});

		describe('.outerWidth', () => {
			it('should calculate properly', () => {
				assert.equal(dom.get.outerWidth(testElement), 260);
			});
		});

		describe('.outerHeight', () => {
			it('should calculate properly', () => {
				assert.equal(dom.get.outerHeight(testElement), 140);
			});
		});

		describe('.borders', () => {
			describe('.width', () => {
				it('should calculate properly', () => {
					assert.equal(dom.get.borders.width(testElement), 6);
				});
			});

			describe('.height', () => {
				it('should calculate properly', () => {
					assert.equal(dom.get.borders.height(testElement), 4);
				});
			});
		});

		describe('.margins', () => {
			describe('.width', () => {
				it('should calculate properly', () => {
					assert.equal(dom.get.margins.width(testElement), 60);
				});
			});

			describe('.height', () => {
				it('should calculate properly', () => {
					assert.equal(dom.get.margins.height(testElement), 40);
				});
			});
		});

		describe('.paddings', () => {
			describe('.width', () => {
				it('should calculate properly', () => {
					assert.equal(dom.get.paddings.width(testElement), 14);
				});
			});

			describe('.height', () => {
				it('should calculate properly', () => {
					assert.equal(dom.get.paddings.height(testElement), 12);
				});
			});
		});

		describe('.lineHeight', () => {
			it('should calculate properly', () => {
				assert.equal(dom.get.lineHeight(testElement), 67);
			});
		});
	});
});
