import { wait } from 'async-agent';
import { assert } from 'chai';
import { event } from 'd3';
import { MOUSE_ENTER_EVENT, MOUSE_OUT_EVENT, MOUSE_OVER_EVENT } from '../../../src';
import GridCell from '../../../src/ui/grid/GridCell';
import * as gridConstants from '../../../src/ui/grid/gridConstants';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

describe('GridCell', () => {
	const testUtil = new TestUtil(GridCell);
	const controlBaseTests = new ControlTests(GridCell, testUtil);

	beforeEach(() => {
		testUtil.container.classList.add('grid');
	});

	controlBaseTests.run(['isEnabled']);

	describe('.rowData', () => {
		testUtil.testMethod({
			methodName: 'rowData',
			defaultSettings: {
				container: testUtil.container
			},
			defaultValue: {},
			testValue: {
				test: true
			}
		});
	});

	describe('.onSelect', () => {
		testUtil.testMethod({
			methodName: 'onSelect',
			defaultSettings: {
				container: testUtil.container
			},
			defaultValue: undefined,
			testValue() {
				return 'test';
			}
		});
	});

	describe('DataType', () => {
		testUtil.testMethod({
			methodName: 'dataType',
			defaultSettings: {
				container: testUtil.container
			},
			defaultValue: gridConstants.COLUMN_TYPES.NONE,
			testValue: gridConstants.COLUMN_TYPES.CHECKBOX,
			secondTestValue: gridConstants.COLUMN_TYPES.TEXT
		});

		it('should remove a toolbar if previously set to ACTIONS', () => {
			testUtil.control = new GridCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.ACTIONS
			})
				.content({
					columnButtons: [{
						icon: 'trash'
					}]
				});

			testUtil.control.dataType(gridConstants.COLUMN_TYPES.TEXT);

			assert.equal(document.querySelectorAll('.toolbar').length, 0);
		});

		it('should remove a checkbox if previously set to CHECKBOX', () => {
			testUtil.control = new GridCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.CHECKBOX
			})
				.content({});

			testUtil.control.dataType(gridConstants.COLUMN_TYPES.TEXT);

			assert.equal(document.querySelectorAll('.checkboxes').length, 0);
		});
	});

	describe('Content', () => {
		const testTypes = [{
			type: 'TEXT',
			content: {
				text: 'test text'
			},
			output: 'test text',
			textAlign: 'NONE'
		}, {
			type: 'EMAIL',
			content: {
				text: 'test@example.com'
			},
			output: '<a href="mailto:test@example.com">test@example.com</a>',
			textAlign: 'NONE'
		}, {
			type: 'LINK',
			content: {
				text: 'http://www.example.com'
			},
			output: '<a href="http://www.example.com" target="_blank">http://www.example.com</a>',
			textAlign: 'NONE'
		}, {
			type: 'NUMBER',
			content: {
				text: '23'
			},
			output: '23',
			textAlign: 'RIGHT'
		}, {
			type: 'DATE',
			content: {
				text: '11/30/1996'
			},
			output: '11/30/1996',
			textAlign: 'CENTER'
		}, {
			type: 'DATE_TIME',
			content: {
				text: '11/30/1996 11:30AM'
			},
			output: '11/30/1996 11:30AM',
			textAlign: 'CENTER'
		}, {
			type: 'TIME',
			content: {
				text: '11:32AM'
			},
			output: '11:32AM',
			textAlign: 'CENTER'
		}, {
			type: 'IMAGE',
			content: {
				src: 'test.png'
			},
			output: '<img src=\"test.png\" style=\"object-fit: contain; opacity: 1;\">',
			textAlign: 'CENTER'
		}, {
			type: 'IMAGE',
			content: {
				icon: 'circle'
			},
			output: '<i class=\"icon icon-lg fa-circle\"></i>',
			textAlign: 'CENTER'
		}, {
			type: 'ACTIONS',
			content: {
				columnButtons: [{
					icon: 'circle'
				}]
			},
			output: '<div class=\"toolbar clearfix\"><button type=\"button\" class=\"icon-button\"><i id="buttonIcon" class=\"icon icon-lg fa-circle\"></i></button></div>',
			textAlign: 'NONE'
		}, {
			type: 'CHECKBOX',
			content: {},
			output: '<label class=\"checkbox\"><input type=\"checkbox\"></label>',
			textAlign: 'NONE'
		}];

		const runSpecificContent = (
			typeString,
			inputContent,
			outputText,
			textAlign
		) => {
			it('should render the content provided when dataType is ' + typeString, () => {
				testUtil.control = new GridCell({
					container: testUtil.container,
					dataType: gridConstants.COLUMN_TYPES[typeString]
				})
					.content(inputContent);

				assert.equal(testUtil.control.element().innerHTML, outputText);
			});

			it('should have textAlign of ' + textAlign + ' when dataType is ' + typeString, () => {
				testUtil.control = new GridCell({
					container: testUtil.container,
					dataType: gridConstants.COLUMN_TYPES[typeString]
				})
					.content(inputContent);

				assert.equal(testUtil.control.textAlign(), gridConstants.CELL_ALIGNMENT[textAlign]);
			});

			testTypes.forEach((testType) => {
				it('should render the content provided when dataType is ' + typeString + ' and then dataType is set to ' +
					testType.type, () => {
					testUtil.control = new GridCell({
						container: testUtil.container,
						dataType: gridConstants.COLUMN_TYPES[typeString]
					})
						.content(inputContent);

					testUtil.control
						.dataType(gridConstants.COLUMN_TYPES[testType.type])
						.content(testType.content);

					assert.equal(testUtil.control.element().innerHTML, testType.output);
				});
			});
		};

		testTypes.forEach((testType) => {
			runSpecificContent(testType.type, testType.content, testType.output, testType.textAlign);
		});

		it('should render buttons when dataType is ACTIONS and button definitions are provided', () => {
			testUtil.control = new GridCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.ACTIONS
			})
				.content({
					columnButtons: [{
						icon: 'circle'
					}, {
						icon: 'trash'
					}]
				});

			assert.equal(document.querySelectorAll('button').length, 2);
		});

		it('should render only the second buttons when dataType is ACTIONS and button definitions are provided twice', () => {
			testUtil.control = new GridCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.ACTIONS
			})
				.content({
					columnButtons: [{
						icon: 'circle'
					}, {
						icon: 'trash'
					}]
				});

			testUtil.control.content({
				columnButtons: [{
					icon: 'another'
				}, {
					icon: 'icon'
				}]
			});

			assert.equal(document.querySelectorAll('button').length, 2);
		});

		it('should call the button onclick event when a button is clicked', () => {
			let testVar = 0;

			testUtil.control = new GridCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.ACTIONS
			})
				.content({
					columnButtons: [{
						icon: 'circle'
					}, {
						icon: 'trash',
						onClick() {
							testVar++;
						}
					}]
				});

			testUtil.simulateClick(document.querySelectorAll('button')[1]);

			assert.equal(testVar, 1);
		});

		it('should call the onSelect callback when a button is clicked', () => {
			let testVar = 0;

			testUtil.control = new GridCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.ACTIONS,
				onSelect() {
					testVar = 2;
				}
			})
				.content({
					columnButtons: [{
						icon: 'circle'
					}, {
						icon: 'trash',
						onClick() {
							testVar++;
						}
					}]
				});

			testUtil.simulateClick(document.querySelectorAll('button')[1]);

			assert.equal(testVar, 2);
		});

		it('should disable all buttons if isEnabled is set to false', () => {
			testUtil.control = new GridCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.ACTIONS,
				isEnabled: false
			})
				.content({
					columnButtons: [{
						icon: 'circle'
					}, {
						icon: 'trash',
						onClick() {
						}
					}]
				});

			assert.equal(document.querySelectorAll('button.disabled').length, 2);
		});

		it('should disable a specific button if specified', () => {
			testUtil.control = new GridCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.ACTIONS
			})
				.content({
					columnButtons: [{
						icon: 'circle'
					}, {
						icon: 'trash',
						onClick() {
						}
					}],
					buttons: [{
						disabled: true
					}]
				});

			assert.equal(document.querySelectorAll('button.disabled').length, 1);
		});

		it('should add a title to a button if the button is disabled and a title is provided', () => {
			testUtil.control = new GridCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.ACTIONS
			})
				.content({
					columnButtons: [{
						icon: 'circle',
						disabled: {
							title: 'test title'
						}
					}, {
						icon: 'trash',
						onClick() {
						}
					}],
					buttons: [{
						disabled: true
					}]
				});

			assert.equal(document.querySelectorAll('button.disabled')[0].getAttribute('alt'), 'test title');
		});

		it('should not throw an error if buttons are provided and a button is moused over', () => {
			let testVar = 0;

			testUtil.control = new GridCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.ACTIONS
			})
				.content({
					columnButtons: [{
						icon: 'circle',
						onClick() {
						}
					}]
				});

			testUtil.trigger(document.querySelectorAll('button')[0], MOUSE_OVER_EVENT);

			assert.equal(testVar, 0);
		});

		it('should not throw an error if buttons are provided and a button is moused over and then out', () => {
			let testVar = 0;

			testUtil.control = new GridCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.ACTIONS
			})
				.content({
					columnButtons: [{
						icon: 'circle',
						onClick() {
						}
					}]
				});

			testUtil.trigger(document.querySelectorAll('button')[0], MOUSE_OVER_EVENT);
			testUtil.trigger(document.querySelectorAll('button')[0], MOUSE_OUT_EVENT);

			assert.equal(testVar, 0);
		});

		it('should have a checkox if datatype is set to CHECKBOX and content is set twice', () => {
			testUtil.control = new GridCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.CHECKBOX
			})
				.content({
					text: ''
				});

			testUtil.control.content({
				text: 'another'
			});

			assert.equal(document.querySelectorAll('.checkbox').length, 1);
		});
	});

	describe('DisplayType', () => {
		it('should return a displayType of gridConstants.DISPLAY_TYPES.TEXT if dataType is set to gridConstants.COLUMN_TYPES.TEXT', () => {
			testUtil.control = new GridCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.TEXT
			})
				.content({});

			assert.equal(testUtil.control.displayType(), gridConstants.DISPLAY_TYPES.TEXT);
		});

		it('should return a displayType of gridConstants.DISPLAY_TYPES.TEXT if dataType is set to gridConstants.COLUMN_TYPES.EMAIL', () => {
			testUtil.control = new GridCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.EMAIL
			})
				.content({});

			assert.equal(testUtil.control.displayType(), gridConstants.DISPLAY_TYPES.TEXT);
		});

		it('should return a displayType of gridConstants.DISPLAY_TYPES.TEXT if dataType is set to gridConstants.COLUMN_TYPES.LINK', () => {
			testUtil.control = new GridCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.LINK
			})
				.content({});

			assert.equal(testUtil.control.displayType(), gridConstants.DISPLAY_TYPES.TEXT);
		});

		it('should return a displayType of gridConstants.DISPLAY_TYPES.TEXT if dataType is set to gridConstants.COLUMN_TYPES.NUMBER', () => {
			testUtil.control = new GridCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.NUMBER
			})
				.content({});

			assert.equal(testUtil.control.displayType(), gridConstants.DISPLAY_TYPES.TEXT);
		});

		it('should return a displayType of gridConstants.DISPLAY_TYPES.TEXT if dataType is set to gridConstants.COLUMN_TYPES.DATE', () => {
			testUtil.control = new GridCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.DATE
			})
				.content({});

			assert.equal(testUtil.control.displayType(), gridConstants.DISPLAY_TYPES.TEXT);
		});

		it('should return a displayType of gridConstants.DISPLAY_TYPES.TEXT if dataType is set to gridConstants.COLUMN_TYPES.DATE_TIME', () => {
			testUtil.control = new GridCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.DATE_TIME
			})
				.content({});

			assert.equal(testUtil.control.displayType(), gridConstants.DISPLAY_TYPES.TEXT);
		});

		it('should return a displayType of gridConstants.DISPLAY_TYPES.TEXT if dataType is set to gridConstants.COLUMN_TYPES.TIME', () => {
			testUtil.control = new GridCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.TIME
			})
				.content({});

			assert.equal(testUtil.control.displayType(), gridConstants.DISPLAY_TYPES.TEXT);
		});

		it('should return a displayType of gridConstants.DISPLAY_TYPES.IMAGE if dataType is set to gridConstants.COLUMN_TYPES.IMAGE', () => {
			testUtil.control = new GridCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.IMAGE
			})
				.content({});

			assert.equal(testUtil.control.displayType(), gridConstants.DISPLAY_TYPES.IMAGE);
		});

		it('should return a displayType of gridConstants.DISPLAY_TYPES.BUTTONS if dataType is set to gridConstants.COLUMN_TYPES.ACTIONS', () => {
			testUtil.control = new GridCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.ACTIONS
			})
				.content({
					columnButtons: []
				});

			assert.equal(testUtil.control.displayType(), gridConstants.DISPLAY_TYPES.BUTTONS);
		});

		it('should return a displayType of gridConstants.DISPLAY_TYPES.CHECKBOX if dataType is set to gridConstants.COLUMN_TYPES.CHECKBOX', () => {
			testUtil.control = new GridCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.CHECKBOX
			})
				.content({});

			assert.equal(testUtil.control.displayType(), gridConstants.DISPLAY_TYPES.CHECKBOX);
		});

		it('should return a displayType of gridConstants.DISPLAY_TYPES.IMAGE if dataType is set to gridConstants.COLUMN_TYPES.IMAGE', () => {
			testUtil.control = new GridCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.IMAGE
			})
				.content({});

			assert.equal(testUtil.control.displayType(), gridConstants.DISPLAY_TYPES.IMAGE);
		});
	});

	describe('IsSelected', () => {
		testUtil.testMethod({
			methodName: 'isSelected',
			defaultSettings: {
				container: testUtil.container
			},
			defaultValue: false,
			testValue: true
		});

		it('should check a checkbox if isSelected is true and the display type is checkbox', () => {
			testUtil.control = new GridCell({
				container: testUtil.container
			})
				.dataType(gridConstants.COLUMN_TYPES.CHECKBOX)
				.content({})
				.isSelected(true);

			assert.equal(document.querySelectorAll('.checkbox.checked').length, 1);
		});

		it('should check a checkbox if isSelected is true before the display type is set to checkbox', () => {
			testUtil.control = new GridCell({
				container: testUtil.container
			})
				.isSelected(true)
				.dataType(gridConstants.COLUMN_TYPES.CHECKBOX)
				.content({});

			assert.equal(document.querySelectorAll('.checkbox.checked').length, 1);
		});

		it('should NOT check a checkbox if isSelected is false and the display type is checkbox', () => {
			testUtil.control = new GridCell({
				container: testUtil.container
			})
				.dataType(gridConstants.COLUMN_TYPES.CHECKBOX)
				.content({})
				.isSelected(false);

			assert.equal(document.querySelectorAll('.checkbox.checked').length, 0);
		});

		it('should NOT check a checkbox if isSelected is set to true and then false and the display type is checkbox', () => {
			testUtil.control = new GridCell({
				container: testUtil.container
			})
				.dataType(gridConstants.COLUMN_TYPES.CHECKBOX)
				.content({})
				.isSelected(true);

			testUtil.control.isSelected(false);

			assert.equal(document.querySelectorAll('.checkbox.checked').length, 0);
		});

		it('should call the onSelect callback with true when an unchecked checkbox is clicked', () => {
			let testVar = null;

			testUtil.control = new GridCell({
				container: testUtil.container,
				onSelect(isChecked) {
					testVar = isChecked;
				}
			})
				.dataType(gridConstants.COLUMN_TYPES.CHECKBOX)
				.content({});

			testUtil.simulateClick(document.querySelector('.checkbox'));

			assert.isTrue(testVar === true);
		});

		it('should call the onSelect callback with false when a checked checkbox is clicked', () => {
			let testVar = null;

			testUtil.control = new GridCell({
				container: testUtil.container,
				onSelect(isChecked) {
					testVar = isChecked;
				}
			})
				.dataType(gridConstants.COLUMN_TYPES.CHECKBOX)
				.content({})
				.isSelected(true);

			testUtil.simulateClick(document.querySelector('.checkbox'));

			assert.isTrue(testVar === false);
		});

		it('should call the onSelect callback with true when a checked checkbox is clicked twice', () => {
			let testVar = null;

			testUtil.control = new GridCell({
				container: testUtil.container,
				onSelect(isChecked) {
					testVar = isChecked;
				}
			})
				.dataType(gridConstants.COLUMN_TYPES.CHECKBOX)
				.content({})
				.isSelected(true);

			testUtil.simulateClick(document.querySelector('.checkbox'));
			testUtil.simulateClick(document.querySelector('.checkbox'));

			assert.isTrue(testVar === true);
		});

		it('should call the onSelect callback with an event object when a checkbox is clicked', () => {
			let testVar = null;

			testUtil.control = new GridCell({
				container: testUtil.container,
				onSelect() {
					testVar = event;
				}
			})
				.dataType(gridConstants.COLUMN_TYPES.CHECKBOX)
				.content({});

			testUtil.simulateClick(document.querySelector('.checkbox'));

			assert.isTrue(testVar.target.nodeName === 'INPUT');
		});
	});

	describe('CanWordWrap', () => {
		testUtil.testMethod({
			methodName: 'wordWrap',
			defaultSettings: {
				container: testUtil.container
			},
			defaultValue: false,
			testValue: true,
			testValueClass: 'can-wrap'
		});

		it('should have a tooltip if the text doesn\'t fit in the cell', () => {
			testUtil.control = new GridCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.TEXT,
				width: '50px'
			})
				.content({
					text: 'a long string that doesn\'t fit in a narrow cell'
				});

			testUtil.control.resize(true);

			assert.equal(testUtil.control.tooltip(), 'a long string that doesn\'t fit in a narrow cell');
		});

		it('should have a trimmed tooltip if the text doesn\'t fit in the cell and is more than 600 characters', () => {
			testUtil.control = new GridCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.TEXT,
				width: '50px'
			})
				.content({
					text: '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890+'
				});

			testUtil.control.resize(true);

			assert.equal(testUtil.control.tooltip(), '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890…');
		});
	});

	describe('TextAlign', () => {
		testUtil.testMethod({
			methodName: 'textAlign',
			defaultSettings: {
				container: testUtil.container
			},
			defaultValue: gridConstants.CELL_ALIGNMENT.NONE,
			testValue: gridConstants.CELL_ALIGNMENT.CENTER,
			secondTestValue: gridConstants.CELL_ALIGNMENT.RIGHT,
			testValueClass: [{
				class: 'align-right',
				testValue: gridConstants.CELL_ALIGNMENT.RIGHT
			}, {
				class: 'align-center',
				testValue: gridConstants.CELL_ALIGNMENT.CENTER
			}, {
				class: 'align-left',
				testValue: gridConstants.CELL_ALIGNMENT.LEFT
			}]
		});
	});

	describe('IsEnabled', () => {
		testUtil.testMethod({
			methodName: 'isEnabled',
			defaultSettings: {
				container: testUtil.container
			},
			defaultValue: true,
			testValue: false
		});
	});

	describe('Tooltip', () => {
		testUtil.testMethod({
			methodName: 'tooltip',
			defaultSettings: {
				container: testUtil.container
			},
			defaultValue: '',
			testValue: 'Test tooltip',
			secondTestValue: 'Test tooltip 2'
		});

		it('should show a tooltip when the tooltip method is set and the mouse is over the cell', () => {
			testUtil.control = new GridCell({
				container: testUtil.container,
				tooltip: 'test'
			});

			testUtil.trigger(testUtil.control.element(), MOUSE_ENTER_EVENT);

			return wait(510)
				.then(() => {
					assert.equal(document.querySelectorAll('.tooltip').length, 1);
				});
		});

		it('should NOT show a tooltip when the tooltip method is not set and the mouse is over the cell', () => {
			testUtil.control = new GridCell({
				container: testUtil.container
			});

			testUtil.trigger(testUtil.control.element(), MOUSE_ENTER_EVENT);

			return wait(510)
				.then(() => {
					assert.equal(document.querySelectorAll('.tooltip').length, 0);
				});
		});

		it('should NOT show a tooltip when the tooltip method is set and then set to an empty string and the mouse is over the cell', () => {
			testUtil.control = new GridCell({
				container: testUtil.container,
				tooltip: 'test'
			});

			testUtil.control.tooltip('');
			testUtil.trigger(testUtil.control.element(), MOUSE_ENTER_EVENT);

			return wait(510)
				.then(() => {
					assert.equal(document.querySelectorAll('.tooltip').length, 0);
				});
		});
	});

	describe('ResetClasses', () => {
		it('should have the class "grid-cell" after resetClasses is called', () => {
			testUtil.control = new GridCell({
				container: testUtil.container,
				classes: 'test'
			});

			testUtil.control.resetClasses();

			assert.equal(document.querySelectorAll('.grid-cell').length, 1);
		});

		it('should have the class "can-wrap" after resetClasses is called if wordWrap is true', () => {
			testUtil.control = new GridCell({
				container: testUtil.container,
				wordWrap: true,
				classes: 'test'
			});

			testUtil.control.resetClasses();

			assert.equal(document.querySelectorAll('.can-wrap').length, 1);
		});

		it('should have the class "align-right" after resetClasses is called if textAlign is set', () => {
			testUtil.control = new GridCell({
				container: testUtil.container,
				textAlign: gridConstants.CELL_ALIGNMENT.RIGHT,
				classes: 'test'
			});

			testUtil.control.resetClasses();

			assert.equal(document.querySelectorAll('.align-right').length, 1);
		});

		it('should remove all added classes after resetClasses is called', () => {
			testUtil.control = new GridCell({
				container: testUtil.container,
				classes: 'test=-class'
			});

			testUtil.control.resetClasses();

			assert.equal(document.querySelectorAll('.test-class').length, 0);
		});
	});
});
