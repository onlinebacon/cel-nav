export const mulVec3Mat3 = (
	[ x, y, z ],
	[ ix, iy, iz, jx, jy, jz, kx, ky, kz ],
) => [
	x*ix + y*jx + z*kx,
	x*iy + y*jy + z*ky,
	x*iz + y*jz + z*kz,
];
