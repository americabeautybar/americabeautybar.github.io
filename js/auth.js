class LoginStorage {

    constructor() {
    }

    #getItemFromStore(item){
        return localStorage.getItem(item);
    }

    #setItemToStore(item, value){
        localStorage.setItem(item, value);
    }

    #removeItemFromStore(item){
        localStorage.removeItem(item);
    }

    getStoreAccessToken(){
        return this.#getItemFromStore("stoken");
    }
    
    setStoreAccessToken(value){
        this.#setItemToStore("stoken", value);
    }

    getStoreRefreshAccessToken(){
        return this.#getItemFromStore("srtoken");
    }
    
    setStoreRefreshAccessToken(value){
        this.#setItemToStore("srtoken", value);
    }
        
    getStoreUserEmail(){
        return this.#getItemFromStore("user_email");
    }
    
    setStoreUserEmail(value){
        this.#setItemToStore("user_email", value);
    }
    
    getStoreUserName(){
        return this.#getItemFromStore("user_name");
    }
    
    setStoreUserName(value){
        this.#setItemToStore("user_name", value);
    }
    
    getStoreRedirectTo(){
        return this.#getItemFromStore("redirect_to");
    }
    
    setStoreRedirectTo(value){
        this.#setItemToStore("redirect_to", value);
    }

    removeItemFromStore(item){
        this.#removeItemFromStore(item);
    }
}


class Auth {

    #supabase;
    #loginstorage;

    constructor(config) {
        const SUPABASE_URL = 'https://qeggtkpneycwsvszhuyu.supabase.co'
        const SUPABASE_ANON_KEY = config.APP.SUPABASE_ANON_KEY

        this.FIDELITY_CARD_EDGE_URL = config.APP.EDGE_API_URL;
        this.SUPA_ANON_KEY = config.APP.SUPABASE_ANON_KEY;

        this.#supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        this.#loginstorage = new LoginStorage();
    }

    #generateRanString(length) {
        const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const charactersLength = characters.length;
        for ( let i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    }

    /*
        return the current url and parameters
    */
    #getRedirectToUrl(){
        let loc = window.location.toString();
        let params = loc.split('?')[1];
        params = params != undefined ? `?${params}` : ''
        let to_redirect = `${window.location.pathname.toString()}${params}`;
        return to_redirect
    }

    /*
        validates if given user_jwt is still valid

        response:
            - token valid
            - token was refreshed
    */
    async validateAccessToken(user_jwt, refresh_token){

        if(user_jwt == null || user_jwt == undefined || user_jwt == ""){
          return [false, false];
        }

        const max_hr_refresh = this.#getMaxHrRefreshingToken(user_jwt)

        let {data, error} = await this.#supabase.auth.getUser(user_jwt)

        // if token is valid calculate if it overpass the max_hr_refresh
        if(data && data.user){

            const last_sign_in_in_hours = this.#getLastSignInHours(data.user.last_sign_in_at)

            //console.log("Max hr for refresh: ", max_hr_refresh)

            if (last_sign_in_in_hours >= max_hr_refresh){
                
                this.#loginstorage.removeItemFromStore("stoken");
                this.#loginstorage.removeItemFromStore("srtoken");
                await this.logout();

                return [false, false];
            }
        }
    
        // if token is not valid try to refresh it
        if(data === undefined || error){
            
            if(refresh_token == null || refresh_token == undefined){

                this.#loginstorage.removeItemFromStore("stoken");
                this.#loginstorage.removeItemFromStore("srtoken");
                
                return [false, false];
            }

            //console.log("try to refresh the token");

            let { data, error } = await this.#supabase.auth.refreshSession({ refresh_token: refresh_token })
            
            //console.log("refresh data: ", data, " - refresh error: ", error);

            // after refreshing the token calculate if it overpass the max_hr_refresh
            if(data && data.user && data.session){

                const max_hr_refresh = this.#getMaxHrRefreshingToken(data.session.access_token)

                const last_sign_in_in_hours = this.#getLastSignInHours(data.user.last_sign_in_at)
    
                if (last_sign_in_in_hours >= max_hr_refresh ){
                    
                    this.#loginstorage.removeItemFromStore("stoken");
                    this.#loginstorage.removeItemFromStore("srtoken");
                    await this.logout();
    
                    return [false, false];
                }
            }

            // if there is any issue refreshing the token return false
            if(data === undefined || error){
                //console.log("-------- data or session are undefined");
                return [false, false];
            }

            /*
            const continue_refresh_token = this._getContinueRefreshingToken(data.session.access_token)

            if (!continue_refresh_token){
                console.log("continue_refresh_token >>>> return [false, false] ", continue_refresh_token )
                
                this.#loginstorage.removeItemFromStore("stoken");
                this.#loginstorage.removeItemFromStore("srtoken");

                return [false, false];
            }
            */

            // if we successfully refreshed the token then update the stored values
            this.#loginstorage.setStoreAccessToken(data.session.access_token);
            this.#loginstorage.setStoreRefreshAccessToken(data.session.refresh_token);

            //console.log("TOKEN WAS REFRESHED.....")

            return [true, true];
        } 
    
        return [true, false];
    }

    #getLastSignInHours(last_sign_in_timestamp){
        
        var last_user_sign_in = new Date(last_sign_in_timestamp);

        var current_timestamp = new Date();

        var last_sign_in_in_hours = (current_timestamp - last_user_sign_in)/1000/60/60;

        //console.log("Last User Sign In: ", last_user_sign_in);
        //console.log("current timestamp: ", current_timestamp);
        //console.log("Last User Sign In (Hours): ", last_sign_in_in_hours);
        
        return last_sign_in_in_hours;
    }

    /*
        Redirect user to index page if token is still valid.
        Used for login page
    */
    async redirectToIndexIfTokenStillValid(){
        
        let accessToken = this.#loginstorage.getStoreAccessToken();
        let refreshToken = this.#loginstorage.getStoreRefreshAccessToken();
    
        const [tokenValid, tokenRefreshed] = await this.validateAccessToken(accessToken, refreshToken);
        if(tokenValid){
            // the access token is still valid, redirect to home page
            window.location.href = "./index.html";
            return true;
        }
        return false;
    }

    /* 
       Redirect user to login page if token is missing
       or not valid. Used for any private page 
    */
    async redirecToLoginIfTokenIsNotValid(){

        //console.log(">>>>> redirecToLoginIfTokenIsNotValid")

        let accessToken = this.#loginstorage.getStoreAccessToken()
        let refreshToken = this.#loginstorage.getStoreRefreshAccessToken();

        //console.log("access token 1 : ", accessToken)
    
        const [tokenValid, tokenRefreshed] = await this.validateAccessToken(accessToken, refreshToken);


        if(!tokenValid){
            const to_redirect = this.#getRedirectToUrl();
            this.#loginstorage.setStoreRedirectTo(to_redirect);
            
            // logout user FIXME
            /* 
                in every page refresh this code runs in a mode where the token is not valid
                or it can not get the token from localstorage, it can not even reach the dev 
                tools debuger. it stores the redirect_to with the page you want to access, 
                redirect the user to login page and seems at login page time it can validate 
                correctly the token, so token is valid then redirect the user to 'redirect_to' 
                and we explicity remove redirect_to this time when token is valid. 
                Seems to me that if we want to logout the user this should happen
                on login page where we can determine if token is really valid or not.
            */
            //let logoutRes = await this.userLogout();

            window.location.href = "./login.html";
            return true;
        } else {
            this.#loginstorage.removeItemFromStore("redirect_to");
        } 
        return false;
    }

    /*
        get current logged in user email from session.
    */
    async getCurrentUserEmailFromSession(){

        const { data } = await this.#supabase.auth.getSession()

        if(data && data.session){
            console.log("current user data ", data);
            return data.session.user.email;
        }
        return null;
    }


    /*
        login user with email and password.
        return if user login, the page to redirect the user and error if any
    */
    async loginUser(email, password){

        const {data, error} = await this.#supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if(data.user && data.session){
            // store user session info into localstorage
            this.#loginstorage.setStoreAccessToken(data.session.access_token);
            this.#loginstorage.setStoreRefreshAccessToken(data.session.refresh_token);
            this.#loginstorage.setStoreUserEmail(data.user.email);
            this.#loginstorage.setStoreUserName(data.user.user_metadata.display_name);

            //console.log("SESSION >>>> ", data.session);

            const redirect_to = this.#loginstorage.getStoreRedirectTo();

            if(redirect_to){
                // remove redirect_to after get/return it
                // so subsequent login will not redirect the user to the same page
                // if the user didnt request a private page.
                this.#loginstorage.removeItemFromStore("redirect_to");
            }

            return {
                login: true,
                redirect_to: redirect_to,
                error: null
            }
        }

        return {
            login: false,
            redirect_to: null,
            error: error.message
        }
    }

    /*
        logout the user from supabase and remove local storage items, then redirect user to index page.
        used for logout button.
    */
    async logout(){
        this.#loginstorage.removeItemFromStore("stoken");
        this.#loginstorage.removeItemFromStore("srtoken");
        this.#loginstorage.removeItemFromStore("user_name");
        this.#loginstorage.removeItemFromStore("user_email");
        const { error } = await this.#supabase.auth.signOut();
        window.location.href = "./index.html";
        return true
    }

    /*
        logout the user from supabase and remove local storage items
    */
    async userLogout(){
        //console.log("login out user...")
        this.#loginstorage.removeItemFromStore("stoken");
        this.#loginstorage.removeItemFromStore("srtoken");
        this.#loginstorage.removeItemFromStore("user_name");
        this.#loginstorage.removeItemFromStore("user_email");
        const { error } = await this.#supabase.auth.signOut();
        return true;
    }

    /*
        Send reset password email. Return error if any.
    */
    async sendResetPasswordEmail(email){
        console.log("sending reset password email for username: ", email);
  
        const { data, error } = await this.#supabase.auth.resetPasswordForEmail(email);

        if(error){
            console.log("supabase reset link error: ", error.message);
            return error.message;
        } else {
          return null;
        }
    }

    /*
        Update password for the current logged in user. Return error if any.
    */
    async updateUserPassword(email, password){
        console.log("updating password for username: ", email);
  
        // updating password for the current user logged in
        const { data, error } = await this.#supabase.auth.updateUser({
          password: password
        })
  
        if(error){
          console.log("supabase password update error: ", error.message);
          return error.message;
        } else {
          return null;
        }
    }

    /*
        Create user account. Return error if any.
    */
    async createUserAccount(firstName, lastName, email){
        console.log(`FirstName: ${firstName}, LastName: ${lastName}, Email: ${email}`);
  
        const { data, error } = await this.#supabase.auth.signUp({
          email: email,
          password: this.#generateRanString(10),
          options: {
            data: {
                display_name: `${firstName} ${lastName}`,
            }
          }
        })

        // last_name: lastName,

        if(error){
            console.log("supabase signup error: ", error.message);
            return error.message;
        } else {
            return null;
        }
    }

    getUserRolesFromToken(){
        let accessToken = this.#loginstorage.getStoreAccessToken();

        if (accessToken == undefined || accessToken == ""){
            return [];
        }

        try{

            let tparsed = JSON.parse(atob(accessToken.split('.')[1]));

            let user_roles = tparsed?.app_metadata?.user_roles;

            if (user_roles != undefined && user_roles != ""){
                let user_roles_arr = user_roles.split(',');
                return user_roles_arr.map(role => parseInt(role));
            } else{
                return []
            }

        } catch(error){
            return []
        }
    }

    _getContinueRefreshingToken(accessToken){
        if (accessToken == undefined || accessToken == ""){
            return false;
        }

        try{
            let tparsed = JSON.parse(atob(accessToken.split('.')[1]));
            let continue_refresh = tparsed?.app_metadata?.continue_refresh;

            //console.log("continue_refresh >>>> ", continue_refresh);

            if (continue_refresh != undefined && continue_refresh != ""){
                return continue_refresh;
            } else{
                return false
            }
        } catch(error){
            return false
        }
    }

    #getMaxHrRefreshingToken(accessToken){

        if (accessToken == undefined || accessToken == ""){
            return false;
        }

        try{

            let tparsed = JSON.parse(atob(accessToken.split('.')[1]));

            let max_hr_refresh = tparsed?.app_metadata?.max_hr_refresh;

            //console.log("max_hr_refresh >>>> ", max_hr_refresh);

            if (max_hr_refresh != undefined && max_hr_refresh != ""){
                return max_hr_refresh;
            } else{
                return 0
            }

        } catch(error){
            return 0
        }
    }
}

var auth = new Auth(CONFIG);

