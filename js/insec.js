// a very insecure password lib
insec = (function (document, window) {
    'use strict';

    // w3schools cookie functions
    var
    setCookie = function (cname, value, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays*24*60*60*1000));
	var expires = "expires="+d.toGMTString();
	document.cookie = cname + "=" + value + "; " + expires;
    },
    getCookie = function(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i=0; i<ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1);
            if (c.indexOf(name) != -1) return c.substring(name.length,c.length);
	}
	return "";
    },
    djb = function(str){
	var hash = 5381;
	for (var i = 0; i < str.length; i++) {
            var char = str.charCodeAt(i);
            hash = ((hash << 5) + hash) + char;
	}
	return hash;
    },
    insec = function (hashed_pass, cookie_days) {
	var _ = this,

	block = document.getElementById('insec-block'),
	inpass = document.getElementById('insec-pass'),
	submit = document.getElementById('insec-submit'),
	
	validate = function(pass) {
	    var hash;
	    if (pass === undefined) {
		hash = getCookie('insec');
	    } else { 
		hash = djb(pass);
	    };
	    if (hash == hashed_pass) {
		setCookie('insec',hashed_pass,cookie_days);
		return 1;
	    };
	    return 0;
	},
	invalidate = function(){
	    setCookie('insec','',0);
	},
	validate_and_clear = function(e){
	    var pass;
	    if (inpass !== null && e !== undefined) 
		pass = inpass.value;
	    if (validate(pass)) {
		block.parentNode.removeChild(block);
	    } else {
		inpass.value = '';
	    };
	};

	cookie_days = cookie_days || 0;
	if ( submit !== null && inpass !== null && block !== null ) {
	    submit.addEventListener('click',validate_and_clear);
	    inpass.addEventListener('keypress',function(e){
		var k = e.keyCode ? e.keyCode : e.which;
		if (k==13) validate_and_clear(e);
		});
	};
	
	validate_and_clear();
	
	_.validate = validate;
	_.invalidate = invalidate;
	_.validate_and_clear = validate_and_clear;
    };
    return insec;
})(document, window);
