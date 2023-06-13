import { float, uniform, varying, vec2, texture, positionGeometry } from '../../../node_modules/three/examples/jsm/nodes/Nodes';
import { SubsurfaceMaterial } from './SubsufaceMaterial';

class HeightMaterial extends SubsurfaceMaterial {

	constructor ( ctx, options ) { // FIXME option handlin

		super( ctx, options );

		this.name ='CV:HightMaterial';

		const survey = ctx.survey;
		const limits = survey.modelLimits;

		const zMin = limits.min.z;
		const zMax = limits.max.z;
		const gradient = ctx.cfg.value( 'saturatedGradient', false ) ? 'gradientHi' : 'gradientLow';
		const textureCache = ctx.materials.textureCache;

		const minZ = uniform( zMin );
		const scaleZ = uniform( 1 / ( zMax - zMin ) );

		const zMap = varying( positionGeometry.z.sub( minZ ).mul( scaleZ ) );

		this.colorNode = texture( textureCache.getTexture( gradient ), vec2( float( 1.0 ).sub( zMap ), 1.0 ) );

	}

}

export { HeightMaterial };