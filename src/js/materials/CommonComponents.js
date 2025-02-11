import { materialColor, abs, cond, distance, float, fwidth, mix, smoothstep, texture, varying, vec3, vec4, positionGeometry, positionLocal } from '../Nodes.js';

class CommonComponents {

    static cursorColor ( cu, delta ) {

        const aDelta = abs( delta );
        const ss = smoothstep( 0.0, cu.cursorWidth, cu.cursorWidth.sub( aDelta ) );

        return cond( aDelta.lessThan( cu.cursorWidth.mul( 0.05 ) ),
            vec4( materialColor, 1.0 ),
            vec4( mix( cu.baseColor, cu.cursorColor, ss ), 1.0 ).mul( materialColor, 1.0 )
        );

    }

    static terrainHeight( du, terrain ) {

        // FIXME use float32 texture and check calcs
        const UnpackDownscale = float( 255. / 256. ); // 0..1 -> fraction (excluding 1)

		const PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
		const UnpackFactors = vec4( UnpackDownscale.div( vec4( PackFactors, 1. ) ) );

		const vTerrainCoords = varying( positionGeometry.xy.sub( du.modelMin.xy ).mul( du.scale ) );

		const terrainHeight = texture( terrain.depthTexture, vTerrainCoords ).dot( UnpackFactors ); // FIXME

		return terrainHeight.mul( du.rangeZ ).add( du.modelMin.z ).add( du.datumShift );

    }

    static location ( ctx, color ) {

        const lu = ctx.materials.commonUniforms.location( ctx );

        const targetDistance = distance( lu.target, positionLocal.xy );

        const f = abs( targetDistance.sub( lu.accuracy ) );
        const df = abs( fwidth( targetDistance ) );

        return cond( lu.accuracy.greaterThanEqual( 0 ),
            mix( vec4( lu.ringColor, 1.0 ), color, smoothstep( 0.0, df.mul( 4.0 ), f ) ),
            color
         );

    }

    static distanceFade( dfu ) {

        return smoothstep( dfu.distanceFadeMin, dfu.distanceFadeMax, distance( dfu.cameraLocation, vPosition ) ).oneMinus();

    }

}

export { CommonComponents };