import DragMixin from '../mixins/DragMixin.js';
import Container from './Container.js';

/**
 * @class DragContainer
 * @mixes DragMixin
 * @extends Container
 *
 * @param {object} [settings]
 */
export default class DragContainer extends DragMixin(Container) {}
