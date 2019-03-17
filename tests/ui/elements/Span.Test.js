import Span from '../../../src/ui/elements/Span';
import TestUtil from '../../TestUtil';
import ControlBaseTests from '../ControlBaseTests';

const testUtil = new TestUtil(Span);
const controlBaseTests = new ControlBaseTests(Span, testUtil);

describe('Span', () => {

	controlBaseTests.run(['width', 'height']);

});
