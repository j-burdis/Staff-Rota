// import { Controller } from "@hotwired/stimulus"

// export default class extends Controller {
//   clearEditPanel(event) {
//     event.preventDefault()
//     const frame = document.getElementById("schedule-edit-panel")
//     if (frame) {
//       frame.innerHTML = '<div class="edit-placeholder"><p>Select a date to edit the schedule</p></div>'
//     }
//   }

//   updateCalendarDay(event) {
//     console.log("Turbo submit event triggered", event)
    
//     try {
//       const fetchResponse = event.detail.fetchResponse
//       console.log("Fetch Response:", fetchResponse)

//       fetchResponse.response.text().then(text => {
//         console.log("Response Text:", text)
        
//         // Create a temporary div to parse the Turbo Stream
//         const tempDiv = document.createElement('div')
//         tempDiv.innerHTML = text.trim()
        
//         // Find the turbo-stream template
//         const turboStreamTemplate = tempDiv.querySelector('turbo-stream template')
        
//         if (turboStreamTemplate) {
//           // Extract the actual content from the template
//           const newDayCell = turboStreamTemplate.content.firstElementChild
          
//           // Find the existing day cell
//           const dayCell = document.getElementById(`day-${event.target.dataset.date}`)
          
//           if (dayCell && newDayCell) {
//             console.log("Replacing day cell")
//             dayCell.parentNode.replaceChild(newDayCell, dayCell)
//           } else {
//             console.error("Day cell not found", { dayCell, newDayCell })
//           }
//         } else {
//           console.error("No turbo-stream template found")
//         }
//       }).catch(error => {
//         console.error("Error processing response text:", error)
//       })
//     } catch (error) {
//       console.error("Error in updateCalendarDay:", error)
//     }
//   }
// }

import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ['editPanel', 'calendar']

  clearEditPanel(event) {
    event.preventDefault()
    this.editPanelTarget.innerHTML = `
      <div class="edit-placeholder">
        <p>Select a date to edit</p>
      </div>
    `
  }

  async loadScheduleEdit(event) {
    event.preventDefault()
    const url = event.currentTarget.getAttribute('href')

    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'text/html'
        }
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const html = await response.text()
      this.editPanelTarget.innerHTML = html
    } catch (error) {
      console.error('Error loading schedule edit:', error)
      this.editPanelTarget.innerHTML = `
        <div class="error">
          <p>Unable to load schedule edit. Please try again.</p>
        </div>
      `
    }
  }

  async updateSchedule(event) {
    event.preventDefault()
    const form = event.target
    const formData = new FormData(form)

    try {
      const response = await fetch(form.action, {
        method: 'PATCH',
        body: formData,
        headers: {
          'Accept': 'text/html'
        }
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const html = await response.text()
      this.processScheduleUpdate(html)
    } catch (error) {
      console.error('Error updating schedule:', error)
      // Optionally show an error message to the user
    }
  }

  processScheduleUpdate(html) {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html.trim()

    // Find the updated day cell
    const updatedDayCell = tempDiv.querySelector('td[id^="day-"]')
    
    if (updatedDayCell) {
      const currentDayCell = document.getElementById(updatedDayCell.id)
      
      if (currentDayCell) {
        // Replace the entire day cell
        currentDayCell.parentNode.replaceChild(updatedDayCell, currentDayCell)
      }
    }

    // Clear the edit panel
    this.clearEditPanel(new Event('click'))
  }
}
