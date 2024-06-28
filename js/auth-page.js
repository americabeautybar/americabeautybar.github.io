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
