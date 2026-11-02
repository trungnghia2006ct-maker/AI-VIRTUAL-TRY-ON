# Đối chiếu điều khoản nhà cung cấp AI

Ngày kiểm tra: 2026-10-31. Đây là ghi chú kỹ thuật, không phải tư vấn pháp lý. Cần xem lại khi điều khoản thay đổi.

## 1. Gemini API (gói miễn phí / Unpaid Services)

Nguồn: https://ai.google.dev/gemini-api/terms (điều khoản hiệu lực 2026-03-23, trang cập nhật 2026-04-28 UTC).

| Chủ đề | Phát hiện |
| --- | --- |
| Dùng dữ liệu để cải thiện sản phẩm | Với Unpaid Services, Google có thể dùng nội dung gửi lên và phản hồi để "provide, improve, and develop" sản phẩm và công nghệ học máy. Gói trả phí thì Google nêu không dùng prompt/phản hồi để cải thiện sản phẩm. |
| Người đọc dữ liệu | Với Unpaid Services, "human reviewers may read, annotate, and process your API input and output". Dữ liệu được tách khỏi tài khoản Google, API key và Cloud project trước khi xem xét. |
| Thời gian lưu giữ | Trang không nêu thời hạn cố định cho prompt/phản hồi thông thường. Chỉ nêu thời hạn cho các tính năng khác (ví dụ Grounding 30 ngày). |
| Dữ liệu nhạy cảm | "Do not submit sensitive, confidential, or personal information to the Unpaid Services." |
| Độ tuổi | "You must be 18 years of age or older to use the APIs." API client không được hướng tới hoặc có khả năng bị người dưới 18 tuổi truy cập. |
| Khu vực | Chỉ được dùng Paid Services khi cung cấp API client cho người dùng ở Khu vực Kinh tế Châu Âu (EEA); điều khoản nêu tương tự cho Thụy Sĩ và Vương quốc Anh. |
| Mục đích sử dụng | Giới hạn cho mục đích nghề nghiệp hoặc kinh doanh, không phải tiêu dùng cá nhân. |
| Nghĩa vụ thông báo cho người dùng cuối | Trang không nêu yêu cầu thông báo hay xin đồng ý cụ thể. Nhưng việc gửi ảnh người dùng lên gói miễn phí vẫn cần được người dùng biết rõ (xem mục rủi ro). |

### Rủi ro cho dự án này
- Ảnh toàn thân của khách là dữ liệu cá nhân. Điều khoản gói miễn phí cấm gửi thông tin cá nhân lên Unpaid Services và cho phép người đánh giá đọc dữ liệu. Dùng gói miễn phí cho ứng dụng hướng tới khách hàng thật là mâu thuẫn với điều khoản này.
- Ứng dụng chưa chặn người dưới 18 tuổi và chưa chặn người dùng ở EEA/UK/Thụy Sĩ.
- Khuyến nghị: chỉ dùng gói miễn phí cho thử nghiệm nội bộ/demo với ảnh người mẫu hoặc ảnh của chính người thử. Trước khi mở cho khách thật, chuyển sang gói trả phí (Cloud Project có billing) hoặc dùng provider khác. Cần tham khảo ý kiến pháp lý.

## 2. Hugging Face IDM-VTON (Space `yisol/IDM-VTON`)

- Nguồn: https://huggingface.co/spaces/yisol/IDM-VTON. Đã đọc được: Space chạy trên phần cứng "Running on Zero" (ZeroGPU).
- **Chưa xác minh được:** giấy phép và điều khoản sử dụng của Space/mô hình (trang không cung cấp qua lần đọc này; README của dự án chỉ nhắc cần kiểm tra giấy phép trước khi dùng thương mại). Cần xem tab Files (LICENSE/README) và model card.
- **Chưa xác minh được:** chính sách quyền riêng tư của Hugging Face (https://huggingface.co/privacy). Lần đọc bị chặn do lỗi mạng/chính sách. Cần đọc lại thủ công.
- **Chưa xác minh được:** việc Space công khai có lưu ảnh gửi lên hay không, và thời hạn lưu giữ. Vì Space do bên thứ ba vận hành, không nên cam kết gì về xử lý ảnh sau khi gửi đi.

## 3. Việc cần người phụ trách làm
1. Quyết định gói Gemini dùng cho môi trường thật (miễn phí chỉ nên dùng cho thử nghiệm).
2. Đọc license của IDM-VTON và chính sách quyền riêng tư của Hugging Face, cập nhật mục 2.
3. Chốt thời gian giữ metadata, kênh liên hệ yêu cầu xóa, và nếu cần, cơ chế chặn dưới 18 tuổi/EEA.
