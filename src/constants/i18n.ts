
/**
 * Translation constants for PigFarm Pro
 * Contains all UI strings for Dashboard, Audit, and Admin views
 */
export const T = {
  // Navigation
  nav: {
    dashboard: "BÁO CÁO",
    audit: "KIỂM TRA",
    admin: "HỆ THỐNG",
    live_sync: "ĐỒNG BỘ TRỰC TUYẾN"
  },
  // Dashboard
  dash: {
    title: "Phân Tích Intel",
    subtitle: "Chỉ số tuân thủ doanh nghiệp thời gian thực",
    compliance: "Độ tuân thủ",
    critical_fails: "Vi phạm nghiêm trọng",
    audits_today: "Lượt khám hôm nay",
    total_photos: "Tổng số ảnh bằng chứng",
    ranking: "Xếp hạng hiệu suất trang trại",
    adherence: "Tuân thủ theo giao thức",
    trend: "Xu hướng tuân thủ (7 ngày)",
    gaps: "Lỗ hổng an toàn nghiêm trọng nhất",
    requirement: "Hạng mục yêu cầu",
    incidents: "Số lần vi phạm",
    refresh: "Cập nhật dữ liệu",
    sync_error: "Không thể kết nối máy chủ dữ liệu",
    resync: "THỬ LẠI NGAY",
    loading: "Đang phân tích dữ liệu hiện trường...",
    ai_vector: "Véc-tơ Chiến lược AI",
    status_insight: "Phân tích Trạng thái"
  },
  // Audit
  audit: {
    mode: "Chế độ Vận hành Hiện trường",
    title: "Danh mục Kiểm tra",
    compliance: "Tuân thủ",
    progress: "Tiến độ",
    requirements: "Yêu cầu",
    critical_trigger: "Kích hoạt Quy tắc An ninh Nghiêm trọng",
    critical_limit: "Điểm bị giới hạn ở mức {limit}% do có vi phạm rủi ro cao.",
    commit: "GỬI BÁO CÁO & KẾT THÚC",
    archiving: "ĐANG LƯU DỮ LIỆU...",
    success: "Đã gửi báo cáo kiểm tra thành công!",
    error: "Lỗi khi lưu báo cáo kiểm tra",
    select_farm_auditor: "Vui lòng chọn Trang trại và nhập tên Người kiểm tra trong phần Hệ thống",
    sync_failed: "Không thể tải danh mục kiểm tra",
    reinitialize: "KHỞI TẠO LẠI",
    calibrating: "Đang hiệu chuẩn các tiêu chuẩn kỹ thuật...",
    pass: "ĐẠT",
    fail: "KHÔNG ĐẠT",
    notes_placeholder: "Ghi chú chi tiết hoặc lý do vi phạm...",
    add_photo: "Chụp ảnh minh chứng hiện trường",
    uploading: "Đang tải ảnh...",
    no_items: "Không có hạng mục nào để kiểm tra.",
    select_farm: "Hãy chọn trang trại trong phần Hệ thống để bắt đầu."
  },
  // Admin
  admin: {
    console: "Bảng điều khiển Trung tâm",
    title: "Cấu hình Hệ thống",
    logic_tab: "Logic Chấm điểm",
    checklist_tab: "Danh mục Tổng",
    securing: "Đang xác thực quyền truy cập...",
    master_synced: "Đã đồng bộ Danh mục Tổng thành công!",
    logic_updated: "Đã cập nhật logic chấm điểm toàn hệ thống!",
    module_importance: "Tầm quan trọng của Module",
    assign_weights: "Gán trọng số để ưu tiên các giao thức cụ thể.",
    weight: "Trọng số",
    logic_settings: "Cài đặt Logic",
    critical_override: "Ghi đè Vi phạm Nghiêm trọng",
    critical_desc: "Giới hạn điểm tối đa nếu có bất kỳ mục 'Nghiêm trọng' nào thất bại.",
    score_caps: "Giới hạn & Ngưỡng điểm",
    critical_cap: "Trần điểm rủi ro (%)",
    green_threshold: "Ngưỡng đạt chuẩn (Xanh %)",
    sync_logic: "ĐỒNG BỘ LOGIC HỆ THỐNG",
    updating: "ĐANG CẬP NHẬT...",
    add_item: "Thêm hạng mục mới",
    export: "Xuất dữ liệu",
    sync_sheet: "Lưu lên Google Sheet",
    col_module: "Module",
    col_title: "Hạng mục",
    col_desc: "Mô tả chi tiết",
    col_risk: "Mức rủi ro",
    col_weight: "Trọng số",
    confirm_delete: "Bạn có chắc chắn muốn xóa hạng mục này không?"
  },
  // Error Card
  error: {
    sync_interrupted: "Mất kết nối đồng bộ",
    check_connection: "Vui lòng kiểm tra kết nối internet của bạn và thử lại.",
    retry: "THỬ LẠI"
  }
};
