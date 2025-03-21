class Employee < ApplicationRecord
  has_many :employee_schedules
  has_many :schedules, through: :employee_schedules

  validates :name, presence: true
end
