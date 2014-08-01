

var app = function() {
    'use strict';
    
    var 
    
    _ = this,

    //////////////////////////////////////////////////////////
    /* HELPER FUNCTIONS
     * Extracted from impress.js
     *
     * Copyright 2011-2012 Bartek Szopka (@bartaz)
     *
     * Released under the MIT and GPL Licenses.
     *
     * ------------------------------------------------
     *  author:  Bartek Szopka
     *  version: 0.5.3
     *  url:     http://bartaz.github.com/impress.js/
     *  source:  http://github.com/bartaz/impress.js/
     */

    // `pfx` is a function that takes a standard CSS property name as a parameter
    // and returns it's prefixed version valid for current browser it runs in.
    // The code is heavily inspired by Modernizr http://www.modernizr.com/
    pfx = (function () {
        var style = document.createElement('dummy').style,
            prefixes = 'Webkit Moz O ms Khtml'.split(' '),
            memory = {};
        return function ( prop ) {
            if ( typeof memory[ prop ] === "undefined" ) {
                var ucProp  = prop.charAt(0).toUpperCase() + prop.substr(1),
                    props   = (prop + ' ' + prefixes.join(ucProp + ' ') + ucProp).split(' ');
                memory[ prop ] = null;
                for ( var i in props ) {
                    if ( style[ props[i] ] !== undefined ) {
                        memory[ prop ] = props[i];
                        break;
                    }
                }
            }
            return memory[ prop ];
        };
    })(),
    // `arraify` takes an array-like object and turns it into real Array
    // to make all the Array.prototype goodness available.
    arrayify = function ( a ) {
        return [].slice.call( a );
    },
    // `css` function applies the styles given in `props` object to the element
    // given as `el`. It runs all property names through `pfx` function to make
    // sure proper prefixed version of the property is used.
    css = function ( el, props ) {
        var key, pkey;
        for ( key in props ) {
            if ( props.hasOwnProperty(key) ) {
                pkey = pfx(key);
                if ( pkey !== null ) {
                    el.style[pkey] = props[key];
                }
            }
        }
        return el;
    },
    // `byId` returns element with given `id` - you probably have guessed that ;)
    byId = function ( id ) {
        return document.getElementById(id);
    },

    //////////////////////////////////////////////////////////

    // binds an event listener
    bind = function (obj, event, callback) {
	obj.addEventListener ? obj.addEventListener(event, callback, false)
	: obj.attachEvent('on'+event, callback);
    },
    addC = function (obj, c) {
	obj.classList && obj.classList.add(c);
    },
    removeC = function (obj, c) {
	obj.classList && obj.classList.remove(c);
    },
    hasC = function (obj, c) {
	return obj.classList && obj.classList.contains(c);
    },
    px = function ( numeric ) {
	return numeric+'px';
    },

    
    status = {},

    init = function () {
	

	var 

	btn_fdw = byId('btn-fdw'),
	btn_fhp = byId('btn-fhp'),
	rdo_fdw1 = byId('fdw-r1'),
	rdo_fdw2 = byId('fdw-r2'),
	rdo_fdw3 = byId('fdw-r3'),
	rdo_fdw4 = byId('fdw-r4'),
	chk_fdw1 = byId('fdw-c1'),
	chk_fdw2 = byId('fdw-c2'),
	chk_fdw3 = byId('fdw-c3'),
	rdo_fhp1 = byId('fhp-r1'),
	rdo_fhp2 = byId('fhp-r2'),
	rdo_fhp3 = byId('fhp-r3'),
	rdo_fhp4 = byId('fhp-r4'),
	chk_fhp1 = byId('fhp-c1'),
	chk_fhp2 = byId('fhp-c2'),
	chk_fhp3 = byId('fhp-c3'),
	
	ctrls = [
	    btn_fdw,
	    btn_fhp,
	    rdo_fdw1,
	    rdo_fdw2,
	    rdo_fdw3,
	    rdo_fdw4,
	    chk_fdw1,
	    chk_fdw2,
	    chk_fdw3,
	    rdo_fhp1,
	    rdo_fhp2,
	    rdo_fhp3,
	    rdo_fhp4,
	    chk_fhp1,
	    chk_fhp2,
	    chk_fhp3],

	div_map = byId('map'),
	div_fdw = byId('fdw-controls'),
	div_fhp = byId('fhp-controls'),

	map = L.map('map', {
	    center: status.mapCenter || [40, 10],
	    zoom: status.mapZoom || 4,
            maxZoom: 15
	}),

	fdw_layers = [],
	fhp_layers = [],

	base = L.tileLayer('http://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png', {}).addTo(map),
	
	watershed = L.mapbox.featureLayer().addTo(map),
	  
	apiurl = 'http://54.86.253.5/',

	get_watershed = function(e) { 
	    var u = apiurl + '?loc=' + e.latlng.lng + ',' + e.latlng.lat + 
		'&d=' + (4/Math.pow(2,map.getZoom())) + '&f=json'; 
	    watershed.loadURL(u);
	},

	popup = L.popup(),
	show_download = function(e) {
	    var lat = watershed._geojson.features[0].properties.pour_lat;
	    var lng = watershed._geojson.features[0].properties.pour_long;
	    var u = apiurl + '?loc=' + lng + ',' + lat + '&d=0&f=zip'; 
	    popup.setLatLng([lat,lng])
		.setContent('Download <a href="'+u+'"> shapefile</a>')
		.openOn(map);
	},

	update_status = function(opts, skip_update) {
	    var dirty = false;
	    if (typeof(opts) === 'object') {
		for (var key in opts) {
		    if (status[key] != opts[key]) {
			status[key] = opts[key];
			dirty = true;
		    };
		};
	    };
	    if (dirty && !skip_update) {
		update_layers();
	    };
	},
	
	read_map_status = function(e) {
	    update_status({mapCenter:map.getCenter(),
			   mapZoom:map.getZoom()},
			  true);
	},

	read_ui = function(e) {	    
	    update_status({
		rdo_fdw1:rdo_fdw1.checked,
		rdo_fdw2:rdo_fdw2.checked,
		rdo_fdw3:rdo_fdw3.checked,
		rdo_fdw4:rdo_fdw4.checked,
		chk_fdw1:chk_fdw1.checked,
		chk_fdw2:chk_fdw2.checked,
		chk_fdw3:chk_fdw3.checked,
		rdo_fhp1:rdo_fhp1.checked,
		rdo_fhp2:rdo_fhp2.checked,
		rdo_fhp3:rdo_fhp3.checked,
		rdo_fhp4:rdo_fhp4.checked,
		chk_fhp1:chk_fhp1.checked,
		chk_fhp2:chk_fhp2.checked,
		chk_fhp3:chk_fhp3.checked
		});
	},
	
	select_fdw = function(e) {
	    addC(btn_fdw,'btn-active');
	    removeC(btn_fhp,'btn-active');
	    update_status({
		btn_fdw:true,
		btn_fhp:false});
	},
	select_fhp = function(e) {
	    addC(btn_fhp,'btn-active');
	    removeC(btn_fdw,'btn-active');    
	    update_status({
		btn_fdw:false,
		btn_fhp:true});
	},

	update_layers = function(force) {
	    if (status.btn_fdw) {
		// drinking water panel active
		for(var l in fhp_layers) {
		    map.removeLayer(fhp_layers[l]);
		};
		removeC(div_fdw,'ra-hidden');
		addC(div_fhp,'ra-hidden');
	    } else if (status.btn_fhp) {
		// hydropower panel active
		for(var l in fdw_layers) {
		    map.removeLayer(fdw_layers[l]);
		};
		removeC(div_fhp,'ra-hidden');
		addC(div_fdw,'ra-hidden');
	    };
	};
	

	map.on({click:get_watershed,
		moveend:read_map_status,
		zoomend:read_map_status});
	watershed.on({click:show_download});

	bind(div_map,'ra-screenchange',map.invalidateSize);
	for(var i in ctrls) {
	    bind(ctrls[i],'click',read_ui);
	};
	bind(btn_fdw,'click',select_fdw);	
	bind(btn_fhp,'click',select_fhp);

	// initialize app on first panel
	select_fdw();
    };
    
    init();
    return status;
};
