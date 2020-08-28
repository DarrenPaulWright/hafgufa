import { TileLayout } from '../../index.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

describe('TileLayout', () => {
	const testUtil = new TestUtil(TileLayout);
	const controlTests = new ControlTests(TileLayout, testUtil);

	controlTests.run();
});
