class ChatSessions {

    constructor(config) {

        this.API_BASE_PATH = config.APP.EDGE_API_URL;
        this.SUPA_ANON_KEY = config.APP.SUPABASE_ANON_KEY;

        this.GET_CHAT_SESSIONS_ENDPOINT = this.API_BASE_PATH + "/chat-sessions/api/getChatSessions"
        this.ASSIGN_CHAT_SESSION_ENDPOINT = this.API_BASE_PATH + "/chat-sessions/api/assignChatSession"

    }


    async #fetchChatSessionsBySearchCriteria(search_criteria){
        const loginstorage = new LoginStorage();

        const req_data = {
            access_token: loginstorage.getStoreAccessToken()
        }

        if (search_criteria != undefined && search_criteria != "") {
            req_data.search_criteria = search_criteria;
        }

        try{ 
            const response = await fetch(this.GET_CHAT_SESSIONS_ENDPOINT, {
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

    async renderChatSessionsResults(search_criteria, table_id){

        let div_table_container = document.getElementById(table_id)
        div_table_container.innerHTML = '';


        let data = await this.#fetchChatSessionsBySearchCriteria(search_criteria)

        console.log("data>>>", data)

        if (data.error) {
            return [true, data.error]
        }

        if (data.length==0) {
            return [true, "unhandled error chat sessions not found in the response"]
        }

        var table_columns = ["#", "Chat Id", "Assigned To", "Updated At", "Actions"]

        var table_el = document.createElement("table");
        table_el.classList.add("table")
        table_el.classList.add("table-striped")
        table_el.classList.add("table-hover")

        var thead_el = document.createElement("thead")
        var tbody_el = document.createElement("tbody")

        // write table header
        var tr_el = document.createElement("tr")
        table_columns.forEach(column => {
            let th_el = document.createElement("th");
            th_el.innerText = column;
            th_el.setAttribute('scope', "col")
            tr_el.appendChild(th_el)
        });
        thead_el.appendChild(tr_el)
        
        //table_el.appendChild(thead_el)

        // write table rows
        for(let i=0; i<data.length; i++){
            let row_info = data[i]

            let btr_el = document.createElement("tr")
            
            let th_row = document.createElement("th")
            th_row.innerText = i+1
            th_row.setAttribute('scope', "row")

            let td_chat_id = document.createElement("td")
            td_chat_id.innerText = row_info.chat_id

            let td_assigned = document.createElement("td")
            td_assigned.innerText = row_info.assigned

            let td_updated_at = document.createElement("td")
            // Original UTC time
            const utcDate = new Date(row_info.updated_at)
            td_updated_at.innerText = utcDate.toLocaleString();

            let td_actions = document.createElement("td")
            td_actions.classList.add("fc-table-action-column")

            let action_div_cont = document.createElement("div")
            action_div_cont.classList.add("fc-search-tab-action")


            // assign to human button
            let div_assign_h = document.createElement("div")
            let a_assign_h = document.createElement("a")
            a_assign_h.href = "#"
            a_assign_h.setAttribute("cs-id", row_info.id)
            a_assign_h.setAttribute("cs-assign-to", "HUMAN")

            a_assign_h.addEventListener("click", function(e){
                e.preventDefault();
                let chat_session_id = e.currentTarget.getAttribute("cs-id")
                let assign_to = e.currentTarget.getAttribute("cs-assign-to")
                
                assignChatSession(chat_session_id, assign_to)
            })

            

            let assign_h_icon = document.createElement("span")
            assign_h_icon.classList.add("icon-person")
            assign_h_icon.title = "assign to human"

            if (row_info.assigned == "HUMAN") {
                a_assign_h.style.pointerEvents = "none";
                a_assign_h.style.cursor = "default";
                assign_h_icon.style.color = "#808080";
            }

            a_assign_h.appendChild(assign_h_icon)
            div_assign_h.appendChild(a_assign_h)
            

            // assign to human robot
            let div_assign_r = document.createElement("div")
            let a_assign_r = document.createElement("a")
            a_assign_r.href = "#"
            a_assign_r.setAttribute("cs-id", row_info.id)
            a_assign_r.setAttribute("cs-assign-to", "BOT")

            a_assign_r.addEventListener("click", function(e){
                e.preventDefault();
                let chat_session_id = e.currentTarget.getAttribute("cs-id")
                let assign_to = e.currentTarget.getAttribute("cs-assign-to")
                
                assignChatSession(chat_session_id, assign_to)
            })

            

            let assign_r_icon = document.createElement("span")
            assign_r_icon.classList.add("icon-android")
            assign_r_icon.title = "assign to bot"

            if (row_info.assigned == "BOT") {
                a_assign_r.style.pointerEvents = "none";
                a_assign_r.style.cursor = "default";
                assign_r_icon.style.color = "#808080";
            }

            a_assign_r.appendChild(assign_r_icon)
            div_assign_r.appendChild(a_assign_r)
            

            // append buttons
            action_div_cont.appendChild(div_assign_h)
            action_div_cont.appendChild(div_assign_r)

            td_actions.appendChild(action_div_cont)


            // appending rows
            btr_el.appendChild(th_row)
            btr_el.appendChild(td_chat_id)
            btr_el.appendChild(td_assigned)
            btr_el.appendChild(td_updated_at)
            btr_el.appendChild(td_actions)

            tbody_el.appendChild(btr_el)
        }

        table_el.appendChild(thead_el)
        table_el.appendChild(tbody_el)

        div_table_container.appendChild(table_el)

        return [false, ""]
    }

    async postAssignChatSession(chat_session_id, assigned_to){
        const loginstorage = new LoginStorage();

        console.log(chat_session_id, assigned_to)

 
         const req_data = {
            chat_session_id: chat_session_id,
            assigned_to: assigned_to,
            access_token: loginstorage.getStoreAccessToken()
         }
 
         try{ 
             const response = await fetch(this.ASSIGN_CHAT_SESSION_ENDPOINT, {
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

             if (response_data.error) {
                return [true, response_data.error]
             }
     
             return [false, response_data];
 
         } catch (error){
             return [true, {error: `unhandled error: ${error.message}`}]
         }

    }
    
}