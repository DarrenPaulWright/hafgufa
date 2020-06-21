import keyCodes from 'keycodes';
import shortid from 'shortid';
import { castArray } from 'type-enforcer';
import { BODY, KEY_DOWN_EVENT } from './domConstants.js';

const defaults = {
	altKey: false,
	ctrlKey: false,
	shiftKey: false
};

const titleModifiers = {
	escape: 'esc',
	left: '',
	right: '',
	up: '',
	down: ''
};

const SEPARATOR = ' + ';

class Shortcuts {
	constructor() {
		const self = this;

		self._shortcuts = [];

		BODY.addEventListener(KEY_DOWN_EVENT, (event) => {
			self._processEvent(event);
		});
	}

	_processEvent(event) {
		this._shortcuts.forEach((shortcut) => {
			if (
				shortcut.keyCode === event.keyCode &&
				event.ctrlKey === shortcut.ctrlKey &&
				event.altKey === shortcut.altKey &&
				event.shiftKey === shortcut.shiftKey
			) {
				event.preventDefault();
				shortcut.callback(event);
			}
		});
	}

	_buildTitle(shortcut) {
		let output = '';

		if (shortcut.ctrlKey) {
			output += 'ctrl' + SEPARATOR;
		}

		if (shortcut.altKey) {
			output += 'alt' + SEPARATOR;
		}

		if (shortcut.shiftKey) {
			output += 'shift' + SEPARATOR;
		}

		return output + (titleModifiers[shortcut.key] || shortcut.key);
	}

	add(shortcuts, control) {
		const self = this;
		const id = shortid.generate();

		castArray(shortcuts).forEach((shortcut) => {
			self._shortcuts.push({
				id,
				...defaults,
				...shortcut,
				keyCode: shortcut.keyCode || keyCodes(shortcut.key)
			});
		});

		if (control !== undefined) {
			control.onRemove(() => {
				self.discard(id);
			});
		}

		return id;
	}

	discard(id) {
		this._shortcuts = this._shortcuts.filter((shortcut) => {
			return shortcut.id !== id;
		});
	}

	descriptions() {
		const self = this;

		return self._shortcuts.map((shortcut) => {
			return {
				title: self._buildTitle(shortcut),
				description: shortcut.description
			};
		});
	}
}

export default new Shortcuts();
