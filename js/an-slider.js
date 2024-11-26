class AnSlider {
  constructor({ selector, indicators = true, arrows = false, initialIndex = 0, leftArrow, rightArrow, buttonColor, arrowColor }) {
    this.wrapper = document.querySelector(selector)

    if (!selector || !this.wrapper) {
      console.error('Selector is empty or does not exist!')
      return
    }

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
    this.active = initialIndex && !isNaN(Number(initialIndex)) ? initialIndex : 0
    this.buttons = []
    this.#init()
  }

  #createCustomEvent(name) {
    return new CustomEvent(name, {
      detail: {
        currentIndex: this.active,
        totalSlides: this.slides.length,
      },
    })
  }

  #makeDraggable() {
    if ('ontouchstart' in window) return

    let xDown = null
    let yDown = null
    let isDragging = false

    const start = e => {
      if (e.button === 0) {
        // Only respond to left mouse button
        xDown = e.clientX
        yDown = e.clientY
        isDragging = true
      }
    }

    const swipe = e => {
      if (isDragging && Math.abs(e.clientX - xDown) > 5) {
        const xUp = e.clientX
        const yUp = e.clientY

        if (!xDown || !yDown) return

        const xDiff = xDown - xUp
        const yDiff = yDown - yUp

        if (Math.abs(xDiff) > Math.abs(yDiff) && xDiff !== 0) {
          this.goTo(this.active + (xDiff > 0 ? 1 : -1))
        }

        xDown = null
        yDown = null
      }
    }

    const end = _ => {
      isDragging = false
      xDown = null
      yDown = null
    }

    this.slider.addEventListener('mousedown', start)
    this.slider.addEventListener('mousemove', swipe)
    this.slider.addEventListener('mouseup', end)
  }

  #addStyles() {
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
  position: relative;

  [aria-hidden="true"] {
    display: none
  }
}
.anSlide {
  scroll-snap-align: center;
  scroll-snap-stop: always
}
.anSlide > img,
.anSlide > video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  vertical-align: bottom;
  transition: opacity .3s ease-in-out;
  opacity: inherit;
  user-select: none
}
.anSlide {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 0 0 calc(100vw - 16px);
  visibility: visible;
  transition: opacity .3s ease-in-out
}
@media (min-width: 466px) {
  .anSlide {
    flex: 0 0 450px
  }
}
.anSlider {
  display: flex;
  flex-flow: row nowrap;
  gap: 35px;
  visibility: hidden;
  scroll-snap-type: x mandatory;
  overflow: scroll hidden;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  cursor: grab
}
.anSlider::-webkit-scrollbar {
  display: none
}
.anSlider-indicators {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  gap: 7px
}
.anSlider-btn {
  width: 15px;
  height: 15px;
  border: 1px solid var(--button-color, #000);
  border-radius: 100%;
  transform: scale(1);
  transition: transform .3s ease-out, background-color .3s ease-out
}
.anSlider-btn[aria-current="true"] {
  margin: 0 2px;
  background-color: var(--button-color, #000);
  cursor: default;
  pointer-events: none;
  transform: scale(1.5);
  transition: transform .3s ease-in, background-color .3s ease-in
}
@media (hover: hover) {
  .anSlider-btn {
    width: 10px;
    height: 10px;
    cursor: pointer
  }
  .anSlider-indicators {
    gap: 4px
  }
  .anSlider:hover > :not(:hover) {
    opacity: .5
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
    transition: transform .3s ease-in
  }
  svg path {
    fill: var(--arrow-color, #000)
  }
}
`
    document.head.appendChild(sliderStyles)
  }

  #createIndicator(i, indicatorsWrapper) {
    const indicator = document.createElement('div')
    indicator.id = `slide-${i}-btn-${this.sliderId}`
    indicator.className = 'anSlider-btn'
    indicator.ariaCurrent = String(i === this.active)
    indicator.ariaLabel = `Go to slide ${i + 1}`
    indicator.addEventListener('click', () => this.goTo(i))
    indicatorsWrapper.appendChild(indicator)
    this.buttons.push(indicator)
  }

  #addArrows() {
    this.leftArrow = document.createElement('div')
    this.leftArrow.className = 'anSlider-left-arrow'
    this.leftArrow.ariaHidden = 'true'
    this.leftArrow.ariaLabel = 'Back'
    this.leftArrow.innerHTML = this.leftArrowCode
    this.leftArrow.addEventListener('click', () => this.goTo(this.active - 1))

    this.rightArrow = document.createElement('div')
    this.rightArrow.classList.add('anSlider-right-arrow')
    this.rightArrow.ariaLabel = 'Forward'
    this.rightArrow.innerHTML = this.rightArrowCode
    this.rightArrow.addEventListener('click', () => this.goTo(this.active + 1))
  }

  #init() {
    const content = this.wrapper.children
    let indicatorsWrapper
    const slides = []

    if (content.length < 1) {
      console.error('Selector has no content to create slides')
      return
    }

    const fragment = document.createDocumentFragment()
    const self = this

    if (this.active < 0 || this.active > content.length - 1) {
      this.active = 0
    }

    this.wrapper.classList.add('anSlider-wrapper')
    this.wrapper.id = `anSlider-${this.sliderId}`
    this.wrapper.role = 'region'
    this.wrapper.ariaLive = 'polite'

    const slider = document.createElement('div')

    slider.className = 'anSlider'

    if (this.indicators) {
      indicatorsWrapper = document.createElement('div')
      indicatorsWrapper.className = 'anSlider-indicators'
    }

    Array.from(content).forEach((item, index) => {
      const slide = document.createElement('div')
      slide.className = 'anSlide'
      slide.id = `slide-${index}-${this.sliderId}`
      slide.appendChild(item)
      slider.appendChild(slide)
      slides.push(slide)

      if (this.indicators) {
        this.#createIndicator(index, indicatorsWrapper)
      }
    })

    fragment.appendChild(slider)

    if (this.indicators) {
      fragment.appendChild(indicatorsWrapper)

      if (this.buttonColor && CSS.supports('color', this.buttonColor)) {
        this.wrapper.style.setProperty('--button-color', this.buttonColor)
      }
    }

    if (this.arrows) {
      this.#addArrows()
      fragment.appendChild(this.leftArrow)
      fragment.appendChild(this.rightArrow)

      if (this.arrowColor && CSS.supports('color', this.arrowColor)) {
        this.wrapper.style.setProperty('--arrow-color', this.arrowColor)
      }
    }

    this.#addStyles()
    this.wrapper.appendChild(fragment)
    this.slider = slider
    this.slides = slides

    this.slider.addEventListener('scrollsnapchanging', e => {
      const id = e.snapTargetInline.id
      const index = parseInt(id.split('-')[1], 10)

      if (self.indicators) {
        indicatorsWrapper?.querySelector('[aria-current="true"]')?.setAttribute('aria-current', false)
        self.buttons[index]?.setAttribute('aria-current', true)
      }

      if (self.arrows) {
        self.leftArrow.ariaHidden = String(index === 0)
        self.rightArrow.ariaHidden = String(index === self.slides.length - 1)
      }

      self.wrapper.dispatchEvent(self.#createCustomEvent('slideChange'))
    })

    this.slider.addEventListener('scrollsnapchange', _ => self.wrapper.dispatchEvent(self.#createCustomEvent('slideTransitionEnd')))

    if (this.active !== 0) {
      this.goTo(this.active, false)
    }

    this.#makeDraggable()
  }

  destroy() {
    this.wrapper.remove()
  }

  goTo(index, smooth = true) {
    if (index < 0 || index > this.slides.length - 1) {
      return
    }

    this.active = index
    this.slides[index]?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'instant',
      block: 'nearest',
      inline: 'center',
    })
  }

  next() {
    this.goTo(this.active + 1)
  }

  prev() {
    this.goTo(this.active - 1)
  }
}
