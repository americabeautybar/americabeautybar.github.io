class AbbSurvey {

    constructor(config) {
        
        this.EDGE_API_URL = config.APP.EDGE_API_URL;
        this.SUPA_ANON_KEY = config.APP.SUPABASE_ANON_KEY;

        this.days_until_expire = 5;

        this.survey_url = `${config.APP.BASE_URL}survey.html`

        this.survComponent = document.getElementById('abb-survey-component');
        this.survLinkContent = document.getElementById('surv-link-content');
        this.survViewDiv = document.getElementById('surv-view-div');
        this.survCopyDiv = document.getElementById('surv-copy-div');

        this.current_survey_code = null;

    }

    async renderSurveyLink(survey_code){

        this.hideSurveyLinkComponent();

        // clean up existent buttons
        this.survViewDiv.innerHTML = ''
        this.survCopyDiv.innerHTML = ''

        // write survey link generated

        this.survLinkContent.innerText = `${this.survey_url}?code=${survey_code}`

        // view button
        const sur_view_a = document.createElement("a");
        sur_view_a.href = "#";
        sur_view_a.target = "_blank";
        sur_view_a.classList.add("surv-view");

        sur_view_a.addEventListener("click", function(e){
            e.preventDefault();
            const survey_page_url = document.getElementById('surv-link-content');

            let params = survey_page_url.innerText.split('?')[1];
            let to_redirect = params != undefined ? `./survey.html?${params}` : './survey.html'
            window.location.href = to_redirect;
            return true;
        })
        
        const sur_view_icon = document.createElement("span");
        sur_view_icon.classList.add("icon-eye")
        sur_view_icon.style.display="block";
        sur_view_icon.style.fontSize="20px";
        sur_view_icon.style.color="#fa5bdd"

        sur_view_a.appendChild(sur_view_icon);

        // copy button
        const sur_copy_a = document.createElement("a");
        sur_copy_a.href = "#";
        sur_copy_a.target = "_blank";
        sur_copy_a.classList.add("surv-view");
        

        sur_copy_a.addEventListener("click", function(e){
            e.preventDefault();
            const survey_page_url = document.getElementById('surv-link-content');
            //alert(survey_page_url.innerText);
            navigator.clipboard.writeText(survey_page_url.innerText);

            let copy_span = document.getElementById("copy-feedback-notification");
            copy_span.style.visibility="visible";

            setTimeout(() => {
                let copy_span = document.getElementById("copy-feedback-notification");
                copy_span.style.visibility="hidden";
            }, 3000);
        })
        
        const sur_copy_icon = document.createElement("span");
        sur_copy_icon.classList.add("icon-copy")
        sur_copy_icon.style.display="block";
        sur_copy_icon.style.fontSize="20px";
        sur_copy_icon.style.color="#fa5bdd"

        sur_copy_a.appendChild(sur_copy_icon);

        
        this.survViewDiv.appendChild(sur_view_a);
        this.survCopyDiv.appendChild(sur_copy_a);

        this.showSurveyLinkComponent();
       
        return [false, ""]
    }

    
    hideSurveyLinkComponent(){
        this.survComponent.style.display='none';
    }

    showSurveyLinkComponent(){
        this.survComponent.style.display='block';
    }

    /*
        Execute Edge Function to create a survey link
    */
    async createSurveyLink(){
       const loginstorage = new LoginStorage();

       const createSurveyEndPoint = `${this.EDGE_API_URL}/survey`

       let date_now = new Date();
       let date_to_expire = new Date();
       date_to_expire.setDate(date_now.getDate() + this.days_until_expire)

        const req_data = {
            expiration_date: date_to_expire.toISOString(),
            access_token: loginstorage.getStoreAccessToken()
        }

        try{ 
            const response = await fetch(createSurveyEndPoint, {
                method: "POST",
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                 'Authorization': `Bearer ${this.SUPA_ANON_KEY}`
                },
                body: JSON.stringify(req_data)
            });

            if(response.status == 401){
                console.log('invalid token');
                const is_redirect = await auth.redirecToLoginIfTokenIsNotValid();
            }
        
            const response_data = await response.json();
    
            return response_data;

        } catch (error){
            return {error: `unhandled error: ${error.message}`}
        }
    }

    /*
        Execute Edge Function to retrieve the survey
    */
    async getSurveyData(code){
    
        const getSurveyEndPoint = `${this.EDGE_API_URL}/get-survey`
    
        const req_data = {
            survey_code: code
        }
    
        try{ 
            const response = await fetch(getSurveyEndPoint, {
                method: "POST",
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.SUPA_ANON_KEY}`
                },
                body: JSON.stringify(req_data)
            });

            const response_data = await response.json();

            this.current_survey_code = code;

            return response_data;

        } catch (error){
            return {error: `unhandled error: ${error.message}`}
        }
    }

    /*
        Execute Edge Function to update the survey
    */
    async saveSurveyAnswers(answers){

        const getSurveyEndPoint = `${this.EDGE_API_URL}/survey`
    
        const req_data = {
            code: this.current_survey_code,
            answers: answers
        }
    
        try{ 
            const response = await fetch(getSurveyEndPoint, {
                method: "PATCH",
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.SUPA_ANON_KEY}`
                },
                body: JSON.stringify(req_data)
            });

        const response_data = await response.json();

        return response_data;

        } catch (error){
            return {error: `unhandled error: ${error.message}`}
        }
    }
}