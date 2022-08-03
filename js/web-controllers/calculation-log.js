import { div } from '../support/dom-factory.js';

const logs = document.querySelector('#logs');

export const clear = () => {
    logs.innerHTML = '';
};

export const writeln = (text) => {
    const line = div('log-line');
    line.innerText = text;
    logs.appendChild(line);
};
