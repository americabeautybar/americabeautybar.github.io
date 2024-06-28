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
}

var utils = new Utils();
