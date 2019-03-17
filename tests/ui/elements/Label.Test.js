import { Label } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlBaseTests from '../ControlBaseTests';

const testUtil = new TestUtil(Label);
const controlBaseTests = new ControlBaseTests(Label, testUtil);

describe('Label', () => {

	controlBaseTests.run(['width', 'height']);

});
