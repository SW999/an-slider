class AnSlider {
    constructor(selector, indicators = true) {
        if (!selector) {
            console.error('Selector is empty');
            return
        }

        this.selector = selector;
        this.sliderElement = document.querySelector(selector);
        this.slider = null;
        this.slides = null;
        this.indicators = indicators;
        this.sliderId = Math.floor(Math.random() * 1000000); // generate a unique id for a slider
        this.isTouchSupported = 'ontouchstart' in window;
        this.activeSlideIndex = 0;
        this.buttons = [];
        this.init();
    }

    #debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        }
    }

    #handleScroll() {
        const pos = this.slider.getBoundingClientRect();
        const sliderWidth = this.slider.offsetWidth;
        const scrollPosition = this.slider.scrollLeft;
        const scrollWidth = this.slider.scrollWidth;

        if (pos) {
            this.buttons[this.activeSlideIndex]?.classList.remove('active');

            if (scrollPosition + sliderWidth >= scrollWidth) {
                this.activeSlideIndex = this.slides.length - 1; // Last slide
            } else if (scrollPosition <= 0) {
                this.activeSlideIndex = 0; // First slide
            } else {
                // Element id in the middle of the slider
                const elementInCenterId = document.elementsFromPoint(pos.x + pos.width / 2, pos.y + pos.height / 2)
                    .find((el) => el.classList.contains('an-slide'))?.id;

                if (elementInCenterId) {
                    const parts = elementInCenterId.split('-');
                    this.activeSlideIndex = parseInt(parts[1]);
                }
            }

            this.buttons[this.activeSlideIndex]?.classList.add('active');
        }
    }

    #addDragEvents() {
        if (this.isTouchSupported) {
            return;
        }

        // const self = this;
        // let startX = 0;
        // let startY = 0;
        // let isDown = false;
        //
        // this.slider.addEventListener('mousedown', handleMouseDown);
        // this.slider.addEventListener('mousemove', handleMouseMove);
        // this.slider.addEventListener('mouseup', handleMouseUp);
        //
        // function handleMouseDown(e) {
        //     startX = e.clientX;
        //     startY = e.clientY;
        //     isDown = true;
        // }
        //
        // function handleMouseMove(e) {
        //     if (!isDown) return;
        //
        //     const diffX = e.clientX - startX;
        //     const diffY = e.clientY - startY;
        //
        //     if (Math.abs(diffX) > Math.abs(diffY)) {
        //         if (diffX > 0) {
        //             self.slides[self.activeSlideIndex - 1]?.scrollIntoView({
        //                 behavior: 'smooth',
        //                 block: 'nearest',
        //                 inline: 'center'
        //             });
        //             console.log('Swipe right');
        //         } else {
        //             self.slides[self.activeSlideIndex + 1]?.scrollIntoView({
        //                 behavior: 'smooth',
        //                 block: 'nearest',
        //                 inline: 'center'
        //             });
        //             console.log('Swipe left');
        //         }
        //     }
        // }
        //
        // function handleMouseUp() {
        //     isDown = false;
        // }

        const self = this;
        let xDown = null;
        let yDown = null;

        function start(e) {
            xDown = e.clientX;
            yDown = e.clientY;
        }

        function swipe(e) {
            const xUp = e.clientX;
            const yUp = e.clientY;

            if (!xDown || !yDown) return;

            const xDiff = xDown - xUp;
            const yDiff = yDown - yUp;

            if (Math.abs(xDiff) > Math.abs(yDiff)) {
                // Right swipe
                if (xDiff > 0) {
                    self.slides[self.activeSlideIndex + 1]?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'center'
                    });
                }
                // Left swipe
                else {
                    self.slides[self.activeSlideIndex - 1]?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'center'
                    });
                }
            }

            xDown = null;
            yDown = null;
        }

        this.slider.addEventListener('mousedown', start);
        this.slider.addEventListener('mousemove', swipe);
    }

    #loadStyles() {
        const id = 'anSliderStyles';

        if (document.getElementById(id)) {
            return
        }

        const sliderStyles = document.createElement('style');
        sliderStyles.id = id;
        sliderStyles.textContent = '.an-slide>img,.an-slider-wrapper{max-width:100%}.an-slide,.an-slider>*{scroll-snap-align:center}.an-slider-wrapper,.an-slider-wrapper *{box-sizing:border-box}.an-slide>img{height:auto;width:100%;vertical-align:bottom;transition:opacity .3s ease-in-out;opacity:inherit;pointer-events:none;user-select:none}.an-slide{display:flex;justify-content:center;align-items:center;flex:0 0 calc(100vw - 16px)}@media (min-width:466px){.an-slide{flex:0 0 450px}}.an-slider{overflow:scroll hidden;display:flex;flex-flow:row nowrap;gap:35px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;cursor:grab}.an-slider::-webkit-scrollbar{display:none}.an-slider-buttons{margin-top:10px;display:flex;justify-content:center;gap:7px}.an-slider-button{width:15px;height:15px;border:1px solid #000;border-radius:100%}@media (hover:hover){.an-slider-button{width:10px;height:10px;cursor:pointer}.an-slider-buttons{gap:4px}}.an-slider-button.active{background-color:#000;cursor:default}';
        document.head.appendChild(sliderStyles);
    }

    init() {
        if (!this.sliderElement) {
            console.error(`Element with selector ${this.selector} not found`);
            return;
        }

        this.sliderElement.classList.add('an-slider-wrapper');
        const slides = this.sliderElement.children;

        if (slides.length < 1) {
            console.error(`Element with selector ${this.selector} has no slides`);
            return;
        }

        const slider = document.createElement('div');
        let sliderButtons;

        slider.classList.add('an-slider');

        if (this.indicators) {
            sliderButtons = document.createElement('div');
            sliderButtons.classList.add('an-slider-buttons');
        }

        Array.from(slides).forEach((slide, index) => {
            const slideWrapper = document.createElement('div');
            slideWrapper.classList.add('an-slide');
            slideWrapper.id = `slide-${index}-${this.sliderId}-id`;
            slideWrapper.appendChild(slide);
            slider.appendChild(slideWrapper);

            if (this.indicators) {
                const button = document.createElement('div');
                button.id = `slide-${index}-btn-${this.sliderId}`;
                button.className = index === 0 ? 'an-slider-button active' : 'an-slider-button';
                button.addEventListener('click', () => {
                    const slideElement = document.getElementById(`slide-${index}-${this.sliderId}-id`);
                    slideElement.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'center'});
                });
                sliderButtons.appendChild(button);
                this.buttons.push(button);
            }
        });

        this.#loadStyles();
        this.sliderElement.appendChild(slider);
        this.slider = this.sliderElement.querySelector('.an-slider');
        this.slides = this.slider.querySelectorAll('.an-slide');

        if (this.indicators) {
            this.sliderElement.appendChild(sliderButtons);
        }

        this.slider.addEventListener('scroll', this.#debounce(this.#handleScroll.bind(this), 200));
        this.#addDragEvents();
    }
}
