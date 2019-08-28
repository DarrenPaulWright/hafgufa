import { assert } from 'chai';
import collectionHelper from '../../src/utility/collectionHelper';
import TestUtil from '../TestUtil';

new TestUtil(collectionHelper);

describe('collectionHelper', () => {
	describe('.slice', () => {
		const testCollection = [{
			prop: 'test 1'
		}, {
			prop: 'test 2'
		}, {
			prop: 'test 3'
		}, {
			prop: 'test 4'
		}, {
			prop: 'test 5'
		}];

		it('should return an array of items from the beginning of the input array if no endFilter is provided', () => {
			const output = [{
				prop: 'test 3'
			}, {
				prop: 'test 4'
			}, {
				prop: 'test 5'
			}];
			const startFilter = {
				prop: 'test 3'
			};

			assert.deepEqual(collectionHelper.slice(testCollection, startFilter), output);
		});

		it('should return an array of items from the middle of the input array if both filters are valid', () => {
			const output = [{
				prop: 'test 2'
			}, {
				prop: 'test 3'
			}, {
				prop: 'test 4'
			}];
			const startFilter = {
				prop: 'test 2'
			};
			const endFilter = {
				prop: 'test 4'
			};

			assert.deepEqual(collectionHelper.slice(testCollection, startFilter, endFilter), output);
		});

		it('should return an array of items from the middle of the input array if both filters are valid but the end filter matches an item before the start filter', () => {
			const output = [{
				prop: 'test 2'
			}, {
				prop: 'test 3'
			}, {
				prop: 'test 4'
			}];
			const startFilter = {
				prop: 'test 4'
			};
			const endFilter = {
				prop: 'test 2'
			};

			assert.deepEqual(collectionHelper.slice(testCollection, startFilter, endFilter), output);
		});

		it('should return an array of items from the end of the input array if the first filter doesn\'t match anything', () => {
			const output = [{
				prop: 'test 1'
			}, {
				prop: 'test 2'
			}, {
				prop: 'test 3'
			}];
			const startFilter = {
				prop: 'test !'
			};
			const endFilter = {
				prop: 'test 3'
			};

			assert.deepEqual(collectionHelper.slice(testCollection, startFilter, endFilter), output);
		});
	});

	describe('.flatten', () => {
		it('should return null if null is input', () => {
			assert.deepEqual(collectionHelper.flatten(null), null);
		});

		it('should return the input if the input is an object without children', () => {
			const testCollection = {
				prop: 'test 1'
			};
			const output = [{
				prop: 'test 1'
			}];

			assert.deepEqual(collectionHelper.flatten(testCollection), output);
		});

		it('should return an array that is already flat', () => {
			const testCollection = [{
				prop: 'test 1'
			}, {
				prop: 'test 2'
			}, {
				prop: 'test 4'
			}, {
				prop: 'test 5'
			}, {
				prop: 'test 6'
			}, {
				prop: 'test 3'
			}];
			const output = [{
				prop: 'test 1'
			}, {
				prop: 'test 2'
			}, {
				prop: 'test 4'
			}, {
				prop: 'test 5'
			}, {
				prop: 'test 6'
			}, {
				prop: 'test 3'
			}];

			assert.deepEqual(collectionHelper.flatten(testCollection), output);
		});

		it('should flatten a nested array', () => {
			const testCollection = [{
				prop: 'test 1'
			}, {
				prop: 'test 2',
				children: [{
					prop: 'test 4'
				}, {
					prop: 'test 5',
					children: [{
						prop: 'test 6'
					}]
				}]
			}, {
				prop: 'test 3'
			}];
			const output = [{
				prop: 'test 1'
			}, {
				prop: 'test 2'
			}, {
				prop: 'test 4'
			}, {
				prop: 'test 5'
			}, {
				prop: 'test 6'
			}, {
				prop: 'test 3'
			}];

			assert.deepEqual(collectionHelper.flatten(testCollection), output);
		});

		it('should flatten a nested array using a specific child property', () => {
			const testCollection = [{
				prop: 'test 1'
			}, {
				prop: 'test 2',
				asdf: [{
					prop: 'test 4'
				}, {
					prop: 'test 5',
					children: [{
						prop: 'test 6'
					}]
				}]
			}, {
				prop: 'test 3'
			}];
			const output = [{
				prop: 'test 1'
			}, {
				prop: 'test 2'
			}, {
				prop: 'test 4'
			}, {
				prop: 'test 5',
				children: [{
					prop: 'test 6'
				}]
			}, {
				prop: 'test 3'
			}];
			const settings = {
				childProperty: 'asdf'
			};

			assert.deepEqual(collectionHelper.flatten(testCollection, settings), output);
		});

		it('should add a depth property to each returned object if saveDepth is true', () => {
			const testCollection = [{
				prop: 'test 1'
			}, {
				prop: 'test 2',
				children: [{
					prop: 'test 4'
				}, {
					prop: 'test 5',
					children: [{
						prop: 'test 6'
					}]
				}]
			}, {
				prop: 'test 3'
			}];
			const output = [{
				prop: 'test 1',
				depth: 0
			}, {
				prop: 'test 2',
				depth: 0
			}, {
				prop: 'test 4',
				depth: 1
			}, {
				prop: 'test 5',
				depth: 1
			}, {
				prop: 'test 6',
				depth: 2
			}, {
				prop: 'test 3',
				depth: 0
			}];
			const settings = {
				saveDepth: true
			};

			assert.deepEqual(collectionHelper.flatten(testCollection, settings), output);
		});

		it('should save properties set in the onEachParent callback', () => {
			const testCollection = [{
				prop: 'test 1'
			}, {
				prop: 'test 2',
				children: [{
					prop: 'test 4'
				}, {
					prop: 'test 5',
					children: [{
						prop: 'test 6'
					}]
				}]
			}, {
				prop: 'test 3'
			}];
			const output = [{
				prop: 'test 1'
			}, {
				prop: 'test 2',
				testProperty: 'test 2'
			}, {
				prop: 'test 4'
			}, {
				prop: 'test 5',
				testProperty: 'test 5'
			}, {
				prop: 'test 6'
			}, {
				prop: 'test 3'
			}];
			const settings = {
				onEachParent(item) {
					item.testProperty = item.prop;
				}
			};

			assert.deepEqual(collectionHelper.flatten(testCollection, settings), output);
		});

		it('should save properties set in the onEachChild callback', () => {
			const testCollection = [{
				prop: 'test 1'
			}, {
				prop: 'test 2',
				children: [{
					prop: 'test 4'
				}, {
					prop: 'test 5',
					children: [{
						prop: 'test 6'
					}]
				}]
			}, {
				prop: 'test 3'
			}];
			const output = [{
				prop: 'test 1',
				testProperty: 'test 1'
			}, {
				prop: 'test 2'
			}, {
				prop: 'test 4',
				testProperty: 'test 4'
			}, {
				prop: 'test 5'
			}, {
				prop: 'test 6',
				testProperty: 'test 6'
			}, {
				prop: 'test 3',
				testProperty: 'test 3'
			}];
			const settings = {
				onEachChild(item) {
					item.testProperty = item.prop;
				}
			};

			assert.deepEqual(collectionHelper.flatten(testCollection, settings), output);
		});

		it('should ignore children of objects where ignoreChildrenProperty is truthy', () => {
			const testCollection = [{
				prop: 'test 1'
			}, {
				prop: 'test 2',
				children: [{
					prop: 'test 4'
				}, {
					prop: 'test 5',
					ignoreChildren: true,
					children: [{
						prop: 'test 6'
					}]
				}]
			}, {
				prop: 'test 3'
			}];
			const output = [{
				prop: 'test 1'
			}, {
				prop: 'test 2'
			}, {
				prop: 'test 4'
			}, {
				ignoreChildren: true,
				prop: 'test 5'
			}, {
				prop: 'test 3'
			}];
			const settings = {
				ignoreChildrenProperty: 'ignoreChildren'
			};

			assert.deepEqual(collectionHelper.flatten(testCollection, settings), output);
		});

		it('should be able to use all the settings together', () => {
			const testCollection = [{
				prop: 'test 1'
			}, {
				prop: 'test 2',
				children2: [{
					prop: 'test 4'
				}, {
					prop: 'test 5',
					ignoreChildren: true,
					children2: [{
						prop: 'test 6'
					}]
				}]
			}, {
				prop: 'test 3'
			}];
			const output = [{
				prop: 'test 1',
				depth: 0,
				testProperty: 'child test 1'
			}, {
				prop: 'test 2',
				depth: 0,
				testProperty: 'parent test 2'
			}, {
				prop: 'test 4',
				depth: 1,
				testProperty: 'child test 4'
			}, {
				prop: 'test 5',
				depth: 1,
				ignoreChildren: true,
				testProperty: 'parent test 5'
			}, {
				prop: 'test 3',
				depth: 0,
				testProperty: 'child test 3'
			}];
			const settings = {
				childProperty: 'children2',
				saveDepth: true,
				ignoreChildrenProperty: 'ignoreChildren',
				onEachParent(item) {
					item.testProperty = 'parent ' + item.prop;
				},
				onEachChild(item) {
					item.testProperty = 'child ' + item.prop;
				}
			};

			assert.deepEqual(collectionHelper.flatten(testCollection, settings), output);
		});

		it('should not modify the original collection', () => {
			const testCollection = [{
				prop: 'test 1'
			}, {
				prop: 'test 2',
				children2: [{
					prop: 'test 4'
				}, {
					prop: 'test 5',
					ignoreChildren: true,
					children2: [{
						prop: 'test 6'
					}]
				}]
			}, {
				prop: 'test 3'
			}];
			const output = [{
				prop: 'test 1'
			}, {
				prop: 'test 2',
				children2: [{
					prop: 'test 4'
				}, {
					prop: 'test 5',
					ignoreChildren: true,
					children2: [{
						prop: 'test 6'
					}]
				}]
			}, {
				prop: 'test 3'
			}];
			const settings = {
				childProperty: 'children2',
				saveDepth: true,
				ignoreChildrenProperty: 'ignoreChildren',
				onEachParent(item) {
					item.testProperty = 'parent ' + item.prop;
				},
				onEachChild(item) {
					item.testProperty = 'child ' + item.prop;
				}
			};

			collectionHelper.flatten(testCollection, settings);

			assert.deepEqual(testCollection, output);
		});
	});

	describe('.nest', () => {
		it('should return null if null is input', () => {
			assert.deepEqual(collectionHelper.nest(null), null);
		});

		it('should return the input if the input doesn\'t have parents', () => {
			const testCollection = [{
				prop: 'test 1'
			}];
			const output = [{
				prop: 'test 1'
			}];

			assert.deepEqual(collectionHelper.nest(testCollection), output);
		});

		it('should return properly nested data', () => {
			const testCollection = [{
				ID: 1,
				prop: 'test 1'
			}, {
				ID: 2,
				prop: 'test 2'
			}, {
				ID: 3,
				prop: 'test 3',
				parent: 2
			}, {
				ID: 4,
				prop: 'test 4',
				another: 'something',
				parent: 2
			}, {
				ID: 5,
				prop: 'test 5',
				parent: 4
			}, {
				ID: 6,
				prop: 'test 6',
				parent: 2
			}];
			const output = [{
				ID: 1,
				prop: 'test 1'
			}, {
				ID: 2,
				prop: 'test 2',
				children: [{
					ID: 3,
					prop: 'test 3',
					parent: 2
				}, {
					ID: 4,
					prop: 'test 4',
					another: 'something',
					children: [{
						ID: 5,
						prop: 'test 5',
						parent: 4
					}],
					parent: 2
				}, {
					ID: 6,
					prop: 'test 6',
					parent: 2
				}]
			}];

			assert.deepEqual(collectionHelper.nest(testCollection), output);
		});

		it('should remove the parent property from items if deleteParentProperty = true', () => {
			const testCollection = [{
				ID: 1,
				prop: 'test 1'
			}, {
				ID: 2,
				prop: 'test 2'
			}, {
				ID: 3,
				prop: 'test 3',
				parent: 2
			}, {
				ID: 4,
				prop: 'test 4',
				another: 'something',
				parent: 2
			}, {
				ID: 5,
				prop: 'test 5',
				parent: 4
			}, {
				ID: 6,
				prop: 'test 6',
				parent: 2
			}];
			const output = [{
				ID: 1,
				prop: 'test 1'
			}, {
				ID: 2,
				prop: 'test 2',
				children: [{
					ID: 3,
					prop: 'test 3'
				}, {
					ID: 4,
					prop: 'test 4',
					another: 'something',
					children: [{
						ID: 5,
						prop: 'test 5'
					}]
				}, {
					ID: 6,
					prop: 'test 6'
				}]
			}];

			assert.deepEqual(collectionHelper.nest(testCollection, {
				deleteParentProperty: true
			}), output);
		});
	});

	describe('.eachChild', () => {
		it('should call a callback for each child of the collection', () => {
			let total = 0;
			const testCollection = [{
				prop: 'test 1'
			}, {
				prop: 'test 2',
				children: [{
					prop: 'test 4'
				}, {
					prop: 'test 5',
					children: [{
						prop: 'test 6'
					}]
				}]
			}, {
				prop: 'test 3'
			}];

			collectionHelper.eachChild(testCollection, () => {
				total++;
			});

			assert.equal(total, 4);
		});

		it('should stop calling a callback if false is returned from the callback', () => {
			let total = 0;
			const testCollection = [{
				prop: 'test 1'
			}, {
				prop: 'test 2',
				children: [{
					prop: 'test 4'
				}, {
					prop: 'test 5',
					children: [{
						prop: 'test 6'
					}]
				}]
			}, {
				prop: 'test 3'
			}];

			collectionHelper.eachChild(testCollection, (item) => {
				total++;
				if (item.prop === 'test 4') {
					return false;
				}
			});

			assert.equal(total, 2);
		});

		it('should NOT call the callback for children that don\'t match the childProperty', () => {
			let total = 0;
			const testCollection = [{
				prop: 'test 1'
			}, {
				prop: 'test 2',
				children: [{
					prop: 'test 4'
				}, {
					prop: 'test 5',
					children: [{
						prop: 'test 6'
					}]
				}]
			}, {
				prop: 'test 3'
			}];

			collectionHelper.eachChild(testCollection, () => {
				total++;
			}, {
				childProperty: 'children2'
			});

			assert.equal(total, 3);
		});

		it('should call the callback for children that match the childProperty', () => {
			let total = 0;
			const testCollection = [{
				prop: 'test 1'
			}, {
				prop: 'test 2',
				children2: [{
					prop: 'test 4'
				}, {
					prop: 'test 5',
					children2: [{
						prop: 'test 6'
					}]
				}]
			}, {
				prop: 'test 3'
			}];

			collectionHelper.eachChild(testCollection, () => {
				total++;
			}, {
				childProperty: 'children2'
			});

			assert.equal(total, 4);
		});

		it('should provide the depth of each child', () => {
			let total = 0;
			const testCollection = [{
				prop: 'test 1'
			}, {
				prop: 'test 2',
				children2: [{
					prop: 'test 4'
				}, {
					prop: 'test 5',
					children2: [{
						prop: 'test 6'
					}]
				}]
			}, {
				prop: 'test 3'
			}];

			collectionHelper.eachChild(testCollection, (item, depth) => {
				total += depth;
			}, {
				childProperty: 'children2'
			});

			assert.equal(total, 3);
		});

		it('should call the onEachParent callback if provided', () => {
			let total = 0;
			const testCollection = [{
				prop: 'test 1'
			}, {
				prop: 'test 2',
				children: [{
					prop: 'test 4'
				}, {
					prop: 'test 5',
					children: [{
						prop: 'test 6'
					}]
				}]
			}, {
				prop: 'test 3'
			}];

			collectionHelper.eachChild(testCollection, () => {
			}, {
				onEachParent(item, depth) {
					total += depth;
				}
			});

			assert.equal(total, 1);
		});
	});

	describe('.count', () => {
		it('should return a new collection with duplicates removed and counts added', () => {
			const testCollection = [{
				prop: 'test 1'
			}, {
				prop: 'test 2'
			}, {
				prop: 'test 2'
			}, {
				prop: 'test 2'
			}, {
				prop: 'test 3'
			}, {
				prop: 'test 3'
			}];
			const testOutput = [{
				prop: 'test 1',
				count: 1
			}, {
				prop: 'test 2',
				count: 3
			}, {
				prop: 'test 3',
				count: 2
			}];

			const output = collectionHelper.count(testCollection, 'count');

			assert.deepEqual(output, testOutput);
		});
	});

	describe('.zipById', () => {
		it('should return a new collection with zipped data from two arrays', () => {
			const testCollection1 = [{
				ID: 2,
				value: 'test 2'
			}, {
				ID: 3,
				value: 'test 3'
			}, {
				ID: 1,
				value: 'test 1'
			}];
			const testCollection2 = [{
				ID: 1,
				value: 'test 4'
			}, {
				ID: 3,
				value: 'test 6'
			}, {
				ID: 2,
				value: 'test 5'
			}];
			const testOutput = [{
				x: 'test 1',
				y: 'test 4'
			}, {
				x: 'test 2',
				y: 'test 5'
			}, {
				x: 'test 3',
				y: 'test 6'
			}];

			const output = collectionHelper.zipById([testCollection1, testCollection2], 'ID', (x, y) => ({
				x: x.value,
				y: y.value
			}));

			assert.deepEqual(output, testOutput);
		});

		it('should return a new collection with zipped data from three arrays', () => {
			const testCollection1 = [{
				ID: 2,
				value: 'test 2'
			}, {
				ID: 3,
				value: 'test 3'
			}, {
				ID: 1,
				value: 'test 1'
			}];
			const testCollection2 = [{
				ID: 1,
				value: 'test 4'
			}, {
				ID: 3,
				value: 'test 6'
			}, {
				ID: 2,
				value: 'test 5'
			}];
			const testCollection3 = [{
				ID: 1,
				value: 'test 7'
			}, {
				ID: 3,
				value: 'test 9'
			}, {
				ID: 2,
				value: 'test 8'
			}];
			const testOutput = [{
				x: 'test 1',
				y: 'test 4',
				z: 'test 7'
			}, {
				x: 'test 2',
				y: 'test 5',
				z: 'test 8'
			}, {
				x: 'test 3',
				y: 'test 6',
				z: 'test 9'
			}];

			const output = collectionHelper.zipById([testCollection1,
				testCollection2,
				testCollection3], 'ID', (x, y, z) => ({
				x: x.value,
				y: y.value,
				z: z.value
			}));

			assert.deepEqual(output, testOutput);
		});

		it('should return a new collection with zipped data from three arrays with multiples of some IDs', () => {
			const testCollection1 = [{
				ID: 2,
				value: 'test 2'
			}, {
				ID: 3,
				value: 'test 3'
			}, {
				ID: 1,
				value: 'test 1'
			}];
			const testCollection2 = [{
				ID: 1,
				value: 'test 4'
			}, {
				ID: 3,
				value: 'test 6'
			}, {
				ID: 2,
				value: 'test 5'
			}, {
				ID: 2,
				value: 'test 11'
			}];
			const testCollection3 = [{
				ID: 1,
				value: 'test 7'
			}, {
				ID: 3,
				value: 'test 9'
			}, {
				ID: 3,
				value: 'test 10'
			}, {
				ID: 2,
				value: 'test 8'
			}];
			const testOutput = [{
				x: 'test 1',
				y: 'test 4',
				z: 'test 7'
			}, {
				x: 'test 2',
				y: 'test 11',
				z: 'test 8'
			}, {
				x: 'test 2',
				y: 'test 5',
				z: 'test 8'
			}, {
				x: 'test 3',
				y: 'test 6',
				z: 'test 10'
			}, {
				x: 'test 3',
				y: 'test 6',
				z: 'test 9'
			}];

			const output = collectionHelper.zipById([testCollection1,
				testCollection2,
				testCollection3], 'ID', (x, y, z) => ({
				x: x.value,
				y: y.value,
				z: z.value
			}));

			assert.deepEqual(output, testOutput);
		});
	});
});
