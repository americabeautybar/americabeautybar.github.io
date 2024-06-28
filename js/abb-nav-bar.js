/*

<li class="nav-item dropdown abb-dropdown-submenu-item">
					<a class="nav-link abb-dropdown-toggle" id="navbarDropdown" role="button">Dropdown
					</a>
					<div class="dropdown-menu" aria-labelledby="navbarDropdown" style="top:60px;" id="fidelity-sub-menu">
					  <a class="dropdown-item" href="#">Action</a>
					  <a class="dropdown-item" href="#">Another action</a>
					  <div class="dropdown-divider"></div>
					  <a class="dropdown-item" href="#">Something else here</a>
					</div>
					
				  </li>



*/
var nav_bar_data = [
        {
            name: 'Home',
            url: 'index.html',
            show: true,
            protected: false
        },
        {
            name: 'Servicios',
            url: 'services.html',
            show: true,
            protected: false
        },
        {
            name: 'Portafolios',
            url: 'work.html',
            show: true,
            protected: false
        },
        {
            name: 'Blog',
            url: 'blog.html',
            show: true,
            protected: false
        },
        {
            name: 'Contacto',
            url: 'contact.html',
            show: true,
            protected: false
        },
        {
            name: 'Fidelity',
            url: null,
            show: false,
            protected: true,
            is_submenu: true,
            submenu_id: "navbarDropdown",
            submenu_item_id: "fidelity-sub-menu",
            submenu_items: [
                {
                    name: 'Fidelity CheckIn',
                    url: 'fidelity-checkin.html',
                    show: true,
                }
            ]
        }
    ]


function buildNavBar(menuId, activePage){

    let menu_el = document.getElementById(menuId);

    const loginStorage = new LoginStorage();

    const access_token = loginStorage.getStoreAccessToken();
    let has_access_token = false;

    if(access_token != undefined && access_token != ""){
        has_access_token = true;
    }

    for(let i=0; i<nav_bar_data.length; i++){

        if(nav_bar_data[i].show === false){
            continue;
        }

        if(nav_bar_data[i].protected === true && has_access_token === false){
            continue;
        }

        let li_el = document.createElement("li");

        if(nav_bar_data[i].is_submenu == true){
            
            li_el.classList.add('nav-item', 'dropdown', 'abb-dropdown-submenu-ite');

            let a_el = document.createElement("a");

            if(activePage && nav_bar_data[i].name == activePage){
                li_el.classList.add('active');
            }

            a_el.classList.add('nav-link','abb-dropdown-toggle');
            a_el.id = nav_bar_data[i].submenu_id
            a_el.role = "button"
            a_el.text = nav_bar_data[i].name;
            a_el.setAttribute('data-toggle','dropdown');

            let div_el = document.createElement('div');
            div_el.classList.add('dropdown-menu');
            div_el.setAttribute('aria-labelledby', nav_bar_data[i].submenu_id);
            div_el.style.top = "60px";
            div_el.id = nav_bar_data[i].submenu_item_id;

            for(let j=0; j<nav_bar_data[i].submenu_items.length; j++){

                if(nav_bar_data[i].submenu_items[j].show === false){
                    continue;
                }

                let a_el_item = document.createElement("a");
                a_el_item.href = nav_bar_data[i].submenu_items[j].url;
                a_el_item.className = "dropdown-item";
                a_el_item.text = nav_bar_data[i].submenu_items[j].name;

                div_el.appendChild(a_el_item);
            }

            li_el.appendChild(a_el);
            li_el.appendChild(div_el);
        }
        else {
            
            if(activePage && nav_bar_data[i].name == activePage){
                li_el.classList.add('nav-item', 'active');
            } else {
                li_el.className = "nav-item";
            }
        
            let a_el = document.createElement("a");
            a_el.href = nav_bar_data[i].url;
            a_el.className = "nav-link";
            a_el.text = nav_bar_data[i].name;

            li_el.appendChild(a_el);
        }

        menu_el.appendChild(li_el);
    }
}

function loadLoginNav(){
    let login_nav = document.getElementById("login-menu");

    if(login_nav == null || login_nav == undefined){
        return;
    }

    const loginStorage = new LoginStorage();

    const access_token = loginStorage.getStoreAccessToken();
    const user_name = loginStorage.getStoreUserName();
    
    let has_access_token = false;
    let has_user_name = false;
    
    if(access_token != undefined && access_token != ""){
            has_access_token = true;
    }
    
    if(user_name != undefined && user_name != ""){
        has_user_name = true;
    }
    
    if(has_access_token){
        let li_el = document.createElement("li");
        let a_el = document.createElement("a");
        a_el.href = "#"
        a_el.text = "Logout";
        a_el.addEventListener("click", function(e){
            e.preventDefault();
            auth.logout();
        })
        li_el.appendChild(a_el);
        login_nav.appendChild(li_el);
    } else {
        let li_el = document.createElement("li");
        let a_el = document.createElement("a");
        a_el.href = "login.html"
        a_el.text = "Login";
        a_el.target = "_self";
        li_el.appendChild(a_el);
        login_nav.appendChild(li_el);
    }
    
    if(has_user_name){
        let li_el_sep = document.createElement("li");
        let sep_text = document.createTextNode('|');
        li_el_sep.appendChild(sep_text);
        let li_el = document.createElement("li")
        let name_text = document.createTextNode("Hola, " + user_name);
        li_el.appendChild(name_text);

        login_nav.appendChild(li_el_sep);
        login_nav.appendChild(li_el);
    }
}
