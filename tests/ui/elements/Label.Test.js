import { Label } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(Label);
const controlTests = new ControlTests(Label, testUtil);

describe('Label', () => {

	controlTests.run(['width', 'height']);

});
