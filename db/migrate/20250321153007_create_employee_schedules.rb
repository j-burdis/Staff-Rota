class CreateEmployeeSchedules < ActiveRecord::Migration[7.2]
  def change
    create_table :employee_schedules do |t|
      t.references :employee, null: false, foreign_key: true
      t.references :schedule, null: false, foreign_key: true
      t.decimal :hours_worked, precision: 4, scale: 2

      t.timestamps
    end

    add_index :employee_schedules, [:employee_id, :schedule_id], unique: true
  end
end
