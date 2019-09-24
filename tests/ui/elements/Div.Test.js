import { assert } from 'chai';
import { Button, Div } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

describe('Div', () => {
	const testUtil = new TestUtil(Div);
	const controlTests = new ControlTests(Div, testUtil);

	controlTests.run();

	describe('.get', () => {
		it('should find a control inside the container', () => {
			const buttonId = 'testId';
			const button = new Button({
				id: buttonId
			});
			testUtil.control = new Div({
				container: testUtil.container,
				content: button
			});

			assert.equal(testUtil.control.get(buttonId), button);
		});

		it('should find a control inside another container', () => {
			const buttonId = 'testId';
			const button = new Button({
				id: buttonId
			});
			testUtil.control = new Div({
				container: testUtil.container,
				content: {
					control: Div,
					content: button
				}
			});

			assert.equal(testUtil.control.get(buttonId), button);
		});
	});

	describe('.append', () => {
		it('should add a control to the end', () => {
			const buttonId = 'testId';
			const buttonId2 = 'testId2';
			const button = new Button({
				id: buttonId
			});
			const button2 = new Button({
				id: buttonId2
			});
			testUtil.control = new Div({
				container: testUtil.container,
				content: button
			});

			testUtil.control.append(button2);

			assert.equal(testUtil.nth('button', 1), button2.element());
		});
	});

	describe('.prepend', () => {
		it('should add a control to the end', () => {
			const buttonId = 'testId';
			const buttonId2 = 'testId2';
			const button = new Button({
				id: buttonId
			});
			const button2 = new Button({
				id: buttonId2
			});
			testUtil.control = new Div({
				container: testUtil.container,
				content: button
			});

			testUtil.control.prepend(button2);

			assert.equal(testUtil.nth('button', 0), button2.element());
		});
	});
});
