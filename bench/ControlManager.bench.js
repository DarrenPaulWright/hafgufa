import { benchSettings } from 'karma-webpack-bundle';
import { ControlManager, Div } from '../index';

suite('ControlManager', () => {
	let sandbox = {};
	let manager = new ControlManager();
	let div = new Div();

	benchmark('init', () => {
		sandbox = new ControlManager();
	}, benchSettings);

	benchmark('add one', () => {
		sandbox = manager.add(div);
	}, {
		...benchSettings,
		onCycle() {
			manager = new ControlManager();
			div = new Div();
		}
	});

	benchmark('add three', () => {
		sandbox = manager.add(div);
	}, {
		...benchSettings,
		onCycle() {
			manager = new ControlManager();
			div = [new Div(), new Div(), new Div()];
		}
	});

	benchmark('discard', () => {
		sandbox = manager.discard('1');
	}, {
		...benchSettings,
		onCycle() {
			manager = new ControlManager();
			manager.add(new Div({
				id: '1'
			}));
		}
	});

	benchmark('update', () => {
		sandbox = manager.update(div);
	}, {
		...benchSettings,
		onCycle() {
			manager = new ControlManager();
			div = new Div({id: '3'});
			manager.add([new Div({id: '1'}), new Div({id: '2'}), div]);
			div.id('4');
		}
	});

	benchmark('get', () => {
		sandbox = manager.get('3');
	}, {
		...benchSettings,
		onCycle() {
			manager = new ControlManager();
			manager.add([new Div({id: '1'}), new Div({id: '2'}), new Div({id: '3'})]);
		}
	});

	benchmark('get id not in manager', () => {
		sandbox = manager.get('4');
	}, {
		...benchSettings,
		onCycle() {
			manager = new ControlManager();
			manager.add([new Div({id: '1'}), new Div({id: '2'}), new Div({id: '3'})]);
		}
	});

	benchmark('remove id', () => {
		sandbox = manager.remove('4');
	}, {
		...benchSettings,
		onCycle() {
			manager = new ControlManager();
			manager.add([new Div({id: '1'}), new Div({id: '2'}), new Div({id: '3'})]);
		}
	});

	benchmark('remove control', () => {
		sandbox = manager.remove(div);
	}, {
		...benchSettings,
		onCycle() {
			manager = new ControlManager();
			div = new Div({id: '3'});
			manager.add([new Div({id: '1'}), new Div({id: '2'}), div]);
		}
	});

	benchmark('remove all', () => {
		sandbox = manager.remove();
	}, {
		...benchSettings,
		onCycle() {
			manager = new ControlManager();
			manager.add([new Div({id: '1'}), new Div({id: '2'}), new Div({id: '3'})]);
		}
	});
});
