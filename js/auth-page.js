(function($) {

	"use strict";

    document.querySelector("body").style.display = "none";

	verifyAuthenticatedUser();

})(jQuery);

async function verifyAuthenticatedUser(){

    const is_redirect = await auth.redirecToLoginIfTokenIsNotValid();

    if(!is_redirect){
        document.querySelector("body").style.display = "block";
    }
}

$(window).focus(function(e) {
	// this will force the page to validate the access token if any.
	validateAccessTokenOnFocus();
});

async function validateAccessTokenOnFocus(){
    const is_redirect = await auth.redirecToLoginIfTokenIsNotValid();
}
