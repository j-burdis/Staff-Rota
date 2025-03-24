import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  clearEditPanel(event) {
    event.preventDefault()
    const frame = document.getElementById("schedule-edit-panel")
    if (frame) {
      frame.innerHTML = '<div class="edit-placeholder"><p>Select a date to edit the schedule</p></div>'
    }
  }

  updateCalendarDay(event) {
    console.log("Turbo submit event triggered", event)
    
    try {
      const fetchResponse = event.detail.fetchResponse
      console.log("Fetch Response:", fetchResponse)

      fetchResponse.response.text().then(text => {
        console.log("Response Text:", text)
        
        // Create a temporary div to parse the Turbo Stream
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = text.trim()
        
        // Find the turbo-stream template
        const turboStreamTemplate = tempDiv.querySelector('turbo-stream template')
        
        if (turboStreamTemplate) {
          // Extract the actual content from the template
          const newDayCell = turboStreamTemplate.content.firstElementChild
          
          // Find the existing day cell
          const dayCell = document.getElementById(`day-${event.target.dataset.date}`)
          
          if (dayCell && newDayCell) {
            console.log("Replacing day cell")
            dayCell.parentNode.replaceChild(newDayCell, dayCell)
          } else {
            console.error("Day cell not found", { dayCell, newDayCell })
          }
        } else {
          console.error("No turbo-stream template found")
        }
      }).catch(error => {
        console.error("Error processing response text:", error)
      })
    } catch (error) {
      console.error("Error in updateCalendarDay:", error)
    }
  }
}
