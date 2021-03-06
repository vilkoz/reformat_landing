const domReady = (callBack) => {
  if (document.readyState === "loading") {
    document.addEventListener('DOMContentLoaded', callBack);
  }
  else {
    callBack();
  }
}

class TouchDetector {
  touchStartX = 0
  touchStartY = 0
  touchEndX = 0
  touchEndY = 0

  leftSwipeCallback = undefined
  rightSwipeCallback = undefined
  moveLeftCallback = undefined
  moveEndCallback = undefined
  moveRightCallback = undefined

  handleGesture = () => {
    const diffX = Math.abs(this.touchStartX - this.touchEndX)
    const diffY = Math.abs(this.touchStartY - this.touchEndY)

    if (this.moveEndCallback) this.moveEndCallback(this.touchStartX - this.touchEndX, this.touchStartY - this.touchEndY)

    if (diffX > diffY && diffX > 50) {
      // Horisontal Swipe
      if (this.touchEndX < this.touchStartX && this.touchStartX > (screen.width * 0.75)) {
        // alert('swiped left')
        console.log(this.touchStartX, screen.width * 0.75)
        if (this.leftSwipeCallback) this.leftSwipeCallback(this.touchStartX - this.touchEndX, this.touchStartY - this.touchEndY)
      }
      if (this.touchEndX > this.touchStartX) {
        // alert('swiped right')
        if (this.rightSwipeCallback) this.rightSwipeCallback()
      }
    } else {
      console.log('vertical swipe')
    }
  }

  touchStart = (e) => {
    this.touchStartX = e.changedTouches[0].clientX
    this.touchStartY = e.changedTouches[0].clientY
  }

  touchEnd = (e) => {
    this.touchEndX = e.changedTouches[0].clientX
    this.touchEndY = e.changedTouches[0].clientY
    this.handleGesture()
  }

  touchMove = (e) => {
    // console.log(e.changedTouches[0])
    const diffX = e.changedTouches[0].clientX - this.touchStartX
    const diffY = e.changedTouches[0].clientY - this.touchStartY

    if (Math.abs(diffX) > Math.abs(diffY)) {

      if (diffX < 0 && this.touchStartX > screen.width * 0.75) {
        if (this.moveLeftCallback) this.moveLeftCallback(diffX, diffY)
      }
      if (diffX > 0) {
        if (this.moveRightCallback) this.moveRightCallback(diffX, diffY)
      }
    }
  }

  addListeners = (elem) => {
    elem.addEventListener('touchstart', this.touchStart)
    elem.addEventListener('touchend', this.touchEnd)
    elem.addEventListener('touchmove', this.touchMove)
  }

  addCallback = (side, callback) => {
    switch (side) {
      case 'left':
        this.leftSwipeCallback = callback
        break;
      case 'right':
        this.rightSwipeCallback = callback
        break;
      case 'moveLeft':
        this.moveLeftCallback = callback
        break
      case 'moveRight':
        this.moveRightCallback = callback
        break
      case 'end':
        this.moveEndCallback = callback
        break;
      default:
        console.error(`no such side '${side}'!`)
        break;
    }
  }
}

class ScrollDetector {
  didScroll = false

  onScrollCallback = undefined
  onScrollStartedCallback = undefined
  onScrollEndCallback = undefined
  onScrollToTopCallback = undefined


  constructor() {
    window.onscroll = (e) => {
      let html = document.getElementsByTagName('html')[0]
      const scrollTop = html.scrollTop
      const maxScrollTop = window.innerWidth < 768 ? window.innerHeight/10 : 150
      const scrollFraction = Math.min(scrollTop / maxScrollTop, 1)
      if (!this.didScroll) {
        this.didScroll = true

        if (this.onScrollStartedCallback) {
          window.requestAnimationFrame(this.onScrollStartedCallback)
        }
      } else if (this.didScroll && scrollFraction == 0) {
        this.didScroll = false
        if (this.onScrollToTopCallback) {
          window.requestAnimationFrame(this.onScrollToTopCallback)
        }
      } else if (scrollFraction == 1) {
        if (this.onScrollEndCallback) {
          window.requestAnimationFrame(this.onScrollEndCallback)
        }
      } else {
        function easeInEaseOut(t) {
          return t * t * (3.0 - 2.0 * t)
        }
        if (this.onScrollCallback) {
          window.requestAnimationFrame(() => {
            this.onScrollCallback(easeInEaseOut(scrollFraction))
          })
        }
      }
    }
  }

  addCallback = (type, callback) => {
    switch (type) {
      case 'scrollToTop':
        this.onScrollToTopCallback = callback
        break
      case 'scrollEnd':
        this.onScrollEndCallback = callback
        break
      case 'scrollStarted':
        this.onScrollStartedCallback = callback
        break
      case 'scroll':
        this.onScrollCallback = callback
        break
      default:
        console.error(`no such callback '${type}'`)
    }

  }

  stopScrollDetection = () => {
    window.onscroll = undefined
  }
}

class AnimationController {
  animateCallback = undefined
  animationEndCallback = undefined

  countdownTimer = undefined

  start = null
  duration = 1000
  defaultAnimationDelay = 2000

  constructor(scrollDetector) {
    this.scrollDetector = scrollDetector
  }

  animate = () => {
    window.requestAnimationFrame(this.animationStep);
  }

  animationStep = (timestamp) => {
    if (!this.animateCallback || !this.animationEndCallback) {
      return ;
    }
    if (!this.start) {
      this.start = timestamp
    }
    const progress = (timestamp - this.start) / this.duration
    if (progress < 1.0) {
      this.animateCallback(progress)
      window.requestAnimationFrame(this.animationStep)
    } else {
      this.animationEndCallback(progress)
    }
  }

  startAnimationCountdown = () => {
    this.stopAnimationCountdown()
    this.countdownTimer = window.setTimeout(() => {
      if (this.scrollDetector.didScroll) {
        return ;
      }
      this.scrollDetector.stopScrollDetection()

      this.animate()
    }, this.defaultAnimationDelay)
  }

  stopAnimationCountdown = () => {
    if (this.countdownTimer) {
      window.clearTimeout(this.countdownTimer)
    }
  }
}

domReady(() => {
  function preloadImg() {
    const images = [
      "img/illustrations/1.png",
      "img/illustrations/4.png",
      "img/illustrations/6.png",
    ]
    images.forEach(image => {
      let img = new Image()
      img.src = image
    })
  }
  preloadImg()

  const scrollDetector = new ScrollDetector()

  const animationController = new AnimationController(scrollDetector)
  animationController.startAnimationCountdown()

  const sliding_image_min_displacement = 463.0 / 696.0

  scrollDetector.addCallback('scrollStarted', () => {
    // window.onscroll = undefined
    const sad_image_elem = document.querySelector('.home-section__image > img')
    sad_image_elem.src = "img/illustrations/6.png"
    // sad_image_elem.parentNode.classList.remove('small_image')
    sad_image_elem.parentNode.style.justifyContent = 'flex-start'

    const sliding_image = document.getElementById('home-section__sliding_image')
    sliding_image.style.display = 'block'
    sliding_image.style.left = `${sad_image_elem.width * sliding_image_min_displacement + (sliding_image.width)}px`
    sliding_image.style.height = `${sad_image_elem.height}px`

    const fade_out_image = document.getElementById('home-section__fade_out_image')
    fade_out_image.style.display = 'block'
    fade_out_image.style.opacity = '0'
    fade_out_image.style.height = `${sad_image_elem.height}px`

    animationController.stopAnimationCountdown()
  })

  const animationCallback = (percent) => {
    const sad_image_elem = document.querySelector('.home-section__image > img')
    const image_url = (new URL(`img/illustrations/6.png`, document.location).href)
    if (sad_image_elem.src != image_url) {
      sad_image_elem.src = "img/illustrations/6.png"
    }

    const sliding_image = document.getElementById('home-section__sliding_image')
    sliding_image.style.display = 'block'
    sliding_image.style.opacity = `${percent}`
    sliding_image.style.left = `${sad_image_elem.width * sliding_image_min_displacement + (sliding_image.width * (1 - percent))}px`
    sliding_image.style.height = `${sad_image_elem.height}px`

    const fade_out_image = document.getElementById('home-section__fade_out_image')
    fade_out_image.style.display = 'block'
    fade_out_image.style.opacity = `${percent}`
    fade_out_image.style.height = `${sad_image_elem.height}px`
  }
  scrollDetector.addCallback('scroll', animationCallback)
  animationController.animateCallback = animationCallback

  const animationEndCallback = (percent) => {
    const sliding_image = document.getElementById('home-section__sliding_image')
    sliding_image.style.display = 'none'
    const sad_image_elem = document.querySelector('.home-section__image > img')
    const image_url = (new URL(`img/illustrations/1.png`, document.location).href)
    if (sad_image_elem.src != image_url) {
      sad_image_elem.src = "img/illustrations/1.png"
    }
    sad_image_elem.parentNode.style.justifyContent = null

    const fade_out_image = document.getElementById('home-section__fade_out_image')
    fade_out_image.style.display = 'none'
  }
  scrollDetector.addCallback('scrollEnd', animationEndCallback)
  animationController.animationEndCallback = animationEndCallback

  scrollDetector.addCallback('scrollToTop', (percent) => {
    const sliding_image = document.getElementById('home-section__sliding_image')
    sliding_image.style.display = 'none'
    const sad_image_elem = document.querySelector('.home-section__image > img')
    sad_image_elem.src = "img/illustrations/4.png"
    // sad_image_elem.parentNode.classList.add('small_image')
    sad_image_elem.parentNode.style.justifyContent = null

    const fade_out_image = document.getElementById('home-section__fade_out_image')
    fade_out_image.style.display = 'none'

    animationController.startAnimationCountdown()
  })


  const body = document.getElementsByTagName('body')[0]
  let our_team_button = document.getElementById('our-team-button')
  let our_team_popup = document.getElementById('our-team')
  let our_team_close_button = document.getElementById('our-team-close-button')

  our_team_button.onclick = () => {
    our_team_popup.classList.remove('hidden')
    body.classList.add('modal-open')
  }
  our_team_close_button.onclick = () => {
    our_team_popup.classList.add('hidden')
    body.classList.remove('modal-open')
  }


  let booking_form_buttons = document.querySelectorAll('.booking-form-button')
  let booking_form_popup = document.getElementById('booking-form')
  let booking_form_close_button = document.getElementById('booking-form-close-button')

  booking_form_buttons.forEach(button => {
    button.onclick = () => {
      booking_form_popup.classList.remove('hidden')
      body.classList.add('modal-open')
    }
  })

  booking_form_close_button.onclick = () => {
    booking_form_popup.classList.add('hidden')
    body.classList.remove('modal-open')
  }

  let send_booking_form_button = document.getElementById('send-booking-form')
  send_booking_form_button.onclick = (e) => {
    e.preventDefault()
    const scriptURL = 'https://script.google.com/macros/s/AKfycbwSnG1ANtqOCP5u_tVc8zjwNJr3W6yAif41O22qJGR2drhF2gxNTArx2hcg7Hq5-Y0/exec'
    const nameElem = document.getElementById('name')
    const lastnameElem = document.getElementById('lastname')
    const phoneElem = document.getElementById('phone')
    const emailElem = document.getElementById('email')

    const name = nameElem.value
    const lastname = lastnameElem.value
    const phone = phoneElem.value
    const email = emailElem.value

    const res = [nameElem, lastnameElem, phoneElem, emailElem].map(e => {
      const value = e.value
      if (value.trim().length === 0) {
        e.value = value.trim()
        e.reportValidity()
        return false;
      }
      if (!e.checkValidity()) {
        e.reportValidity()
        return false;
      }
      return true;
    })
    console.log(res)
    if (res.some(x => x === false)) {
      return ;
    }

    const data = {name, lastname, phone, email}

    console.log('data', data)
    fetch(scriptURL, {
        method: 'POST',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(data)
      })
      .then(data => {
        console.log('Success:', data)
      })
      .catch((error) => {
        console.error('Error:', error)
      })
    document.querySelector('.booking-form__column').style.display = 'none'
    document.querySelector('.booking-form__send_result').style.display = 'block'
  }

  const mobile_menu_open_button = document.getElementById("mobile-menu-open-button")
  const mobile_menu_popup = document.getElementById("mobile-menu")
  const mobile_menu_close_button = document.getElementById("mobile-menu-close-button")

  mobile_menu_open_button.onclick = () => {
    mobile_menu_popup.classList.remove('hidden')
    body.classList.add('modal-open')
  }

  function mobile_menu_hide () {
    mobile_menu_popup.classList.add('hidden')
    body.classList.remove('modal-open')
    return true
  }

  mobile_menu_close_button.onclick = mobile_menu_hide

  let mobile_menu_links = document.querySelectorAll(".mobile-menu__content_item")
  mobile_menu_links.forEach(link => {
    link.onclick = mobile_menu_hide
  })

  let mobileMenuOpenTouchDetector = new TouchDetector()
  mobileMenuOpenTouchDetector.addListeners(document.getElementsByTagName('main')[0])
  mobileMenuOpenTouchDetector.addCallback('left', (x, y) => {
    mobile_menu_popup.classList.remove('hidden')
    body.classList.add('modal-open')
  })
  mobileMenuOpenTouchDetector.addCallback('moveLeft', (x, y) => {
      mobile_menu_popup.classList.remove('hidden')
      mobile_menu_popup.style.left = `${Math.max(screen.width + x, 0)}px`
  })
  mobileMenuOpenTouchDetector.addCallback('end', (x, y) => {
    mobile_menu_popup.classList.add('hidden')
    mobile_menu_popup.style.left = `0`
  })

  let mobileMenuCloseTouchDetector = new TouchDetector()
  mobileMenuCloseTouchDetector.addListeners(mobile_menu_popup)
  mobileMenuCloseTouchDetector.addCallback('end', (x, y) => {
    if (x < -150) {
      mobile_menu_popup.classList.add('hidden')
      body.classList.remove('modal-open')
    }
    mobile_menu_popup.style.left = `0`
  })
  mobileMenuCloseTouchDetector.addCallback('moveRight', (x, y) => {
    mobile_menu_popup.classList.remove('hidden')
    mobile_menu_popup.style.left = `${x}px`
  })
})
