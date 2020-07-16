import { BODY, MOUSE_ENTER_EVENT, MOUSE_MOVE_EVENT } from './domConstants.js';

export let x = null;
export let y = null;

const onMouseUpdate = (event) => {
	x = event.pageX;
	y = event.pageY;
};

BODY.addEventListener(MOUSE_MOVE_EVENT, onMouseUpdate, false);
BODY.addEventListener(MOUSE_ENTER_EVENT, onMouseUpdate, false);
