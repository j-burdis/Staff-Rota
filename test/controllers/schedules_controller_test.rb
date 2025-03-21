require "test_helper"

class SchedulesControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get schedules_index_url
    assert_response :success
  end

  test "should get show" do
    get schedules_show_url
    assert_response :success
  end

  test "should get edit" do
    get schedules_edit_url
    assert_response :success
  end

  test "should get update" do
    get schedules_update_url
    assert_response :success
  end
end
