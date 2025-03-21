require "test_helper"

class WorkHoursControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get work_hours_index_url
    assert_response :success
  end

  test "should get edit" do
    get work_hours_edit_url
    assert_response :success
  end

  test "should get update" do
    get work_hours_update_url
    assert_response :success
  end
end
