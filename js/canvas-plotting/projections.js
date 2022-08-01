const { PI } = Math;
const d180 = PI;
const d90 = PI*0.5;

export const equirectangular = {
    label: 'Equirectangular',
    imageUrl: 'img/equirectangular.png',
    ratio: 2,
    normalToLatlon: (x, y) => [
        y/d90,
        x/d180,
    ],
    latlonToNormal: (lat, lon) => [
        lon/d180,
        lat/d90,
    ],
};

export const list = () => [
    equirectangular,
];
