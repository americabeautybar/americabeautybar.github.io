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

    constructor() {
        const SUPABASE_URL = 'https://qeggtkpneycwsvszhuyu.supabase.co'
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlZ2d0a3BuZXljd3N2c3podXl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUyMjE5MjcsImV4cCI6MjAzMDc5NzkyN30.nmw2M42yDOgBaoD9jHhizWs06d27qbu8-aGYcO1b_V8'

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
    */
    async validateAccessToken(user_jwt){

        if(user_jwt == null || user_jwt == undefined){
          return false;
        }
    
        const {data, error} = await this.#supabase.auth.getUser(user_jwt)
    
        if(data === undefined || error){
            return false;
        }
    
        return true;
    }

    /*
        Redirect user to index page if token is still valid.
        Used for login page
    */
    async redirectToIndexIfTokenStillValid(){
        
        let accessToken = this.#loginstorage.getStoreAccessToken();
    
        const tokenValid = await this.validateAccessToken(accessToken);
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
        // TODO: maybe change the name to CheckPagePermission

        let accessToken = this.#loginstorage.getStoreAccessToken()
    
        const tokenValid = await this.validateAccessToken(accessToken);
    
        if(!tokenValid){
            const to_redirect = this.#getRedirectToUrl();
            this.#loginstorage.setStoreRedirectTo(to_redirect);
            window.location.href = "./login.html";
            return true;
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
            this.#loginstorage.setStoreUserEmail(data.user.email);
            this.#loginstorage.setStoreUserName(data.user.user_metadata.display_name);

            const redirect_to = this.#loginstorage.getStoreRedirectTo();

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
        logout the user from supabase and remove local storage items
    */
    async logout(){
        this.#loginstorage.removeItemFromStore("stoken");
        this.#loginstorage.removeItemFromStore("user_name");
        this.#loginstorage.removeItemFromStore("user_email");
        const { error } = await this.#supabase.auth.signOut();
        window.location.href = "./index.html";
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

}

var auth = new Auth();

