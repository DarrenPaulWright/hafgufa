import { Hyperlink } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(Hyperlink);
const controlTests = new ControlTests(Hyperlink, testUtil, {
	focusableElement: 'HyperLink'
});

describe('Hyperlink', () => {
	controlTests.run(['width', 'height']);
});
