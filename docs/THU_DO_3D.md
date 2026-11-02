# Thử áo 3D — bản demo theo cm/kg

Trang `/thu-do-3d` nhận Nam/Nữ, chiều cao và cân nặng, tính BMI, gọi dịch vụ
model của nhóm rồi hiển thị người + áo bằng Three.js. Có xoay, phóng to,
góc trước/nghiêng/sau, bốn màu hiển thị và tải GLB. Nút **Thử 3D** trên header
mở trang này. Các route thử đồ 2D giữ nguyên.

## Chạy trên máy của Nghĩa

Trong repo này cài thư viện bằng `npm ci`. Giữ bộ `nhom07_ai3d` đang chạy được
trong Downloads, ngoài repo. Mở Terminal tại thư mục repo và chạy:

```bash
python3 "$HOME/Downloads/nhom07_ai3d/start_web.py" --repo "$PWD"
```

Launcher mở dịch vụ model bằng Python/NumPy đi kèm Blender và Next.js.
Địa chỉ mặc định là `http://localhost:3000/thu-do-3d`; nếu cổng đang bận,
dùng đúng URL launcher in ra. Giữ Terminal mở, Ctrl+C dừng cả hai dịch vụ.
Đường dẫn kit khác thì thay phần đường dẫn tương ứng.

## Chạy trên máy thành viên khác

Repo chứa frontend và API proxy; **không chứa checkpoint, bộ SMPL hay cache
SMPL đã chuyển đổi**. Thành viên cần bộ runtime/model `nhom07_ai3d` của nhóm,
Blender, Python 3, Node/npm, Git và bản SMPL mà họ được quyền sử dụng.
Trao đổi dữ liệu/model riêng trong nhóm theo giấy phép của từng nguồn.
Sau khi chuẩn bị SMPL theo README của kit, dùng lệnh launcher ở trên.

Nếu chỉ chạy `npm run dev`, giao diện vẫn mở nhưng cần `AI3D_SERVICE_URL`
phía server để tạo mô hình. Ví dụ khi model chạy cùng máy tại cổng 8013:

```dotenv
AI3D_SERVICE_URL=http://127.0.0.1:8013
```

Đặt trong `.env.local`, khởi động lại Next.js. Launcher tự thiết lập biến này
khi khởi động web. Không dùng tiền tố `NEXT_PUBLIC_`.

## API và triển khai

- Trình duyệt POST `/api/nhom07-3d` với JSON
  `{"gender":"male","height_cm":173,"weight_kg":76}`.
- Proxy kiểm tra dữ liệu rồi POST `${AI3D_SERVICE_URL}/predict`; kết quả là
  GLB (`model/gltf-binary`) có hai mesh Body/TShirt và metadata số đo.
- GET `/api/nhom07-3d` chuyển tiếp `/health`; trường `ready` cho biết trạng thái.
- Thiếu cấu hình/kết nối trả 503; dữ liệu sai khoảng trả 422.
- Dịch vụ hiện tại chỉ lắng nghe localhost. Deploy frontend lên Vercel **không
  tự triển khai model**: localhost trên Vercel không phải laptop của Nghĩa.
  Cần triển khai dịch vụ model và cấu hình đường kết nối riêng trước khi demo
  trên Internet. Phần triển khai đó không nằm trong commit này.

## Model và phạm vi kết quả

Áo dùng checkpoint baseline PCA+MLP được nhóm train từ dữ liệu TailorNet,
không phải toàn bộ kiến trúc TailorNet của tác giả. Dáng người dùng SMPL.
Adapter cm/kg tìm dáng trong miền train bằng ước lượng thể tích; chiều cao
được scale đồng thời trên người và áo. BMI được tính từ cm/kg đã nhập.

Cùng chiều cao/cân nặng có thể có nhiều vóc dáng. Đây là hình dung 3D ước
lượng, chưa xác nhận size, độ chật/rộng, áp lực vải hoặc mô phỏng vải thật.
Một mẫu áo thun, A-pose; màu chỉ đổi hiển thị, GLB giữ màu gốc từ dịch vụ.
UI báo giới hạn khi yêu cầu nằm ngoài khả năng khớp dáng của model.

## Kiểm tra

```bash
npm run lint
npm run build
node --test tests/analytics.test.mjs
```

Demo: chọn Nam/Nữ, nhập cm/kg, tạo mẫu; đổi cân nặng và tạo lại; xoay nhìn
sau/nách; tải GLB. Tắt model rồi tạo lại để kiểm tra thông báo lỗi kết nối.

## Nguồn

- [TailorNet dataset của tác giả](https://github.com/zycliao/TailorNet_dataset)
- [SMPL](https://smpl.is.tue.mpg.de/)
- Checkpoint và thông tin train: `SOURCES.txt`, `meta/training_domain.json`
  trong kit của nhóm. Giữ dữ liệu có giấy phép ngoài git.
