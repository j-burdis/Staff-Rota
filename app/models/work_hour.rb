class WorkHour < ApplicationRecord
  validates :day_of_week, presence: true, uniqueness: true
  validates :hours, presence: true, numericality: { greater_than: 0 }
end
