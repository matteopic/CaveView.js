import { Box3, Group } from '../Three';
import { FEATURE_TERRAIN, SHADING_RELIEF, SHADING_OVERLAY, SHADING_CONTOURS } from '../core/constants';
import { HeightLookup } from './HeightLookup';
import { HypsometricMaterial } from '../materials/HypsometricMaterial';
import { ContourMaterial } from '../materials/ContourMaterial';
import { DepthMapMaterial } from '../materials/DepthMapMaterial';
import { Overlay } from './Overlay';

class CommonTerrain extends Group {

	constructor ( ctx ) {

		super();

		this.hasOverlay = false;
		this.activeOverlay = null;
		this.renderer = null;
		this.heightLookup = null;
		this.datumShift = 0;
		this.activeDatumShift = 0;
		this.terrainBase = null;
		this.terrainRange = null;
		this.isFlat = false;
		this.screenAttribution = null;
		this.terrainShadingModes = {};
//		this.commonUniforms = ctx.materials.commonTerrainUniforms; FIXME
		this.ctx = ctx;
		this.shadingMode = SHADING_RELIEF;
		this.renderTarget = null;
		this.depthTexture = null;

		this.addEventListener( 'removed', () => this.removed() );

	}

	removed () {}

	getOpacity () {

		return this.ctx.materials.terrainOpacity;

	}

	setOpacity ( opacity ) {

		this.ctx.materials.terrainOpacity = opacity;

	}

	commonRemoved () {

		const activeOverlay = this.activeOverlay;

		if ( activeOverlay !== null ) activeOverlay.setInactive();

		if ( this.renderTarget !== null ) this.renderTarget.dispose();

	}

	checkTerrainShadingModes () {

		const overlays = this.ctx.overlays;
		const terrainShadingModes = {};

		terrainShadingModes[ 'terrain.shading.height' ] = SHADING_RELIEF;
		terrainShadingModes[ 'terrain.shading.contours' + ' (' + this.ctx.cfg.themeValue( 'shading.contours.interval' ) + '\u202fm)' ] = SHADING_CONTOURS;

		if ( this.isTiled && overlays) {

			Object.keys( overlays ).sort().forEach( name => {

				const overlay = overlays[ name ];

				if ( overlay.checkCoverage( this.limits, this.displayCRS, this.surveyCRS ) ) {

					overlay.active = ( this.activeOverlay === overlay );
					terrainShadingModes[ name ] = name;

				}

			} );

		} else if ( this.hasOverlay ) {

			terrainShadingModes[ 'terrain.shading.overlay' ] = SHADING_OVERLAY;

		}

		this.terrainShadingModes = terrainShadingModes;

		return terrainShadingModes;

	}

	async setup ( renderer, scene, survey ) {

		this.computeBoundingBox();

		survey.addStatic( this );

		const dim = 1024;

		const container = this.ctx.container;
		const renderUtils = this.ctx.renderUtils;

		// set camera frustrum to cover region/survey area
		const rtCamera = renderUtils.makePlanCamera( container, survey );

		rtCamera.layers.set( FEATURE_TERRAIN ); // just render the terrain

		const renderTarget = renderUtils.makeRenderTarget( dim, dim );
		const depthMapMaterial = new DepthMapMaterial( this );

		renderTarget.texture.name = 'CV.DepthMapTexture';

		renderer.setSize( dim, dim );
		renderer.setPixelRatio( 1 );

		renderer.clear();

		renderer.setRenderTarget( renderTarget );

		scene.overrideMaterial = depthMapMaterial;

		renderer.render( scene, rtCamera, true ).then( () => {

			// const p = new Popup( this.ctx );
			// const pop = new PopupMaterial( container, renderTarget.texture );
			// p.material = pop;
			// scene.add( p );

			// add lookup using heightMap texture
			this.heightLookup = new HeightLookup( renderer, renderTarget, this.boundingBox );
			this.renderTarget = renderTarget;
			this.depthTexture = renderTarget.texture;

			survey.setupTerrain( this );
			this.ctx.materials.setTerrain( this );

		} );

		scene.overrideMaterial = null;
		renderer.setRenderTarget( null );

		this.renderer = renderer;

		// renderer.renderLists.dispose(); // FIXME is this needed and is there a webHPU equivalent

		// restore renderer to normal render size and target

		this.ctx.viewer.resetRenderer();

		this.checkTerrainShadingModes();
		survey.setupTerrain( this );
		this.ctx.materials.setTerrain( this );

	}

	setShadingMode ( mode, renderCallback ) {

		const activeOverlay = this.activeOverlay;
		const materials = this.ctx.materials;
		const overlays = this.ctx.overlays;

		let material;
		let hideAttribution = true;
		let overlay = null;

		switch ( mode ) {

		case SHADING_RELIEF:

			material = materials.getMaterial( HypsometricMaterial, {} );

			break;

		case SHADING_OVERLAY:

			this.setOverlay( renderCallback );
			hideAttribution = false;

			break;

		case SHADING_CONTOURS:

			material = materials.getMaterial( ContourMaterial, {} );

			break;

		default:

			overlay = overlays[ mode ];

			if ( overlay !== undefined ) {

				if ( this.isTiled && overlay.hasCoverage ) {

					this.setOverlay( overlay, renderCallback );
					hideAttribution = false;

				} else {

					// if initial setting is not valid, default to shaded relief
					material = materials.getMaterial( HypsometricMaterial, {} );
					mode = SHADING_RELIEF;

				}

			} else {

				console.warn( 'unknown mode', mode );
				return false;

			}

		}

		if ( hideAttribution && activeOverlay !== null ) {

			activeOverlay.setInactive();

			this.activeOverlay = null;

		}

		if ( material !== undefined ) {

			this.setMaterial( material );

		}

		this.shadingMode = mode;

		return true;

	}

	setVisibility ( mode ) {

		this.visible = mode;

		if ( mode ) {

			this.showAttribution();

		} else {

			this.hideAttribution();

		}

	}

	showAttribution () {

		const attribution = this.screenAttribution;

		if ( attribution !== null ) {

			this.ctx.container.appendChild( attribution );

		}

		if ( this.activeOverlay !== null ) this.activeOverlay.showAttribution();

	}

	hideAttribution () {

		const attribution = this.screenAttribution;

		if ( attribution !== null ) {

			const parent = attribution.parentNode;

			if ( parent !== null ) parent.removeChild( attribution );


		}

		if ( this.activeOverlay !== null ) this.activeOverlay.hideAttribution();

	}

	applyDatumShift ( mode ) {

		if ( mode && this.activeDatumShift === 0 ) {

			this.translateZ( this.datumShift );
			this.activeDatumShift = this.datumShift;

		} else if ( ! mode && this.activeDatumShift !== 0 ) {

			this.translateZ( - this.datumShift );
			this.activeDatumShift = 0;

		}

		this.updateMatrix();

		this.dispatchEvent( { type: 'datumShiftChange', value: this.activeDatumShift } );

	}

	computeBoundingBox () {

		const bb = new Box3();

		this.traverse( _getBoundingBox );

		this.boundingBox = bb;

		function _getBoundingBox( obj ) {

			if ( obj.isTile && obj.isMesh ) bb.union( obj.geometry.boundingBox );

		}

		return bb;

	}

	getHeight ( point ) {

		return this.heightLookup.lookup( point );

	}

	_fitSurface ( modelPoints /*, offsets */ ) {

		const points = modelPoints;

		let n = 0, s1 = 0, s2 = 0;

		points.forEach( point => {

			const v = point.z - this.getHeight( point );
			s1 += v;
			s2 += v * v;
			n++;

		} );

		const sd = Math.sqrt( s2 / n - Math.pow( s1 / n, 2 ) );

		// simple average
		//this.datumShift = s1 / n;
		this.ctx.viewer.terrainDatumShiftValue = s1 / n;

		console.log( `Adjustmenting terrain height by: ${this.datumShift} sd: ${sd} n: ${n} --` );

	}

}

CommonTerrain.addOverlay = function ( ctx, name, overlayProvider ) {

	if ( ctx.overlays === undefined ) ctx.overlays = {};

	ctx.overlays[ name ] = new Overlay( ctx, overlayProvider );

};

export { CommonTerrain };