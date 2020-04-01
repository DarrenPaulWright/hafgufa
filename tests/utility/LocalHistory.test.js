import { assert } from 'type-enforcer';
import { LocalHistory } from '../..';
import TestUtil from '../TestUtil';

new TestUtil(LocalHistory);

describe('LocalHistory', () => {
	describe('BasicHistory', () => {
		const historyObject1 = {
			test: 'test1'
		};
		const historyObject2 = {
			test: 'test2'
		};
		const historyObject3 = {
			test: 'test3'
		};

		it('should return true when an object is pushed', () => {
			const history = new LocalHistory();

			assert.is(history.push(historyObject1), true);
		});
		it('should NOT show that it has history when one object is pushed', () => {
			const history = new LocalHistory();
			history.push(historyObject1);

			assert.is(history.hasHistory(), false);
		});
		it('should show that it has history after a second object is pushed', () => {
			const history = new LocalHistory();
			history.push(historyObject1);
			history.push(historyObject2);

			assert.is(history.hasHistory(), true);
		});
		it('should return undefined if no history has been pushed', () => {
			const history = new LocalHistory();

			assert.equal(history.undo(), undefined);
		});
		it('should return the same history object that gets pushed', () => {
			const history = new LocalHistory();
			history.push(historyObject1);
			history.push(historyObject2);

			assert.equal(history.undo(), historyObject1);
		});
		it('should return undefined if the history is deleted', () => {
			const history = new LocalHistory();
			history.push(historyObject1);
			history.push(historyObject2);
			history.push(historyObject3);
			history.clear();

			assert.equal(history.undo(), undefined);
		});
		it('should replace the most recent history item if replace is used', () => {
			const history = new LocalHistory();
			history.push(historyObject1);
			history.push(historyObject2);
			history.replace(historyObject3);

			assert.equal(history.undo(), historyObject1);
		});
		it('should not save history if replace is called when there is no history', () => {
			const history = new LocalHistory();
			history.replace(historyObject3);

			assert.equal(history.undo(), undefined);
		});
	});

	describe('Callbacks', () => {
		const historyObject1 = {
			test: 'test1'
		};
		const historyObject2 = {
			test: 'test2'
		};

		it('should NOT call a callback function when undo is called and no history exists', () => {
			let callbackValue = '';
			const history = new LocalHistory({
				onUndo(historyObject) {
					callbackValue = historyObject.test;
				}
			});
			history.undo();

			assert.is(callbackValue, '');
		});
		it('should call a callback function when undo is called and history exists', () => {
			let callbackValue = '';
			const history = new LocalHistory({
				onUndo(historyObject) {
					callbackValue = historyObject.test;
				}
			});
			history.push(historyObject1);
			history.push(historyObject2);
			history.undo();

			assert.is(callbackValue, 'test1');
		});
		it('should NOT call a callback function when replace is called and no history exists', () => {
			let callbackValue = '';
			const history = new LocalHistory({
				onPush() {
					callbackValue = 'test4';
				}
			});
			history.replace(historyObject1);

			assert.is(callbackValue, '');
		});
		it('should call a callback function when push is called and history exists', () => {
			let callbackValue = 0;
			const history = new LocalHistory({
				onPush() {
					callbackValue += 1;
				}
			});
			history.push(historyObject1);
			history.push(historyObject2);

			assert.is(callbackValue, 2);
		});
	});
});
