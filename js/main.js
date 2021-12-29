const domReady = (callBack) => {
  if (document.readyState === "loading") {
    document.addEventListener('DOMContentLoaded', callBack);
  }
  else {
    callBack();
  }
}
domReady(() => {
  let our_team_button = document.getElementById('our-team-button')
  let our_team_popup = document.getElementById('our-team')
  let our_team_close_button = document.getElementById('our-team-close-button')

  our_team_button.onclick = () => {
    our_team_popup.classList.remove('hidden')
  }
  our_team_close_button.onclick = () => {
    our_team_popup.classList.add('hidden')
  }


  let booking_form_buttons = document.querySelectorAll('.booking-form-button')
  let booking_form_popup = document.getElementById('booking-form')
  let booking_form_close_button = document.getElementById('booking-form-close-button')

  booking_form_buttons.forEach(button => {
    button.onclick = () => {
      booking_form_popup.classList.remove('hidden')
    }
  })

  booking_form_close_button.onclick = () => {
    booking_form_popup.classList.add('hidden')
  }

  let send_booking_form_button = document.getElementById('send-booking-form')
  send_booking_form_button.onclick = () => {
    // TODO: send form and save somewhere
    alert('TODO SEND FORM')
  }
})
