# Trang thử đồ 3D bổ sung

Mở `/thu-do-3d`, API proxy `/api/nhom07-3d`. Chạy bằng
`python3 ~/Downloads/nhom07_ai3d/start_web.py --repo DUONG_DAN_WEB`.

Trang dùng CSS đã biên dịch và scoped `.nhom07-ai3d-scope`, import tương đối,
không phụ thuộc SiteHeader, alias @ hay theme Tailwind của repo cũ.
Chỉ cần React/Next.js và Three.js; các route cũ không bị thay thế.

Model áo giữ nguyên checkpoint PCA+MLP trên TailorNet. Dáng cm/kg là ước lượng
thể tích, chưa phải nhân trắc được xác thực hay đánh giá size/chật/rộng thật.
SMPL/cache để ngoài repo trong kit local; không tự công khai các file này.
