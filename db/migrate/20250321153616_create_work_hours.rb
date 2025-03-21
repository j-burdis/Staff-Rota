class CreateWorkHours < ActiveRecord::Migration[7.2]
  def change
    create_table :work_hours do |t|
      t.string :day_of_week, null: false
      t.decimal :hours, precision: 4, scale: 2, default: 7.0, null: false

      t.timestamps
    end
    
    add_index :work_hours, :day_of_week, unique: true
  end
end
