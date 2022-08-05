import './web-initializers/reading-form.js';
import './web-initializers/2d-plotter.js';
import './web-controllers/readings.js';
import './math/small-circles.js';
import * as FixEngine from './calculation/fix-engine.js';
import * as Readings from './repositories/readings-repository.js';

Readings.on('add', () => FixEngine.run());
Readings.on('remove', () => FixEngine.run());
