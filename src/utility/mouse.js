import { event, select } from 'd3';
import { BODY, MOUSE_ENTER_EVENT, MOUSE_MOVE_EVENT } from './domConstants';

const MOUSE_EVENT_SUFFIX = '.mouse';

export let x = null;
export let y = null;

const onMouseUpdate = () => {
	x = event.pageX;
	y = event.pageY;
};

select(BODY)
	.on(MOUSE_MOVE_EVENT + MOUSE_EVENT_SUFFIX, onMouseUpdate)
	.on(MOUSE_ENTER_EVENT + MOUSE_EVENT_SUFFIX, onMouseUpdate);
