import { positionGeometry, attribute, float, texture, uniform, varying, vec2 } from '../Nodes.js';
import { Line2Material } from './Line2Material.js';

class DepthLineMaterial extends Line2Material {

	name = 'HeightLineMaterial';

	constructor ( params = {}, ctx ) {

		super( params, ctx );

		const survey = ctx.survey;
		const limits = survey.modelLimits;

		const zMin = limits.min.z;
		const zMax = limits.max.z;
		const gradient = ctx.cfg.value( 'saturatedGradient', false ) ? 'gradientHi' : 'gradientLow';
		const textureCache = ctx.materials.textureCache;

		const minZ = uniform( zMin );
		const scaleZ = uniform( 1 / ( zMax - zMin ) );

		const instanceStart = attribute( 'instanceStart', 'vec3' );
		const instanceEnd   = attribute( 'instanceEnd', 'vec3' );

		const vPosition = positionGeometry.y.lessThan( 0.5 ).cond( instanceStart, instanceEnd );

		const zMap = varying( vPosition.z.sub( minZ ).mul( scaleZ ) );

		this.colorInsert = texture( textureCache.getTexture( gradient ), vec2( float( 1 ).sub( zMap ), 1.0 ) );
/*
		if ( CV_DEPTH ) {

			return texture2D( cmap, vec2( depth * depthScale, 1.0 ) ) * vec4( vColor, 1.0 );

		}
*/
	}

}

export { DepthLineMaterial };