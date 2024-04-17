var abbC$ = (function () {

	var default_config = {
        maxSlices: null,
    }

	var Constructor = function (selector, data, config) {

        this.element = document.getElementById(selector);
        this.data = data;
        this.config = {
            maxSlices: (config && config.maxSlices) ? config.maxSlices : default_config.maxSlices,
        };

        if(this.element == undefined || this.element == null){
            throw new Error('No element selected for selector: ' + selector);
        }

        if(this.data == undefined || this.data == null || this.data.length == 0){
            throw new Error('No data to create carousel');
        }

        this.createCarousel();
	};

    Constructor.prototype.createCarousel = function(){

        console.log('creating carousel with data: ', this.data);

        this.element.classList.add('carousel', 'slide');
        this.element.setAttribute('data-ride', 'carousel');

        var indicators_ol = document.createElement('ol');
        indicators_ol.className = 'carousel-indicators';

        var img_elems = document.createElement('div');
        img_elems.className = 'carousel-inner';

        var activated = false;

        for(let i=0; i<this.data.length; i++){

            if(this.data[i].show === false){
                continue;
            }

            if (this.config.maxSlices != null && i >= this.config.maxSlices){
                break;
            }

            // creating indicators
            let li = document.createElement('li');
            li.setAttribute("data-target", "#"+this.element.id);
            li.setAttribute("data-slide-to", i);

            if(!activated){
                li.className = 'active';
            }

            indicators_ol.appendChild(li);

            // creating images
            let img_div = document.createElement('div');
            if(!activated){
                img_div.classList.add('carousel-item', 'active');
            } else {
                img_div.className='carousel-item';
            }

            let img = document.createElement('img');
            img.classList.add('d-block'); // , 'w-100'
            img.src = this.data[i].url;
            img.alt = this.data[i].name;

            img_div.appendChild(img);
            img_elems.appendChild(img_div);

            if(!activated){
                activated = true;
            }
        }

        this.element.appendChild(indicators_ol);
        this.element.appendChild(img_elems);
        
        // add previous elements
        prev_btn = createNavigationButtons(this.element.id, true);
        next_btn = createNavigationButtons(this.element.id, false);

        this.element.appendChild(prev_btn);
        this.element.appendChild(next_btn);
    }

    var createNavigationButtons = function(elementId, isPrevious=true){
        var sufix_nav = 'prev';
        var span_nav_text = 'Previous';

        if(isPrevious===false){
            sufix_nav = 'next';
            span_nav_text = 'Next';
        }

        var prev_btn = document.createElement('a');
        prev_btn.className = 'carousel-control-' + sufix_nav;
        prev_btn.href = "#" + elementId;
        prev_btn.role = "button";
        prev_btn.setAttribute("data-slide", sufix_nav);

        var span_prev_1 = document.createElement('span');
        span_prev_1.className = 'carousel-control-' + sufix_nav + '-icon';
        span_prev_1.setAttribute("aria-hidden", "true");

        var span_prev_2 = document.createElement('span');
        span_prev_2.className = 'sr-only';
        span_prev_2.innerText = 'Previous';

        prev_btn.appendChild(span_prev_1);
        prev_btn.appendChild(span_prev_2);

        return prev_btn;

    }

    var instantiate = function (selector, data, config) {
		return new Constructor(selector, data, config);
	};

	
	return instantiate;

})();