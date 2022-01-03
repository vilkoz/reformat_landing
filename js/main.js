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

domReady(() => {
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
  send_booking_form_button.onclick = () => {
    // TODO: send form and save somewhere
    alert('TODO SEND FORM')
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
