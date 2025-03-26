class Employee < ApplicationRecord
  has_many :employee_schedules
  has_many :schedules, through: :employee_schedules

  validates :name,
            presence: true,
            length: { minimum: 2, maximum: 100 },
            format: {
              with: /\A[a-zA-Z\s'-]+\z/,
              message: "can only contain letters, spaces, hyphens, and apostrophes"
            }

  # Scope to get active employees
  scope :active, -> { where(active: true) }

  # Scope to get inactive employees
  scope :inactive, -> { where(active: false) }
end
