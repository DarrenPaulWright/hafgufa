import { TileLayout } from '../../index.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

describe('TileLayout', () => {
	const testUtil = new TestUtil(TileLayout);
	const controlBaseTests = new ControlTests(TileLayout, testUtil);

	controlBaseTests.run();
});
