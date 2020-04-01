import { TileLayout } from '../..';
import ControlTests from '../ControlTests';
import TestUtil from '../TestUtil';

describe('TileLayout', () => {
	const testUtil = new TestUtil(TileLayout);
	const controlBaseTests = new ControlTests(TileLayout, testUtil);

	controlBaseTests.run();
});
