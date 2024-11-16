**An-Slider**
================

An(other) js slider. A lightweight and customizable slider component made with pure JavaScript, without any dependencies.

**Features**
------------

* **Touch-friendly**: Supports touch events
* **Keyboard navigation**: Allows navigation using keyboard arrows
* **Customizable**: Easily customize the slider's appearance and behavior
* **No dependencies**: Made with pure JavaScript, without any libraries or frameworks

**Usage**
-----

1. Include the `an-slider.min.js` file in your HTML document
2. Create a container element for the slider with unique css class or id
3. Add slide elements inside the container
4. Initialize the slider by calling the `AnSlider` constructor and passing the container element as an option `selector`

**Example**
------------

```html
<div class="slider1">
  <div>Slide 1</div>
  <div>Slide 2</div>
  <div>Slide 3</div>
</div>

<div id="slider2">
  <img alt="1" src="https://placehold.co/600x500/EEE/F00/png?text=Some\nPicture1">
  <img alt="2" src="https://placehold.co/600x500/EEE/0F0/png?text=Another\nPicture2">
  <img alt="3" src="https://placehold.co/600x500/EEE/00F/png?text=Some\nPicture3">
</div>

<script>
    document.addEventListener('DOMContentLoaded', function () {
        new AnSlider({selector: '.slider1'});
        new AnSlider({selector: '#slider2', indicators: false, arrows: true});
    })
</script>
```

**Options**
------------

* `indicators`: Whether to add dot indicator for each slide (default: `true`)
* `arrows`: Whether to add arrows for navigation (default: `false`)

**License**
------------

MIT License


## TODO:

- [ ] Add set of default slide sizes and support for custom size
- [ ] Add variant with previews (horizontal and vertical)
- [ ] Add `slideTransitionEnd` - custom event. Fired when the slide transition ends
- [ ] Add `slideChange` - custom event. Fired when the active slide changes
- [ ] Add methods `next`, `prev`, `goTo`, `destroy`
- [ ] Add accessibility support
