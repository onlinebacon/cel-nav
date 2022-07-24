import { div, button } from './support/dom-factory.js';

const parsePixelSize = value => {
    return Number(value.replace('px', ''));
};

const getDimentions = (dom) => {
    const { width, height } = getComputedStyle(dom);
    return [ width, height ].map(parsePixelSize);
};

const centralize = (background, wind) => {
    const [ screenWidth, screenHeight ] = getDimentions(background);
    const [ windWidth, windHeight ] = getDimentions(wind);
    const left = Math.floor((screenWidth - windWidth)*0.5);
    const top = Math.floor((screenHeight - windHeight)*0.4);
    wind.style.marginTop = top + 'px';
    wind.style.marginLeft = left + 'px';
};

export const open = ({ html, onclose }) => {
    const closeButton = button('close-button', '&#215;');
    const content = div('content', html);
    const wind = div('popup-window', closeButton, content);
    const popupBackground = div('popup-background', wind);
    document.body.appendChild(popupBackground);
    closeButton.onclick = () => {
        onclose?.();
        close(popupBackground);
    };
    centralize(popupBackground, wind);
    return content;
};

export const close = (popup) => {
    let element = popup;
    while (!element.matches('.popup-background')) {
        element = element.parentElement;
    }
    element.remove();
};

window.addEventListener('resize', () => {
    const backgrounds = [ ...document.querySelectorAll('.popup-background') ];
    for (const background of backgrounds) {
        const wind = background.firstChild;
        centralize(background, wind);
    }
});
