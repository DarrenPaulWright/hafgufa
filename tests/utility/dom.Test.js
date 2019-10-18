import { assert } from 'chai';
import { forOwn } from 'object-agent';
import { INITIAL } from 'type-enforcer';
import { ABSOLUTE, BODY, BORDER_BOX, dom } from '../../src';

describe('dom', () => {
	describe('.get', () => {
		const testWrapper = document.createElement('div');
		BODY.appendChild(testWrapper);
		const testElement = document.createElement('div');
		testWrapper.appendChild(testElement);

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
			BODY.appendChild(testWrapper);
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
