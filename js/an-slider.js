class AnSlider {
    constructor({selector, indicators = true, arrows = false}) {
        if (!selector) {
            console.error('Selector is empty');
            return
        }

        this.selector = selector;
        this.sliderElement = document.querySelector(selector);
        this.slider = null;
        this.slides = null;
        this.indicators = indicators;
        this.arrows = arrows;
        this.leftArrow = null;
        this.rightArrow = null;
        this.sliderId = Date.now();
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

            if (this.arrows) {
                this.leftArrow?.classList.toggle('an-slider-hidden', this.activeSlideIndex === 0);
                this.rightArrow?.classList.toggle('an-slider-hidden', this.activeSlideIndex === this.slides.length - 1);
            }
        }
    }

    #addDragEvents() {
        if (this.isTouchSupported) {
            return;
        }

        const self = this;
        let xDown = null;
        let yDown = null;
        let isDragging = false;

        function start(e) {
            if (e.button === 0) { // Only respond to left mouse button
                xDown = e.clientX;
                yDown = e.clientY;
                isDragging = true;
            }
        }

        function swipe(e) {
            if (isDragging && Math.abs(e.clientX - xDown) > 5) {
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
        }

        function end() {
            isDragging = false;
            xDown = null;
            yDown = null;
        }

        this.slider.addEventListener('mousedown', start);
        this.slider.addEventListener('mousemove', swipe);
        this.slider.addEventListener('mouseup', end);
    }

    #loadStyles() {
        const id = 'anSliderStyles';

        if (document.getElementById(id)) {
            return
        }

        const sliderStyles = document.createElement('style');
        sliderStyles.id = id;
        sliderStyles.textContent = `
.an-slide > img,
.an-slider-wrapper {
  max-width: 100%
}
.an-slide,
.an-slider > * {
  scroll-snap-align: center
}
.an-slider-wrapper,
.an-slider-wrapper * {
  box-sizing: border-box
}
.an-slider-with-arrows{
position:relative
}
.an-slider-hidden{
display:none
}
.an-slide > img {
  height: auto;
  width: 100%;
  vertical-align: bottom;
  transition: opacity 0.3s ease-in-out;
  opacity: inherit;
  pointer-events: none;
  user-select: none
}
.an-slide {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 0 0 calc(100vw - 16px)
}
@media (min-width: 466px) {
  .an-slide {
    flex: 0 0 450px
  }
}
.an-slider {
  overflow: scroll hidden;
  display: flex;
  flex-flow: row nowrap;
  gap: 35px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  cursor: grab
}
.an-slider::-webkit-scrollbar {
  display: none
}
.an-slider-buttons {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  gap: 7px
}
.an-slider-button {
  width: 15px;
  height: 15px;
  border: 1px solid #000;
  border-radius: 100%
}
@media (hover: hover) {
  .an-slider-button {
    width: 10px;
    height: 10px;
    cursor: pointer
  }
  .an-slider-buttons {
    gap: 4px
  }
}
.an-slider-button.active {
  background-color: #000;
  cursor: default
}
.an-slider-left-arrow{
left: 10px;
background-image: url('data:image/svg+xml,<svg width="143" height="330" xmlns="http://www.w3.org/2000/svg" xml:space="preserve"><path stroke="null" d="M3.213 155.996 115.709 6c4.972-6.628 14.372-7.97 21-3 6.627 4.97 7.97 14.373 3 21L33.962 164.997 139.709 306c4.97 6.627 3.626 16.03-3 21a14.929 14.929 0 0 1-8.988 3c-4.56 0-9.065-2.071-12.012-6L3.213 173.996a15 15 0 0 1 0-18z"/></svg>')
}
.an-slider-right-arrow{
right: 10px;
background-image: url('data:image/svg+xml,<svg width="143" height="330" xmlns="http://www.w3.org/2000/svg" xml:space="preserve"><path d="M140.001 155.997 27.501 6c-4.972-6.628-14.372-7.97-21-3s-7.97 14.373-3 21l105.75 140.997L3.501 306c-4.97 6.627-3.627 16.03 3 21a14.93 14.93 0 0 0 8.988 3c4.561 0 9.065-2.071 12.012-6l112.5-150.004a15 15 0 0 0 0-18z"/></svg>')
}
.an-slider-left-arrow,
.an-slider-right-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-size: contain;
  background-repeat: no-repeat;
  width: 14px;
  height: 32px;
  cursor: pointer
}
`;
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

        if (this.arrows) {
            this.leftArrow = document.createElement('div');
            this.leftArrow.classList.add('an-slider-left-arrow', 'an-slider-hidden');
            this.leftArrow.addEventListener('click', () => {
                this.slides[this.activeSlideIndex - 1]?.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'center'});
            });

            this.rightArrow = document.createElement('div');
            this.rightArrow.classList.add('an-slider-right-arrow');
            this.rightArrow.addEventListener('click', () => {
                this.slides[this.activeSlideIndex + 1]?.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'center'});
            });

            this.sliderElement.classList.add('an-slider-with-arrows');
            slider.appendChild(this.leftArrow);
            slider.appendChild(this.rightArrow);
        }

        Array.from(slides).forEach((slide, index) => {
            const slideWrapper = document.createElement('div');
            slideWrapper.classList.add('an-slide');
            slideWrapper.id = `slide-${index}-${this.sliderId}`;
            slideWrapper.appendChild(slide);
            slider.appendChild(slideWrapper);

            if (this.indicators) {
                const button = document.createElement('div');
                button.id = `slide-${index}-btn-${this.sliderId}`;
                button.className = index === 0 ? 'an-slider-button active' : 'an-slider-button';
                button.addEventListener('click', () => {
                    const slideElement = document.getElementById(`slide-${index}-${this.sliderId}`);
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
