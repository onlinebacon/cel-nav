export const vecToLatlon = ([ x, y, z ]) => {
    const lat = Math.asin(y);
    const r = Math.sqrt(x*x + z*z);
    if (r === 0) {
        return [ lat, 0 ];
    }
    return [ lat, Math.acos(z/r)*(x < 0 ? -1 : 1) ];
};

export const buildLatlonMat3 = (lat, lon) => {
	const sinLat = Math.sin(lat);
	const cosLat = Math.cos(lat);
	const sinLon = Math.sin(lon);
	const cosLon = Math.cos(lon);
	return [
		        cosLon,      0,        -sinLon,
		-sinLat*sinLon, cosLat, -sinLat*cosLon,
		 cosLat*sinLon, sinLat,  cosLat*cosLon,
	];
};
