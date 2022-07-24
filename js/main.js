import BodyList from './body-list.js';
import './readings-manager.js';

const domFactory = (tagname, classAttr, content) => {
    const dom = document.createElement(tagname);
    if (classAttr) {
        dom.setAttribute('class', classAttr);
    }
    if (!content) return dom;
    if (typeof content === 'string') {
        dom.innerHTML = content;
        return dom;
    }
    if (content instanceof Array) {
        for (const item of content) {
            dom.appendChild(item);
        }
        return dom;
    }
    dom.appendChild(content);
    return dom;
};

const div = (...args) => domFactory('div', ...args);
const button = (...args) => domFactory('button', ...args);

const getDimentions = (dom) => {
    const { width, height } = getComputedStyle(dom);
    return [
        1 * width.replace('px', ''),
        1 * height.replace('px', ''),
    ];
};

const centralize = (background, wind) => {
    const [ screenWidth, screenHeight ] = getDimentions(background);
    const [ windWidth, windHeight ] = getDimentions(wind);
    const left = Math.floor((screenWidth - windWidth)*0.5);
    const top = Math.floor((screenHeight - windHeight)*0.4);
    wind.style.marginTop = top + 'px';
    wind.style.marginLeft = left + 'px';
};

const formHandlers = {
    'reading': {
        init: (content) => {
            const inputDate = content.querySelector('[type="datetime-local"]');
            const nowButton = content.querySelector('[type="button"]');
            nowButton.onclick = () => {
                inputDate.value = new Date().toISOString().replace(/Z|\.\d+/g, '');
            };

            const listName = [ 'Other', ...BodyList.map(({ name }) => name) ];

            content.querySelector('[name="body"]').innerHTML = listName
                .map(name => `<option value="${name}">${name}</option>`)
                .join('');
        },
        close: () => {},
    }
};

const openPopup = async (name, onsubmit) => {
    const url = `forms/${name}.html`;
    const response = await fetch(url);
    const html = await response.text();
    const closeButton = button('close-button', '&#215;');
    const content = div('content', html);
    const wind = div('popup-window', [ closeButton, content ]);
    const popupBackground = div('popup-background', wind);
    document.body.appendChild(popupBackground);
    closeButton.onclick = () => {
        formHandlers[name].close();
        popupBackground.remove();
    };
    centralize(popupBackground, wind);
    formHandlers[name].init(content);
    return content;
};

window.addEventListener('resize', () => {
    const backgrounds = [ ...document.querySelectorAll('.popup-background') ];
    for (const background of backgrounds) {
        const wind = background.firstChild;
        centralize(background, wind);
    }
});

const newReading = async () => {
    const popup = await openPopup('reading');
    popup.querySelector('.delete').remove();
};

document.querySelector('.new-button').onclick = () => {
    newReading();
};
