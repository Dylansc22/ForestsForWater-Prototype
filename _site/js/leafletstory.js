(function(L) {
    'use strict'
    
    var 

    // utility functions
    _hide = function(el) {
	L.DomUtil.addClass(el, 'leaflet-control-story-hide');
    },
    _show = function(el) {
	if (L.DomUtil.hasClass(el, 'leaflet-control-story-hide'))
	    L.DomUtil.removeClass(el, 'leaflet-control-story-hide');
    };

    L.Control.Story = L.Control.extend( {
	options: {
	    position:'bottomright'
	},
	initialize: function(options) {
	    L.setOptions(this, options);
	    this._slides = [];
	    this.curSlide = 0;
	},
	onAdd: function(map) {
	    var controlName = 'leaflet-control-story';
	    // create divs
	    this.container = L.DomUtil.create('div', controlName);
	    this.storyDiv = L.DomUtil.create('div', controlName+'-pane', this.container);
	    this.prevBtn = this._createBtn(this.container, controlName+'-prev', this.previous);
	    this.nextBtn = this._createBtn(this.container, controlName+'-next', this.next);
	    this.closeBtn = this._createBtn(this.container, controlName+'-close', this.remove);
	    // set to slide 0
	    if (this._slides.length > 0)
		this._selectSlide(0);
	    return this.container;
	},
	addSlide: function (el, options) {
	    // add a new slide with options
	    this._slides.push(this._makeSlide(el,options));
	    return this;
	},
	insertSlide: function (i, el, options) {
	    // insert a new slide at position i with options
	    this._slides.insert(this._makeSlide(el,options),i);
	    return this;
	},
	onRemove: function(i) {
	    this._unselectSlide(this.curSlide);
	},
	removeSlide: function (i) {
	    // remove a slide
	    this._slides.remove(i);
	    return this;
	},
	next: function () {
	    // go to the next slide or end the show
	    if (this.curSlide < this._slides.length-1) {
		this._unselectSlide(this.curSlide);
		this.curSlide++;
		this._selectSlide(this.curSlide);
	    } else this.remove();
	},
	previous: function () {
	    // go to the previous slide or end the show
	    if (this.curSlide > 0) {
		this._unselectSlide(this.curSlide);
		this.curSlide--;
		this._selectSlide(this.curSlide);
	    } else this.remove();
	},
	goToSlide: function(i) {
	    // go to a given slide
	    this._unselectSlide(this.curSlide);
	    this.curSlide = i;
	    this._selectSlide(this.curSlide);
	},
	remove: function() {
	    // close the story
	    this.removeFrom(this._map);
	},
	_createBtn: function(container, className, fn) {
	    // Modified from Leaflet zoom control && Leaflet.NavBar
	    var link = L.DomUtil.create('a', className, container);
	    link.href = '#';
	    L.DomEvent
		.on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
		.on(link, 'click', L.DomEvent.stop)
		.on(link, 'click', fn, this)
		.on(link, 'click', this._refocusOnMap, this);
	    return link;
	},
	_makeSlide: function(el, options) {
	    // default options
	    var slide = {
		onOpen:undefined,
		closeOpen:undefined,
		nextText:'Next',
		prevText:'Back',
		layers:[],
		offLayers:[],
		closeAllLayers:false,
		closePopups:false,
		zoom:undefined,
		center:undefined,
		panDuration:0.25,
	    };
	    // create element if el is HTML
	    if (el !== undefined) {
		if (el.nodeName) {
		    slide.el = el;
		} else {
		    var newEl = L.DomUtil.create('div', '');
		    newEl.innerHTML = el;
		    slide.el = newEl;
		};
		_hide(slide.el);
	    };
	    if (options) {
		if (options.onOpen)
		    slide.onOpen = options.onOpen;
		if (options.onClose)
		    slide.onClose = options.onClose;
		if (options.nextText)
		    slide.nextText = options.nextText;
		if (options.prevText)
		    slide.prevText = options.prevText;
		if (options.layers) {
		    if (options.layers instanceof Array) {
			slide.layers = options.layers;
		    } else if (options.layers instanceof L.ILayer) {
			slide.layers = [options.layers]; }; };
		if (options.offLayers) {
		    if (options.offLayers instanceof Array) {
			slide.offLayers = options.offLayers;
		    } else if (options.layers instanceof L.ILayer) {
			slide.offLayers = [options.offLayers]; }; };
		if (options.closeAllLayers !== undefined)
		    slide.closeAllLayers = options.closeAllLayers;
		if (options.closePopups !== undefined)
		    slide.closePopups = options.closePopups;
		if (typeof(options.zoom) == 'number')
		    slide.zoom = options.zoom;
		if (typeof(options.panDuration) == 'number')
		    slide.panDuration = options.panDuration;
		if (options.center instanceof Array || options.center instanceof L.latLng)
		    slide.center = options.center;
	    };
	    return slide;
	},
	_selectSlide: function(i) {
	    var s = this._slides[i];	    
	    // show the element
	    this.storyDiv.appendChild(s.el);
	    _show(s.el);
	    this.nextBtn.innerHTML = s.nextText;
	    this.prevBtn.innerHTML = s.prevText;
	    // set next/back button text to close by default if first or last slide
	    if (i==0 && s.prevText == 'Back')
		this.prevBtn.innerHTML = 'Close';
	    if (i==this._slides.length-1 && s.nextText == 'Next') 
		this.nextBtn.innerHTML = 'Close';

	    var map = this._map;
	    // zoompan
	    if (s.zoom !== undefined) {
		if (s.center !== undefined) {
		    map.setView(s.center, s.zoom, {
			animate:true, pan:{duration:s.panDuration} } );
		} else map.setZoom(s.zoom, {animate:true});
	    } else if (s.center !== undefined) 
		map.panTo(s.center, {animate:true, duration:s.panDuration})
	    // hide popups/layers
	    if (s.closePopups) this.map.closePopup();
	    if (s.closeAllLayers) {
		map.eachLayer(function(l) {
		    map.removeLayer(l); });
	    } else for (var i; i<s.offLayers.length; i++) {
		s.layers[l].removeFrom(map); };
	    // show layers
	    for (var i; i<s.layers.length; i++) {
		s.layers[l].addTo(map); };
	    // callback
	    if (typeof(s.onOpen) == 'object')
		s.onOpen();
	},
	_unselectSlide: function(i) {
	    var s = this._slides[i];
	    // hide content
	    _hide(s.el);
	    // callback
	    if (typeof(s.onClose) == 'object')
		s.onClose();
	},
    });
    
    L.control.story = function(options) {
	return new L.Control.Story(options);
    };
})(L);
