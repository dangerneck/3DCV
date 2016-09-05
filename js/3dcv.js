// Global vars

var container, scene, camera, renderer, cssRenderer, cssScene;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
var wallsWidth = 20;
var wallsHeight = 150;
var targetList = [];
var interactableList = [];
var interactionsList = [];
var projector, mouse = { x: 0, y: 0 };
var infoModalLookup = [];

//
// Info modals
//
//

$('#info-modal').modal({
  keyboard: false
});

var MFGInfo = {
	title: "Mother Fucker Galaxy",
	body: "Mother Fucker Galaxy is my first completed action-format video-game.<br />It is an excessively difficult 2D Shoot-em-up game that explores themes of trauma and violence. It was made using Yoyogames' Game Maker. <br />Music made in famitracker.",
	buttonText: "Close",
	display: function(){
		$("#modal-title").html(this.title);
		$("#modal-body-p").html(this.body);
		$("#modal-button").html(this.buttonText);
		$("#info-modal").modal('show');
	}
};

var GLInfo = {
	title: "Gabby Loves Art",
	body: "gabbylovesart.com was made to provide the artist with an online gallery to showcase her work and a Wordpress blog to post updates regarding her work.The design was developed by the artist with web design input by myself.<br /><br />The site design is responsive and designed for mobile, tablet and desktop screen sizes.",
	buttonText: "Close",
	display: function(){
		$("#modal-title").html(this.title);
		$("#modal-body-p").html(this.body);
		$("#modal-button").html(this.buttonText);
		$("#info-modal").modal('show');
	}
};

document.addEventListener( 'mousedown', onDocumentMouseDown, false );

init();
initGrowl();
animate();

// FUNCTIONS
function init()
{
	projector = new THREE.Projector();

	// SCENE
	scene = new THREE.Scene();
	// CAMERA
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);
	camera.position.set(0,40,1100);
	camera.lookAt(scene.position);
	camera.rotation.x = 0;

	// RENDERER
	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
		renderer = new THREE.CanvasRenderer();

	renderer.shadowMapEnabled = true;
	renderer.shadowMapSoft = true;

	renderer.shadowCameraNear = 3;
	renderer.shadowCameraFar = camera.far;
	renderer.shadowCameraFov = 1;

	renderer.shadowMapBias = 0.0039;
	renderer.shadowMapDarkness = 0.8;
	renderer.shadowMapWidth = 10000;
	renderer.shadowMapHeight = 10000;
	renderer.shadowMapType = THREE.PCFShadowMap;

	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

	container = document.getElementById( 'ThreeJS' );
	container.appendChild( renderer.domElement );

	// EVENTS
	THREEx.WindowResize(renderer, camera);


	collidableMeshList = [];

	cameraColGeo = new THREE.CubeGeometry(40, 40, 40, 4, 4, 4);
	cameraColMat = new THREE.MeshBasicMaterial({ visible: false, color: 0x00ff00});
	cameraColMesh = new THREE.Mesh(cameraColGeo, cameraColMat);
	cameraColMesh.position.set(0,40,1100);
	scene.add(cameraColMesh);

	// LIGHT
	var light = new THREE.SpotLight(0xffffff, 0.5);
	light.position.set(0,1000,2500);

	scene.add(light);
	light.castShadow = true;
	light.shadowDarkness = 0.5;

	// FLOOR
	var floorTexture = new THREE.ImageUtils.loadTexture( 'images/Grass_6.png' );

	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
	floorTexture.repeat.set( 100, 100 );
	var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
	var floorGeometry = new THREE.PlaneGeometry(4000, 4000, 10, 10);
	var floor = new THREE.Mesh(floorGeometry, floorMaterial);
	floor.position.y = -0.5;
	floor.rotation.x = Math.PI / 2;
	floor.receiveShadow = true;
	scene.add(floor);

	// Big back wall
	var wallGeo = new THREE.CubeGeometry(4000,300,20,1,1,1);
	var wallMat = new THREE.MeshBasicMaterial({color: 0xaaee00});
	var wall = new THREE.Mesh(wallGeo, wallMat);
	wall.position.set(0,150,1990);
	scene.add(wall);
	collidableMeshList.push(wall);

	// The building
	InitStructure();

	// SKYBOX/FOG
	var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
	var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00, side: THREE.BackSide } );
	var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
	// scene.add(skyBox);
	scene.fog = new THREE.FogExp2( 0x9999ff, 0.0005 );
	scene.add(skyBox);

	// CSS3D
	cssScene = new THREE.Scene();

	CSS3DElementsInit();

	cssRenderer = new THREE.CSS3DRenderer();
	cssRenderer.setSize( window.innerWidth, window.innerHeight );
	cssRenderer.domElement.style.position = 'absolute';
	cssRenderer.domElement.style.top = 0;

	document.body.appendChild(cssRenderer.domElement);

	THREEx.WindowResize(cssRenderer, camera);

	//renderer.domElement.style.zIndex = 1;
	renderer.domElement.style.top = 0;
	renderer.domElement.style.position = 'absolute';
	cssRenderer.domElement.appendChild(renderer.domElement);

}

function initGrowl(){
 	var growlSettings = {
		position:{from: "top", align: "center"},
		delay: 5000,
		allow_dismiss: true,
		type: "info",
		fade_in: 400,
		z_index: 10,
		pause_on_mouseover: true
	};

	setTimeout(function(){
		$.growl(
			"<span class='glyphicon glyphicon-comment'></span>    Welcome.",
			growlSettings
		);
	}, 1000);

	setTimeout(function(){
		$.growl(
			"W S A D to walk around",
			growlSettings
		);
	}, 2500);

	setTimeout(function(){
		$.growl(
			"Click on the door and the ? icons to interact",
			growlSettings
		);
	}, 4000);

	setTimeout(function(){
		$.growl(
			"<span class='glyphicon glyphicon-eye-open'></span>    Take a look around.",
			growlSettings
		);
	}, 7000);
}

function animate()
{
    requestAnimationFrame( animate );
	render();
	update();
}

function update()
{
	var delta = clock.getDelta(); // seconds.
	var moveDistance = 200 * delta; // 200 pixels per second
	var rotateAngle = Math.PI / 2 * delta;   // pi/2 radians (90 degrees) per second

	cameraColMesh.position.set(camera.position.x, camera.position.y, camera.position.z);

	// move forwards/backwards/left/right
	if ( keyboard.pressed("W") ){
		var camBefore = camera.position;
		camera.translateZ( -moveDistance );
		if (!canMoveTo(camBefore, camera.position)){ camera.translateZ( moveDistance ); }
	}

	if ( keyboard.pressed("S") ){
		var camBefore = camera.position;
		camera.translateZ(  moveDistance );
		if (!canMoveTo(camBefore, camera.position)){ camera.translateZ( -moveDistance ); }

	}

	var rotation_matrix = new THREE.Matrix4().identity();
	if ( keyboard.pressed("A") )
		camera.rotateOnAxis( new THREE.Vector3(0,1,0), rotateAngle);
	if ( keyboard.pressed("D") )
		camera.rotateOnAxis( new THREE.Vector3(0,1,0), -rotateAngle);

	if ( keyboard.pressed("Z") )
	{
		camera.position.set(0,1200,0);
		camera.rotation.set(0,0,0);
	}

}

function render()
{
	cssRenderer.render(cssScene, camera);
	renderer.render( scene, camera );
}

function onDocumentMouseDown(event){

	console.log("Click.");

	// update the mouse variable
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;


	// create a Ray with origin at the mouse position
	//   and direction into the scene (camera direction)
	var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
	projector.unprojectVector( vector, camera );
	var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

	// create an array containing all objects in the scene with which the ray intersects
	var intersects = ray.intersectObjects( collidableMeshList );

	// if there is one (or more) intersections
	if ( intersects.length > 0)
	{

		objectId = intersects[0].object.id;
		if (infoModalLookup[objectId] != null){
			infoModalLookup[objectId].display();
		}

		if (interactionsList[objectId]){
			interactionsList[objectId](intersects[0].object);
		}
	}
}

function CSS3DElementsInit(){

	var mfgElement = document.createElement( 'div' );
	mfgElement.innerHTML = "<h1>The page for my game called Mother Fucker Galaxy should be here but it's currently offline. You can find it on GameJolt, though.</h1><img src='images/costanza-shrug.gif' />"
	mfgElement.style.padding = "100px";
	mfgElement.style.width  = "1024px";
	mfgElement.style.height = "614px";

	var glElement = document.createElement('iframe');
	glElement.src = 'http://gabbylovesart.com';
	// force iframe to have same relative dimensions as planeGeometry
	glElement.style.width  = "1024px";
	glElement.style.height = "614px";

	// create the dom Element
	var outsideElement = document.createElement( 'div' );
	outsideElement.innerHTML = "<h1>That's all for now.</h1><h1>Please enjoy the grassy void.</h1><br /><br /><img src='images/126.gif' />";
	// force iframe to have same relative dimensions as planeGeometry
	outsideElement.style.width  = "500px";
	outsideElement.style.height = "600px";
	outsideElement.style.background = "-webkit-linear-gradient(top, #9efc8f 0%,#e8a1ea 100%)";
	outsideElement.style.padding = "50px";

	createCSS3DObject(
	{
		material: new THREE.MeshBasicMaterial({color: 0x000000, opacity: 0.1, side: THREE.DoubleSide }),
		geometry: new THREE.PlaneGeometry(200, 120),
		x: 500,
		y: 0,
		z: -150
	}, mfgElement);

	createCSS3DObject(
	{
		material: new THREE.MeshBasicMaterial({color: 0x000000, opacity: 0.1, side: THREE.DoubleSide }),
		geometry: new THREE.PlaneGeometry(200, 120),
		x: -500,
		y: 0,
		z: -150
	}, glElement);

	createCSS3DObject(
	{
		material: new THREE.MeshBasicMaterial({color: 0x000000, opacity: 0.1, side: THREE.DoubleSide }),
		geometry: new THREE.PlaneGeometry(200, 200),
		x: 0,
		y: 0,
		z: -875
	}, outsideElement);
}

function createCSS3DObject(planeObj, element, forceAspectRatio){
	var forceAspectRatio = (typeof forceAspectRatio !== 'undefined') ?  forceAspectRatio : true;
	var planeMesh= new THREE.Mesh( planeObj.geometry, planeObj.material );
	planeMesh.position.y = planeObj.geometry.height/2;
	planeMesh.position.x = planeObj.x;
	planeMesh.position.z = planeObj.z;
	// add it to the standard (WebGL) scene
	scene.add(planeMesh);

	var elementWidth = element.style.width.replace(/[^0-9.]/g, "");

	if (forceAspectRatio){
		var aspectRatio = planeObj.geometry.height / planeObj.geometry.width;
		var elementHeight = elementWidth * aspectRatio;
		element.style.height = elementHeight + "px";
	}

	// create the object3d for this element
	var cssObject = new THREE.CSS3DObject( element );
	// we reference the same position and rotation
	cssObject.position = planeMesh.position;
	cssObject.rotation = planeMesh.rotation;
	cssObject.scale.x /= (1 + 0.05) * (elementWidth / planeObj.geometry.width);
	cssObject.scale.y /= (1 + 0.05) * (elementWidth / planeObj.geometry.width);
	// add it to the css scene
	cssScene.add(cssObject);
}

function canMoveTo(vBefore, vAfter){
	if (vAfter.x > 2000 || vAfter.x < -2000){ return false; }
	if (vAfter.z > 2000 || vAfter.z < -2000){ return false; }

	for(var vi = 0; vi < cameraColMesh.geometry.vertices.length; vi++){
		var localVertex = cameraColMesh.geometry.vertices[vi].clone();
		var globalVertex = localVertex.applyMatrix4(cameraColMesh.matrix);
		var directionVector = globalVertex.sub(cameraColMesh.position);

		var colRay = new THREE.Raycaster(vAfter, directionVector.clone().normalize());
		var colResult = colRay.intersectObjects(collidableMeshList);
		if (colResult.length > 0 && colResult[0].distance < directionVector.length()){
			return false;
			break;
		}
	}

	return true;
}

function InitStructure(){

	// ~~~
	// 	Yeah I know this function is insane and should be done better.
	// 	I'm sure I'll get around to it.
	// 	Relax.
	// ~~~


	// Lamps
	var loader = new THREE.SceneLoader();
	loader.load("models/lamp.json", function(res){ // loading mesh
		var lamp = res.scene.children[0];

		lampTwo = lamp.clone();

		lamp.position.set(-150,45,700);
		lamp.scale.set(60,60,60);

		lampTwo.position.set(150,45,700);
		lampTwo.scale.set(60,60,60);

		scene.add(lamp);
		scene.add(lampTwo);
	});

	// Lights

	var light = new THREE.PointLight( 0xaa00ee, 1, 200);
	light.position.set(-150, 45, 700);
	scene.add(light);

	light = new THREE.PointLight( 0x00eeaa, 1, 200);
	light.position.set(150, 45, 700);
	scene.add(light);

	var bulbLightOne = new THREE.PointLight(0xffffff, 1, 400);
	var bulbLightTwo = bulbLightOne.clone();
	var bulbLightThree = bulbLightOne.clone();

	bulbLightOne.position.set(-500,149,300);
	bulbLightTwo.position.set(0,149,300);
	bulbLightThree.position.set(500,149,300);

	scene.add(bulbLightOne);
	scene.add(bulbLightTwo);
	scene.add(bulbLightThree);

	var lightBulbG = new THREE.CubeGeometry(2,2,2);
	var lightBulbM = new THREE.MeshBasicMaterial({color: 0xffffff});

	var bulbOne = new THREE.Mesh(lightBulbG, lightBulbM);
	var bulbTwo = bulbOne.clone();
	var bulbThree = bulbOne.clone();

	bulbOne.position.set(-500,149,300);
	bulbTwo.position.set(0,149,300);
	bulbThree.position.set(500,149,300);
	scene.add(bulbOne);
	scene.add(bulbTwo);
	scene.add(bulbThree);


	wallMat = new THREE.MeshPhongMaterial({ambient: 0x99aabb, specular: 0xffffff, shininess: 30, shading: THREE.FlatShading, color: 0xaabbcc});
	roofMat = new THREE.MeshPhongMaterial({color: 0x445566});
	var houseFloorTexture = new THREE.ImageUtils.loadTexture( 'images/AntiqueRedOakRustic.jpg' );
	houseFloorTexture.wrapS = houseFloorTexture.wrapT = THREE.RepeatWrapping;
	houseFloorTexture.repeat.set( 20, 20 );

	var doorTexture = new THREE.ImageUtils.loadTexture('images/sign_wooddoor_sm.png');
	var doorTwoTexture = new THREE.ImageUtils.loadTexture('images/sign_wooddoor_sm_rev.png');

	var floorMat = new THREE.MeshBasicMaterial( { map: houseFloorTexture, side: THREE.DoubleSide } );

	var infoBoxTexture = THREE.ImageUtils.loadTexture('images/infobox.png');

	infoBoxMat = new THREE.MeshBasicMaterial({color: 0xffffff, map: infoBoxTexture});

	wallGeo = new THREE.CubeGeometry(200 + wallsWidth,wallsHeight,wallsWidth,1,1,1);
	wall = new THREE.Mesh(wallGeo, wallMat);
	wall.position.set(0,wallsHeight/2,1200);
	scene.add(wall);
	wall.castShadow = true; wall.receiveShadow = true;

	collidableMeshList.push(wall);

	wallGeo = new THREE.CubeGeometry(200 + wallsWidth,wallsHeight,wallsWidth,1,1,1);
	wall = new THREE.Mesh(wallGeo, wallMat);
	wall.position.set(100,wallsHeight/2,1100);
	wall.rotation.y = Math.PI /2;
	scene.add(wall);
	wall.castShadow = true; wall.receiveShadow = true;
	collidableMeshList.push(wall);

	wallGeo = new THREE.CubeGeometry(200 + wallsWidth,wallsHeight,wallsWidth,1,1,1);
	wall = new THREE.Mesh(wallGeo, wallMat);
	wall.position.set(-100,wallsHeight/2,1100);
	wall.rotation.y = Math.PI /2;
	scene.add(wall);
	wall.castShadow = true; wall.receiveShadow = true;
	collidableMeshList.push(wall);

	wallGeo = new THREE.CubeGeometry(200 + wallsWidth,wallsHeight,wallsWidth,1,1,1);
	wall = new THREE.Mesh(wallGeo, wallMat);
	wall.position.set(-200,wallsHeight/2,1000);
	scene.add(wall);
	wall.castShadow = true; wall.receiveShadow = true;
	collidableMeshList.push(wall);

	wallGeo = new THREE.CubeGeometry(200 + wallsWidth,wallsHeight,wallsWidth,1,1,1);
	wall = new THREE.Mesh(wallGeo, wallMat);
	wall.position.set(200,wallsHeight/2,1000);
	scene.add(wall);
	wall.castShadow = true; wall.receiveShadow = true;
	collidableMeshList.push(wall);

	wallGeo = new THREE.CubeGeometry(400 + wallsWidth,wallsHeight,wallsWidth,1,1,1);
	wall = new THREE.Mesh(wallGeo, wallMat);
	wall.position.set(300,wallsHeight/2,800);
	wall.rotation.y = Math.PI /2;
	scene.add(wall);
	wall.castShadow = true; wall.receiveShadow = true;
	collidableMeshList.push(wall);

	wallGeo = new THREE.CubeGeometry(400 + wallsWidth,wallsHeight,wallsWidth,1,1,1);
	wall = new THREE.Mesh(wallGeo, wallMat);
	wall.position.set(-300,wallsHeight/2,800);
	wall.rotation.y = Math.PI /2;
	scene.add(wall);
	wall.castShadow = true; wall.receiveShadow = true;
	collidableMeshList.push(wall);

	wallGeo = new THREE.CubeGeometry(200 + wallsWidth,wallsHeight,wallsWidth,1,1,1);
	wall = new THREE.Mesh(wallGeo, wallMat);
	wall.position.set(-200,wallsHeight/2,600);
	scene.add(wall);
	wall.castShadow = true; wall.receiveShadow = true;
	collidableMeshList.push(wall);

	wallGeo = new THREE.CubeGeometry(200 + wallsWidth,wallsHeight,wallsWidth,1,1,1);
	wall = new THREE.Mesh(wallGeo, wallMat);
	wall.position.set(200,wallsHeight/2,600);
	scene.add(wall);
	wall.castShadow = true; wall.receiveShadow = true;
	collidableMeshList.push(wall);

	wallGeo = new THREE.CubeGeometry(200 + wallsWidth,wallsHeight,wallsWidth,1,1,1);
	wall = new THREE.Mesh(wallGeo, wallMat);
	wall.position.set(-100,wallsHeight/2,500);
	wall.rotation.y = Math.PI /2;
	scene.add(wall);
	wall.castShadow = true; wall.receiveShadow = true;
	collidableMeshList.push(wall);

	wallGeo = new THREE.CubeGeometry(200 + wallsWidth,wallsHeight,wallsWidth,1,1,1);
	wall = new THREE.Mesh(wallGeo, wallMat);
	wall.position.set(100,wallsHeight/2,500);
	wall.rotation.y = Math.PI /2;
	scene.add(wall);
	wall.castShadow = true; wall.receiveShadow = true;
	collidableMeshList.push(wall);

	wallGeo = new THREE.CubeGeometry(200 + wallsWidth,wallsHeight,wallsWidth,1,1,1);
	wall = new THREE.Mesh(wallGeo, wallMat);
	wall.position.set(200,wallsHeight/2,400);
	scene.add(wall);
	wall.castShadow = true; wall.receiveShadow = true;
	collidableMeshList.push(wall);

	wallGeo = new THREE.CubeGeometry(200 + wallsWidth,wallsHeight,wallsWidth,1,1,1);
	wall = new THREE.Mesh(wallGeo, wallMat);
	wall.position.set(200,wallsHeight/2,200);
	scene.add(wall);
	wall.castShadow = true; wall.receiveShadow = true;
	collidableMeshList.push(wall);

	wallGeo = new THREE.CubeGeometry(200 + wallsWidth,wallsHeight,wallsWidth,1,1,1);
	wall = new THREE.Mesh(wallGeo, wallMat);
	wall.position.set(-200,wallsHeight/2,400);
	scene.add(wall);
	wall.castShadow = true; wall.receiveShadow = true;
	collidableMeshList.push(wall);

	wallGeo = new THREE.CubeGeometry(200 + wallsWidth,wallsHeight,wallsWidth,1,1,1);
	wall = new THREE.Mesh(wallGeo, wallMat);
	wall.position.set(-200,wallsHeight/2,200);
	scene.add(wall);
	wall.castShadow = true; wall.receiveShadow = true;
	collidableMeshList.push(wall);

 	// Big Rooms
	wallGeo = new THREE.CubeGeometry(400 + wallsWidth,wallsHeight,wallsWidth,1,1,1);
	wall = new THREE.Mesh(wallGeo, wallMat);
	wall.position.set(-500,wallsHeight/2,600);
	scene.add(wall);
	wall.castShadow = true; wall.receiveShadow = true;
	collidableMeshList.push(wall);
	wallGeo = new THREE.CubeGeometry(400 + wallsWidth,wallsHeight,wallsWidth,1,1,1);
	wall = new THREE.Mesh(wallGeo, wallMat);
	wall.position.set(500,wallsHeight/2,600);
	scene.add(wall);
	wall.castShadow = true; wall.receiveShadow = true;
	collidableMeshList.push(wall);

	wallGeo = new THREE.CubeGeometry(200 + wallsWidth,wallsHeight,wallsWidth,1,1,1);
	wall = new THREE.Mesh(wallGeo, wallMat);
	wall.position.set(300,wallsHeight/2,500);
	wall.rotation.y = Math.PI /2;
	scene.add(wall);
	wall.castShadow = true; wall.receiveShadow = true;
	collidableMeshList.push(wall);
	wallGeo = new THREE.CubeGeometry(200 + wallsWidth,wallsHeight,wallsWidth,1,1,1);
	wall = new THREE.Mesh(wallGeo, wallMat);
	wall.position.set(-300,wallsHeight/2,500);
	wall.rotation.y = Math.PI /2;
	scene.add(wall);
	wall.castShadow = true; wall.receiveShadow = true;
	collidableMeshList.push(wall);

	wallGeo = new THREE.CubeGeometry(400 + wallsWidth,wallsHeight,wallsWidth,1,1,1);
	wall = new THREE.Mesh(wallGeo, wallMat);
	wall.position.set(-500,wallsHeight/2,-200);
	scene.add(wall);
	wall.castShadow = true; wall.receiveShadow = true;
	collidableMeshList.push(wall);
	wallGeo = new THREE.CubeGeometry(400 + wallsWidth,wallsHeight,wallsWidth,1,1,1);
	wall = new THREE.Mesh(wallGeo, wallMat);
	wall.position.set(500,wallsHeight/2,-200);
	scene.add(wall);
	wall.castShadow = true; wall.receiveShadow = true;
	collidableMeshList.push(wall);

	wallGeo = new THREE.CubeGeometry(400 + wallsWidth,wallsHeight,wallsWidth,1,1,1);
	wall = new THREE.Mesh(wallGeo, wallMat);
	wall.position.set(300,wallsHeight/2,0);
	wall.rotation.y = Math.PI /2;
	scene.add(wall);
	wall.castShadow = true; wall.receiveShadow = true;
	collidableMeshList.push(wall);
	wallGeo = new THREE.CubeGeometry(400 + wallsWidth,wallsHeight,wallsWidth,1,1,1);
	wall = new THREE.Mesh(wallGeo, wallMat);
	wall.position.set(-300,wallsHeight/2,0);
	wall.rotation.y = Math.PI /2;
	scene.add(wall);
	wall.castShadow = true; wall.receiveShadow = true;
	collidableMeshList.push(wall);

	wallGeo = new THREE.CubeGeometry(400 + wallsWidth,wallsHeight,wallsWidth,1,1,1);
	wall = new THREE.Mesh(wallGeo, wallMat);
	wall.position.set(100,wallsHeight/2,0);
	wall.rotation.y = Math.PI /2;
	scene.add(wall);
	wall.castShadow = true; wall.receiveShadow = true;
	collidableMeshList.push(wall);
	wallGeo = new THREE.CubeGeometry(400 + wallsWidth,wallsHeight,wallsWidth,1,1,1);
	wall = new THREE.Mesh(wallGeo, wallMat);
	wall.position.set(-100,wallsHeight/2,0);
	wall.rotation.y = Math.PI /2;
	scene.add(wall);
	wall.castShadow = true; wall.receiveShadow = true;
	collidableMeshList.push(wall);

	wallGeo = new THREE.CubeGeometry(800 + wallsWidth,wallsHeight,wallsWidth,1,1,1);
	wall = new THREE.Mesh(wallGeo, wallMat);
	wall.position.set(700,wallsHeight/2,200);
	wall.rotation.y = Math.PI /2;
	scene.add(wall);
	wall.castShadow = true; wall.receiveShadow = true;
	collidableMeshList.push(wall);
	wallGeo = new THREE.CubeGeometry(800 + wallsWidth,wallsHeight,wallsWidth,1,1,1);
	wall = new THREE.Mesh(wallGeo, wallMat);
	wall.position.set(-700,wallsHeight/2,200);
	wall.rotation.y = Math.PI /2;
	scene.add(wall);
	wall.castShadow = true; wall.receiveShadow = true;
	collidableMeshList.push(wall);

	// Roof
	wallGeo = new THREE.CubeGeometry(1400 + wallsWidth,1600,wallsWidth,1,1,1);
	wall = new THREE.Mesh(wallGeo, roofMat);
	wall.position.set(0,wallsHeight+10,400);
	wall.rotation.x = Math.PI /2;
	scene.add(wall);
	wall.castShadow = true;
	collidableMeshList.push(wall);

	// Floor
	wallGeo = new THREE.CubeGeometry(1400 + wallsWidth,1600,0.1,1,1,1);
	wall = new THREE.Mesh(wallGeo, floorMat);
	wall.position.set(0,0.1,400);
	wall.rotation.x = Math.PI /2;
	scene.add(wall);
	wall.receiveShadow = true;
	collidableMeshList.push(wall);


	// Clickable info boxes
	wallGeo = new THREE.CubeGeometry(20 ,40,10,1,1,1);
	wall = new THREE.Mesh(wallGeo, infoBoxMat);
	wall.position.set(350,20,-150);
	wall.rotation.y = Math.PI /6;
	scene.add(wall);
	collidableMeshList.push(wall);
	infoModalLookup[wall.id] = MFGInfo;

	wall = new THREE.Mesh(wallGeo, infoBoxMat);
	wall.position.set(-350,20,-150);
	wall.rotation.y = -Math.PI /6;
	scene.add(wall);
	collidableMeshList.push(wall);
	infoModalLookup[wall.id] = GLInfo;

	// Door

	var doorGeo = new THREE.CubeGeometry(100,wallsHeight,3,1,1,1);
	var doorMat = new THREE.MeshPhongMaterial({map: doorTexture, color: 0xaa3322});
	var doorTwoMat = new THREE.MeshPhongMaterial({map: doorTwoTexture, color: 0xaa3322});
	var door = new THREE.Mesh(doorGeo, doorMat);
	var doorTwo = new THREE.Mesh(doorGeo, doorTwoMat);

	door.position.set(-50,wallsHeight/2,-100);
	doorTwo.position.set(50,wallsHeight/2,-100);

	door.isOpen = false;
	doorTwo.isOpen = false;

	collidableMeshList.push(door);
	collidableMeshList.push(doorTwo);

	interactionsList[door.id] = function(obj){
		obj.isOpen = !obj.isOpen;
		if (obj.isOpen){
			obj.rotation.y += Math.PI / 2;
			obj.position.x = -90;
		}else{
			obj.rotation.y -= Math.PI / 2;
			obj.position.x = -50
		}
	};
	interactionsList[doorTwo.id] = function(obj){
		obj.isOpen = !obj.isOpen;
		if (obj.isOpen){
			obj.rotation.y += Math.PI / 2;
			obj.position.x = 90;
		}else{
			obj.rotation.y -= Math.PI / 2;
			obj.position.x = 50;
		}
	};

	scene.add(door);
	scene.add(doorTwo);


}