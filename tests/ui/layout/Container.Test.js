import { assert } from 'chai';
import { Button, Container } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

describe('Container', () => {
	const testUtil = new TestUtil(Container);
	const controlTests = new ControlTests(Container, testUtil);

	controlTests.run([], ['focus']);

	describe('.get', () => {
		it('should find a control inside the container', () => {
			const buttonId = 'testId';
			const button = new Button({
				id: buttonId
			});
			testUtil.control = new Container({
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
			testUtil.control = new Container({
				container: testUtil.container,
				content: {
					control: Container,
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
			testUtil.control = new Container({
				container: testUtil.container,
				content: button
			});

			testUtil.control.append(button2);

			assert.equal(document.querySelectorAll('button')[1], button2.element());
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
			testUtil.control = new Container({
				container: testUtil.container,
				content: button
			});

			testUtil.control.prepend(button2);

			assert.equal(document.querySelectorAll('button')[0], button2.element());
		});
	});
});
