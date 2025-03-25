# frozen_string_literal: true

class Users::SessionsController < Devise::SessionsController
  # before_action :configure_sign_in_params, only: [:create]

  # GET /resource/sign_in
  # def new
  #   super
  # end

  # POST /resource/sign_in
  # def create
  #   super
  # end

  # DELETE /resource/sign_out
  # def destroy
  #   super
  # end

  # protected

  # If you have extra params to permit, append them to the sanitizer.
  # def configure_sign_in_params
  #   devise_parameter_sanitizer.permit(:sign_in, keys: [:attribute])
  # end

  def create
    self.resource = warden.authenticate!(auth_options)
    
    respond_to do |format|
      format.html do
        set_flash_message!(:notice, :signed_in)
        sign_in(resource_name, resource)
        yield resource if block_given?
        respond_with resource, location: after_sign_in_path_for(resource)
      end
      
      format.turbo_stream do
        # Ensure the user is signed in
        sign_in(resource_name, resource)
        
        # Render a Turbo Stream that forces a full page reload to the root path
        render turbo_stream: <<-HTML
          <turbo-stream action="replace" target="body">
            <template>
              <meta name="turbo-visit-control" content="reload">
              <script>
                Turbo.visit('#{root_path}', { action: 'replace' });
              </script>
            </template>
          </turbo-stream>
        HTML
      end
    end
  end

  def destroy
    signed_out = (Devise.sign_out_all_scopes ? sign_out : sign_out(resource_name))
    
    respond_to do |format|
      format.html do
        set_flash_message! :notice, :signed_out if signed_out
        yield if block_given?
        respond_with_navigational(resource){ redirect_to after_sign_out_path_for(resource_name) }
      end
      
      format.turbo_stream do
        flash[:notice] = "Signed out successfully."
        
        # Use Turbo Stream to replace the entire body with a redirect
        render turbo_stream: <<-HTML
          <turbo-stream action="replace" target="body">
            <template>
              <meta name="turbo-visit-control" content="reload">
              <script>
                Turbo.visit('#{root_path}');
              </script>
            </template>
          </turbo-stream>
        HTML
      end
    end
  end
end
