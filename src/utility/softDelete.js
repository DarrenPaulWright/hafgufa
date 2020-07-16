import { clone } from 'object-agent';
import toast from '../display/toast.js';
import locale from './locale.js';

/**
 * @class SoftDelete
 *
 * @param {object} settings
 * @param {string} settings.title
 * @param {string} settings.value
 * @param {Function} [settings.onDo] - Called after the value is cloned
 * @param {Function} settings.onUndo - Called if the user clicks the toast. the clone of the original value is provided as an argument.
 * @param {Function} [settings.onCommit] - Called if the toast is removed without onUndo being called
 */
export default function(settings = {}) {
	let previous = clone(settings.value);
	let isUndone = false;

	if (settings.onDo) {
		settings.onDo();
	}

	toast.info({
		title: settings.title,
		subTitle: locale.get('clickToUndo'),
		onClick() {
			isUndone = true;
			settings.onUndo(previous);
		},
		onRemove() {
			if (!isUndone && settings.onCommit) {
				settings.onCommit();
			}
			previous = null;
		}
	});
}
