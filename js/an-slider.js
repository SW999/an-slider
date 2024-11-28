class AnSlider {
  slider
  slidesCount = 0
  playingState = 'idle' // idle, paused, playing, stopped
  #wrapper
  #indicatorsWrapper
  #leftArrow
  #rightArrow
  #autoplayTimer
  #indicators
  #arrows
  #indicatorColor
  #arrowColor
  #leftArrowCode
  #rightArrowCode

  constructor({ selector, indicators = true, arrows = false, initialIndex = 0, autoPlay = false, leftArrow, rightArrow, indicatorColor, arrowColor }) {
    this.#wrapper = document.querySelector(selector)

    if (!selector || !this.#wrapper) {
      throw new Error('Selector parameter is empty or such element does not exist!')
    }

    this.#indicators = 'boolean' === typeof indicators ? indicators : true
    this.#arrows = 'boolean' === typeof arrows ? arrows : false
    this.#indicatorColor = CSS.supports('color', indicatorColor) ? indicatorColor : undefined
    this.#arrowColor = CSS.supports('color', arrowColor) ? arrowColor : undefined
    this.#leftArrowCode = this.#isValidSVG(leftArrow?.trim())
      ? leftArrow
      : '<svg viewBox="0 0 143 330" xml:space="preserve"><path stroke="null" d="M3.213 155.996 115.709 6c4.972-6.628 14.372-7.97 21-3 6.627 4.97 7.97 14.373 3 21L33.962 164.997 139.709 306c4.97 6.627 3.626 16.03-3 21a14.929 14.929 0 0 1-8.988 3c-4.56 0-9.065-2.071-12.012-6L3.213 173.996a15 15 0 0 1 0-18z"/></svg>'
    this.#rightArrowCode = this.#isValidSVG(rightArrow?.trim())
      ? rightArrow
      : '<svg viewBox="0 0 143 330" xml:space="preserve"><path d="M140.001 155.997 27.501 6c-4.972-6.628-14.372-7.97-21-3s-7.97 14.373-3 21l105.75 140.997L3.501 306c-4.97 6.627-3.627 16.03 3 21a14.93 14.93 0 0 0 8.988 3c4.561 0 9.065-2.071 12.012-6l112.5-150.004a15 15 0 0 0 0-18z"/></svg>'
    this.sliderId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`
    this.activeIndex = initialIndex && !isNaN(Number(initialIndex)) && initialIndex % 1 === 0 && initialIndex > -1 ? initialIndex : 0
    this.autoPlay = 'boolean' === typeof autoPlay ? autoPlay : false
    this.#init()
  }

  #isValidSVG(str) {
    if (!this.#arrows) return false

    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(str, 'image/svg+xml')
      return doc.documentElement.nodeName === 'svg' && !doc.querySelector('parsererror')
    } catch {
      return false
    }
  }

  #createCustomEvent(name) {
    return new CustomEvent(name, {
      detail: {
        currentIndex: this.activeIndex,
        totalSlides: this.slidesCount,
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
          this.goTo(this.activeIndex + (xDiff > 0 ? 1 : -1))
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
  --indicator-color: #000;
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
.anSlider-indicator {
  width: 15px;
  height: 15px;
  border: 1px solid var(--indicator-color, #000);
  border-radius: 100%;
  transform: scale(1);
  transition: transform .3s ease-out, background-color .3s ease-out
}
.anSlider-indicator[aria-current="true"] {
  margin: 0 2px;
  background-color: var(--indicator-color, #000);
  cursor: default;
  pointer-events: none;
  transform: scale(1.5);
  transition: transform .3s ease-in, background-color .3s ease-in
}
@media (hover: hover) {
  .anSlider-indicator {
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
}`
    document.head.appendChild(sliderStyles)
  }

  #createIndicator(i) {
    const indicator = document.createElement('div')

    indicator.id = `slide-${i}-indicator-${this.sliderId}`
    indicator.className = 'anSlider-indicator'
    indicator.ariaCurrent = String(i === this.activeIndex)
    indicator.ariaLabel = `Go to slide ${i + 1}`
    indicator.dataset.index = i
    this.#indicatorsWrapper.appendChild(indicator)
  }

  #addArrows() {
    this.#leftArrow = document.createElement('div')
    this.#leftArrow.className = 'anSlider-arrow anSlider-left-arrow'
    this.#leftArrow.ariaHidden = 'true'
    this.#leftArrow.ariaLabel = 'Back'
    this.#leftArrow.innerHTML = this.#leftArrowCode
    this.#leftArrow.dataset.direction = '-1'

    this.#rightArrow = document.createElement('div')
    this.#rightArrow.className = 'anSlider-arrow anSlider-right-arrow'
    this.#rightArrow.ariaLabel = 'Forward'
    this.#rightArrow.innerHTML = this.#rightArrowCode
    this.#rightArrow.dataset.direction = '1'
  }

  #addIndicators() {
    this.#indicatorsWrapper = document.createElement('div')
    this.#indicatorsWrapper.className = 'anSlider-indicators'

    Array.from({ length: this.slidesCount }).forEach((_, index) => this.#createIndicator(index))
  }

  #bindEvents() {
    this.#wrapper.addEventListener('click', e => {
      const indicator = e.target.closest('.anSlider-indicator')
      const arrow = e.target.closest('.anSlider-arrow')

      if (indicator) {
        this.goTo(Number(indicator.dataset.index))
        return
      }

      if (arrow) {
        this.goTo(this.activeIndex + Number(arrow.dataset.direction))
      }
    })

    this.slider.addEventListener('scrollsnapchanging', e => {
      const index = Number(e.snapTargetInline.dataset.index)

      if (this.#indicators) {
        this.#indicatorsWrapper?.querySelector('[aria-current="true"]')?.setAttribute('aria-current', false)
        this.#indicatorsWrapper?.querySelectorAll('.anSlider-indicator')[index]?.setAttribute('aria-current', true)
      }

      if (this.#arrows) {
        this.#leftArrow.ariaHidden = String(index === 0)
        this.#rightArrow.ariaHidden = String(index === this.slidesCount - 1)
      }

      this.#wrapper.dispatchEvent(this.#createCustomEvent('slideChange'))
    })

    this.slider.addEventListener('scrollsnapchange', _ => {
      this.#wrapper.dispatchEvent(this.#createCustomEvent('slideTransitionEnd'))

      if (this.playingState === 'played') {
        this.play(true)
      }
    })

    this.slider.addEventListener('mouseover', () => {
      if (this.playingState === 'played') {
        clearTimeout(this.#autoplayTimer)
        this.playingState = 'paused'
      }
    })

    this.slider.addEventListener('mouseout', () => {
      if (this.playingState === 'paused') {
        this.play(true)
      }
    })

    this.#makeDraggable()
  }

  #createSlide(item, index) {
    const slide = document.createElement('div')
    slide.className = 'anSlide'
    slide.dataset.index = index
    slide.id = `slide-${index}-${this.sliderId}`
    slide.appendChild(item)
    this.slider.appendChild(slide)
  }

  #setupSlider() {
    const content = Array.from(this.#wrapper.children)
    const fragment = document.createDocumentFragment()

    this.slidesCount = content.length
    this.activeIndex = this.activeIndex > this.slidesCount - 1 ? 0 : this.activeIndex

    this.#wrapper.classList.add('anSlider-wrapper')
    this.#wrapper.id = `anSlider-${this.sliderId}`
    this.#wrapper.role = 'region'
    this.#wrapper.ariaLive = 'polite'

    this.slider = document.createElement('div')
    this.slider.className = 'anSlider'

    content.forEach((item, index) => this.#createSlide(item, index))
    fragment.appendChild(this.slider)

    if (this.#indicators) {
      this.#addIndicators()
      fragment.appendChild(this.#indicatorsWrapper)

      if (this.#indicatorColor) {
        this.#wrapper.style.setProperty('--indicator-color', this.#indicatorColor)
      }
    }

    if (this.#arrows) {
      this.#addArrows()
      fragment.appendChild(this.#leftArrow)
      fragment.appendChild(this.#rightArrow)

      if (this.#arrowColor) {
        this.#wrapper.style.setProperty('--arrow-color', this.#arrowColor)
      }
    }

    this.#wrapper.appendChild(fragment)
  }

  #init() {
    if (this.#wrapper.childElementCount < 1) {
      throw new Error('Selector has no content to create slides!')
    }

    this.#addStyles()
    this.#setupSlider()
    this.#bindEvents()

    if (this.activeIndex !== 0) {
      this.goTo(this.activeIndex, false)
    }

    if (this.autoPlay) {
      this.play(true)
    }
  }

  destroy() {
    clearTimeout(this.#autoplayTimer)
    this.#wrapper.remove()
  }

  goTo(index, smooth = true) {
    if (index < 0 || index > this.slidesCount - 1) {
      return
    }

    this.activeIndex = index
    this.slider.querySelector(`#slide-${index}-${this.sliderId}`)?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'instant',
      block: 'nearest',
      inline: 'center',
    })
  }

  next() {
    this.goTo(this.activeIndex + 1)
  }

  prev() {
    this.goTo(this.activeIndex - 1)
  }

  play(delayed = false) {
    const nextIndex = this.activeIndex + 1 > this.slidesCount - 1 ? 0 : this.activeIndex + 1

    clearTimeout(this.#autoplayTimer)
    this.#autoplayTimer = setTimeout(() => this.goTo(nextIndex), delayed ? 3000 : 0)
    this.playingState = 'played'
  }

  pause() {
    clearTimeout(this.#autoplayTimer)
    this.playingState = 'stopped'
  }
}
