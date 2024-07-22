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
}