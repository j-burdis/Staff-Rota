class EmployeeSchedule < ApplicationRecord
  belongs_to :employee
  belongs_to :schedule

  validates :employee_id, uniqueness: { scope: :schedule_id }
end
