require(['jquery', 'bootstrap','Detector', 'three', 'threeFullscreen', 'threeWindowResize', 'threeKeyboardState', 'CSS3DRenderer', 'bootstrapGrowl'],
	function($, bootstrap, detector, THREE, THREEx, THREEx, THREEx)
{
	var ThreeDCV = function(){
		this.SCREEN_WIDTH = window.innerWidth;
		this.SCREEN_HEIGHT = window.innerHeight;
		this.VIEW_ANGLE = 45;
		this.ASPECT = this.SCREEN_WIDTH / this.SCREEN_HEIGHT;
		this.NEAR = 0.1;
		this.FAR = 20000;

		this.container = document.getElementById( 'ThreeJS' );
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera( this.VIEW_ANGLE, this.ASPECT, this.NEAR, this.FAR);
		this.renderer = null;
		this.cssRenderer = null;
		this.cssScene = new THREE.Scene();
		this.projector = new THREE.Projector();
		this.keyboard = new THREEx.KeyboardState();
		this.clock = new THREE.Clock();
		this.wallsWidth = 20;
		this.wallsHeight = 150;
		this.interactionsList = [];
		this.mouse = { x: 0, y: 0 };
		this.infoModalLookup = [];
		this.collidableMeshList = [];
		this.cameraColGeo = new THREE.CubeGeometry(40, 40, 40, 4, 4, 4);
		this.cameraColMat = new THREE.MeshBasicMaterial({ visible: false, color: 0x00ff00});
		this.cameraColMesh = new THREE.Mesh(this.cameraColGeo, this.cameraColMat);

		// RENDERER
		if ( detector.webgl )
			this.renderer = new THREE.WebGLRenderer( {antialias:true} );
		else
			this.renderer = new THREE.CanvasRenderer();

		this.MFGInfo = {
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

		this.GLInfo = {
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

		this.scene.add(this.camera);
		this.camera.position.set(0,40,1100);
		this.camera.lookAt(this.scene.position);
		this.camera.rotation.x = 0;

		this.renderer.shadowMapEnabled = true;
		this.renderer.shadowMapSoft = true;
		this.renderer.shadowCameraNear = 3;
		this.renderer.shadowCameraFar = this.camera.far;
		this.renderer.shadowCameraFov = 1;

		this.renderer.shadowMapBias = 0.0039;
		this.renderer.shadowMapDarkness = 0.8;
		this.renderer.shadowMapWidth = 10000;
		this.renderer.shadowMapHeight = 10000;
		this.renderer.shadowMapType = THREE.PCFShadowMap;

		this.renderer.setSize(this.SCREEN_WIDTH, this.SCREEN_HEIGHT);

		this.container.appendChild( this.renderer.domElement );

		THREEx.WindowResize(this.renderer, this.camera);


		this.cameraColMesh.position.set(0,40,1100);
		this.scene.add(this.cameraColMesh);

		// LIGHT
		var light = new THREE.SpotLight(0xffffff, 0.5);
		light.position.set(0,1000,2500);

		this.scene.add(light);
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
		this.scene.add(floor);

		// Big back wall
		var wallGeo = new THREE.CubeGeometry(4000,300,20,1,1,1);
		var wallMat = new THREE.MeshBasicMaterial({color: 0xaaee00});
		var wall = new THREE.Mesh(wallGeo, wallMat);
		wall.position.set(0,150,1990);
		this.scene.add(wall);
		this.collidableMeshList.push(wall);

		// SKYBOX/FOG
		var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
		var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00, side: THREE.BackSide } );
		var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
		// scene.add(skyBox);
		this.scene.fog = new THREE.FogExp2( 0x9999ff, 0.0005 );
		this.scene.add(skyBox);

		this.cssRenderer = new THREE.CSS3DRenderer();
		this.cssRenderer.setSize( window.innerWidth, window.innerHeight );
		this.cssRenderer.domElement.style.position = 'absolute';
		this.cssRenderer.domElement.style.top = 0;

		document.body.appendChild(this.cssRenderer.domElement);

		THREEx.WindowResize(this.cssRenderer, this.camera);

		this.renderer.domElement.style.top = 0;
		this.renderer.domElement.style.position = 'absolute';
		this.cssRenderer.domElement.appendChild(this.renderer.domElement);
	};

	ThreeDCV.prototype.initGrowl = function(){
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

	ThreeDCV.prototype.onDocumentMouseDown = function(event){

		console.log("Click.");

		// update the mouse variable
		this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;


		// create a Ray with origin at the mouse position
		//   and direction into the scene (camera direction)
		var vector = new THREE.Vector3( this.mouse.x,this.mouse.y, 1 );
		this.projector.unprojectVector( vector, this.camera );
		var ray = new THREE.Raycaster( this.camera.position, vector.sub( this.camera.position ).normalize() );

		// create an array containing all objects in the scene with which the ray intersects
		var intersects = ray.intersectObjects( this.collidableMeshList );

		// if there is one (or more) intersections
		if ( intersects.length > 0)
		{

			objectId = intersects[0].object.id;
			if (this.infoModalLookup[objectId] != null){
				this.infoModalLookup[objectId].display();
			}

			if (this.interactionsList[objectId]){
				this.interactionsList[objectId](intersects[0].object);
			}
		}
	}

	ThreeDCV.prototype.CSS3DElementsInit = function(){

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

		this.createCSS3DObject(
		{
			material: new THREE.MeshBasicMaterial({color: 0x000000, opacity: 0.1, side: THREE.DoubleSide }),
			geometry: new THREE.PlaneGeometry(200, 120),
			x: 500,
			y: 0,
			z: -150
		}, mfgElement);

		this.createCSS3DObject(
		{
			material: new THREE.MeshBasicMaterial({color: 0x000000, opacity: 0.1, side: THREE.DoubleSide }),
			geometry: new THREE.PlaneGeometry(200, 120),
			x: -500,
			y: 0,
			z: -150
		}, glElement);

		this.createCSS3DObject(
		{
			material: new THREE.MeshBasicMaterial({color: 0x000000, opacity: 0.1, side: THREE.DoubleSide }),
			geometry: new THREE.PlaneGeometry(200, 200),
			x: 0,
			y: 0,
			z: -875
		}, outsideElement);
	}

	ThreeDCV.prototype.createCSS3DObject = function(planeObj, element, forceAspectRatio){
		var forceAspectRatio = (typeof forceAspectRatio !== 'undefined') ?  forceAspectRatio : true;
		var planeMesh= new THREE.Mesh( planeObj.geometry, planeObj.material );
		planeMesh.position.y = planeObj.geometry.height/2;
		planeMesh.position.x = planeObj.x;
		planeMesh.position.z = planeObj.z;
		// add it to the standard (WebGL) scene
		this.scene.add(planeMesh);

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
		this.cssScene.add(cssObject);
	}

	ThreeDCV.prototype.canMoveTo = function(vBefore, vAfter){
		if (vAfter.x > 2000 || vAfter.x < -2000){ return false; }
		if (vAfter.z > 2000 || vAfter.z < -2000){ return false; }

		for(var vi = 0; vi < this.cameraColMesh.geometry.vertices.length; vi++){
			var localVertex = this.cameraColMesh.geometry.vertices[vi].clone();
			var globalVertex = localVertex.applyMatrix4(this.cameraColMesh.matrix);
			var directionVector = globalVertex.sub(this.cameraColMesh.position);

			var colRay = new THREE.Raycaster(vAfter, directionVector.clone().normalize());
			var colResult = colRay.intersectObjects(this.collidableMeshList);
			if (colResult.length > 0 && colResult[0].distance < directionVector.length()){
				return false;
				break;
			}
		}

		return true;
	}

	ThreeDCV.prototype.createStructureWall = function(wallMat, w, d, h, position, rotate, solid ){
		position = (typeof position !== 'undefined') ?  position : {x: 0, y: 0, z: 0};
		rotate = (typeof rotate !== 'undefined') ?  rotate : true;
		solid = (typeof solid !== 'undefined') ?  solid : true;

		var wallGeo = new THREE.CubeGeometry(w,h,d,1,1,1);
		var wall = new THREE.Mesh(wallGeo, wallMat);
		wall.position.set(position.x, position.y, position.z);

			var rotationMatrix = new THREE.Matrix4();
			var axis = new THREE.Vector3(1,0,0);

		    rotationMatrix.makeRotationAxis( axis.normalize(), Math.PI/2 );
		    rotationMatrix.multiply( wall.matrix );                       // pre-multiply
		    wall.matrix = rotationMatrix;
		    wall.rotation.setEulerFromRotationMatrix( wall.matrix );

		if (rotate){
			var rotationMatrix = new THREE.Matrix4();
			var axis = new THREE.Vector3(0,1,0);

		    rotationMatrix.makeRotationAxis( axis.normalize(), Math.PI/2 );
		    rotationMatrix.multiply( wall.matrix );                       // pre-multiply
		    wall.matrix = rotationMatrix;
		    wall.rotation.setEulerFromRotationMatrix( wall.matrix );
		}

		this.scene.add(wall);

		wall.castShadow = true;
		wall.receiveShadow = true;

		if (solid){
			this.collidableMeshList.push(wall);
		}
	}

	ThreeDCV.prototype.InitStructure = function(){
		// Lamps
		var self = this;
		var loader = new THREE.SceneLoader();
		loader.load("models/lamp.json", function(res){ // loading mesh
			var lamp = res.scene.children[0];

			lampTwo = lamp.clone();

			lamp.position.set(-150,45,700);
			lamp.scale.set(60,60,60);

			lampTwo.position.set(150,45,700);
			lampTwo.scale.set(60,60,60);

			self.scene.add(lamp);
			self.scene.add(lampTwo);
		});

		// Lights

		var light = new THREE.PointLight( 0xaa00ee, 1, 200);
		light.position.set(-150, 45, 700);
		this.scene.add(light);

		light = new THREE.PointLight( 0x00eeaa, 1, 200);
		light.position.set(150, 45, 700);
		this.scene.add(light);

		var bulbLightOne = new THREE.PointLight(0xffffff, 1, 400);
		var bulbLightTwo = bulbLightOne.clone();
		var bulbLightThree = bulbLightOne.clone();

		bulbLightOne.position.set(-500,149,300);
		bulbLightTwo.position.set(0,149,300);
		bulbLightThree.position.set(500,149,300);

		this.scene.add(bulbLightOne);
		this.scene.add(bulbLightTwo);
		this.scene.add(bulbLightThree);

		var lightBulbG = new THREE.CubeGeometry(2,2,2);
		var lightBulbM = new THREE.MeshBasicMaterial({color: 0xffffff});

		var bulbOne = new THREE.Mesh(lightBulbG, lightBulbM);
		var bulbTwo = bulbOne.clone();
		var bulbThree = bulbOne.clone();

		bulbOne.position.set(-500,149,300);
		bulbTwo.position.set(0,149,300);
		bulbThree.position.set(500,149,300);
		this.scene.add(bulbOne);
		this.scene.add(bulbTwo);
		this.scene.add(bulbThree);

		// Wall time
		var wallsDepth = 200 + this.wallsWidth;
		var wallsY = this.wallsHeight / 2;

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

		this.createStructureWall(wallMat, wallsDepth, this.wallsHeight, this.wallsWidth, {x: 0, y: wallsY, z: 1200}, false);
		this.createStructureWall(wallMat, wallsDepth, this.wallsHeight, this.wallsWidth, {x: 100, y: wallsY, z: 1100}, true);
		this.createStructureWall(wallMat, wallsDepth, this.wallsHeight, this.wallsWidth, {x: -100, y: wallsY, z: 1100}, true);
		this.createStructureWall(wallMat, wallsDepth, this.wallsHeight, this.wallsWidth, {x: -200, y: wallsY, z: 1000}, false);
		this.createStructureWall(wallMat, wallsDepth, this.wallsHeight, this.wallsWidth, {x: 200, y: wallsY, z: 1000}, false);
		this.createStructureWall(wallMat, wallsDepth+200, this.wallsHeight, this.wallsWidth, {x: 300, y: wallsY, z: 800}, true);
		this.createStructureWall(wallMat, wallsDepth+200, this.wallsHeight, this.wallsWidth, {x: -300, y: wallsY, z: 800}, true);
		this.createStructureWall(wallMat, wallsDepth, this.wallsHeight, this.wallsWidth, {x: -200, y: wallsY, z: 600}, false);
		this.createStructureWall(wallMat, wallsDepth, this.wallsHeight, this.wallsWidth, {x: 200, y: wallsY, z: 600}, false);
		this.createStructureWall(wallMat, wallsDepth, this.wallsHeight, this.wallsWidth, {x: -100, y: wallsY, z: 500}, true);
		this.createStructureWall(wallMat, wallsDepth, this.wallsHeight, this.wallsWidth, {x: 100, y: wallsY, z: 500}, true);
		this.createStructureWall(wallMat, wallsDepth, this.wallsHeight, this.wallsWidth, {x: 200, y: wallsY, z: 400}, false);
		this.createStructureWall(wallMat, wallsDepth, this.wallsHeight, this.wallsWidth, {x: 200, y: wallsY, z: 200}, false);
		this.createStructureWall(wallMat, wallsDepth, this.wallsHeight, this.wallsWidth, {x: -200, y: wallsY, z: 400}, false);
		this.createStructureWall(wallMat, wallsDepth, this.wallsHeight, this.wallsWidth, {x: -200, y: wallsY, z: 200}, false);

	 	// Big Rooms
	 	this.createStructureWall(wallMat, wallsDepth+200, this.wallsHeight, this.wallsWidth, {x: -500, y: wallsY, z: 600}, false);
		this.createStructureWall(wallMat, wallsDepth+200, this.wallsHeight, this.wallsWidth, {x: 500, y: wallsY, z: 600}, false);
		this.createStructureWall(wallMat, wallsDepth, this.wallsHeight, this.wallsWidth, {x: 300, y: wallsY, z: 500}, true);
		this.createStructureWall(wallMat, wallsDepth, this.wallsHeight, this.wallsWidth, {x: -300, y: wallsY, z: 500}, true);
		this.createStructureWall(wallMat, wallsDepth+200, this.wallsHeight, this.wallsWidth, {x: -500, y: wallsY, z: -200}, false);
		this.createStructureWall(wallMat, wallsDepth+200, this.wallsHeight, this.wallsWidth, {x: 500, y: wallsY, z: -200}, false);
		this.createStructureWall(wallMat, wallsDepth+200, this.wallsHeight, this.wallsWidth, {x: 300, y: wallsY, z: 0}, true);
		this.createStructureWall(wallMat, wallsDepth+200, this.wallsHeight, this.wallsWidth, {x: -300, y: wallsY, z: 0}, true);
		this.createStructureWall(wallMat, wallsDepth+200, this.wallsHeight, this.wallsWidth, {x: 100, y: wallsY, z: 0}, true);
		this.createStructureWall(wallMat, wallsDepth+200, this.wallsHeight, this.wallsWidth, {x: -100, y: wallsY, z: 0}, true);
		this.createStructureWall(wallMat, wallsDepth+600, this.wallsHeight, this.wallsWidth, {x: 700, y: wallsY, z: 200}, true);
		this.createStructureWall(wallMat, wallsDepth+600, this.wallsHeight, this.wallsWidth, {x: -700, y: wallsY, z: 200}, true);

		// Roof
		var wallGeo = new THREE.CubeGeometry(1400 + this.wallsWidth,1600,this.wallsWidth,1,1,1);
		var wall = new THREE.Mesh(wallGeo, roofMat);
		wall.position.set(0,this.wallsHeight+10,400);
		wall.rotation.x = Math.PI /2;
		this.scene.add(wall);
		wall.castShadow = true;
		this.collidableMeshList.push(wall);

		// Floor
		wallGeo = new THREE.CubeGeometry(1400 + this.wallsWidth,1600,0.1,1,1,1);
		wall = new THREE.Mesh(wallGeo, floorMat);
		wall.position.set(0,0.1,400);
		wall.rotation.x = Math.PI /2;
		this.scene.add(wall);
		wall.receiveShadow = true;
		this.collidableMeshList.push(wall);

		// Clickable info boxes
		wallGeo = new THREE.CubeGeometry(20,40,10,1,1,1);
		wall = new THREE.Mesh(wallGeo, infoBoxMat);
		wall.position.set(350,20,-150);
		wall.rotation.y = Math.PI /6;
		this.scene.add(wall);
		this.collidableMeshList.push(wall);
		this.infoModalLookup[wall.id] = this.MFGInfo;

		wall = new THREE.Mesh(wallGeo, infoBoxMat);
		wall.position.set(-350,20,-150);
		wall.rotation.y = -Math.PI /6;
		this.scene.add(wall);
		this.collidableMeshList.push(wall);
		this.infoModalLookup[wall.id] = this.GLInfo;

		// Doors
		var doorGeo = new THREE.CubeGeometry(100,this.wallsHeight,3,1,1,1);
		var doorMat = new THREE.MeshPhongMaterial({map: doorTexture, color: 0xaa3322});
		var doorTwoMat = new THREE.MeshPhongMaterial({map: doorTwoTexture, color: 0xaa3322});
		var door = new THREE.Mesh(doorGeo, doorMat);
		var doorTwo = new THREE.Mesh(doorGeo, doorTwoMat);

		door.position.set(-50,this.wallsHeight/2,-100);
		doorTwo.position.set(50,this.wallsHeight/2,-100);

		door.isOpen = false;
		doorTwo.isOpen = false;

		this.collidableMeshList.push(door);
		this.collidableMeshList.push(doorTwo);

		this.interactionsList[door.id] = function(obj){
			obj.isOpen = !obj.isOpen;
			if (obj.isOpen){
				obj.rotation.y += Math.PI / 2;
				obj.position.x = -90;
			}else{
				obj.rotation.y -= Math.PI / 2;
				obj.position.x = -50
			}
		};
		this.interactionsList[doorTwo.id] = function(obj){
			obj.isOpen = !obj.isOpen;
			if (obj.isOpen){
				obj.rotation.y += Math.PI / 2;
				obj.position.x = 90;
			}else{
				obj.rotation.y -= Math.PI / 2;
				obj.position.x = 50;
			}
		};

		this.scene.add(door);
		this.scene.add(doorTwo);
	};

	var cv = new ThreeDCV();

	document.addEventListener( 'mousedown', function(event){cv.onDocumentMouseDown(event);}, false );

	cv.InitStructure();
	cv.CSS3DElementsInit();

	cv.initGrowl();

	$('#info-modal').modal({
	  keyboard: false,
	  show: false
	});

	// threejs requires global scope for some loop things, so here we go
	window.cv = cv;

	animate();

});


function animate(){
    requestAnimationFrame( animate );
	render();
	update();
}

function update()
{
	var delta = window.cv.clock.getDelta(); // seconds.
	var moveDistance = 200 * delta; // 200 pixels per second
	var rotateAngle = Math.PI / 2 * delta;   // pi/2 radians (90 degrees) per second

	window.cv.cameraColMesh.position.set(window.cv.camera.position.x, window.cv.camera.position.y, window.cv.camera.position.z);

	// move forwards/backwards/left/right
	if ( window.cv.keyboard.pressed("W") ){
		var camBefore = window.cv.camera.position;
		window.cv.camera.translateZ( -moveDistance );
		if (!window.cv.canMoveTo(camBefore, window.cv.camera.position)){ window.cv.camera.translateZ( moveDistance ); }
	}

	if ( window.cv.keyboard.pressed("S") ){
		var camBefore = window.cv.camera.position;
		window.cv.camera.translateZ(  moveDistance );
		if (!window.cv.canMoveTo(camBefore, window.cv.camera.position)){ window.cv.camera.translateZ( -moveDistance ); }

	}

	if ( window.cv.keyboard.pressed("A") )
		window.cv.camera.rotateOnAxis( new THREE.Vector3(0,1,0), rotateAngle);
	if ( window.cv.keyboard.pressed("D") )
		window.cv.camera.rotateOnAxis( new THREE.Vector3(0,1,0), -rotateAngle);

	if ( window.cv.keyboard.pressed("Z") )
	{
		window.cv.camera.position.set(0,1200,0);
		window.cv.camera.rotation.set(0,0,0);
	}

}

function render()
{
	window.cv.cssRenderer.render(window.cv.cssScene, window.cv.camera);
	window.cv.renderer.render( window.cv.scene, window.cv.camera );
}