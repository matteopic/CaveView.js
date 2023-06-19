import { Vector3 } from '../Three';
import { uniform, vec2 } from '../Nodes';

class CommonUniforms {

    // shared common uniforms

    // terrain adjustment
    static datumShift      = uniform( 0, 'float' );

    // location ring
    static accuracy        = uniform( -1.0, 'float' );
    static target          = uniform( vec2( 0, 0 ), 'vec2' );

    // distance fade
    static distanceFadeMin = uniform( 0.0, 'float' );
    static distanceFadeMax = uniform( 0.0, 'float' );
    static cameraLocation  = uniform( new Vector3(), 'vec3' );

    static depth ( ctx ) {  // FIXME - share for line materials when ready

        const survey = ctx.survey;
		const surveyLimits = survey.modelLimits;
		const terrain = survey.terrain;
		const limits = terrain.boundingBox;
		const range = limits.getSize( new Vector3() );

        return {
            modelMin:   uniform( limits.min, 'vec3' ),
            scale:      uniform( vec2( 1 / range.x, 1 / range.y), 'vec2' ),
            rangeZ:     uniform( range.z, 'float' ),
            depthScale: uniform( 1 / ( surveyLimits.max.z - surveyLimits.min.z ), 'float' ),
            datumShift: this.datumShift
        }

    }

    static cursor ( ctx ) { // FIXME - share for line materials when ready

        const cfg = ctx.cfg;

        return {
            cursor:      uniform( 0, 'float' ),
		    cursorWidth: uniform( 5.0, 'float' ),
		    baseColor:   uniform( cfg.themeColor( 'shading.cursorBase' ) ),
		    cursorColor: uniform( cfg.themeColor( 'shading.cursor' ) ),
        };

    }

    static location ( ctx ) {

        return {
            accuracy:  this.accuracy,
            target:    this.target,
            ringColor: uniform( ctx.cfg.themeColor( 'shading.ringColor' ), 'vec3' )
        };

    }

    static distanceFade( ) {

        return {
            distanceFadeMin: this.distanceFadeMin,
            distanceFadeMax: this.distanceFadeMax,
            cameraLocation:  this.cameraLocation
        };

    }

}

export { CommonUniforms };