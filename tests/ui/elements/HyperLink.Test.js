import { HyperLink } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(HyperLink);
const controlTests = new ControlTests(HyperLink, testUtil, {
	focusableElement: 'HyperLink'
});

describe('HyperLink', () => {
	controlTests.run(['width', 'height']);
});
