import { Span } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(Span);
const controlTests = new ControlTests(Span, testUtil);

describe('Span', () => {

	controlTests.run(['width', 'height']);

});
