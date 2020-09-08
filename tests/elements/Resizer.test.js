import { assert } from 'type-enforcer';
import { CssSize } from 'type-enforcer-ui';
import { ORIENTATION, Resizer } from '../../index.js';
import { offsetToPixels, pixelsToOffset } from '../../src/elements/Resizer.js';
import TestUtil from '../TestUtil.js';

describe('offsetToPixels', () => {
	it('should return 0 if no offset is provided', () => {
		assert.is(offsetToPixels(undefined, 1000), 0);
	});

	it('should calculate a percent', () => {
		assert.is(offsetToPixels(new CssSize('60%'), 1000), 600);
	});

	it('should calculate a negative percent', () => {
		assert.is(offsetToPixels(new CssSize('-90%'), 1000), 100);
	});

	it('should return a pixel value', () => {
		assert.is(offsetToPixels(new CssSize('200px'), 1000), 200);
	});

	it('should do something', () => {
		assert.is(offsetToPixels(new CssSize('-200px'), 1000), 800);
	});
});

describe('pixelsToOffset', () => {
	it('should return 0 if no offset is provided', () => {
		assert.is(pixelsToOffset(undefined, 300, 1000), 0);
	});

	it('should calculate a percent', () => {
		assert.is(pixelsToOffset(new CssSize('60%'), 100, 1000), '10%');
	});

	it('should calculate a negative percent', () => {
		assert.is(pixelsToOffset(new CssSize('-90%'), 400, 1000), '-60%');
	});

	it('should return a pixel value', () => {
		assert.is(pixelsToOffset(new CssSize('200px'), 215, 1000), '215px');
	});

	it('should do something', () => {
		assert.is(pixelsToOffset(new CssSize('-200px'), 215, 1000), '-785px');
	});
});

describe('Resizer', () => {
	const testUtil = new TestUtil(Resizer);
	testUtil.run({
		skipTests: ['height', 'width'],
		mainCssClass: 'resizer'
	});

	beforeEach(() => {
		testUtil.container.element.style.width = '1000px';
		testUtil.container.element.style.height = '800px';
	});

	describe('.orientation', () => {
		testUtil.testMethod({
			methodName: 'orientation',
			defaultValue: 'horizontal',
			testValue: 'vertical',
			testValueClass: [{
				class: 'horizontal',
				testValue: 'horizontal'
			}, {
				class: 'vertical',
				testValue: 'vertical'
			}]
		});
	});

	describe('orientation Horizontal', () => {
		describe('.splitOffset', () => {
			it('should render at offset 0 be default', () => {
				testUtil.control = new Resizer({
					container: testUtil.container,
					orientation: ORIENTATION.HORIZONTAL
				});

				assert.equal(testUtil.getComputedTranslateXY('.resizer'), []);
			});

			it('should render at a positive pixel offset', () => {
				testUtil.control = new Resizer({
					container: testUtil.container,
					orientation: ORIENTATION.HORIZONTAL,
					splitOffset: '2rem'
				});

				assert.equal(testUtil.getComputedTranslateXY('.resizer'), [0, 32]);
			});

			it('should render at a negative pixel offset', () => {
				testUtil.control = new Resizer({
					container: testUtil.container,
					orientation: ORIENTATION.HORIZONTAL,
					splitOffset: '-2rem'
				});

				assert.equal(testUtil.getComputedTranslateXY('.resizer'), [0, 768]);
			});

			it('should render at a positive percent offset', () => {
				testUtil.control = new Resizer({
					container: testUtil.container,
					orientation: ORIENTATION.HORIZONTAL,
					splitOffset: '30%'
				});

				assert.equal(testUtil.getComputedTranslateXY('.resizer'), [0, 240]);
			});

			it('should render at a negative percent offset', () => {
				testUtil.control = new Resizer({
					container: testUtil.container,
					orientation: ORIENTATION.HORIZONTAL,
					splitOffset: '-30%'
				});

				assert.equal(testUtil.getComputedTranslateXY('.resizer'), [0, 560]);
			});

			it('should move the resizer when splitOffset is reset', () => {
				testUtil.control = new Resizer({
					container: testUtil.container,
					orientation: ORIENTATION.HORIZONTAL,
					splitOffset: '-30%'
				});

				assert.equal(testUtil.getComputedTranslateXY('.resizer'), [0, 560]);

				testUtil.control.splitOffset('2rem');

				assert.equal(testUtil.getComputedTranslateXY('.resizer'), [0, 32]);
			});
		});

		describe('.minOffset .maxOffset', () => {
			it('should render at minOffset', () => {
				testUtil.control = new Resizer({
					container: testUtil.container,
					orientation: ORIENTATION.HORIZONTAL,
					minOffset: '1rem'
				});

				assert.equal(testUtil.getComputedTranslateXY('.resizer'), [0, 16]);
			});

			it('should render at a positive pixel offset', () => {
				testUtil.control = new Resizer({
					container: testUtil.container,
					orientation: ORIENTATION.HORIZONTAL,
					splitOffset: '2rem',
					minOffset: '3rem'
				});

				assert.equal(testUtil.getComputedTranslateXY('.resizer'), [0, 48]);
			});

			it('should render at a negative pixel offset', () => {
				testUtil.control = new Resizer({
					container: testUtil.container,
					orientation: ORIENTATION.HORIZONTAL,
					splitOffset: '-2rem',
					maxOffset: '-3rem'
				});

				assert.equal(testUtil.getComputedTranslateXY('.resizer'), [0, 752]);
			});

			it('should render at a positive percent offset', () => {
				testUtil.control = new Resizer({
					container: testUtil.container,
					orientation: ORIENTATION.HORIZONTAL,
					splitOffset: '30%',
					minOffset: '40%'
				});

				assert.equal(testUtil.getComputedTranslateXY('.resizer'), [0, 320]);
			});

			it('should render at a negative percent offset', () => {
				testUtil.control = new Resizer({
					container: testUtil.container,
					orientation: ORIENTATION.HORIZONTAL,
					splitOffset: '-30%',
					maxOffset: '-40%'
				});

				assert.equal(testUtil.getComputedTranslateXY('.resizer'), [0, 480]);
			});

			it('should move the resizer when splitOffset is reset', () => {
				testUtil.control = new Resizer({
					container: testUtil.container,
					orientation: ORIENTATION.HORIZONTAL,
					splitOffset: '-30%',
					minOffset: '3rem',
					maxOffset: '-40%'
				});

				assert.equal(testUtil.getComputedTranslateXY('.resizer'), [0, 480]);

				testUtil.control.splitOffset('2rem');

				assert.equal(testUtil.getComputedTranslateXY('.resizer'), [0, 48]);
			});
		});
	});

	describe('orientation Vertical', () => {
		describe('.splitOffset', () => {
			it('should render at offset 0 be default', () => {
				testUtil.control = new Resizer({
					container: testUtil.container,
					orientation: ORIENTATION.VERTICAL
				});

				assert.equal(testUtil.getComputedTranslateXY('.resizer'), []);
			});

			it('should render at a positive pixel offset', () => {
				testUtil.control = new Resizer({
					container: testUtil.container,
					orientation: ORIENTATION.VERTICAL,
					splitOffset: '2rem'
				});

				assert.equal(testUtil.getComputedTranslateXY('.resizer'), [32, 0]);
			});

			it('should render at a negative pixel offset', () => {
				testUtil.control = new Resizer({
					container: testUtil.container,
					orientation: ORIENTATION.VERTICAL,
					splitOffset: '-2rem'
				});

				assert.equal(testUtil.getComputedTranslateXY('.resizer'), [968, 0]);
			});

			it('should render at a positive percent offset', () => {
				testUtil.control = new Resizer({
					container: testUtil.container,
					orientation: ORIENTATION.VERTICAL,
					splitOffset: '30%'
				});

				assert.equal(testUtil.getComputedTranslateXY('.resizer'), [300, 0]);
			});

			it('should render at a negative percent offset', () => {
				testUtil.control = new Resizer({
					container: testUtil.container,
					orientation: ORIENTATION.VERTICAL,
					splitOffset: '-30%'
				});

				assert.equal(testUtil.getComputedTranslateXY('.resizer'), [700, 0]);
			});

			it('should move the resizer when splitOffset is reset', () => {
				testUtil.control = new Resizer({
					container: testUtil.container,
					orientation: ORIENTATION.VERTICAL,
					splitOffset: '-30%'
				});

				assert.equal(testUtil.getComputedTranslateXY('.resizer'), [700, 0]);

				testUtil.control.splitOffset('2rem');

				assert.equal(testUtil.getComputedTranslateXY('.resizer'), [32, 0]);
			});
		});

		describe('.minOffset .maxOffset', () => {
			it('should render at minOffset', () => {
				testUtil.control = new Resizer({
					container: testUtil.container,
					orientation: ORIENTATION.VERTICAL,
					minOffset: '1rem'
				});

				assert.equal(testUtil.getComputedTranslateXY('.resizer'), [16, 0]);
			});

			it('should render at a positive pixel offset', () => {
				testUtil.control = new Resizer({
					container: testUtil.container,
					orientation: ORIENTATION.VERTICAL,
					splitOffset: '2rem',
					minOffset: '3rem'
				});

				assert.equal(testUtil.getComputedTranslateXY('.resizer'), [48, 0]);
			});

			it('should render at a negative pixel offset', () => {
				testUtil.control = new Resizer({
					container: testUtil.container,
					orientation: ORIENTATION.VERTICAL,
					splitOffset: '-2rem',
					maxOffset: '-3rem'
				});

				assert.equal(testUtil.getComputedTranslateXY('.resizer'), [952, 0]);
			});

			it('should render at a positive percent offset', () => {
				testUtil.control = new Resizer({
					container: testUtil.container,
					orientation: ORIENTATION.VERTICAL,
					splitOffset: '30%',
					minOffset: '40%'
				});

				assert.equal(testUtil.getComputedTranslateXY('.resizer'), [400, 0]);
			});

			it('should render at a negative percent offset', () => {
				testUtil.control = new Resizer({
					container: testUtil.container,
					orientation: ORIENTATION.VERTICAL,
					splitOffset: '-30%',
					maxOffset: '-40%'
				});

				assert.equal(testUtil.getComputedTranslateXY('.resizer'), [600, 0]);
			});

			it('should move the resizer when splitOffset is reset', () => {
				testUtil.control = new Resizer({
					container: testUtil.container,
					orientation: ORIENTATION.VERTICAL,
					splitOffset: '-30%',
					minOffset: '3rem',
					maxOffset: '-40%'
				});

				assert.equal(testUtil.getComputedTranslateXY('.resizer'), [600, 0]);

				testUtil.control.splitOffset('2rem');

				assert.equal(testUtil.getComputedTranslateXY('.resizer'), [48, 0]);
			});
		});
	});
});
