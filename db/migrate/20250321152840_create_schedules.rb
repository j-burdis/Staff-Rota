class CreateSchedules < ActiveRecord::Migration[7.2]
  def change
    create_table :schedules do |t|
      t.date :date, null: false
      t.text :notes

      t.timestamps
    end

    add_index :schedules, :date, unique: true
  end
end
