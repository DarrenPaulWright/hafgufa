import { assert } from 'chai';
import LocalHistory from '../../src';
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

			assert.isTrue(history.push(historyObject1));
		});
		it('should NOT show that it has history when one object is pushed', () => {
			const history = new LocalHistory();
			history.push(historyObject1);

			assert.isFalse(history.hasHistory());
		});
		it('should show that it has history after a second object is pushed', () => {
			const history = new LocalHistory();
			history.push(historyObject1);
			history.push(historyObject2);

			assert.isTrue(history.hasHistory());
		});
		it('should return undefined if no history has been pushed', () => {
			const history = new LocalHistory();

			assert.deepEqual(history.undo(), undefined);
		});
		it('should return the same history object that gets pushed', () => {
			const history = new LocalHistory();
			history.push(historyObject1);
			history.push(historyObject2);

			assert.deepEqual(history.undo(), historyObject1);
		});
		it('should return undefined if the history is deleted', () => {
			const history = new LocalHistory();
			history.push(historyObject1);
			history.push(historyObject2);
			history.push(historyObject3);
			history.clear();

			assert.deepEqual(history.undo(), undefined);
		});
		it('should replace the most recent history item if replace is used', () => {
			const history = new LocalHistory();
			history.push(historyObject1);
			history.push(historyObject2);
			history.replace(historyObject3);

			assert.deepEqual(history.undo(), historyObject1);
		});
		it('should not save history if replace is called when there is no history', () => {
			const history = new LocalHistory();
			history.replace(historyObject3);

			assert.deepEqual(history.undo(), undefined);
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
				onUndo: function(historyObject) {
					callbackValue = historyObject.test;
				}
			});
			history.undo();

			assert.equal(callbackValue, '');
		});
		it('should call a callback function when undo is called and history exists', () => {
			let callbackValue = '';
			const history = new LocalHistory({
				onUndo: function(historyObject) {
					callbackValue = historyObject.test;
				}
			});
			history.push(historyObject1);
			history.push(historyObject2);
			history.undo();

			assert.equal(callbackValue, 'test1');
		});
		it('should NOT call a callback function when replace is called and no history exists', () => {
			let callbackValue = '';
			const history = new LocalHistory({
				onPush: function() {
					callbackValue = 'test4';
				}
			});
			history.replace(historyObject1);

			assert.equal(callbackValue, '');
		});
		it('should call a callback function when push is called and history exists', () => {
			let callbackValue = 0;
			const history = new LocalHistory({
				onPush: function() {
					callbackValue += 1;
				}
			});
			history.push(historyObject1);
			history.push(historyObject2);

			assert.equal(callbackValue, 2);
		});
	});
});
