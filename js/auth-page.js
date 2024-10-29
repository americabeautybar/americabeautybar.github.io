$(document).ready(function() {

    document.querySelector("body").style.display = "none";

    //console.log("running verifyAuthenticatedUser [1]...");
	verifyAuthenticatedUser();

})


async function verifyAuthenticatedUser(){

    const is_redirect = await auth.redirecToLoginIfTokenIsNotValid();

    if(!is_redirect){
        validateUserPermissionForPage();
        document.querySelector("body").style.display = "block";
    }
}

$(window).focus(function(e) {
	// this will force the page to validate the access token if any.
    //console.log("running validateAccessTokenOnFocus [2]...");
	validateAccessTokenOnFocus();
});

async function validateAccessTokenOnFocus(){
    const is_redirect = await auth.redirecToLoginIfTokenIsNotValid();
    if(!is_redirect){
        validateUserPermissionForPage();
    }
}

function validateUserPermissionForPage(){

    if(typeof(ABB_PERMISSIONS_ROUTES) !== 'undefined'){

        for(let i = 0; i < ABB_PERMISSIONS_ROUTES.length; i++){

            let current_url = window.location.href;

            if(current_url.match(ABB_PERMISSIONS_ROUTES[i].url_pattern)){
                let user_roles = auth.getUserRolesFromToken()
                if(!hasPermission(user_roles, ABB_PERMISSIONS_ROUTES[i].permission_action)){
                    window.location.href = "./403.html";
                    return true;
                }
                break;
            }
        }
    }
}
