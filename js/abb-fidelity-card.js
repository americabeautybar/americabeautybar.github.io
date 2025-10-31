class FidelityCard {

    constructor(config) {
        
        this.FIDELITY_CARD_API_URL = config.APP.FIDELITY_API_URL;
        this.FIDELITY_CARD_EDGE_URL = config.APP.EDGE_API_URL;
        this.SUPA_ANON_KEY = config.APP.SUPABASE_ANON_KEY;
        this.MAX_FIDELITY_COUNT = 6;
        
        this.fcCard = document.getElementById('fc-card');
        this.checks = document.getElementById('fc-checks');
        this.clientName = document.getElementById('fc-client-name');
        this.cardId = document.getElementById('fc-card-id');

        this.has_max_count = false;

    }

    async renderCard(card_id){

        this.hideCard();

        var data = await this.#fetchFidelityCardData(card_id);

        if(data.error){
            return [true, data.error]
        }

        this.clientName.innerText = data.clientName;
        this.cardId.innerText = data.cardId;
        let clientFidelityCount = data.fidelityCount;

        this.checks.innerHTML = '';

        // add heart
        for (let i=1; i<=6; i++){

            const checkNode = document.createElement("div");
            checkNode.className = "fc-check";
            checkNode.innerHTML  = i;
            
            if(i<=clientFidelityCount){
                checkNode.className += " fc-check-heart";
                checkNode.innerHTML = "";
            }

            this.checks.appendChild(checkNode);
        }
        
        //this.fcCard.classList.remove("fc-hidden-card")
        this.showCard();

        if (clientFidelityCount == this.MAX_FIDELITY_COUNT){
            this.has_max_count = true;
            //showSuccess("El servicio gratuito ya fue aplicado, muchas gracias!")
            return [false, "El servicio gratuito ya fue aplicado, muchas gracias"]
        }

        return [false, ""]
    }

    async #fetchFidelityCardData(card_id){
        var fidelity_data = await $.getJSON(`${this.FIDELITY_CARD_API_URL}?card_id=${card_id}`, function (data) { 
            return data;
        }).fail(function(jqXHR, textStatus, errorThrown) { 
            return {error: textStatus}
        });

        return fidelity_data;
    }

    hideCard(){
        this.fcCard.classList.add("fc-hidden-card");
    }

    showCard(){
        this.fcCard.classList.remove("fc-hidden-card");
    }

    /*
        Execute Edge Function to CheckIn Fidelity Card With Token
    */
    async checkInFidelityCardWithToken(card_id, token, captcha){
        
        const checkInFidelityCardWithTokenEndPoint = `${this.FIDELITY_CARD_EDGE_URL}/fidelity-card-api/checkin-with-token`

        const req_data = {
            cardId: card_id,
            token: token,
            captcha: captcha
        }

        try{ 
            const response = await fetch(checkInFidelityCardWithTokenEndPoint, {
                method: "POST",
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.SUPA_ANON_KEY}`
                },
                body: JSON.stringify(req_data)
            });

            const response_data = await response.json();
    
            return [response_data, response.status];

        } catch (error){
            return [{error: `unhandled error: ${error.message}`}, 500]
        }
    }
    

    /*
        Execute Edge Function to Search Fidelity Card With Token
    */
    async searchFidelityCardWithToken(phone, token, captcha){
    
        const searchFidelityCardWithTokenEndPoint = `${this.FIDELITY_CARD_EDGE_URL}/fidelity-card-api/search-with-token`

        const req_data = {
            phone: phone,
            token: token,
            captcha: captcha
        }

        try{ 
            const response = await fetch(searchFidelityCardWithTokenEndPoint, {
                method: "POST",
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.SUPA_ANON_KEY}`
                },
                body: JSON.stringify(req_data)
            });

            
            const response_data = await response.json();

            return [response_data, response.status];

        } catch (error){
            return [{error: `unhandled error: ${error.message}`}, 500]
        }
    }

    /*
        Execute Edge Function to get a Token base on a PIN
    */
    async getTokenWithPIN(pin){
    
        const tokenFidelityCardEndPoint = `${this.FIDELITY_CARD_EDGE_URL}/fidelity-card-api/token-with-pin`

        const req_data = {
            pin: pin
        }

        try{ 
            const response = await fetch(tokenFidelityCardEndPoint, {
                method: "POST",
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
    
    /*
        Execute Edge Function to CheckIn Fidelity Card
    */
    async checkInFidelityCard(card_id){
       const loginstorage = new LoginStorage();

       const checkInFidelityCardEndPoint = `${this.FIDELITY_CARD_EDGE_URL}/mark-fidelity-card`

        const req_data = {
            cardId: card_id,
            checkInNumber: "1",
            access_token: loginstorage.getStoreAccessToken()
        }

        try{ 
            const response = await fetch(checkInFidelityCardEndPoint, {
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
        Execute Edge Function to create Fidelity Card
    */
    async createFidelityCard(clientName, clientPhone){
        const loginstorage = new LoginStorage();
    
        const createFidelityCardEndPoint = `${this.FIDELITY_CARD_EDGE_URL}/create-fidelity-card`
    
        const req_data = {
            client_name: clientName,
            client_phone_number: clientPhone,
            fidelity_count: "1",
            access_token: loginstorage.getStoreAccessToken()
            }
    
            try{ 
                const response = await fetch(createFidelityCardEndPoint, {
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

    async #fetchFidelityCardsBySearchCriteria(search_criteria){
        const loginstorage = new LoginStorage();

        const searchFidelityCardEndPoint = `${this.FIDELITY_CARD_EDGE_URL}/search-fidelity-card`

        const req_data = {
            search_criteria: search_criteria,
            access_token: loginstorage.getStoreAccessToken()
        }

        try{ 
            const response = await fetch(searchFidelityCardEndPoint, {
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

    async renderFidelityCardsSearchResults(search_criteria, table_id){

        let div_table_container = document.getElementById(table_id)
        div_table_container.innerHTML = '';


        let data = await this.#fetchFidelityCardsBySearchCriteria(search_criteria)

        console.log("data>>>", data)

        if(data.error){
            return [true, data.error]
        }

        if(data.cards == undefined){
            return [true, "unhandled error cards were not found in the response"]
        }

        if(data.cards.length==0){
            return [true, "unhandled error cards is empty in the response"]
        }

        var table_columns = ["#", "Nombre", "Telefono", "Visitas", "Acciones"]

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
        for(let i=0; i<data.cards.length; i++){
            let card_info = data.cards[i]

            let btr_el = document.createElement("tr")
            
            let th_row = document.createElement("th")
            th_row.innerText = i+1
            th_row.setAttribute('scope', "row")

            let td_name = document.createElement("td")
            td_name.innerText = card_info.clientName

            let td_phone = document.createElement("td")
            td_phone.innerText = card_info.phone_number

            let td_visits = document.createElement("td")
            td_visits.innerText = card_info.fidelityCount

            let td_actions = document.createElement("td")
            td_actions.classList.add("fc-table-action-column")

            let action_div_cont = document.createElement("div")
            action_div_cont.classList.add("fc-search-tab-action")

            // see card button
            let div_see = document.createElement("div")
            let a_see = document.createElement("a")
            a_see.href = "./fidelity.html?code=" + card_info.cardId;
            a_see.target = "_self";
            let see_icon = document.createElement("span")
            see_icon.classList.add("icon-eye")
            see_icon.title = "ver tarjeta"

            a_see.appendChild(see_icon)
            div_see.appendChild(a_see)

            // qr card button
            let div_qr = document.createElement("div")
            let a_qr = document.createElement("a")
            a_qr.href = "#"
            a_qr.setAttribute("fc-id", card_info.cardId)
            a_qr.setAttribute("fc-name", card_info.clientName)

            a_qr.addEventListener("click", function(e){
                e.preventDefault();
                let cardId = e.currentTarget.getAttribute("fc-id")
                let cardClientName = e.currentTarget.getAttribute("fc-name")
                
                let qr_modal_el = document.getElementById("qrcode")
                qr_modal_el.innerHTML = ""

                //alert(e.currentTarget.getAttribute("fc-id"))

                let qrcode = new QRCode(qr_modal_el, {
                    text: `${CONFIG.APP.BASE_URL}fidelity.html?code=${cardId}`,
                    width: 128,
                    height: 128,
                    colorDark : "#000000",
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.H
                });

                let modalText = document.getElementById("fc-notification-modal-body")
                modalText.innerText = cardClientName

                $("#fc-notification-modal").modal('show');
            })

            let qr_icon = document.createElement("span")
            qr_icon.classList.add("icon-qrcode")
            qr_icon.title = "QR tarjeta"

            a_qr.appendChild(qr_icon)
            div_qr.appendChild(a_qr)
            
            // check-in card button
            let div_checkin = document.createElement("div")
            let a_checkin = document.createElement("a")
            a_checkin.href = "./fidelity-checkin.html?code=" + card_info.cardId;
            a_checkin.target = "_self";
            let checkin_icon = document.createElement("span")
            checkin_icon.classList.add("icon-check")
            checkin_icon.title = "check-in tarjeta"

            a_checkin.appendChild(checkin_icon)
            div_checkin.appendChild(a_checkin)

            // append buttons
            action_div_cont.appendChild(div_see)
            action_div_cont.appendChild(div_qr)
            action_div_cont.appendChild(div_checkin)

            td_actions.appendChild(action_div_cont)

            btr_el.appendChild(th_row)
            btr_el.appendChild(td_name)
            btr_el.appendChild(td_phone)
            btr_el.appendChild(td_visits)
            btr_el.appendChild(td_actions)

            tbody_el.appendChild(btr_el)


        }

        table_el.appendChild(thead_el)
        table_el.appendChild(tbody_el)

        div_table_container.appendChild(table_el)

        return [false, ""]
    }

    
}