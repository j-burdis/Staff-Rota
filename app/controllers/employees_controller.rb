class EmployeesController < ApplicationController
  before_action :set_employee, only: %i[show edit update destroy deactivate reactivate]

  def index
    @employees = Employee.all.order(active: :desc, id: :asc)
    @new_employee = Employee.new
  end

  def new
    @employee = Employee.new

    respond_to do |format|
      format.html { render layout: request.xhr? ? false : 'application' }
    end
  end

  def create
    @employee = Employee.new(employee_params)

    if @employee.save
      respond_to do |format|
        format.html {
          if request.xhr?
            render json: { success: true }
          else
            redirect_to employees_path, notice: 'Employee successfully created.'
          end
        }
      end
    else
      respond_to do |format|
        format.html {
          if request.xhr?
            render :new, layout: false, status: :unprocessable_entity
          else
            render :new, status: :unprocessable_entity
          end
        }
      end
    end
  end

  def show
    respond_to(&:html)
  end

  def edit
  end

  def update
    if @employee.update(employee_params)
      respond_to do |format|
        format.html { render :show }
      end
    else
      respond_to do |format|
        format.html { render :show, status: :unprocessable_entity }
      end
    end
  end

  def deactivate
    if @employee.update(active: false)
      respond_to do |format|
        format.html { render :show }
      end
    else
      redirect_to employee_path(@employee), alert: 'Could not deactivate employee.'
    end
  end

  def reactivate
    if @employee.update(active: true)
      respond_to do |format|
        format.html { render :show }
      end
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
