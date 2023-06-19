import { MeshPhongNodeMaterial } from '../Nodes';

class SubsurfaceMaterial extends MeshPhongNodeMaterial {

	constructor ( options = {}, ctx ) {

		super( options );

		this.lightsNode = ctx.lightingManager.getSubsurfaceLights();

	}

	customProgramCacheKey () {

		return this.name;

	}

}

export { SubsurfaceMaterial };