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

	describe('.prependTo', () => {
		it('should NOT prepend an element if the first argument is a string', () => {
			const element = dom.buildNew('test_class', 'div');

			dom.prependTo('.test_class', element);

			assert.equal(testUtil.container.childNodes.length, 0);
		});

		it('should NOT prepend an element if the second argument is a string', () => {
			dom.prependTo(testUtil.container, '.test_class');

			assert.equal(testUtil.container.childNodes.length, 0);
		});
	});

	describe('.appendTo', () => {
		it('should NOT append an element if the first argument is a string', () => {
			const element = dom.buildNew('test_class', 'div');

			dom.appendTo('.test_class', element);

			assert.equal(testUtil.container.childNodes.length, 0);
		});

		it('should NOT append an element if the second argument is a string', () => {
			dom.appendTo(testUtil.container, '.test_class');

			assert.equal(testUtil.container.childNodes.length, 0);
		});
	});

	describe('.appendBefore', () => {
		it('should NOT append an element if the first argument is a string', () => {
			const element = dom.buildNew('test_class', 'div');

			dom.appendBefore('.test_class', element);

			assert.equal(testUtil.container.childNodes.length, 0);
		});

		it('should NOT append an element if the second argument is a string', () => {
			dom.appendBefore(testUtil.container, '.test_class');

			assert.equal(testUtil.container.childNodes.length, 0);
		});
	});

	describe('.appendAfter', () => {
		it('should NOT append an element if the first argument is a string', () => {
			const element = dom.buildNew('test_class', 'div');

			dom.appendAfter('.test_class', element);

			assert.equal(testUtil.container.childNodes.length, 0);
		});

		it('should NOT append an element if the second argument is a string', () => {
			dom.appendAfter(testUtil.container, '.test_class');

			assert.equal(testUtil.container.childNodes.length, 0);
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
