import { clone } from 'object-agent';
import toast from '../ui/display/toast';
import locale from './locale';

/**
 * @class SoftDelete
 *
 * @arg {Object} settings
 * @arg {String} settings.title
 * @arg {String} settings.value
 * @arg {function} [settings.onDo] - Called after the value is cloned
 * @arg {function} settings.onUndo - Called if the user clicks the toast. the clone of the original value is provided as an argument.
 * @arg {function} [settings.onCommit] - Called if the toast is removed without onUndo being called
 */
export default function(settings = {}) {
	let prev = clone(settings.value);
	let isUndone = false;

	if (settings.onDo) {
		settings.onDo();
	}

	toast.info({
		title: settings.title,
		subTitle: locale.get('clickToUndo'),
		onClick() {
			isUndone = true;
			settings.onUndo(prev);
		},
		onRemove() {
			if (!isUndone && settings.onCommit) {
				settings.onCommit();
			}
			prev = null;
		}
	});
}
