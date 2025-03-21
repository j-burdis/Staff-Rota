class Schedule < ApplicationRecord
  has_many :employee_schedules, dependent: :destroy
  has_many :employees, through: :employee_schedules

  validates :date, presence: true, uniqueness: true

  def day_of_week
    date.strftime("%A")
  end

  def day_number
    date.day
  end

  def default_hours
    day_name = day_of_week.downcase
    WorkHour.find_by(day_of_week: day_name)&.hours || 7.0
  end
end
