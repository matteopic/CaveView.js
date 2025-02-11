/**
 * @author mrdoob / http://mrdoob.com/
 * @author marklundin / http://mark-lundin.com/
 * @author alteredq / http://alteredqualia.com/
 * @author tschw
 */

import {
	LinearFilter,
	Mesh,
	NearestFilter,
	OrthographicCamera,
	PlaneGeometry,
	RGBAFormat,
	Scene,
	StereoCamera,
	WebGLRenderTarget
} from '../Three';
import { AnaglyphMaterial } from '../materials/AnaglyphMaterial';

function AnaglyphEffect ( renderer, width, height ) {

	const _camera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

	const _scene = new Scene();

	const _stereo = new StereoCamera();

	_stereo.cameraL.layers.mask = 0xFFFFFFFF;
	_stereo.cameraR.layers.mask = 0xFFFFFFFF;

	const _params = { minFilter: LinearFilter, magFilter: NearestFilter, format: RGBAFormat, stencil: true };

	const pixelRatio = renderer.getPixelRatio();

	const _renderTargetL = new WebGLRenderTarget( width * pixelRatio, height * pixelRatio, _params );
	const _renderTargetR = new WebGLRenderTarget( width * pixelRatio, height * pixelRatio, _params );

	const _material = new AnaglyphMaterial( {
		left: _renderTargetL.texture,
		right: _renderTargetR.texture
	} );

	const _mesh = new Mesh( new PlaneGeometry( 2, 2 ), _material );
	_scene.add( _mesh );

	this.setLayers = function ( mask ) {

		_stereo.cameraL.layers.mask = mask;
		_stereo.cameraR.layers.mask = mask;

	};

	this.setSize = function ( width, height ) {

		renderer.setSize( width, height );

		const pixelRatio = renderer.getPixelRatio();

		_renderTargetL.setSize( width * pixelRatio, height * pixelRatio );
		_renderTargetR.setSize( width * pixelRatio, height * pixelRatio );

	};

	this.setEyeSeparation = function ( x ) {

		_stereo.eyeSep = x;

	};

	this.render = async function ( scene, camera ) {

		scene.updateMatrixWorld();

		if ( camera.parent === null ) camera.updateMatrixWorld();
		_stereo.eyeSep = 2.0;

		_stereo.update( camera );

		renderer.setRenderTarget( _renderTargetL );
		renderer.render( scene, _stereo.cameraL );

		renderer.setRenderTarget( _renderTargetR );
		renderer.render( scene, _stereo.cameraR );

		renderer.setRenderTarget( null );
		renderer.render( _scene, _camera );

	};

	this.dispose = function() {

		_renderTargetL.dispose();
		_renderTargetR.dispose();

		_material.dispose();
		_mesh.geometry.dispose();

	};

}

export { AnaglyphEffect };