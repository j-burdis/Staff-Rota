// app/javascript/controllers/employees_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [ "list", "details", "editForm" ]
  static values = { selectedEmployeeId: Number }

  connect() {
    // Optional: Initial setup if needed
  }

  showEmployee(event) {
    event.preventDefault()
    const employeeId = event.currentTarget.querySelector('[data-employee-id]').dataset.employeeId

    fetch(`/employees/${employeeId}`)
      .then(response => response.text())
      .then(html => {
        this.detailsTarget.innerHTML = html
        this.selectedEmployeeIdValue = employeeId
        this.editFormTarget.innerHTML = '' // Clear any existing edit form
      })
  }

  editEmployee(event) {
    event.preventDefault()
    const employeeId = this.selectedEmployeeIdValue

    fetch(`/employees/${employeeId}/edit`)
      .then(response => response.text())
      .then(html => {
        // Create a temporary div to parse the HTML
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = html
        
        // Find the form within the parsed HTML
        const editForm = tempDiv.querySelector('form')
        
        // If the form exists, replace the content of the edit form target
        if (editForm) {
          this.editFormTarget.innerHTML = editForm.outerHTML
        }
      })
  }

  updateEmployee(event) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const employeeId = this.selectedEmployeeIdValue

    fetch(`/employees/${employeeId}`, {
      method: 'PATCH',
      body: formData,
      headers: {
        'Accept': 'text/html'
      }
    })
    .then(response => response.text())
    .then(html => {
      // Create a temporary div to parse the HTML
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = html
      
      // Find the show container within the parsed HTML
      const showContainer = tempDiv.querySelector('.employees-show-container')
      
      // Update details with just the show container
      if (showContainer) {
        this.detailsTarget.innerHTML = showContainer.outerHTML
        this.editFormTarget.innerHTML = ''
      }
    })
    .catch(error => {
      console.error('Error:', error)
    })
  }

  cancelEdit(event) {
    event.preventDefault()
    
    // Refetch the employee show view
    fetch(`/employees/${this.selectedEmployeeIdValue}`)
      .then(response => response.text())
      .then(html => {
        // Create a temporary div to parse the HTML
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = html
        
        // Find the show container within the parsed HTML
        const showContainer = tempDiv.querySelector('.employees-show-container')
        
        // Update details with just the show container
        if (showContainer) {
          this.detailsTarget.innerHTML = showContainer.outerHTML
          this.editFormTarget.innerHTML = ''
        }
      })
  }
}
