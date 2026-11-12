# BÁO CÁO ĐỒ ÁN / HỌC MÁY - NHẬN DIỆN SÂU HẠI LÚA
## 2.5. Xây dựng chương trình demo

### 2.5.1. Kiến trúc tổng thể của chương trình
Chương trình được thiết kế theo kiến trúc phân tách độc lập giữa máy khách và máy chủ (**Client - Server Architecture**), giúp tối ưu hóa hiệu năng tính toán tài nguyên phần cứng, đảm bảo khả năng mở rộng và linh hoạt trong triển khai thực tế:
- **Phía Máy chủ tính toán (Backend Server):** Được xây dựng bằng ngôn ngữ **Python** với framework API hiệu năng cao **FastAPI** và máy chủ **Uvicorn** (chuẩn ASGI). Mô-đun suy luận tích hợp thư viện thị giác máy tính **Ultralytics** (mô hình **YOLO11s**) và **PyTorch**, thực thi tính toán song song trực tiếp trên phần cứng tăng tốc đồ họa NVIDIA CUDA (GPU T4 trên môi trường Google Colab). Các bản ghi nhận diện và thông số siêu dữ liệu được lưu trữ tự động vào cơ sở dữ liệu **SQLite** (`history.db`). Đường hầm **Cloudflared Tunnel** được thiết lập để cung cấp địa chỉ truy cập công khai bảo mật dạng HTTPS và WebSocket (WSS).
- **Phía Giao diện tương tác người dùng (Frontend Web App):** Được phát triển dưới dạng Single Page Application (SPA) hiện đại bằng **React 18**, **TypeScript**, **Tailwind CSS** và công cụ đóng gói **Vite**. Trình duyệt gọi trực tiếp tới Backend (Direct Browser-to-Backend), không thông qua máy chủ trung gian để loại trừ giới hạn kích thước payload truyền tải và duy trì luồng truyền WebSocket độ trễ thấp. Giao diện hỗ trợ chuẩn đoán trạng thái kết nối thông minh (Health Check) và tích hợp sẵn chế độ Demo mô phỏng (Mock Data).

```text
[ Người dùng / Thiết bị ngoại vi (Điện thoại, Máy tính) ]
                     │  Tải ảnh / Video / Camera Stream trực tiếp
                     ▼
[ Giao diện Web Client (React 18 + Vite + Tailwind CSS) ]
                     │  Gọi trực tiếp REST API (POST /predict) & WebSocket (/ws)
                     ▼
[ Kênh truyền mã hóa: Cloudflared Public Tunnel (HTTPS / WSS) ]
                     │
                     ▼
[ Máy chủ Backend (Python 3.13 + FastAPI + Uvicorn + SQLite) ]
      ├── Giải mã dữ liệu & tiền xử lý ảnh (OpenCV cv2.imdecode)
      ├── Nạp mô hình & suy luận tăng tốc GPU (Ultralytics YOLO11 + PyTorch CUDA)
      ├── Áp dụng ngưỡng Confidence Threshold & Giải thuật NMS
      └── Lưu vết dữ liệu vào cơ sở dữ liệu SQLite (history.db)
                     │
                     ▼  Trả JSON (Tọa độ Box, Tên lớp chuẩn hóa, % Conf, Số lượng)
[ Giao diện Web Client ]: Vẽ Box High-DPI Canvas 1:1, Bảng đếm & Khuyến nghị IPM
```

---

### 2.5.2. Luồng xử lý từ ảnh đầu vào đến kết quả
Quy trình xử lý một mẫu ảnh khảo sát đồng ruộng từ lúc nạp dữ liệu đến khi trực quan hóa kết quả được tiến hành qua 5 giai đoạn liên hoàn như sau:
1. **Giai đoạn 1 - Tiếp nhận và tiền xử lý tại Client:** Người dùng chọn hoặc kéo thả tệp ảnh vào khu vực nhận diện. Phía Web Client kiểm tra định dạng hợp lệ (JPEG, PNG, WEBP), đọc siêu dữ liệu ảnh (độ phân giải chiều rộng × chiều cao thực tế, dung lượng tệp) và dựng ảnh xem trước tức thì.
2. **Giai đoạn 2 - Truyền tải dữ liệu qua REST API:** Trình duyệt đóng gói tệp ảnh nhị phân thành biểu mẫu `multipart/form-data` và phát lệnh HTTP POST đến endpoint `/predict`, đồng thời đính kèm giá trị ngưỡng tin cậy `conf` (Confidence Threshold) đã được người dùng thiết lập đồng bộ.
3. **Giai đoạn 3 - Giải mã và suy luận mô hình tại Backend:** FastAPI tiếp nhận luồng dữ liệu byte và nạp vào bộ giải mã `cv2.imdecode` của OpenCV. Mảng ảnh được đưa vào mô hình YOLO11s. Mô hình thực hiện chuẩn hóa tỉ lệ (kích thước đầu vào 640×640 px), trích xuất bản đồ đặc trưng qua mạng nơ-ron và áp dụng giải thuật triệt tiêu phi cực đại (**Non-Maximum Suppression - NMS**) với ngưỡng IoU quy định. NMS giúp loại bỏ các hộp bao chồng chéo trên cùng một cá thể sâu hại, bảo đảm tính đơn nhất và độ chính xác của số lượng phát hiện.
4. **Giai đoạn 4 - Trích xuất kết quả và lưu vết cơ sở dữ liệu:** Backend trích xuất tọa độ tuyệt đối `[x1, y1, x2, y2]` tương ứng kích thước ảnh gốc, định danh mã lớp (`cls_id`, `cls`), độ tin cậy của từng cá thể và tính toán thời gian suy luận (miligiây). Hệ thống tự động ghi nhật ký vào bảng `history` của SQLite để phục vụ tra cứu hồi tố và phân tích thống kê sau này.
5. **Giai đoạn 5 - Hiển thị đồ họa tương tác trên giao diện:** Web Client nhận gói JSON phản hồi và dựng lại các khung bao trên lớp phủ HTML5 Canvas độ sắc nét cao (High-DPI). Mỗi loài sâu bệnh được gán một mã màu trực quan cố định kèm nhãn phụ đề gồm tên tiếng Việt chuẩn hóa và phần trăm tin cậy. Đồng thời, bảng thống kê số lượng và đánh giá rủi ro dịch bệnh IPM được cập nhật tự động.

---

### 2.5.3. Thiết kế giao diện chương trình
Giao diện được thiết kế với phong cách hiện đại, thanh lịch, lấy gam màu xanh nông nghiệp làm chủ đạo, bố cục tối ưu hóa cho cả màn hình máy tính bàn và thiết bị di động của cán bộ thăm đồng. Các khối chức năng cốt lõi bao gồm:
- **Thanh trạng thái kết nối thông minh (Header):** Gồm logo hệ thống, các tab điều hướng (Nhận diện, Lịch sử, Thống kê, Loài gây hại, Cài đặt). Tích hợp huy hiệu trạng thái Backend tự động thăm dò `GET /health` mỗi 10 giây để báo Online (kèm thông tin GPU T4 / CPU) hoặc Offline cảnh báo kèm gợi ý dán lại URL Colab. Có nút chuyển đổi ngôn ngữ nhanh (Tiếng Việt / English / Song ngữ).
- **Khu vực tùy biến và điều khiển ngưỡng tin cậy:** Cung cấp thanh trượt tùy chỉnh ngưỡng Confidence Threshold (từ 0.1 đến 0.9, mặc định 0.4). Thay đổi ngưỡng tin cậy tại đây sẽ được lưu trữ vào LocalStorage và áp dụng đồng bộ tức thì trên toàn bộ hệ thống (Nhận diện Ảnh, phân tích Video và luồng Camera trực tiếp).
- **Khung hiển thị ảnh kết quả và chế độ phóng đại:** Khung hiển thị trung tâm hỗ trợ chiều cao linh hoạt lên đến 820px, cho phép quan sát sắc nét các loài sâu hại nhỏ (1-2mm). Nút bấm "Chế độ mở rộng" (*Expanded View*) cho phép mở rộng toàn hàng màn hình để soi kỹ từng chi tiết tổn thương trên lá lúa. Hỗ trợ nút tải ảnh kết quả chất lượng gốc đã vẽ khung bao trực tiếp từ Canvas.
- **Bảng thống kê số lượng và Bách khoa thư sâu bệnh:** Liệt kê số lượng phát hiện của từng loài, thời gian xử lý (ms) và huy hiệu cảnh báo mật độ. Người dùng có thể nhấp chuột trực tiếp vào bất kỳ loài nào để hiển thị cửa sổ Bách khoa thư IPM tra cứu đặc điểm gây hại, vòng đời và biện pháp phòng trị sinh học/hóa học tương ứng.

*(Vị trí chèn ảnh minh chứng trong báo cáo)*
```text
[ CHÈN HÌNH 2.4: ẢNH CHỤP MÀN HÌNH GIAO DIỆN CHƯƠNG TRÌNH DEMO TẠI ĐÂY ]
Hình 2.4. Giao diện chương trình demo nhận diện và thống kê côn trùng gây hại trên cây lúa
```

---

### 2.5.4. Hiển thị kết quả và thống kê mật độ côn trùng phục vụ IPM
Nhằm chuyển giao từ bài toán thị giác máy tính thuần túy sang ứng dụng thực tiễn trong nông nghiệp, chương trình tích hợp mô-đun đánh giá mật độ và cảnh báo nguy cơ bùng phát dịch theo tiêu chuẩn **Quản lý dịch hại tổng hợp (IPM - Integrated Pest Management)**:

**Bảng 2.1. Danh mục chuẩn hóa 10 loài côn trùng hại lúa và phân hạng mức độ nguy hại**

| ID | Mã lớp YOLO | Tên Tiếng Việt chuẩn hóa | Tên Tiếng Anh | Mức độ nguy hại |
|:--:|:---|:---|:---|:---:|
| 0 | `rice_leaf_roller` | **Sâu cuốn lá lúa** | Rice Leaf Roller | Cao |
| 1 | `rice_leaf_caterpillar` | **Sâu đo lúa / Sâu ăn lá lúa** | Rice Leaf Caterpillar | Trung bình |
| 2 | `asiatic_rice_borer` | **Sâu đục thân 5 vạch kẻ đầu nâu (hoặc Sâu đục thân bướm 2 chấm / Sâu đục thân châu Á)** | Asiatic Rice Borer | **Nguy cấp** |
| 3 | `yellow_rice_borer` | **Sâu đục thân bướm 2 chấm (Sâu đục thân màu vàng)** | Yellow Rice Borer | **Nguy cấp** |
| 4 | `rice_gall_midge` | **Muỗi hành (Muỗi đầu nguyễn)** | Rice Gall Midge | Cao |
| 5 | `brown_plant_hopper` | **Rầy nâu** | Brown Plant Hopper | **Nguy cấp** |
| 6 | `white_backed_plant_hopper` | **Rầy lưng trắng** | White-backed Plant Hopper | Cao |
| 7 | `small_brown_plant_hopper` | **Rầy nâu nhỏ** | Small Brown Plant Hopper | Trung bình |
| 8 | `rice_water_weevil` | **Súng nước hại lúa (hoặc Bọ vòi đôi hại lúa)** | Rice Water Weevil | Cao |
| 9 | `rice_leafhopper` | **Rầy xanh đuôi đen (Rầy lá lúa nói chung)** | Rice Leafhopper | Trung bình |

Thuật toán đánh giá rủi ro tự động phân tích ma trận đếm số lượng dựa trên các ngưỡng sinh học:
- **Mức An toàn / Mật độ thấp (Xanh):** Tổng số cá thể dưới 4 và không có loài thuộc nhóm nguy cấp. Khuyến nghị duy trì chế độ chăm sóc tự nhiên, bảo tồn đàn thiên địch như nhện giăng, bọ rùa đỏ, bọ xít mù xanh.
- **Mức Cảnh báo (Vàng):** Xuất hiện từ 4 cá thể trở lên hoặc chớm xuất hiện loài thuộc nhóm nguy hại cao. Khuyến nghị tăng cường tuần suất thăm đồng 2-3 ngày/lần, điều tiết rút cạn nước ngắt quãng để giảm độ ẩm ổ dịch.
- **Báo động đỏ / Nguy cơ bùng phát dịch (Đỏ):** Xuất hiện từ 3 cá thể nhóm nguy cấp (*Rầy nâu*, *Sâu đục thân*) hoặc tổng mật độ vượt quá 8 cá thể trên mẫu quan sát. Hệ thống phát cảnh báo nguy cơ cháy rầy hoặc bạc bông trắng đồng, đồng thời đề xuất các hoạt chất thuốc bảo vệ thực vật đặc trị sinh học hoặc hóa học theo danh mục được Bộ Nông nghiệp cấp phép.

> **Lưu ý chuyên môn:** Kết quả do hệ thống đưa ra chỉ mang tính chất công cụ hỗ trợ ra quyết định (*Decision Support Tool*). Cán bộ khuyến nông và nông dân cần kết hợp thêm yếu tố thực tế về giai đoạn sinh trưởng của cây lúa (mạ, đẻ nhánh, làm đòng hay trỗ chín) và điều kiện thời tiết thực địa để quyết định can thiệp (theo mục 1.5.1).

---

### 2.5.5. Hướng dẫn cài đặt và vận hành
Các bước cài đặt và vận hành hệ thống demo được tiêu chuẩn hóa theo quy trình 4 bước:

- **Bước 1: Chuẩn bị môi trường thực thi Python**
  Cài đặt môi trường Python 3.10 trở lên (phiên bản được sử dụng trong suốt quá trình thực nghiệm và kiểm thử hệ thống là **Python 3.13.16** trên nền tảng Google Colab Linux 64-bit có trang bị GPU NVIDIA T4 16GB VRAM).

- **Bước 2: Cài đặt các thư viện phụ thuộc của Backend**
  Cài đặt các gói thư viện Python bằng lệnh:
  ```bash
  pip install -U ultralytics==8.3.253 fastapi "uvicorn[standard]" python-multipart requests opencv-python
  ```
  *(Thư viện PyTorch 2.14.1 cùng nền tảng CUDA Toolkit 12.x được tự động nạp đồng bộ để kích hoạt khả năng tăng tốc GPU).*

- **Bước 3: Thiết lập đường dẫn tệp trọng số mô hình**
  Đặt tệp trọng số tốt nhất (`best.pt`) sau quá trình huấn luyện mô hình YOLO11s vào thư mục lưu trữ trên Google Drive hoặc máy chủ nội bộ. Khi thực nghiệm, tệp được đặt tại đường dẫn:
  `/content/drive/MyDrive/rice_pest_detection/runs/yolo11s/weights/best.pt`
  Trong tệp mã nguồn backend (`backend.ipynb`), thư mục được khai báo thông qua biến cấu hình:
  `MODEL_DIR = "/content/drive/MyDrive/rice_pest_detection/runs/yolo11s/weights"`

- **Bước 4: Khởi chạy và vận hành chương trình**
  Quy trình vận hành chương trình gồm hai bước khởi động:
  - **Khởi chạy Backend:** Mở tệp notebook `backend/backend.ipynb` trên Google Colab và bấm chạy cell chính. Hệ thống sẽ nạp mô hình lên GPU, khởi tạo máy chủ Uvicorn ở cổng 8000 và chạy tiện ích cloudflared để phát sinh đường dẫn công khai, ví dụ:
    `https://rice-pest-backend.trycloudflare.com`
  - **Khởi chạy Frontend Web Client:** Tại thư mục mã nguồn giao diện, mở terminal và thực thi lệnh:
    ```bash
    npm install
    npm run dev
    ```
    Mở trình duyệt theo địa chỉ `http://localhost:5173` (hoặc mở trực tiếp đường dẫn Vercel). Nhấp vào biểu tượng **Cài đặt kết nối**, dán địa chỉ Backend URL nhận được từ Cloudflared, sau đó tiến hành tải ảnh/video và theo dõi kết quả nhận diện tức thì.

