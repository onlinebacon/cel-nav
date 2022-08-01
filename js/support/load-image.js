const loadImage = (url) => new Promise((done, fail) => {
	const dom = document.createElement('img');
	dom.onload = () => done(dom);
	dom.src = url;
});

export default loadImage;
