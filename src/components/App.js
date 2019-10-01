import React, { Component } from 'react';

import * as THREE from 'three';
import { PCDLoader } from 'three/examples/jsm/loaders/PCDLoader.js';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

import $ from 'jquery'; 
import { CSVLink } from 'react-csv';

import '../static/App.css';

var camera, controls, scene, stats, renderer, loader, pointcloud;
var bboxHelperList = [];

var raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 0.04;
var mouse = new THREE.Vector2();

function range(start, end) {
  return (new Array(end - start + 1)).fill(undefined).map((_, i) => (i + start).toString());
}

var fileSelected = '9342';
const bboxes = range(9342, 10480);
const files = range(9342, 10480);

const fileFolder = 'littlebg_d0.3_s0.02/';
const bboxFolder = 'littlebg_d0.2_s0.01_result/';

var validFrames = [];

class App extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      loaded: 0
    };
  }

  componentDidMount() {
    this.init();

    this.animate();
  }

  init = () => {

    $('.alert-success').hide();

    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x808080 );
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( width, height );
    renderer.dofAutofocus = true;
    this.mount.appendChild( renderer.domElement );

    camera = new THREE.PerspectiveCamera(
      65,
      width / height,
      1,
      1000
    );
    camera.position.set(6, -5, 6);
    camera.up.set( 0, -1, 0 );
    //scene.add(camera);
    
    // controls

    controls = new MapControls( camera, renderer.domElement );
    
    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;
    
    controls.screenSpacePanning = false;
    
    controls.minDistance = 1;
    controls.maxDistance = 500;
    
    controls.maxPolarAngle = Math.PI / 2;

    // point cloud
    this.addPointcloud();

    // bbox
    this.addBbox();
    
    // axis
    var axesHelper = new THREE.AxesHelper( 5 );
    scene.add( axesHelper );
    
    // stats
    stats = new Stats();
    this.mount.appendChild( stats.dom );


    window.addEventListener( 'resize', this.onWindowResize, false );

    window.addEventListener( 'keypress', this.onKeyPress );

    window.addEventListener( 'mousemove', this.onMouseMove, false );
  }

  addPointcloud = () => {
    
    pointcloud = new THREE.Points(new THREE.Geometry(), new THREE.Material());
    loader = new PCDLoader();
    loader.load( './data/pcd/' + fileFolder + fileSelected + '.pcd', 
    ( points ) => {

      pointcloud = points;

      if (points.material.color.r !== 1) {
        points.material.color.setHex( 0x000000 );
      }

      points.material.size = 0.02;
      
      scene.add( pointcloud );
      
      // var center = points.geometry.boundingSphere.center;
      // controls.target.set( center.x, center.y, center.z );
      // controls.update();
    },
    ( xhr ) => {
      this.setState({
        loaded: Math.round(xhr.loaded / xhr.total * 100)
      });

      console.log( ( this.state.loaded ) + '% loaded' );
  
    } );
  }

  addBbox = () => {
    if (bboxes.includes(fileSelected)) {
      fetch('./data/bbox/' + bboxFolder + fileSelected + '.txt')
        .then((res) => res.text())
        .then(text => {
          var lines = text.split(/\r\n|\n/);
          lines = lines.map(line => { return line.split(' ') });

          var labels = {};
          console.log(lines.length);
          for (var i = 0; i < lines.length; i++) {
            labels[i] = lines[i].slice(0, 6).map(Number);
          }
          console.log(labels);

          for (var i = 0; i < lines.length; i++) {
            var bbox = new THREE.Box3();
            // bbox.setFromCenterAndSize( new THREE.Vector3( labels[i][3], labels[i][4], labels[i][5] ), new THREE.Vector3( labels[i][1], labels[i][2], labels[i][0] ) );
            bbox.set(new THREE.Vector3( labels[i][0], labels[i][1], labels[i][2] ), new THREE.Vector3( labels[i][3], 0, labels[i][5] ))
            var bboxHelper = new THREE.Box3Helper( bbox, 0x00FF00 );
            bboxHelperList.push(bboxHelper);
            scene.add( bboxHelper );
          }
          
        })
    }
  }

  removePointcloud = () => {
    scene.remove( pointcloud );
  }

  removeBbox = () => {
    for (var i = 0; i < bboxHelperList.length; i++) {
      scene.remove( bboxHelperList[i] );
    }
  }

  animate = () => {
    
    requestAnimationFrame( this.animate );

    controls.update();
    
    stats.update();
    
    this.renderScene();

  }

  renderScene = () => {

    // update the picking ray with the camera and mouse position
    // raycaster.setFromCamera( mouse, camera );

    // calculate objects intersecting the picking ray
    // var intersects = raycaster.intersectObjects( scene.children );
    
    // for ( var i = 0; i < intersects.length; i++ ) {

    //   intersects[ i ].object.material.color.set( 0xff0000 );

    // }

    renderer.render(scene, camera);

  }

  onMouseMove = ( event ) => {

    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
  
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  
  }

  onWindowResize = () => {
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
   
    renderer.setSize( window.innerWidth, window.innerHeight );

  }

  onKeyPress = ( e ) => {
    console.log(e.keyCode);
    var points = scene.getObjectByName( fileSelected + '.pcd' );
    switch ( e.keyCode ) {
      case 61:
        points.material.size *= 1.2;
        points.material.needsUpdate = true;
        break;
      case 45:
        points.material.size /= 1.2;
        points.material.needsUpdate = true;
        break;
      case 99:
        points.material.color.setHex( Math.random() * 0xffffff );
        points.material.needsUpdate = true;
        break;
      case 100:
        if (files.indexOf(fileSelected) + 1 < files.length) {
          fileSelected = files[files.indexOf(fileSelected) + 1]
          this.onFileNext();
          $('.alert-success').hide();
        }
        break
      case 97:
        if (files.indexOf(fileSelected) - 1 > -1) {
          fileSelected = files[files.indexOf(fileSelected) - 1]
          this.onFilePrev();
          $('.alert-success').hide();
        }
        break
      case 102:
        validFrames.push([fileSelected]);
        console.log(validFrames);
        $('.alert-success').show();
        break
      default:
        break;
    }
  }

  onFileSelect = (e) => {
    fileSelected = e.target.id;
    console.log(fileSelected);

    this.removePointcloud();
    this.removeBbox();

    this.addPointcloud();
    this.addBbox();
  }

  onFileNext = () => {
    this.removePointcloud();
    this.removeBbox();

    this.addPointcloud();
    this.addBbox();
  }

  onFilePrev = () => {
    this.removePointcloud();
    this.removeBbox();

    this.addPointcloud();
    this.addBbox();
  }
  
  render() {
    return (
      <div>
        
        <div id="info-mouse" className="d-none d-sm-block">

          <div>Point Cloud Viewer by <a href="https://zexihan.com" target="_blank" rel="noopener">Zexi Han</a></div>
          <div>axis: <font style={{color:'red'}}>X</font>  <font style={{color:'lime'}}>Y</font> <font style={{color:'blue'}}>Z</font></div>
          <div>left mouse button + move: Pan the map</div>
          <div>right mouse button + move: Rotate the view</div>
          <div>mouse wheel: Zoom up and down</div>
          <div>a/d: Previous/Next frame</div>
          <div>+/-: Increase/Decrease point size</div>
          <div>c: Change color</div>
          <div>f: Validate</div>
          {this.state.loaded !== 100 && <div>{this.state.loaded}% loaded</div>}

        </div>
        <div id="info-touch" className="d-sm-none">
          <div>Point Cloud Viewer by <a href="https://zexihan.com" target="_blank" rel="noopener">Zexi Han</a></div>
          <div>one finger: Pan the map</div>
          <div>two fingers: Scale and rotate the view</div>
          <div>{this.state.loaded}% loaded</div>
        </div>
        <div className="dropdown d-sm-none">
          <button className="btn btn-dark dropdown-toggle" type="button" id="framesBtn" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Frames
          </button>
          <div className="dropdown-menu d-sm-none" aria-labelledby="framesBtn">
            {files.map((filename, i) =>
              <a key={i} className="dropdown-item" id={filename} href="#" onClick={this.onFileSelect}>{filename}</a>
            )}
          </div>
        </div>
        <div id="filelist" className="row d-none d-sm-block">
          <div className="col">
            
            <div class="alert alert-info">
              <strong>Frames {fileSelected}</strong> 
            </div>
            
            <div className="list-group" id="list-tab" role="tablist">
              {files.map((filename, i) => 
                <a key={i} 
                   className={`list-group-item px-2 py-1 list-group-item-action ${filename === fileSelected ? 'active' : ''}`}
                   id={filename} 
                   data-toggle="list" 
                   href={`#list-${filename}`} 
                   onClick={this.onFileSelect}>
                     {filename}
                </a>
              )}
            </div>
            <div class="alert alert-success" role="alert">
              Success!
            </div>
            <CSVLink 
              data={validFrames} 
              enclosingCharacter=''
              filename={"valid_frames.txt"}
              className="btn btn-light">
                Download labels
            </CSVLink>
            
          </div>
        </div>
        {/* <button className="btn btn-dark">BUTTON</button> */}
        <div
          style={{ width: window.innerWidth, height: window.innerHeight }}
          ref={(mount) => { this.mount = mount }}
        />
        
      </div>
      
    );
  }
}

export default App;