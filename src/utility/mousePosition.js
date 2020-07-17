import { BODY, MOUSE_ENTER_EVENT, MOUSE_MOVE_EVENT } from './domConstants.js';

const mousePosition = {
	x: 0,
	y: 0
};

const onMouseUpdate = (event) => {
	mousePosition.x = event.pageX;
	mousePosition.y = event.pageY;
};

BODY.addEventListener(MOUSE_MOVE_EVENT, onMouseUpdate, false);
BODY.addEventListener(MOUSE_ENTER_EVENT, onMouseUpdate, false);

export default mousePosition;
