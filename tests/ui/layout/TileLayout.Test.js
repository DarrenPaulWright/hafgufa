import { TileLayout } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(TileLayout);
const controlBaseTests = new ControlTests(TileLayout, testUtil);

describe('TileLayout', () => {
	controlBaseTests.run();
});
