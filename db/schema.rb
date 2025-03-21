# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2025_03_21_153616) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "employee_schedules", force: :cascade do |t|
    t.bigint "employee_id", null: false
    t.bigint "schedule_id", null: false
    t.decimal "hours_worked", precision: 4, scale: 2
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["employee_id", "schedule_id"], name: "index_employee_schedules_on_employee_id_and_schedule_id", unique: true
    t.index ["employee_id"], name: "index_employee_schedules_on_employee_id"
    t.index ["schedule_id"], name: "index_employee_schedules_on_schedule_id"
  end

  create_table "employees", force: :cascade do |t|
    t.string "name", null: false
    t.boolean "active", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "schedules", force: :cascade do |t|
    t.date "date", null: false
    t.text "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["date"], name: "index_schedules_on_date", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  create_table "work_hours", force: :cascade do |t|
    t.string "day_of_week", null: false
    t.decimal "hours", precision: 4, scale: 2, default: "7.0", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["day_of_week"], name: "index_work_hours_on_day_of_week", unique: true
  end

  add_foreign_key "employee_schedules", "employees"
  add_foreign_key "employee_schedules", "schedules"
end
