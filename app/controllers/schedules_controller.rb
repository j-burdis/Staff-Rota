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
    @schedules = Schedule.where(date: @days)
                         .includes(employee_schedules: :employee)
                         .index_by(&:date)
  end

  def show
    @employees = Employee.where(active: true).order(:name)
    @assigned_employee_ids = @schedule.employees.pluck(:id)

    respond_to do |format|
      format.html # Regular HTML response
      format.turbo_frame { render partial: "edit_panel", formats: [:html] }
    end
  end

  def edit
    @employees = Employee.where(active: true).order(:name)
    @assigned_employee_ids = @schedule.employees.pluck(:id)
  end

  def update
    # Find or create the schedule for the specific date
    @schedule = Schedule.find_or_create_by(date: params[:id])

    # Ensure we have the correct month and year for context
    @month = @schedule.date.month
    @year = @schedule.date.year

    # Normalize employee_ids to an array, defaulting to empty array
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

    # Reload the schedule to get updated employees
    @schedule.reload

    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: turbo_stream.replace(
          "day-#{@schedule.date}", 
          partial: 'day', 
          locals: { 
            date: @schedule.date, 
            month: @month,
            schedule: @schedule
          }
        )
      end

      format.html do
        redirect_to schedule_path(@schedule), 
                    notice: 'Schedule was successfully updated.'
      end
    end
  rescue ActiveRecord::RecordInvalid => e
    # Handle validation errors
    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: turbo_stream.replace(
          "schedule-edit-panel",
          partial: 'edit_panel',
          locals: { 
            schedule: @schedule,
            error: e.message 
          }
        )
      end

      format.html do
        render :edit, status: :unprocessable_entity
      end
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
