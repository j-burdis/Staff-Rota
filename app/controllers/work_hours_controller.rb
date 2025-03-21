class WorkHoursController < ApplicationController
  def index
    @work_hours = WorkHour.order(:id)
  end

  def edit
    @work_hours = WorkHour.order(:id)
  end

  def update
    success = true

    params[:work_hours].each do |id, work_hour_params|
      work_hour = WorkHour.find(id)
      success = work_hour.update(hours: work_hour_params[:hours]) && success
    end

    if success
      redirect_to work_hours_path, notice: 'Default hours were successfully updated.'
    else
      redirect_to edit_work_hours_path, alert: 'There was an error updating the default hours.'
    end
  end
end
