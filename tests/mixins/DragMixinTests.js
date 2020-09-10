import { assert } from 'type-enforcer';
import extendsTestRegister from '../extendsTestRegister.js';
import ExtendsTestRunner, { CONTROL, TEST_UTIL } from '../ExtendsTestRunner.js';

export default class DragMixinTests extends ExtendsTestRunner {
	center() {
		const self = this;

		beforeEach(() => {
			self[TEST_UTIL].container.css({
				width: '340px',
				height: '240px',
				padding: '20px',
				'box-sizing': 'border-box',
				position: 'absolute'
			});
		});

		it(`should set position when control is taller`, () => {
			self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
				width: '200px',
				height: '400px',
				canDrag: true
			}));

			self[TEST_UTIL].control.center();

			assert.is(
				self[TEST_UTIL].control.element.style.transform,
				'translate(50px, -100px)'
			);
		});

		it(`should set position when control is wider`, () => {
			self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
				width: '600px',
				height: '200px',
				canDrag: true
			}));

			self[TEST_UTIL].control.center();

			assert.is(
				self[TEST_UTIL].control.element.style.transform,
				'translate(-150px)'
			);
		});

		it(`should set position when control is smaller`, () => {
			self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
				width: '100px',
				height: '100px',
				canDrag: true
			}));

			self[TEST_UTIL].control.center();

			assert.is(
				self[TEST_UTIL].control.element.style.transform,
				'translate(100px, 50px)'
			);
		});
	}

	stretch() {
		const self = this;

		beforeEach(() => {
			self[TEST_UTIL].container.css({
				width: '340px',
				height: '240px',
				padding: '20px',
				'box-sizing': 'border-box',
				position: 'absolute'
			});
		});

		const doTests = (command, results) => {
			it(`should scale and center when set to "${command}" and is taller`, () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					width: '200px',
					height: '400px',
					canDrag: true,
					scaleMin: 0.1,
					scaleMax: 10,
					restrictVerticalDrag: false,
					restrictHorizontalDrag: false
				}));

				self[TEST_UTIL].control.stretch(command);

				assert.is(
					self[TEST_UTIL].control.element.style.transform,
					results.taller
				);
			});

			it(`should scale and center when set to "${command}" and is wider`, () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					width: '600px',
					height: '200px',
					canDrag: true,
					scaleMin: 0.1,
					scaleMax: 10,
					restrictVerticalDrag: false,
					restrictHorizontalDrag: false
				}));

				self[TEST_UTIL].control.stretch(command);

				assert.is(
					self[TEST_UTIL].control.element.style.transform,
					results.wider
				);
			});

			it(`should scale and center when set to "${command}" and is smaller`, () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					width: '100px',
					height: '100px',
					canDrag: true,
					scaleMin: 0.1,
					scaleMax: 10,
					restrictVerticalDrag: false,
					restrictHorizontalDrag: false
				}));

				self[TEST_UTIL].control.stretch(command);

				assert.is(
					self[TEST_UTIL].control.element.style.transform,
					results.smaller
				);
			});

			it(`should scale and center when set to "${command}" twice and is taller`, () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					width: '200px',
					height: '400px',
					canDrag: true,
					scaleMin: 0.1,
					scaleMax: 10,
					restrictVerticalDrag: false,
					restrictHorizontalDrag: false
				}));

				self[TEST_UTIL].control.stretch(command).stretch(command);

				assert.is(
					self[TEST_UTIL].control.element.style.transform,
					results.twice ? results.twice.taller : results.taller
				);
			});

			it(`should scale and center when set to "${command}" twice and is wider`, () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					width: '600px',
					height: '200px',
					canDrag: true,
					scaleMin: 0.1,
					scaleMax: 10,
					restrictVerticalDrag: false,
					restrictHorizontalDrag: false
				}));

				self[TEST_UTIL].control.stretch(command).stretch(command);

				assert.is(
					self[TEST_UTIL].control.element.style.transform,
					results.twice ? results.twice.wider : results.wider
				);
			});

			it(`should scale and center when set to "${command}" twice and is smaller`, () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					width: '100px',
					height: '100px',
					canDrag: true,
					scaleMin: 0.1,
					scaleMax: 10,
					restrictVerticalDrag: false,
					restrictHorizontalDrag: false
				}));

				self[TEST_UTIL].control.stretch(command).stretch(command);

				assert.is(
					self[TEST_UTIL].control.element.style.transform,
					results.twice ? results.twice.smaller : results.smaller
				);
			});
		};

		doTests('none', {
			taller: 'translate(50px, -100px)',
			wider: 'translate(-150px)',
			smaller: 'translate(100px, 50px)'
		});

		doTests('auto', {
			taller: 'translate(100px) scale(0.5)',
			wider: 'translate(0px, 50px) scale(0.5)',
			smaller: 'translate(100px, 50px)'
		});

		doTests('fit', {
			taller: 'translate(100px) scale(0.5)',
			wider: 'translate(0px, 50px) scale(0.5)',
			smaller: 'translate(50px) scale(2)'
		});

		doTests('fill', {
			taller: 'translate(0px, -200px) scale(1.5)',
			wider: 'translate(-150px)',
			smaller: 'translate(0px, -50px) scale(3)'
		});

		doTests('in', {
			taller: 'translate(-50px, -100px) scale(1.5)',
			wider: 'translate(-150px, -50px) scale(1.5)',
			smaller: 'translate(-25px, -25px) scale(1.5)',
			twice: {
				taller: 'translate(-125px, -250px) scale(2.25)',
				wider: 'translate(-375px, -125px) scale(2.25)',
				smaller: 'translate(-62.5px, -62.5px) scale(2.25)'
			}
		});

		doTests('out', {
			taller: 'translate(33.3333px, 66.6667px) scale(0.666667)',
			wider: 'translate(100px, 33.3333px) scale(0.666667)',
			smaller: 'translate(16.6667px, 16.6667px) scale(0.666667)',
			twice: {
				taller: 'translate(55.5556px, 111.111px) scale(0.444444)',
				wider: 'translate(166.667px, 55.5556px) scale(0.444444)',
				smaller: 'translate(27.7778px, 27.7778px) scale(0.444444)'
			}
		});
	}
}

extendsTestRegister.register('DragMixin', DragMixinTests);
