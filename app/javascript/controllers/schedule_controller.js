import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ['editPanel', 'calendar']

  clearEditPanel(event) {
    if (event) event.preventDefault()
    this.editPanelTarget.innerHTML = `
      <div class="edit-placeholder">
        <p>Select a date to edit</p>
      </div>
    `
  }

  async loadScheduleEdit(event) {
    event.preventDefault()
    const url = event.currentTarget.getAttribute('href')
    const selectedDate = url.split('/').pop()

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

      // Pre-select existing employees
      const existingEmployeeIds = this.getExistingEmployeeIds(selectedDate)
      this.updateCheckboxes(existingEmployeeIds)
    } catch (error) {
      console.error('Error loading schedule edit:', error)
      this.editPanelTarget.innerHTML = `
        <div class="error">
          <p>Unable to load schedule edit. Please try again.</p>
        </div>
      `
    }
  }

  updateCheckboxes(employeeIds) {
    // Uncheck all checkboxes
    this.editPanelTarget.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.checked = false
    })

    // Check specific employee checkboxes
    employeeIds.forEach(id => {
      const checkbox = this.editPanelTarget.querySelector(`#employee_${id}`)
      if (checkbox) checkbox.checked = true
    })
  }

  getExistingEmployeeIds(date) {
    const dayCell = document.getElementById(`day-${date}`)
    if (!dayCell) return []

    const employeeTags = dayCell.querySelectorAll('.employee-tag:not(.empty)')
    return Array.from(employeeTags)
      .map(tag => tag.dataset.employeeId)
      .filter(id => id) // Remove any falsy values
  }

  async updateSchedule(event) {
    event.preventDefault()
    const form = event.target
    const formData = new FormData(form)
    const selectedDate = form.dataset.date

    try {
      const response = await fetch(form.action, {
        method: 'PATCH',
        body: formData,
        headers: {
          'Accept': 'application/json'  // Changed to expect JSON
        }
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const responseData = await response.json()
      this.processScheduleUpdate(responseData, selectedDate)
    } catch (error) {
      console.error('Error updating schedule:', error)
      // Optionally show an error message to the user
    }
  }

  processScheduleUpdate(responseData, selectedDate) {
    // Update the day cell directly based on the response
    const dayCell = document.getElementById(`day-${selectedDate}`)
    if (dayCell) {
      // Find the employees div
      const employeesContainer = dayCell.querySelector('.employees .employee-list')
      
      if (employeesContainer) {
        // Clear existing employees
        employeesContainer.innerHTML = ''

        // Add new employees
        if (responseData.employees && responseData.employees.length > 0) {
          responseData.employees.forEach(employee => {
            const employeeTag = document.createElement('div')
            employeeTag.className = 'employee-tag'
            employeeTag.dataset.employeeId = employee.id
            employeeTag.textContent = employee.name
            employeesContainer.appendChild(employeeTag)
          })
        } else {
          // Add empty tag if no employees
          const emptyTag = document.createElement('div')
          emptyTag.className = 'employee-tag empty'
          employeesContainer.appendChild(emptyTag)
        }
      }
    }

    // Reload the edit panel to ensure checkboxes match
    this.reloadScheduleEdit(selectedDate)
  }

  async reloadScheduleEdit(date) {
    try {
      const response = await fetch(`/schedules/${date}`, {
        headers: {
          'Accept': 'text/html'
        }
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const html = await response.text()
      this.editPanelTarget.innerHTML = html

      // Pre-select existing employees
      const existingEmployeeIds = this.getExistingEmployeeIds(date)
      this.updateCheckboxes(existingEmployeeIds)
    } catch (error) {
      console.error('Error reloading schedule edit:', error)
    }
  }
}
