/* global window, Modernizr, document */
'use strict';

var $ = require('jQuery'),
    Modernizr = require('modernizr'),
    ImprovedNoise = require('./components/ImprovedNoise'),
    THREE = require('three');

require('three-first-person-controls')(THREE);

window.jQuery = window.$ = $;

$(document).ready(function() {
    var container;
    var camera, controls, scene, renderer, data;
    var mesh;

    var worldWidth = 256, worldDepth = 256,
    worldHalfWidth = worldWidth / 2, worldHalfDepth = worldDepth / 2;

    var clock = new THREE.Clock();

    init();
    animate();

    function init() {
        container = document.getElementById('background');

        camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );

        controls = new THREE.FirstPersonControls( camera );
        controls.lookVertical = false;
        controls.movementSpeed = 50;
        controls.lookSpeed = 0.005;
        controls.autoForward = true;

        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0xE8E8E8, 0.1);

        data = generateHeight( worldWidth, worldDepth );

        camera.position.y = data[ worldHalfWidth + worldHalfDepth * worldWidth ] * 10 + 1000;

        var geometry = new THREE.PlaneBufferGeometry( 7500, 7500, worldWidth - 1, worldDepth - 1 );
        geometry.rotateX( - Math.PI / 2 );

        var vertices = geometry.attributes.position.array;

        for ( var i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
            vertices[ j + 1 ] = data[ i ] * 10;
        }

        mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { wireframe: true } ) );
        scene.add(mesh);

        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor( 0xC5CFC6 );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );

        container.appendChild( renderer.domElement );
        window.addEventListener( 'resize', onWindowResize, false );
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

        controls.handleResize();
    }

    function generateHeight( width, height ) {
        var size = width * height, data = new Uint8Array( size ),
        perlin = new ImprovedNoise(), quality = 1, z = Math.random() * 100;

        for ( var j = 0; j < 4; j ++ ) {

            for ( var i = 0; i < size; i ++ ) {

                var x = i % width, y = ~~ ( i / width );
                data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );

            }

            quality *= 5;

        }

        return data;

    }

    function animate() {
        requestAnimationFrame(animate);
        render();
    }

    function render() {
        controls.update(clock.getDelta());
        renderer.render(scene, camera);
    }

});
