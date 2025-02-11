import { Line2NodeMaterial } from '../Nodes.js';

class SurveyLineMaterial extends Line2NodeMaterial {

	constructor ( params = {}, ctx ) {

		super( params, ctx );

		this.linewidthNode = ctx.materials.commonUniforms.lines().linewidth;

        this.constructShaders();

    }

}

export { SurveyLineMaterial };