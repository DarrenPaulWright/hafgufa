import { assert } from 'chai';
import { HyperLink } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlBaseTests from '../ControlBaseTests';

const testUtil = new TestUtil(HyperLink);
const controlBaseTests = new ControlBaseTests(HyperLink, testUtil, {
	focusableElement: 'HyperLink'
});

describe('HyperLink', () => {
	controlBaseTests.run(['width', 'height']);
});
