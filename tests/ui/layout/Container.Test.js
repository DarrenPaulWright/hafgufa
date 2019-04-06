import { assert } from 'chai';
import { Button, Container } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(Container);
const controlTests = new ControlTests(Container, testUtil);

describe('Container', () => {
	controlTests.run([], ['focus']);

	describe('.get', () => {
		it('should find a control inside the container', () => {
			const buttonId = 'testId';
			const button = new Button({
				ID: buttonId
			});
			window.control = new Container({
				container: window.testContainer,
				content: button
			});

			assert.equal(window.control.get(buttonId), button);
		});

		it('should find a control inside another container', () => {
			const buttonId = 'testId';
			const button = new Button({
				ID: buttonId
			});
			window.control = new Container({
				container: window.testContainer,
				content: {
					control: Container,
					content: button
				}
			});

			assert.equal(window.control.get(buttonId), button);
		});
	});

	describe('.append', () => {
		it('should add a control to the end', () => {
			const buttonId = 'testId';
			const buttonId2 = 'testId2';
			const button = new Button({
				ID: buttonId
			});
			const button2 = new Button({
				ID: buttonId2
			});
			window.control = new Container({
				container: window.testContainer,
				content: button
			});

			window.control.append(button2);

			assert.equal(document.querySelectorAll('button')[1], button2.element());
		});
	});

	describe('.prepend', () => {
		it('should add a control to the end', () => {
			const buttonId = 'testId';
			const buttonId2 = 'testId2';
			const button = new Button({
				ID: buttonId
			});
			const button2 = new Button({
				ID: buttonId2
			});
			window.control = new Container({
				container: window.testContainer,
				content: button
			});

			window.control.prepend(button2);

			assert.equal(document.querySelectorAll('button')[0], button2.element());
		});
	});
});
