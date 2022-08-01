import * as Plotter from '../canvas-plotting/2d-plotter.js';
import * as Projections from '../canvas-plotting/projections.js';

const canvas = Plotter.getCanvas();
const [ projection ] = Projections.list();

document.querySelector('.canvas-wrapping').appendChild(canvas);

Plotter.setProjection(projection);
Plotter.resize({
	width: 800,
	height: 800/projection.ratio,
});
Plotter.update();
