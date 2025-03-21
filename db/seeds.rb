# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Create default work hours for each day of the week
[
  { day_of_week: 'sunday', hours: 5.5 },
  { day_of_week: 'monday', hours: 7.0 },
  { day_of_week: 'tuesday', hours: 7.0 },
  { day_of_week: 'wednesday', hours: 7.0 },
  { day_of_week: 'thursday', hours: 7.0 },
  { day_of_week: 'friday', hours: 7.0 },
  { day_of_week: 'saturday', hours: 7.0 }
].each do |work_hour_data|
  WorkHour.find_or_create_by!(day_of_week: work_hour_data[:day_of_week]) do |wh|
    wh.hours = work_hour_data[:hours]
  end
end

# Add some sample employees if needed
if Rails.env.development? && Employee.count == 0
  [
    { name: 'Su' },
    { name: 'Michelle' },
    { name: 'Iryna' },
    { name: 'Leona' },
    { name: 'Nikki' },
    { name: 'Jon' },
    { name: 'Mal' },
    { name: 'Tom' }
  ].each do |employee_data|
    Employee.create!(employee_data)
  end
end
