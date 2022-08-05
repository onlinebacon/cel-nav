export const domFactory = (tagname, classAttr, ...content) => {
    const dom = document.createElement(tagname);
    if (classAttr) {
        dom.setAttribute('class', classAttr);
    }
    for (let item of content) {
        if (typeof item === 'string') {
            dom.innerHTML += item;
        } else {
            dom.appendChild(item);
        }
    }
    return dom;
};

export const div = (...args) => domFactory('div', ...args);
export const button = (...args) => domFactory('button', ...args);
