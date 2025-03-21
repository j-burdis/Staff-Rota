class SchedulesController < ApplicationController
  before_action :set_schedule, only: %i[show edit update]
  def index
    @year = params[:year].present? ? params[:year].to_i : Date.current.year
    @month = params[:month].present? ? params[:month].to_i : Date.current.month

    @date = Date.new(@year, @month, 1)
    @previous_month = @date.prev_month
    @next_month = @date.next_month

    # Get all days in the selected month
    @days = (@date.beginning_of_month..@date.end_of_month).to_a

    # Preload existing schedules for this month
    @schedules = Schedule.where(date: @days).includes(:employees)
                        .index_by(&:date)
  end

  def show
    @employees = Employee.where(active: true).order(:name)
    @assigned_employee_ids = @schedule.employees.pluck(:id)
  end

  def edit
    @employees = Employee.where(active: true).order(:name)
    @assigned_employee_ids = @schedule.employees.pluck(:id)
  end

  def update
    employee_ids = params[:employee_ids] || []

    # Begin a transaction to ensure all changes are atomic
    ActiveRecord::Base.transaction do
      # Remove employees not in the new list
      @schedule.employee_schedules.where.not(employee_id: employee_ids).destroy_all

      # Add new employees
      employee_ids.each do |employee_id|
        next if @schedule.employee_schedules.exists?(employee_id: employee_id)

        # Create with default hours for that day
        @schedule.employee_schedules.create!(
          employee_id: employee_id,
          hours_worked: @schedule.default_hours
        )
      end
    end

    respond_to do |format|
      format.html { redirect_to schedule_path(@schedule), notice: 'Schedule was successfully updated.' }
      format.json { render json: { success: true } }
    end
  end

  private

  def set_schedule
    @schedule = Schedule.find_by(date: params[:id])

    return if @schedule

    # Create the schedule if it doesn't exist
    @schedule = Schedule.create!(date: params[:id])
  end
end
