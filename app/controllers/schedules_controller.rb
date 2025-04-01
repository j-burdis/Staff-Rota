class SchedulesController < ApplicationController
  before_action :set_schedule, only: %i[show edit update]
  def index
    @year = params[:year].present? ? params[:year].to_i : Date.current.year
    @month = params[:month].present? ? params[:month].to_i : Date.current.month

    @selected_year = @year
    @selected_month = @month

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
    @employees = Employee.where(active: true).order(active: :desc, id: :asc)
    @assigned_employee_ids = @schedule.employees.pluck(:id)

    respond_to do |format|
      format.html { render partial: 'edit_panel', layout: false, formats: [:html] }
    end
  end

  def edit
    @employees = Employee.where(active: true)
    @assigned_employee_ids = @schedule.employees.pluck(:id)
  end

  def update
    # Find or create the schedule for the specific date
    @schedule = Schedule.find_or_create_by(date: params[:id])

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

    # Prepare response data
    response_data = {
      employees: @schedule.employees.map do |employee|
        {
          id: employee.id,
          name: employee.name
        }
      end
    }

    # Respond with JSON for the Stimulus controller
    render json: response_data
  rescue ActiveRecord::RecordInvalid => e
    # Render error response
    render json: { 
      error: e.message 
    }, status: :unprocessable_entity
  end

  private

  def set_schedule
    @schedule = Schedule.find_by(date: params[:id])

    return if @schedule

    # Create the schedule if it doesn't exist
    @schedule = Schedule.create!(date: params[:id])
  end
end
