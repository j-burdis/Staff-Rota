# frozen_string_literal: true

class Users::RegistrationsController < Devise::RegistrationsController
  # before_action :configure_sign_up_params, only: [:create]
  # before_action :configure_account_update_params, only: [:update]

  # GET /resource/sign_up
  # def new
  #   super
  # end

  # POST /resource
  # def create
  #   super
  # end

  # GET /resource/edit
  # def edit
  #   super
  # end

  # PUT /resource
  # def update
  #   super
  # end

  # DELETE /resource
  # def destroy
  #   super
  # end

  # GET /resource/cancel
  # Forces the session data which is usually expired after sign
  # in to be expired now. This is useful if the user wants to
  # cancel oauth signing in/up in the middle of the process,
  # removing all OAuth session data.
  # def cancel
  #   super
  # end

  # protected

  # If you have extra params to permit, append them to the sanitizer.
  # def configure_sign_up_params
  #   devise_parameter_sanitizer.permit(:sign_up, keys: [:attribute])
  # end

  # If you have extra params to permit, append them to the sanitizer.
  # def configure_account_update_params
  #   devise_parameter_sanitizer.permit(:account_update, keys: [:attribute])
  # end

  # The path used after sign up.
  # def after_sign_up_path_for(resource)
  #   super(resource)
  # end

  # The path used after sign up for inactive accounts.
  # def after_inactive_sign_up_path_for(resource)
  #   super(resource)
  # end

  # def new
  #   # Explicitly build the resource
  #   self.resource = resource_class.new(sign_up_params)
    
  #   respond_to do |format|
  #     format.html { 
  #       # Explicitly render the template with the current layout
  #       render template: 'devise/registrations/new', layout: false 
  #     }
  #   end
  # end

  def new
    build_resource({})

    respond_to do |format|
      format.html { render 'new' }
      format.turbo_frame { 
        render 'new', 
               layout: false # Important for Turbo Frame requests
      }
    end
  end

  # skip_before_action :require_no_authentication, only: [:new, :create]

  # def new
  #   # Explicit logging for debugging
  #   Rails.logger.debug "RegistrationsController#new called"
  #   Rails.logger.debug "Request formats: #{request.formats.inspect}"
  #   Rails.logger.debug "Current view paths: #{lookup_context.view_paths.inspect}"

  #   # Explicitly build the resource
  #   build_resource({})

  #   respond_to do |format|
  #     format.html { 
  #       # Try multiple rendering approaches
  #       begin
  #         render 'new'
  #       rescue ActionView::MissingTemplate => e
  #         Rails.logger.error "Missing template error: #{e.message}"
  #         render plain: "Template not found. Searched in: #{lookup_context.view_paths.map(&:to_s)}"
  #       end
  #     }
  #   end
  # end

  def create
    build_resource(sign_up_params)

    if resource.save
      sign_in(resource_name, resource)
      respond_to do |format|
        format.html { respond_with resource, location: after_sign_up_path_for(resource) }
        format.turbo_frame { 
          redirect_to after_sign_up_path_for(resource) 
        }
      end
    else
      respond_to do |format|
        format.html {
          clean_up_passwords resource
          set_minimum_password_length
          respond_with resource
        }
        format.turbo_frame { 
          render 'new', 
                 layout: false, 
                 status: :unprocessable_entity 
        }
      end
    end
  end

  private

  # Optional: Add this to help debug
  def sign_up_params
    params.require(resource_name).permit(:email, :password, :password_confirmation)
  end
end
