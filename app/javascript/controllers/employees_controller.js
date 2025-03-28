// app/javascript/controllers/employees_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [ "list", "details", "editForm", "nameInput" ]
  static values = { selectedEmployeeId: Number }

  connect() {
    // Ensure the name input is always disabled by default
    if (this.hasNameInputTarget) {
      this.nameInputTarget.disabled = true
    }
  }

  // Helper method to get CSRF token
  getCsrfToken() {
    const metaTag = document.querySelector('meta[name="csrf-token"]')
    return metaTag ? metaTag.content : ''
  }

  // Helper method for common fetch options
  getFetchOptions(method, body = null) {
    const options = {
      method: method,
      headers: {
        'Accept': 'text/html',
        'X-CSRF-Token': this.getCsrfToken()
      }
    }

    if (body) {
      options.body = body
    }

    return options
  }

  showEmployee(event) {
    event.preventDefault()
    const employeeId = event.currentTarget.querySelector('[data-employee-id]').dataset.employeeId

    fetch(`/employees/${employeeId}`, {
      headers: {
        'Accept': 'text/html'
      }
    })
    .then(response => response.text())
    .then(html => {
      this.detailsTarget.innerHTML = html
      this.selectedEmployeeIdValue = employeeId
      this.editFormTarget.innerHTML = '' // Clear any existing edit form
      
      // Re-disable name input after loading details
      if (this.hasNameInputTarget) {
        this.nameInputTarget.disabled = true
      }
    })
    .catch(error => {
      console.error('Error loading employee details:', error)
    })
  }

  async updateEmployee(event) {
    event.preventDefault()
    const form = event.target
    const formData = new FormData(form)
    const employeeId = this.selectedEmployeeIdValue

    try {
      const response = await fetch(`/employees/${employeeId}`, {
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
      
      // Update details with new employee information
      this.detailsTarget.innerHTML = html
      
      // Update employee list
      this.updateEmployeeList(employeeId, formData)
      
      // Clear edit form and hide edit actions
      this.editFormTarget.innerHTML = ''
      const editActions = this.element.querySelector('.employees-show-actions .edit-actions')
      const defaultActions = this.element.querySelector('.employees-show-actions .default-actions')
      
      if (editActions) editActions.classList.add('hidden')
      if (defaultActions) defaultActions.classList.remove('hidden')
      
      // Re-disable name input
      if (this.hasNameInputTarget) {
        this.nameInputTarget.disabled = true
      }
    } catch (error) {
      console.error('Error updating employee:', error)
    }
  }

  updateEmployeeList(employeeId, formData) {
    const listItem = this.listTarget.querySelector(`[data-employee-id="${employeeId}"]`)
    
    if (listItem) {
      const nameSpan = listItem.closest('.employees-list-item')
      const nameElement = nameSpan.querySelector('.employees-list-item-name')
      const statusElement = nameSpan.querySelector('.employees-list-item-status-active, .employees-list-item-status-inactive')
      
      // Determine the current active status from the details view
      const detailsStatusElement = this.detailsTarget.querySelector('.employee-status')
      const isCurrentlyActive = detailsStatusElement.classList.contains('employees-list-item-status-active')

      // Reset the name element
      nameElement.classList.remove('inactive')

      // Update name
      const nameText = detailsStatusElement.closest('.employees-show-header').querySelector('.employees-show-title').value
      nameElement.innerHTML = nameText

      // Append status
      if (isCurrentlyActive) {
        nameElement.classList.remove('inactive')
        nameElement.innerHTML += `<span class="employees-list-item-status-active"> - Active</span>`
      } else {
        nameElement.classList.add('inactive')
        nameElement.innerHTML += `<span class="employees-list-item-status-inactive"> - Inactive</span>`
      }
    }
  }

  startEdit(event) {
    event.preventDefault()
    const editActions = this.element.querySelector('.employees-show-actions .edit-actions')
    const defaultActions = this.element.querySelector('.employees-show-actions .default-actions')

    // Show edit actions, hide default actions
    editActions.classList.remove('hidden')
    defaultActions.classList.add('hidden')

    // Enable name input for editing
    if (this.hasNameInputTarget) {
      this.nameInputTarget.disabled = false
      this.nameInputTarget.focus()
    }
  }

  cancelEdit(event) {
    event.preventDefault()
    const editActions = this.element.querySelector('.employees-show-actions .edit-actions')
    const defaultActions = this.element.querySelector('.employees-show-actions .default-actions')

    // Hide edit actions, show default actions
    editActions.classList.add('hidden')
    defaultActions.classList.remove('hidden')

    // Disable name input
    if (this.hasNameInputTarget) {
      this.nameInputTarget.disabled = true
    }
  }

  async deactivate(event) {
    event.preventDefault()
    const employeeId = this.selectedEmployeeIdValue

    try {
      const response = await fetch(`/employees/${employeeId}/deactivate`, 
        this.getFetchOptions('PATCH')
      )

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const html = await response.text()
      
      // Update details
      this.detailsTarget.innerHTML = html
      
      // Update employee list while preserving the name
      this.updateEmployeeList(employeeId, new FormData(), true)
    } catch (error) {
      console.error('Error deactivating employee:', error)
    }
  }

  async reactivate(event) {
    event.preventDefault()
    const employeeId = this.selectedEmployeeIdValue

    try {
      const response = await fetch(`/employees/${employeeId}/reactivate`, 
        this.getFetchOptions('PATCH')
      )

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const html = await response.text()
      
      // Update details
      this.detailsTarget.innerHTML = html
      
      // Update employee list while preserving the name
      this.updateEmployeeList(employeeId, new FormData(), true)
    } catch (error) {
      console.error('Error reactivating employee:', error)
    }
  }
}
