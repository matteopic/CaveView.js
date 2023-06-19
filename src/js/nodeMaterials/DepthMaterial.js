import { texture, vec2, positionLocal } from '../Nodes';
import { SubsurfaceMaterial } from './SubsufaceMaterial';
import { CommonComponents } from './CommonComponents';
import { CommonUniforms } from './CommonUniforms';

class DepthMaterial extends SubsurfaceMaterial {

	constructor ( options, ctx ) {

		const survey = ctx.survey;
		const terrain = survey.terrain;
		const gradient = ctx.cfg.value( 'saturatedGradient', false ) ? 'gradientHi' : 'gradientLow';
		const textureCache = ctx.materials.textureCache;

		super( { transparent: options.location }, ctx );

		this.name = 'CV:DepthMaterial';

		const du = CommonUniforms.depth( ctx );

		const terrainHeight = CommonComponents.terrainHeight( du, terrain );

		// FIXME double check all depth calcs
		const depth = terrainHeight.sub( positionLocal.z ).mul( du.depthScale );

		this.colorNode = texture( textureCache.getTexture( gradient ), vec2( depth, 1.0 ) ); // FIXME vertex colot

	}

}

export { DepthMaterial };