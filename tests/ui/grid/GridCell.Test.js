import { assert } from 'chai';
import { event } from 'd3';
import GridCell from '../../../src/ui/grid/GridCell';
import * as gridConstants from '../../../src/ui/grid/gridConstants';
import { MOUSE_ENTER_EVENT, MOUSE_OUT_EVENT, MOUSE_OVER_EVENT } from '../../../src/utility/domConstants';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(GridCell);
const controlBaseTests = new ControlTests(GridCell, testUtil);

describe('GridCell', () => {

	beforeEach(() => {
		window.testContainer.classList.add('grid');
	});

	controlBaseTests.run(['isEnabled']);

	describe('Data', () => {
		testUtil.testMethod({
			methodName: 'data',
			defaultSettings: {
				container: window.testContainer
			},
			defaultValue: {},
			testValue: {
				test: true
			}
		});
	});

	describe('OnRenderCell', () => {
		testUtil.testMethod({
			methodName: 'onRenderCell',
			defaultSettings: {
				container: window.testContainer
			},
			defaultValue: undefined,
			testValue() {
				return 'test';
			}
		});
	});

	describe('OnRemoveCell', () => {
		testUtil.testMethod({
			methodName: 'onRemoveCell',
			defaultSettings: {
				container: window.testContainer
			},
			defaultValue: undefined,
			testValue() {
				return 'test';
			}
		});
	});

	describe('OnRowClick', () => {
		testUtil.testMethod({
			methodName: 'onRowClick',
			defaultSettings: {
				container: window.testContainer
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
				container: window.testContainer
			},
			defaultValue: gridConstants.COLUMN_TYPES.NONE,
			testValue: gridConstants.COLUMN_TYPES.CHECKBOX,
			secondTestValue: gridConstants.COLUMN_TYPES.TEXT
		});

		it('should remove a toolbar if previously set to ACTIONS', () => {
			window.control = new GridCell({
				container: window.testContainer,
				dataType: gridConstants.COLUMN_TYPES.ACTIONS
			})
				.content({
					columnButtons: [{
						icon: 'trash'
					}]
				});

			window.control.dataType(gridConstants.COLUMN_TYPES.TEXT);

			assert.equal(document.querySelectorAll('.toolbar').length, 0);
		});

		it('should remove a checkbox if previously set to CHECKBOX', () => {
			window.control = new GridCell({
				container: window.testContainer,
				dataType: gridConstants.COLUMN_TYPES.CHECKBOX
			})
				.content({});

			window.control.dataType(gridConstants.COLUMN_TYPES.TEXT);

			assert.equal(document.querySelectorAll('.checkboxes').length, 0);
		});

		it('should call onRemoveCell if set', () => {
			let testVar = null;
			let returnedControl = null;

			window.control = new GridCell({
				container: window.testContainer,
				dataType: gridConstants.COLUMN_TYPES.CHECKBOX,
				onRemoveCell(content, cellControl) {
					testVar = content.newValue;
					returnedControl = cellControl;
				}
			})
				.content({
					newValue: 'success'
				});

			window.control.dataType(gridConstants.COLUMN_TYPES.TEXT);

			assert.equal(testVar, 'success');
			assert.equal(returnedControl, window.control);
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
			output: '<img src=\"test.png\">',

			textAlign: 'CENTER'
		}, {
			type: 'IMAGE',
			content: {
				src: 'test.png',
				link: 'index.html'
			},
			output: '<a target=\"_blank\" href=\"index.html\"><img src=\"test.png\"></a>',
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
			output: '<div class=\"toolbar clearfix\"><button class=\"icon-button\" type=\"button\"><i class=\"icon icon-lg fa-circle\" id="buttonIcon"></i></button></div>',
			textAlign: 'NONE'
		}, {
			type: 'CUSTOM',
			content: {
				text: 'custom text'
			},
			output: 'custom text',
			onRenderCell(content, container) {
				container.innerHTML = content.text;
			},
			onRemoveCell() {
			},
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
			textAlign,
			onRenderCell,
			onRemoveCell
		) => {
			it('should render the content provided when dataType is ' + typeString, () => {
				window.control = new GridCell({
					container: window.testContainer,
					dataType: gridConstants.COLUMN_TYPES[typeString],
					onRenderCell: onRenderCell,
					onRemoveCell: onRemoveCell
				})
					.content(inputContent);

				assert.equal(window.control.element().innerHTML, outputText);
			});

			it('should have textAlign of ' + textAlign + ' when dataType is ' + typeString, () => {
				window.control = new GridCell({
					container: window.testContainer,
					dataType: gridConstants.COLUMN_TYPES[typeString],
					onRenderCell: onRenderCell,
					onRemoveCell: onRemoveCell
				})
					.content(inputContent);

				assert.equal(window.control.textAlign(), gridConstants.CELL_ALIGNMENT[textAlign]);
			});

			testTypes.forEach((testType) => {
				it('should render the content provided when dataType is ' + typeString + ' and then dataType is set to ' + testType.type, () => {
					window.control = new GridCell({
						container: window.testContainer,
						dataType: gridConstants.COLUMN_TYPES[typeString],
						onRenderCell: onRenderCell,
						onRemoveCell: onRemoveCell
					})
						.content(inputContent);

					window.control
						.dataType(gridConstants.COLUMN_TYPES[testType.type])
						.onRenderCell(testType.onRenderCell)
						.onRemoveCell(testType.onRemoveCell)
						.content(testType.content);

					assert.equal(window.control.element().innerHTML, testType.output);
				});
			});
		};

		testTypes.forEach((testType) => {
			runSpecificContent(testType.type, testType.content, testType.output, testType.textAlign, testType.onRenderCell, testType.onRemoveCell);
		});

		it('should render buttons when dataType is ACTIONS and button definitions are provided', () => {
			window.control = new GridCell({
				container: window.testContainer,
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
			window.control = new GridCell({
				container: window.testContainer,
				dataType: gridConstants.COLUMN_TYPES.ACTIONS
			})
				.content({
					columnButtons: [{
						icon: 'circle'
					}, {
						icon: 'trash'
					}]
				});

			window.control.content({
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

			window.control = new GridCell({
				container: window.testContainer,
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

			window.control = new GridCell({
				container: window.testContainer,
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
			window.control = new GridCell({
				container: window.testContainer,
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
			window.control = new GridCell({
				container: window.testContainer,
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
			window.control = new GridCell({
				container: window.testContainer,
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

			window.control = new GridCell({
				container: window.testContainer,
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

			window.control = new GridCell({
				container: window.testContainer,
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
			window.control = new GridCell({
				container: window.testContainer,
				dataType: gridConstants.COLUMN_TYPES.CHECKBOX
			})
				.content({
					text: ''
				});

			window.control.content({
				text: 'another'
			});

			assert.equal(document.querySelectorAll('.checkbox').length, 1);
		});

		it('should call onRenderCell when dataType is CUSTOM', () => {
			window.control = new GridCell({
				container: window.testContainer,
				dataType: gridConstants.COLUMN_TYPES.CUSTOM,
				onRenderCell(content, container, customData) {
					if (content.text === 'test' && container && customData) {
						container.innerHTML = content.text;
					}
				},
				onRemoveCell() {
				}
			})
				.content({
					text: 'test'
				});

			assert.equal(window.control.element().textContent, 'test');
		});

		it('should call onRemoveCell when dataType is CUSTOM and content is set twice', () => {
			let testVar = 0;

			window.control = new GridCell({
				container: window.testContainer,
				dataType: gridConstants.COLUMN_TYPES.CUSTOM,
				onRenderCell(content, container, customData) {
					if (content.text === 'test' && container && customData) {
						container.innerHTML = content.text;
					}
				},
				onRemoveCell(content, cellControl) {
					if (content === '' && cellControl === window.control) {
						testVar = content.text;
					}
				}
			})
				.content({
					text: 'test'
				});

			window.control.content({
				text: ''
			});

			assert.equal(testVar, '');
		});
	});

	describe('DisplayType', () => {
		it('should return a displayType of gridConstants.DISPLAY_TYPES.TEXT if dataType is set to gridConstants.COLUMN_TYPES.TEXT', () => {
			window.control = new GridCell({
				container: window.testContainer,
				dataType: gridConstants.COLUMN_TYPES.TEXT
			})
				.content({});

			assert.equal(window.control.displayType(), gridConstants.DISPLAY_TYPES.TEXT);
		});

		it('should return a displayType of gridConstants.DISPLAY_TYPES.TEXT if dataType is set to gridConstants.COLUMN_TYPES.EMAIL', () => {
			window.control = new GridCell({
				container: window.testContainer,
				dataType: gridConstants.COLUMN_TYPES.EMAIL
			})
				.content({});

			assert.equal(window.control.displayType(), gridConstants.DISPLAY_TYPES.TEXT);
		});

		it('should return a displayType of gridConstants.DISPLAY_TYPES.TEXT if dataType is set to gridConstants.COLUMN_TYPES.LINK', () => {
			window.control = new GridCell({
				container: window.testContainer,
				dataType: gridConstants.COLUMN_TYPES.LINK
			})
				.content({});

			assert.equal(window.control.displayType(), gridConstants.DISPLAY_TYPES.TEXT);
		});

		it('should return a displayType of gridConstants.DISPLAY_TYPES.TEXT if dataType is set to gridConstants.COLUMN_TYPES.NUMBER', () => {
			window.control = new GridCell({
				container: window.testContainer,
				dataType: gridConstants.COLUMN_TYPES.NUMBER
			})
				.content({});

			assert.equal(window.control.displayType(), gridConstants.DISPLAY_TYPES.TEXT);
		});

		it('should return a displayType of gridConstants.DISPLAY_TYPES.TEXT if dataType is set to gridConstants.COLUMN_TYPES.DATE', () => {
			window.control = new GridCell({
				container: window.testContainer,
				dataType: gridConstants.COLUMN_TYPES.DATE
			})
				.content({});

			assert.equal(window.control.displayType(), gridConstants.DISPLAY_TYPES.TEXT);
		});

		it('should return a displayType of gridConstants.DISPLAY_TYPES.TEXT if dataType is set to gridConstants.COLUMN_TYPES.DATE_TIME', () => {
			window.control = new GridCell({
				container: window.testContainer,
				dataType: gridConstants.COLUMN_TYPES.DATE_TIME
			})
				.content({});

			assert.equal(window.control.displayType(), gridConstants.DISPLAY_TYPES.TEXT);
		});

		it('should return a displayType of gridConstants.DISPLAY_TYPES.TEXT if dataType is set to gridConstants.COLUMN_TYPES.TIME', () => {
			window.control = new GridCell({
				container: window.testContainer,
				dataType: gridConstants.COLUMN_TYPES.TIME
			})
				.content({});

			assert.equal(window.control.displayType(), gridConstants.DISPLAY_TYPES.TEXT);
		});

		it('should return a displayType of gridConstants.DISPLAY_TYPES.IMAGE if dataType is set to gridConstants.COLUMN_TYPES.IMAGE', () => {
			window.control = new GridCell({
				container: window.testContainer,
				dataType: gridConstants.COLUMN_TYPES.IMAGE
			})
				.content({});

			assert.equal(window.control.displayType(), gridConstants.DISPLAY_TYPES.IMAGE);
		});

		it('should return a displayType of gridConstants.DISPLAY_TYPES.BUTTONS if dataType is set to gridConstants.COLUMN_TYPES.ACTIONS', () => {
			window.control = new GridCell({
				container: window.testContainer,
				dataType: gridConstants.COLUMN_TYPES.ACTIONS
			})
				.content({
					columnButtons: []
				});

			assert.equal(window.control.displayType(), gridConstants.DISPLAY_TYPES.BUTTONS);
		});

		it('should return a displayType of gridConstants.DISPLAY_TYPES.CUSTOM if dataType is set to gridConstants.COLUMN_TYPES.CUSTOM', () => {
			window.control = new GridCell({
				container: window.testContainer,
				dataType: gridConstants.COLUMN_TYPES.CUSTOM,
				onRenderCell() {
				}
			})
				.content({});

			assert.equal(window.control.displayType(), gridConstants.DISPLAY_TYPES.CUSTOM);
		});

		it('should return a displayType of gridConstants.DISPLAY_TYPES.CHECKBOX if dataType is set to gridConstants.COLUMN_TYPES.CHECKBOX', () => {
			window.control = new GridCell({
				container: window.testContainer,
				dataType: gridConstants.COLUMN_TYPES.CHECKBOX
			})
				.content({});

			assert.equal(window.control.displayType(), gridConstants.DISPLAY_TYPES.CHECKBOX);
		});

		it('should return a displayType of gridConstants.DISPLAY_TYPES.IMAGE if dataType is set to gridConstants.COLUMN_TYPES.IMAGE', () => {
			window.control = new GridCell({
				container: window.testContainer,
				dataType: gridConstants.COLUMN_TYPES.IMAGE
			})
				.content({});

			assert.equal(window.control.displayType(), gridConstants.DISPLAY_TYPES.IMAGE);
		});
	});

	describe('IsSelected', () => {
		testUtil.testMethod({
			methodName: 'isSelected',
			defaultSettings: {
				container: window.testContainer
			},
			defaultValue: false,
			testValue: true
		});

		it('should check a checkbox if isSelected is true and the display type is checkbox', () => {
			window.control = new GridCell({
				container: window.testContainer
			})
				.dataType(gridConstants.COLUMN_TYPES.CHECKBOX)
				.content({})
				.isSelected(true);

			assert.equal(document.querySelectorAll('.checkbox.checked').length, 1);
		});

		it('should check a checkbox if isSelected is true before the display type is set to checkbox', () => {
			window.control = new GridCell({
				container: window.testContainer
			})
				.isSelected(true)
				.dataType(gridConstants.COLUMN_TYPES.CHECKBOX)
				.content({});

			assert.equal(document.querySelectorAll('.checkbox.checked').length, 1);
		});

		it('should NOT check a checkbox if isSelected is false and the display type is checkbox', () => {
			window.control = new GridCell({
				container: window.testContainer
			})
				.dataType(gridConstants.COLUMN_TYPES.CHECKBOX)
				.content({})
				.isSelected(false);

			assert.equal(document.querySelectorAll('.checkbox.checked').length, 0);
		});

		it('should NOT check a checkbox if isSelected is set to true and then false and the display type is checkbox', () => {
			window.control = new GridCell({
				container: window.testContainer
			})
				.dataType(gridConstants.COLUMN_TYPES.CHECKBOX)
				.content({})
				.isSelected(true);

			window.control.isSelected(false);

			assert.equal(document.querySelectorAll('.checkbox.checked').length, 0);
		});

		it('should call the onSelect callback with true when an unchecked checkbox is clicked', () => {
			let testVar = null;

			window.control = new GridCell({
				container: window.testContainer,
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

			window.control = new GridCell({
				container: window.testContainer,
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

			window.control = new GridCell({
				container: window.testContainer,
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

			window.control = new GridCell({
				container: window.testContainer,
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
				container: window.testContainer
			},
			defaultValue: false,
			testValue: true,
			testValueClass: 'can-wrap'
		});

		it('should have a tooltip if the text doesn\'t fit in the cell', () => {
			window.control = new GridCell({
				container: window.testContainer,
				dataType: gridConstants.COLUMN_TYPES.TEXT,
				width: '50px'
			})
				.content({
					text: 'a long string that doesn\'t fit in a narrow cell'
				});

			window.control.resize(true);

			assert.equal(window.control.tooltip(), 'a long string that doesn\'t fit in a narrow cell');
		});

		it('should have a trimmed tooltip if the text doesn\'t fit in the cell and is more than 600 characters', () => {
			window.control = new GridCell({
				container: window.testContainer,
				dataType: gridConstants.COLUMN_TYPES.TEXT,
				width: '50px'
			})
				.content({
					text: '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890+'
				});

			window.control.resize(true);

			assert.equal(window.control.tooltip(), '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890…');
		});
	});

	describe('TextAlign', () => {
		testUtil.testMethod({
			methodName: 'textAlign',
			defaultSettings: {
				container: window.testContainer
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
				container: window.testContainer
			},
			defaultValue: true,
			testValue: false
		});
	});

	describe('Tooltip', () => {
		testUtil.testMethod({
			methodName: 'tooltip',
			defaultSettings: {
				container: window.testContainer
			},
			defaultValue: '',
			testValue: 'Test tooltip',
			secondTestValue: 'Test tooltip 2'
		});

		it('should show a tooltip when the tooltip method is set and the mouse is over the cell', () => {
			window.control = new GridCell({
				container: window.testContainer,
				tooltip: 'test'
			});

			testUtil.trigger(window.control.element(), MOUSE_ENTER_EVENT);

			return testUtil.delay(510)
				.then(() => {
					assert.equal(document.querySelectorAll('.tooltip').length, 1);
				});
		});

		it('should NOT show a tooltip when the tooltip method is not set and the mouse is over the cell', () => {
			window.control = new GridCell({
				container: window.testContainer
			});

			testUtil.trigger(window.control.element(), MOUSE_ENTER_EVENT);

			return testUtil.delay(510)
				.then(() => {
					assert.equal(document.querySelectorAll('.tooltip').length, 0);
				});
		});

		it('should NOT show a tooltip when the tooltip method is set and then set to an empty string and the mouse is over the cell', () => {
			window.control = new GridCell({
				container: window.testContainer,
				tooltip: 'test'
			});

			window.control.tooltip('');
			testUtil.trigger(window.control.element(), MOUSE_ENTER_EVENT);

			return testUtil.delay(510)
				.then(() => {
					assert.equal(document.querySelectorAll('.tooltip').length, 0);
				});
		});
	});

	describe('ResetClasses', () => {
		it('should have the class "grid-cell" after resetClasses is called', () => {
			window.control = new GridCell({
				container: window.testContainer,
				classes: 'test'
			});

			window.control.resetClasses();

			assert.equal(document.querySelectorAll('.grid-cell').length, 1);
		});

		it('should have the class "can-wrap" after resetClasses is called if wordWrap is true', () => {
			window.control = new GridCell({
				container: window.testContainer,
				wordWrap: true,
				classes: 'test'
			});

			window.control.resetClasses();

			assert.equal(document.querySelectorAll('.can-wrap').length, 1);
		});

		it('should have the class "align-right" after resetClasses is called if textAlign is set', () => {
			window.control = new GridCell({
				container: window.testContainer,
				textAlign: gridConstants.CELL_ALIGNMENT.RIGHT,
				classes: 'test'
			});

			window.control.resetClasses();

			assert.equal(document.querySelectorAll('.align-right').length, 1);
		});

		it('should remove all added classes after resetClasses is called', () => {
			window.control = new GridCell({
				container: window.testContainer,
				classes: 'test=-class'
			});

			window.control.resetClasses();

			assert.equal(document.querySelectorAll('.test-class').length, 0);
		});
	});
});
