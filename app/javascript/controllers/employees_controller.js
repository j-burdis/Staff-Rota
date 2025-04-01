// app/javascript/controllers/employees_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [ "list", "details", "editForm", "nameInput", "statusCheckbox" ]
  static values = { selectedEmployeeId: Number }

  connect() {
    // Ensure the name input is always disabled by default
    if (this.hasNameInputTarget) {
      this.nameInputTarget.disabled = true
    }

    // Show placeholder initially if no employee is selected
    if (!this.selectedEmployeeIdValue) {
      this.showPlaceholder();
    }

    this.element.addEventListener('change', event => {
      if (event.target.name === 'employee[active]') {
        this.updateStatusLabel(event.target);
      }
    });
  }

  showPlaceholder() {
    this.detailsTarget.innerHTML = `
      <div class="employee-placeholder">
        <div class="placeholder-icon">👤</div>
        <h3>Select an employee</h3>
        <p>Click on an employee from the list to view their details</p>
      </div>
    `;
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
    
    // Make sure to include the name from our input field
    if (this.hasNameInputTarget) {
      formData.set('employee[name]', this.nameInputTarget.value)
    }

    // Include the active status from our checkbox
    if (this.hasStatusCheckboxTarget) {
      const checkbox = this.statusCheckboxTarget.querySelector('input[type="checkbox"]')
      if (checkbox) {
        formData.set('employee[active]', checkbox.checked ? '1' : '0')
      }
    }
  
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
      const listItemWrapper = listItem.closest('.employees-list-item').querySelector('.employees-list-item-wrapper')
      const nameElement = listItemWrapper.querySelector('.employees-list-item-name')
      const statusElement = listItemWrapper.querySelector('.employees-list-item-status-active, .employees-list-item-status-inactive')
      
      // Determine the current active status from the details view
      const detailsStatusElement = this.detailsTarget.querySelector('.employee-status')
      const isCurrentlyActive = detailsStatusElement.classList.contains('employees-list-item-status-active')
  
      // Update name element (without the status text)
      nameElement.classList.toggle('inactive', !isCurrentlyActive)
      const nameText = this.detailsTarget.querySelector('.employees-show-title').value
      nameElement.textContent = nameText
  
      // Update status element
      if (statusElement) {
        statusElement.remove() // Remove the old status element
      }
      
      // Create and append the new status element
      const newStatusElement = document.createElement('span')
      if (isCurrentlyActive) {
        newStatusElement.className = 'employees-list-item-status-active'
        newStatusElement.textContent = 'Active'
      } else {
        newStatusElement.className = 'employees-list-item-status-inactive'
        newStatusElement.textContent = 'Inactive'
      }
      listItemWrapper.appendChild(newStatusElement)
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
    
    // Show status checkbox
    if (this.hasStatusCheckboxTarget) {
      this.statusCheckboxTarget.classList.remove('hidden')
      
      // Add an event listener to update the status text when checkbox changes
      const checkbox = this.statusCheckboxTarget.querySelector('input[type="checkbox"]')
      if (checkbox) {
        checkbox.addEventListener('change', this.updateStatusTextFromCheckbox.bind(this))
      }
    }
  }

  cancelEdit(event) {
    event.preventDefault()
    const editActions = this.element.querySelector('.employees-show-actions .edit-actions')
    const defaultActions = this.element.querySelector('.employees-show-actions .default-actions')
  
    // Hide edit actions, show default actions
    editActions.classList.add('hidden')
    defaultActions.classList.remove('hidden')
  
    // Disable name input and reset to original value
    if (this.hasNameInputTarget) {
      this.nameInputTarget.disabled = true
      
      // Get the current employee data to reset the field if needed
      const employeeId = this.selectedEmployeeIdValue
      const employeeItem = this.listTarget.querySelector(`[data-employee-id="${employeeId}"]`)
      if (employeeItem) {
        const nameElement = employeeItem.closest('.employees-list-item').querySelector('.employees-list-item-name')
        this.nameInputTarget.value = nameElement.textContent.trim()
      }
    }
    
    // Hide status checkbox and reset status display to original state
    if (this.hasStatusCheckboxTarget) {
      this.statusCheckboxTarget.classList.add('hidden')
      
      // Reset checkbox and status display to match the original state
      const employeeId = this.selectedEmployeeIdValue
      const listItem = this.listTarget.querySelector(`[data-employee-id="${employeeId}"]`)
      
      if (listItem) {
        const listItemWrapper = listItem.closest('.employees-list-item').querySelector('.employees-list-item-wrapper')
        const statusElement = this.element.querySelector('.employee-status')
        const checkbox = this.statusCheckboxTarget.querySelector('input[type="checkbox"]')
        
        // Determine if the employee is active by checking the status in the list view
        const isActive = listItemWrapper.querySelector('.employees-list-item-status-active') !== null
        
        // Update checkbox
        if (checkbox) {
          checkbox.checked = isActive
        }
        
        // Reset status element to match
        if (statusElement) {
          if (isActive) {
            statusElement.textContent = 'Active'
            statusElement.classList.remove('employees-list-item-status-inactive')
            statusElement.classList.add('employees-list-item-status-active')
          } else {
            statusElement.textContent = 'Inactive'
            statusElement.classList.remove('employees-list-item-status-active')
            statusElement.classList.add('employees-list-item-status-inactive')
          }
        }
      }
    }
  }

  updateStatusTextFromCheckbox(event) {
    const checkbox = event.target
    const statusElement = this.element.querySelector('.employee-status')
    
    if (statusElement) {
      if (checkbox.checked) {
        statusElement.textContent = 'Active'
        statusElement.classList.remove('employees-list-item-status-inactive')
        statusElement.classList.add('employees-list-item-status-active')
      } else {
        statusElement.textContent = 'Inactive'
        statusElement.classList.remove('employees-list-item-status-active')
        statusElement.classList.add('employees-list-item-status-inactive')
      }
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

  showNewEmployeeForm(event) {
    event.preventDefault()
    
    // Clear any existing employee details and forms
    this.detailsTarget.innerHTML = ''
    this.editFormTarget.innerHTML = ''
    
    // Fetch the new employee form
    fetch('/employees/new', {
      headers: {
        'Accept': 'text/html'
      }
    })
    .then(response => response.text())
    .then(html => {
      // Load the form into the details area
      this.detailsTarget.innerHTML = `
          <h3>Add New Employee</h3>
          ${html}
      `
    })
    .catch(error => {
      console.error('Error loading new employee form:', error)
    })
  }
  
  createEmployee(event) {
    event.preventDefault()
    const form = event.target
    const formData = new FormData(form)
  
    fetch('/employees', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'text/html',
        'X-CSRF-Token': this.getCsrfToken()
      }
    })
    .then(response => {
      if (response.ok) {
        // Reload the entire page to update the employee list
        window.location.reload()
      } else {
        // Handle validation errors
        return response.text().then(html => {
          this.detailsTarget.innerHTML = `
            <div class="employees-show-container">
              <h3>Add New Employee</h3>
              ${html}
            </div>
          `
        })
      }
    })
    .catch(error => {
      console.error('Error creating employee:', error)
    })
  }

  cancelNewForm(event) {
    event.preventDefault()
    // Clear the form  and show placeholder
    this.showPlaceholder();
  }

  updateStatusText(event) {
    const checkbox = event.target;
    const statusElement = checkbox.closest('.employees-show-status').querySelector('.employee-status');
    
    if (statusElement) {
      if (checkbox.checked) {
        statusElement.textContent = 'Active';
        statusElement.classList.remove('employees-list-item-status-inactive');
        statusElement.classList.add('employees-list-item-status-active');
      } else {
        statusElement.textContent = 'Inactive';
        statusElement.classList.remove('employees-list-item-status-active');
        statusElement.classList.add('employees-list-item-status-inactive');
      }
    }
  }
}
