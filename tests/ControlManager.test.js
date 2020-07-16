import { assert } from 'type-enforcer';
import { Container, ControlManager, Div, IsWorking } from '../index.js';

describe('ControlManager', () => {
	let manager;

	beforeEach(() => {
		manager = new ControlManager();
	});

	afterEach(() => {
		manager.remove();
		manager = null;
	});

	it('should add an onRemove callback to a control', () => {
		const div = new Div();
		const initial = div.onRemove().length;

		manager.add(div);

		assert.is(div.onRemove().length, initial + 1);
		assert.is(manager.length, 1);
	});

	it('should add onRemove callbacks to multiple controls', () => {
		const div1 = new Div();
		const div2 = new Div();
		const initial1 = div1.onRemove().length;
		const initial2 = div2.onRemove().length;

		manager.add([div1, div2]);

		assert.is(div1.onRemove().length, initial1 + 1);
		assert.is(div2.onRemove().length, initial2 + 1);
		assert.is(manager.length, 2);

		manager.remove();

		assert.is(div1.onRemove().length, 0);
		assert.is(div2.onRemove().length, 0);
		assert.is(manager.length, 0);
	});

	it('should get a control by id', () => {
		const div = new Div({
			id: 'test'
		});

		manager.add(div);

		assert.is(manager.get('test'), div);
	});

	it('should get a nested control by id', () => {
		const container = new Container();
		const div = new Div({
			container,
			id: 'test'
		});

		manager.add(container);

		assert.is(manager.get('test'), div);
	});

	it('should return undefined if a control can\'t be found', () => {
		const container = new Container();
		new Div({
			container,
			id: 'test'
		});

		manager.add(container);

		assert.is(manager.get('test2'), undefined);
	});

	it('should call a callback for each control', () => {
		const div1 = new Div();
		const div2 = new Div();
		let count = 0;
		let countTotal = 0;

		manager.add([div1, div2]);
		manager.each((control) => {
			countTotal++;
			if (control === div1 || control === div2) {
				count++;
			}
		});

		assert.is(countTotal, 2);
		assert.is(count, 2);
	});

	it('should call a callback for each control and return an array', () => {
		const div1 = new Div({
			id: '4'
		});
		const div2 = new Div({
			id: '7'
		});
		let count = 0;
		let countTotal = 0;

		manager.add([div1, div2]);
		const result = manager.map((control) => {
			countTotal++;
			if (control === div1 || control === div2) {
				count++;
			}

			return control.id();
		});

		assert.is(countTotal, 2);
		assert.is(count, 2);
		assert.equal(result, ['4', '7']);
	});

	it('should get a control by id after the id is added', () => {
		const div = new Div();

		manager.add(div);
		div.id('test');
		manager.update(div);

		assert.is(manager.get('test'), div);
	});

	it('should get a control by id after the id is updated', () => {
		const div = new Div({
			id: 'test'
		});

		manager.add(div);
		div.id('test2');
		manager.update(div);

		assert.is(manager.get('test2'), div);
	});

	it('should NOT get a control by id after the control is discarded', () => {
		const div = new Div({
			id: 'test'
		});

		manager.add(div);

		assert.is(manager.get('test'), div);

		manager.discard(div);

		assert.is(manager.get('test'), undefined);
		assert.is(manager.length, 0);
	});

	it('should NOT get a control by id after the control is discarded (fade)', () => {
		const div = new IsWorking({
			id: 'test'
		});

		manager.add(div);

		assert.is(manager.get('test'), div);

		manager.discard(div);

		assert.is(manager.get('test'), undefined);
		assert.is(manager.length, 0);
	});

	it('should NOT get a control by id after the control is discarded (by id)', () => {
		const div = new Div({
			id: 'test'
		});

		manager.add(div);

		assert.is(manager.get('test'), div);

		manager.discard('test');

		assert.is(manager.get('test'), undefined);
	});

	it('should remove a control by id', () => {
		const div1 = new Div({
			id: '1'
		});
		const div2 = new Div({
			id: '2'
		});
		const div3 = new Div();

		manager.add([div1, div2, div3]);

		assert.is(manager.length, 3);

		manager.remove('2');

		assert.is(manager.length, 2);
		assert.is(manager.get('1'), div1);
		assert.is(manager.get('2'), undefined);
	});

	it('should remove a control by reference', () => {
		const div1 = new Div({
			id: '1'
		});
		const div2 = new Div({
			id: '2'
		});
		const div3 = new Container({
			content: {
				control: Div,
				id: 'test4'
			}
		});

		manager.add([div1, div2, div3]);

		assert.is(manager.length, 3);

		manager.remove(div2);

		assert.is(manager.length, 2);
		assert.is(manager.get('1'), div1);
		assert.is(manager.get('2'), undefined);
		assert.is(manager.get('test4'), div3.get('test4'));

		manager.remove('test4');

		assert.is(manager.length, 2);
		assert.is(manager.get('1'), div1);
		assert.is(manager.get('2'), undefined);
		assert.is(manager.get('test4'), div3.get('test4'));

		manager.remove(div3);

		assert.is(manager.length, 1);
		assert.is(manager.get('1'), div1);
		assert.is(manager.get('2'), undefined);
		assert.is(manager.get('test4'), div3.get('test4'));
	});

	it('should remove a control when the control is removed externally', () => {
		const div1 = new Div({
			id: '1'
		});
		const div2 = new Div({
			id: '2'
		});
		const div3 = new Div();

		manager.add([div1, div2, div3]);

		assert.is(manager.length, 3);

		div3.remove();

		assert.is(manager.length, 2);
		assert.is(manager.get('1'), div1);
		assert.is(manager.get('2'), div2);

		div2.remove();

		assert.is(manager.length, 1);
		assert.is(manager.get('1'), div1);
		assert.is(manager.get('2'), undefined);
	});

	it('should remove a control with fade', () => {
		const div1 = new Div({
			id: '1'
		});
		const div2 = new IsWorking({
			id: '2'
		});

		manager.add([div1, div2]);

		assert.is(manager.length, 2);

		manager.remove();

		assert.is(manager.length, 0);
	});

});
