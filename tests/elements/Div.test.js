import { assert } from 'type-enforcer';
import { Button, Div } from '../../index.js';
import TestUtil from '../TestUtil.js';

describe('Div', () => {
	const testUtil = new TestUtil(Div);
	testUtil.run();

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

			assert.is(testUtil.control.get(buttonId), button);
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

			assert.is(testUtil.control.get(buttonId), button);
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

			assert.is(testUtil.nth('button', 1), button2.element);
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

			assert.is(testUtil.nth('button', 0), button2.element);
		});
	});
});
