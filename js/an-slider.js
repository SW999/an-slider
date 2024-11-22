class AnSlider {
  constructor({ selector, indicators = true, arrows = false, initialIndex = 0, leftArrow, rightArrow, buttonColor, arrowColor }) {
    if (!selector) {
      console.error('Selector is empty')
      return
    }

    this.selector = selector
    this.sliderElement = document.querySelector(selector)
    this.slider = null
    this.slides = null
    this.indicators = indicators
    this.arrows = arrows
    this.buttonColor = buttonColor
    this.arrowColor = arrowColor
    this.leftArrow = null
    this.rightArrow = null
    this.leftArrowCode =
      leftArrow ||
      '<svg viewBox="0 0 143 330" xml:space="preserve"><path stroke="null" d="M3.213 155.996 115.709 6c4.972-6.628 14.372-7.97 21-3 6.627 4.97 7.97 14.373 3 21L33.962 164.997 139.709 306c4.97 6.627 3.626 16.03-3 21a14.929 14.929 0 0 1-8.988 3c-4.56 0-9.065-2.071-12.012-6L3.213 173.996a15 15 0 0 1 0-18z"/></svg>'
    this.rightArrowCode =
      rightArrow ||
      '<svg viewBox="0 0 143 330" xml:space="preserve"><path d="M140.001 155.997 27.501 6c-4.972-6.628-14.372-7.97-21-3s-7.97 14.373-3 21l105.75 140.997L3.501 306c-4.97 6.627-3.627 16.03 3 21a14.93 14.93 0 0 0 8.988 3c4.561 0 9.065-2.071 12.012-6l112.5-150.004a15 15 0 0 0 0-18z"/></svg>'
    this.sliderId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`
    this.isTouchSupported = 'ontouchstart' in window
    this.activeSlideIndex = initialIndex && !isNaN(Number(initialIndex)) ? initialIndex : 0
    this.buttons = []
    this.#init()
  }

  #debounce(func, delay) {
    let timeoutId
    return function (...args) {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func(...args), delay)
    }
  }

  #handleScroll() {
    const pos = this.slider.getBoundingClientRect()
    const sliderWidth = this.slider.offsetWidth
    const scrollPosition = this.slider.scrollLeft
    const scrollWidth = this.slider.scrollWidth

    if (pos) {
      this.buttons[this.activeSlideIndex]?.classList.remove('active')

      if (scrollPosition + sliderWidth >= scrollWidth) {
        this.activeSlideIndex = this.slides.length - 1 // Last slide
      } else if (scrollPosition <= 0) {
        this.activeSlideIndex = 0 // First slide
      } else {
        // Element id in the middle of the slider
        const elementInCenterId = document.elementsFromPoint(pos.x + pos.width / 2, pos.y + pos.height / 2).find(el => el.classList.contains('anSlide'))?.id

        if (elementInCenterId) {
          const parts = elementInCenterId.split('-')
          this.activeSlideIndex = parseInt(parts[1])
        }
      }

      this.buttons[this.activeSlideIndex]?.classList.add('active')

      if (this.arrows) {
        this.leftArrow.classList.toggle('anSlider-hidden', this.activeSlideIndex === 0)
        this.rightArrow.classList.toggle('anSlider-hidden', this.activeSlideIndex === this.slides.length - 1)

        this.leftArrow.ariaHidden = String(this.activeSlideIndex === 0)
        this.rightArrow.ariaHidden = String(this.activeSlideIndex === this.slides.length - 1)
      }
    }
  }

  #addDragEvents() {
    if (this.isTouchSupported) return

    const self = this
    let xDown = null
    let yDown = null
    let isDragging = false

    function start(e) {
      if (e.button === 0) {
        // Only respond to left mouse button
        xDown = e.clientX
        yDown = e.clientY
        isDragging = true
      }
    }

    function swipe(e) {
      if (isDragging && Math.abs(e.clientX - xDown) > 5) {
        const xUp = e.clientX
        const yUp = e.clientY

        if (!xDown || !yDown) return

        const xDiff = xDown - xUp
        const yDiff = yDown - yUp

        if (Math.abs(xDiff) > Math.abs(yDiff)) {
          // Right swipe
          if (xDiff > 0) {
            self.goTo(self.activeSlideIndex + 1)
          }
          // Left swipe
          else {
            self.goTo(self.activeSlideIndex - 1)
          }
        }

        xDown = null
        yDown = null
      }
    }

    function end() {
      isDragging = false
      xDown = null
      yDown = null
    }

    this.slider.addEventListener('mousedown', start)
    this.slider.addEventListener('mousemove', swipe)
    this.slider.addEventListener('mouseup', end)
  }

  #loadStyles() {
    const id = 'anSliderStyles'

    if (document.getElementById(id)) return

    const sliderStyles = document.createElement('style')
    sliderStyles.id = id
    sliderStyles.textContent = `
.anSlider-wrapper,
.anSlider-wrapper * {
  box-sizing: border-box
}
.anSlide > img,
.anSlider-wrapper {
  max-width: 100%
}
.anSlider-wrapper {
  --button-color: #000;
  --arrow-color: #000;
}
.anSlide,
.anSlider > * {
  scroll-snap-align: center
}
.anSlider-with-arrows {
  position: relative
}
.anSlider-hidden {
  display:none
}
.anSlide > img {
  height: auto;
  width: 100%;
  vertical-align: bottom;
  transition: opacity 0.3s ease-in-out;
  opacity: inherit;
  pointer-events: none;
  user-select: none
}
.anSlide {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 0 0 calc(100vw - 16px);
  visibility: visible;
  transition: opacity 0.3s ease-in-out
}
@media (min-width: 466px) {
  .anSlide {
    flex: 0 0 450px
  }
}
.anSlider {
  overflow: scroll hidden;
  display: flex;
  flex-flow: row nowrap;
  gap: 35px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  cursor: grab;
  visibility: hidden
}
.anSlider::-webkit-scrollbar {
  display: none
}
.anSlider-buttons {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  gap: 7px
}
.anSlider-button {
  width: 15px;
  height: 15px;
  border: 1px solid var(--button-color, #000);
  border-radius: 100%;
  transform: scale(1);
  transition: transform 0.3s ease-out, background-color 0.3s ease-out
}
.anSlider-button.active {
  margin: 0 2px ;
  background-color: var(--button-color, #000);
  cursor: default;
  pointer-events: none;
  transform: scale(1.5);
  transition: transform 0.3s ease-in, background-color 0.3s ease-in
}
@media (hover: hover) {
  .anSlider-button {
    width: 10px;
    height: 10px;
    cursor: pointer
  }
  .anSlider-buttons {
    gap: 4px
  }
  .anSlider:hover > :not(:hover) {
    opacity: 0.5
  }
  .anSlider-left-arrow:hover,
  .anSlider-right-arrow:hover {
    svg {
      transform: scale(1.2)
    }
  }
}
.anSlider-left-arrow {
  left: 0
}
.anSlider-right-arrow {
  right: 0
}
.anSlider-left-arrow,
.anSlider-right-arrow {
  position: absolute;
  top: 50%;
  width: 34px;
  height: 42px;
  padding: 5px 10px;
  cursor: pointer;
  transform: translateY(-50%);
  svg {
    transition: transform 0.3s ease-in
  }
  svg path {
      fill: var(--arrow-color, #000)
  }
}
`
    document.head.appendChild(sliderStyles)
  }

  #createButton(index, sliderButtons) {
    const button = document.createElement('div')
    button.id = `slide-${index}-btn-${this.sliderId}`
    button.className = index === this.activeSlideIndex ? 'anSlider-button active' : 'anSlider-button'
    button.ariaCurrent = String(index === this.activeSlideIndex)
    button.ariaLabel = `Go to slide ${index + 1}`
    button.addEventListener('click', () => this.goTo(index))
    sliderButtons.appendChild(button)
    this.buttons.push(button)
  }

  #createArrows() {
    this.leftArrow = document.createElement('div')
    this.leftArrow.classList.add('anSlider-left-arrow', 'anSlider-hidden')
    this.leftArrow.ariaHidden = 'true'
    this.leftArrow.ariaLabel = 'Back'
    this.leftArrow.innerHTML = this.leftArrowCode
    this.leftArrow.addEventListener('click', () => this.goTo(this.activeSlideIndex - 1))

    this.rightArrow = document.createElement('div')
    this.rightArrow.classList.add('anSlider-right-arrow')
    this.rightArrow.ariaLabel = 'Forward'
    this.rightArrow.innerHTML = this.rightArrowCode
    this.rightArrow.addEventListener('click', () => this.goTo(this.activeSlideIndex + 1))

    this.sliderElement.classList.add('anSlider-with-arrows')
  }

  #init() {
    if (!this.sliderElement) {
      console.error(`Element with selector ${this.selector} not found`)
      return
    }

    const slides = this.sliderElement.children
    const fragment = document.createDocumentFragment()

    if (slides.length < 1) {
      console.error(`Element with selector ${this.selector} has no slides`)
      return
    }

    if (this.activeSlideIndex < 0 || this.activeSlideIndex > slides.length - 1) {
      this.activeSlideIndex = 0
    }

    this.sliderElement.classList.add('anSlider-wrapper')
    this.sliderElement.id = `anSlider-${this.sliderId}`
    this.sliderElement.role = 'region'
    this.sliderElement.ariaLive = 'polite'

    const slider = document.createElement('div')
    let sliderButtons

    slider.classList.add('anSlider')

    if (this.indicators) {
      sliderButtons = document.createElement('div')
      sliderButtons.classList.add('anSlider-buttons')
    }

    Array.from(slides).forEach((slide, index) => {
      const slideWrapper = document.createElement('div')
      slideWrapper.classList.add('anSlide')
      slideWrapper.id = `slide-${index}-${this.sliderId}`
      slideWrapper.appendChild(slide)
      slider.appendChild(slideWrapper)

      if (this.indicators) {
        this.#createButton(index, sliderButtons)
      }
    })

    fragment.appendChild(slider)

    if (this.indicators) {
      fragment.appendChild(sliderButtons)

      if (this.buttonColor && CSS.supports('color', this.buttonColor)) {
        this.sliderElement.style.setProperty('--button-color', this.buttonColor)
      }
    }

    if (this.arrows) {
      this.#createArrows()
      fragment.appendChild(this.leftArrow)
      fragment.appendChild(this.rightArrow)

      if (this.arrowColor && CSS.supports('color', this.arrowColor)) {
        this.sliderElement.style.setProperty('--arrow-color', this.arrowColor)
      }
    }

    this.#loadStyles()
    this.sliderElement.appendChild(fragment)
    this.slider = this.sliderElement.querySelector('.anSlider')
    this.slides = this.slider.querySelectorAll('.anSlide')

    this.slider.addEventListener('scroll', this.#debounce(this.#handleScroll.bind(this), 200))
    this.#addDragEvents()

    if (this.activeSlideIndex !== 0) {
      this.goTo(this.activeSlideIndex, false)
    }
  }

  destroy() {
    this.sliderElement.remove()
  }

  goTo(index, smooth = true) {
    if (index < 0 || index > this.slides.length - 1) {
      return
    }

    this.slides[index]?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'instant',
      block: 'nearest',
      inline: 'center',
    })
  }

  next() {
    this.goTo(this.activeSlideIndex + 1)
  }

  prev() {
    this.goTo(this.activeSlideIndex - 1)
  }
}
