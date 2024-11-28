**An-Slider**
================

An(other) js slider. A lightweight and customizable gallery component made via pure JavaScript, without dependencies.

**Features**
------------

* **Touch-friendly**: Supports touch events on mobile and desktop
* **Keyboard navigation**: Allows navigation using keyboard arrows
* **Customizable**: Easily customize the slider's appearance and behavior
* **No dependencies**: Made with pure JavaScript, without any libraries or frameworks
* **Accessible**: Supports accessibility features for users with disabilities

**Usage**
-----

1. Include the `an-slider.js` file in your HTML document
2. Create a container element for the slider with unique css class or id
3. Add slide elements inside the container
4. Initialize the slider by calling the `AnSlider` constructor and using the config object

**Example**
------------

```html
<div id="slider2">
  <img alt="1" src="https://placehold.co/600x500/EEE/F00/png?text=Some\nPicture1">
  <img alt="2" src="https://placehold.co/600x500/EEE/0F0/png?text=Another\nPicture2">
  <img alt="3" src="https://placehold.co/600x500/EEE/00F/png?text=Some\nPicture3">
</div>

<script>
    document.addEventListener('DOMContentLoaded', function () {
        const slider = new AnSlider({
            // required option
            selector: '#slider2',
            
            // show/hide slide indicators (default: true)
            indicators: false,
            
            // show/hide navigation arrows (default: false)
            arrows: true,
            
            // initial slide index (default: 0)
            initialIndex: 2,
            
            // color of navigation indicators (default: #000)
            indicatorColor: '#fff',
            
            // color of navigation arrows (default: #000). Works for default arrows only
            arrowColor: '#fff',
            
            // start autoplay (default: false)
            autoPlay: true,
            
            // svg code for left arrow (default: '<')
            leftArrow: '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><path d="M50,50 L0,0 L0,100 Z" fill="#000"/></svg>',
            
            // svg code for right arrow (default: '>')
            rightArrow: '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><path d="M0,50 L50,0 L50,100 Z" fill="#000"/></svg>'
         });
    })
</script>
```

**Options**
------------

* `selector`: Selector for the container element (e.g. `.slider`, `#mySlider`)
* `indicators`: Whether to add dot indicator for each slide (default: `true`)
* `arrows`: Whether to add arrows for navigation (default: `false`)
* `initialIndex`: Index of the initial slide (default: `0`)
* `indicatorColor`: Color of the navigation (dots) indicators (default: `#000`)
* `arrowColor`: Color of the arrows (default: `#000`)
* `leftArrow`: String with **svg** code for the left arrow (default: `<`)
* `rightArrow`: String with **svg** code for the right arrow (default: `>`)
* `AutoPlay`: Whether to start autoplay (default: `false`)

> [!TIP]
> 
> Only `selector` is required. Other options are optional.

**Methods**
------------

* `destroy`: Removes the slider instance from the DOM
* `gotTo`: Changes the active slide to the specified index
* `next`: Changes the active slide to the next slide
* `prev`: Changes the active slide to the previous slide
* `play`: Starts autoplay
* `pause`: Pauses autoplay

**License**
------------

MIT License


> [!NOTE]
> ## TODO:
> - [ ] Add set of default slide sizes and support for custom size
> - [ ] Add variant with previews (horizontal and vertical)
> - [x] Add `slideTransitionEnd` - custom event. Fired when the slide transition ends
> - [x] Add `slideChange` - custom event. Fired when the active slide changes
> - [x] Add methods `next`, `prev`, `goTo`, `destroy`
> - [x] Add accessibility support
> - [x] Add `initialIndex` option
> - [x] Add `AutoPlay`
