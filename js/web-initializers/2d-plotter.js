import * as Plotter from '../canvas/2d-plotter.js';
import * as Projections from '../canvas/projections.js';

const canvas = Plotter.getCanvas();
const [ projection ] = Projections.list();

document.querySelector('.canvas-wrapping').appendChild(canvas);

Plotter.setProjection(projection);
Plotter.resize({
	width: 800,
	height: 800/projection.ratio,
});
Plotter.update();
