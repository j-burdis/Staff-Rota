class EmployeesController < ApplicationController
  before_action :set_employee, only: %i[show edit update destroy deactivate reactivate]

  def index
    @employees = Employee.all
    @new_employee = Employee.new
  end

  def new
    @employee = Employee.new
  end

  def create
    @employee = Employee.new(employee_params)

    if @employee.save
      redirect_to employees_path, notice: 'Employee successfully created.'
    else
      render :new, status: :unprocessable_entity
    end
  end

  def show
  end

  def edit
    render layout: false
  end

  def update
    # if @employee.update(employee_params)
    #   redirect_to employees_path, notice: 'Employee successfully updated.'
    # else
    #   render :edit
    # end
    if @employee.update(employee_params)
      render 'show', layout: false
    else
      render 'edit', layout: false, status: :unprocessable_entity
    end
  end

  def deactivate
    if @employee.update(active: false)
      redirect_to employees_path, notice: 'Employee was successfully deactivated.'
    else
      redirect_to employee_path(@employee), alert: 'Could not deactivate employee.'
    end
  end

  def reactivate
    if @employee.update(active: true)
      redirect_to employees_path, notice: 'Employee was successfully reactivated.'
    else
      redirect_to employee_path(@employee), alert: 'Could not reactivate employee.'
    end
  end

  def destroy
    if @employee.destroy
      redirect_to employees_path, notice: 'Employee permanently deleted.'
    else
      redirect_to employee_path(@employee), alert: 'Could not delete employee.'
    end
  end

  private

  def set_employee
    @employee = Employee.find(params[:id])

    if @employee.nil?
      flash[:alert] = 'Employee not found.'
      redirect_to employees_path
    end
  end

  def employee_params
    params.require(:employee).permit(:name, :active)
  end
end
