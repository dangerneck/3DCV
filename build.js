({
    baseUrl: "js/",
    paths: {
        three: "Three58",
        threeFullscreen: "THREEx.FullScreen",
        threeWindowResize: "THREEx.WindowResize",
        threeKeyboardState: "THREEx.KeyboardState",
        bootstrap: 'bootstrap.min',
        bootstrapGrowl: 'bootstrap-growl.min'
    },
    shim:{
    	'three': {
    		exports: "THREE"
    	},
    	'threeFullScreen':{
    		deps: ['three']
    	},
    	'threeWindowResize':{
    		deps: ['three']
    	},
    	'threeKeyboardState':{
    		deps: ['three']
    	}
    	'CSS3DRenderer':{
    		deps: ['three']
    	},
    	'bootstrapGrowl':{
    		deps: ['bootstrap']
    	}
    },
    name: "js/3dcv",
    out: "js/3dcv-release.js"
});