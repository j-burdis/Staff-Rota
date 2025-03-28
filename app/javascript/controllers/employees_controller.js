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

  // updateEmployeeList(employeeId, formData) {
  //   const listItem = this.listTarget.querySelector(`[data-employee-id="${employeeId}"]`)
    
  //   if (listItem) {
  //     const nameSpan = listItem.closest('.employees-list-item')
  //     const nameElement = nameSpan.querySelector('.employees-list-item-name')
  //     const statusElement = nameSpan.querySelector('.employees-list-item-status-active, .employees-list-item-status-inactive')
      
  //     // Update name
  //     const newName = formData.get('employee[name]')
  //     nameElement.firstChild.textContent = newName

  //     // Update active status only if the active field is present in formData
  //     if (formData.has('employee[active]')) {
  //       const isActive = formData.get('employee[active]') === '1'
  //       if (isActive) {
  //         nameElement.classList.remove('inactive')
  //         statusElement.textContent = ' - Active'
  //         statusElement.className = 'employees-list-item-status-active'
  //       } else {
  //         nameElement.classList.add('inactive')
  //         statusElement.textContent = ' - Inactive'
  //         statusElement.className = 'employees-list-item-status-inactive'
  //       }
  //     }
  //   }
  // }

  updateEmployeeList(employeeId, formData) {
    console.log('Updating employee list:', {
      employeeId: employeeId,
      formData: Object.fromEntries(formData),
    });

    const listItem = this.listTarget.querySelector(`[data-employee-id="${employeeId}"]`)
    
    if (listItem) {
      const nameSpan = listItem.closest('.employees-list-item')
      const nameElement = nameSpan.querySelector('.employees-list-item-name')
      const statusElement = nameSpan.querySelector('.employees-list-item-status-active, .employees-list-item-status-inactive')
      
      console.log('List item elements:', {
        nameSpan,
        nameElement,
        statusElement
      });
      
      // Update name
      const newName = formData.get('employee[name]')
      nameElement.firstChild.textContent = newName

      // Determine the current active status from the details view
      const detailsStatusElement = this.detailsTarget.querySelector('.employees-show-status span')
      const isCurrentlyActive = detailsStatusElement.classList.contains('employees-list-item-status-active')

      console.log('Current active status:', {
        isCurrentlyActive,
        detailsStatusElement
      });

      // Update status based on the current status in the details view
      if (isCurrentlyActive) {
        nameElement.classList.remove('inactive')
        statusElement.textContent = ' - Active'
        statusElement.className = 'employees-list-item-status-active'
      } else {
        nameElement.classList.add('inactive')
        statusElement.textContent = ' - Inactive'
        statusElement.className = 'employees-list-item-status-inactive'
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
      const response = await fetch(`/employees/${employeeId}/deactivate`, {
        method: 'PATCH',
        headers: {
          'Accept': 'text/html'
        }
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const html = await response.text()
      
      // Update details
      this.detailsTarget.innerHTML = html
      
      // Update employee list
      this.updateEmployeeList(employeeId, new FormData())
    } catch (error) {
      console.error('Error deactivating employee:', error)
    }
  }

  async reactivate(event) {
    event.preventDefault()
    const employeeId = this.selectedEmployeeIdValue

    try {
      const response = await fetch(`/employees/${employeeId}/reactivate`, {
        method: 'PATCH',
        headers: {
          'Accept': 'text/html'
        }
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const html = await response.text()
      
      // Update details
      this.detailsTarget.innerHTML = html
      
      // Update employee list
      this.updateEmployeeList(employeeId, new FormData())
    } catch (error) {
      console.error('Error reactivating employee:', error)
    }
  }

  async destroy(event) {
    event.preventDefault()
    const employeeId = this.selectedEmployeeIdValue

    if (!confirm('Are you sure you want to permanently delete this employee?')) {
      return
    }

    try {
      const response = await fetch(`/employees/${employeeId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'text/html'
        }
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      // Remove the employee from the list
      const listItem = this.listTarget.querySelector(`[data-employee-id="${employeeId}"]`).closest('.employees-list-item')
      listItem.remove()

      // Clear details and edit form
      this.detailsTarget.innerHTML = ''
      this.editFormTarget.innerHTML = ''
    } catch (error) {
      console.error('Error deleting employee:', error)
    }
  }
}
