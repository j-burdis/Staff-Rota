import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  clearEditPanel(event) {
    event.preventDefault()
    const frame = document.getElementById("schedule-edit-panel")
    if (frame) {
      frame.innerHTML = '<div class="edit-placeholder"><p>Select a date to edit the schedule</p></div>'
    }
  }
}