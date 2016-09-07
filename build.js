({
    baseUrl: "js/",
    paths: {
        "three": "Three58",
        "threeFullscreen": "THREEx.FullScreen",
        "threeWindowResize": "THREEx.WindowResize",
        "threeKeyboardState": "THREEx.KeyboardState",
        "bootstrap": "bootstrap.min",
        "bootstrapGrowl": "bootstrap-growl.min",
        "CSS3DRenderer": "CSS3DRenderer",
    },
	shim:{
	    	"three": {
	    		exports: "THREE"
	    	},
	    	"threeFullScreen":{
	    		deps: ["three"],
	    		exports: "THREEx"
	    	},
	    	"threeWindowResize":{
	    		deps: ["three"],
	    		exports: "THREEx"
	    	},
	    	"threeKeyboardState":{
	    		deps: ["three"],
	    		exports: "THREEx"
	    	},
	    	"CSS3DRenderer":{
	    		deps: ["three"],
	    	},
	    	"bootstrapGrowl":{
	    		deps: ["bootstrap"]
	    	},
	    	"bootstrap":{
	    		deps: ["jquery"]
	    	}
	    },
    name: "3dcv",
    out: "js/3dcv-release.js"
});