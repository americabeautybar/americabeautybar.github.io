class Utils {
    constructor() {
    }

    showMessage(msg, is_error, elementId){
        if(is_error){
            this.showError(msg, elementId);
        } else {
            this.showSuccess(msg, elementId);
        }
    }
    
    hideMessages(){
        this.hideError();
        this.hideSuccess();
    }
    
    showError(msg, elementId){
        const el_id = elementId || "error";
        const el = $("#" + el_id);
        if(el){
            el.html(`${msg}`);
            el.show();
        }
    }
    
    hideError(elementId){
        const el_id = elementId || "error";
        const el = $("#" + el_id);
        if(el){
            el.html("");
            el.hide();
        }
    }
    
    showSuccess(msg, elementId){
        const el_id = elementId || "success";
        const el = $("#" + el_id);
        if(el){
            el.html(`${msg}`);
            el.show();
        }
    }
    
    hideSuccess(elementId){
        const el_id = elementId || "success";
        const el = $("#" + el_id);
        if(el){
            el.html("");
            el.hide();
        }
    }

    setModalErrorText(txtMsg, modalId=""){
        let parentSelector = "#fc-notification-modal" // default notification modal
        if(modalId != ""){
            parentSelector = "#" + modalId
        }
        $(parentSelector + " #fc-notification-modal-body").text(txtMsg);
        $(parentSelector + " #fc-notification-modal-icon").attr("src","images/cross-mark.png");
    }

    setModalSuccessText(txtMsg, modalId=""){
        let parentSelector = "#fc-notification-modal" // default notification modal
        if(modalId != ""){
            parentSelector = "#" + modalId
        }
        $(parentSelector + " #fc-notification-modal-body").text(txtMsg);
        $(parentSelector + " #fc-notification-modal-icon").attr("src","images/check-mark.png");
    }

    showModal(modalId=""){
        let modalSelector = "#fc-notification-modal"
        if(modalId != ""){
            modalSelector = "#" + modalId
        }
        $(modalSelector).modal('show');
    }
}

var utils = new Utils();
