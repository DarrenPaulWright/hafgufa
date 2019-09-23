import { TileLayout } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

describe('TileLayout', () => {
	const testUtil = new TestUtil(TileLayout);
	const controlBaseTests = new ControlTests(TileLayout, testUtil);

	controlBaseTests.run();
});
