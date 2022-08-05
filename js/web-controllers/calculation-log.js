import { domFactory, div } from '../support/dom-factory.js';

const logs = document.querySelector('#logs');

export const clear = () => {
    logs.innerHTML = '';
};

export const writeln = (text) => {
    if (!text.trim()) {
        logs.appendChild(domFactory('br'));
    } else {
        const line = div('log-line');
        line.innerText = text;
        logs.appendChild(line);
    }
};
