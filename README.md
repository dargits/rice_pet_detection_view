# 🌾 RicePest AI - Hệ Thống Nhận Diện Sâu Bệnh Hại Lúa (YOLOv11)

Frontend Web Application hoàn chỉnh cho đề tài **"Nhận diện và phân loại côn trùng gây hại trên cây lúa"**, sử dụng mô hình thị giác máy tính **YOLOv11**, xây dựng trên nền tảng **React 18, Vite, TypeScript và Tailwind CSS**.

Ứng dụng được thiết kế tối ưu để deploy trực tiếp lên **Vercel** và kết nối thẳng tới **FastAPI Backend chạy trên Google Colab** (qua Cloudflared Tunnel).

---

## 🚀 Tính năng nổi bật

### 1. Kiến trúc kết nối trực tiếp (Direct Browser-to-Colab)
- **Không qua serverless proxy:** Trình duyệt gọi trực tiếp tới FastAPI backend, vượt qua giới hạn payload body ~4.5MB và hỗ trợ WebSocket thời gian thực của Vercel.
- **Thích ứng với URL động của Colab:** Link `https://xxxx.trycloudflare.com` thay đổi sau mỗi lần khởi động lại cell. Người dùng có thể dễ dàng dán URL mới vào hộp thoại **Cài đặt kết nối**.
- **Tự động nhận diện & chuẩn hóa URL:** Loại bỏ dấu `/` thừa, tự động bổ sung `https://` nếu người dùng quên.
- **Huy hiệu trạng thái Colab (Health Check):** Tự động thăm dò `GET /health` mỗi 10 giây, hiển thị trạng thái Online (kèm chip GPU CUDA/CPU) hoặc Offline (kèm banner cảnh báo và nút cập nhật URL).
- **Hỗ trợ xác thực bảo mật:** Gắn header `x-api-key` cho toàn bộ yêu cầu fetch; tự động thêm query param `?key=...` cho các thẻ `<video>`, `<img>`, liên kết tải xuống và luồng WebSocket.
- **Chế độ Demo/Mock (`?mock=1`):** Tích hợp sẵn bộ giả lập dữ liệu hoàn chỉnh, giúp trải nghiệm giao diện đầy đủ (ảnh, video, webcam mô phỏng, lịch sử, thống kê) ngay cả khi không bật Colab.

### 2. Ba phương thức nhận diện thông minh
- **Nhận diện Ảnh:**
  - Kéo thả hoặc chọn nhiều ảnh mẫu lá/dảnh lúa, xử lý tuần tự.
  - Vẽ bounding box chuẩn sắc nét (High-DPI Canvas) kèm nhãn tên loài và độ tin cậy `%`.
  - Tải xuống ảnh đã vẽ box trực tiếp từ Canvas (độ phân giải gốc).
  - Nhấp vào bất kỳ loài nào để xem hướng dẫn phòng trừ IPM.
- **Nhận diện Video:**
  - Tải lên video khảo sát đồng ruộng (hỗ trợ file lớn, cảnh báo > 200MB).
  - Tùy chỉnh tham số `skip` khung hình (1-10) và ngưỡng `conf` (0.1-0.9).
  - Thanh tiến độ động thăm dò `GET /job/{id}` mỗi giây kèm nút hủy.
  - Trình phát video kết quả đã vẽ box (`/job/{id}/video`).
  - **Timeline tương tác:** Liệt kê các khung hình có phát hiện; nhấp vào mốc thời gian để video tự động nhảy (seek) đến đúng giây đó.
- **Webcam trực tiếp (Camera Stream):**
  - Hỗ trợ chọn camera, tự động ưu tiên camera sau trên thiết bị di động (`environment`).
  - **Cơ chế Backpressure chống trễ:** Chỉ chụp và gửi khung hình JPEG tiếp theo qua WebSocket **sau khi** nhận được phản hồi của khung hình trước (tự động bỏ qua các frame trễ).
  - Đồng hồ đo FPS thực tế, độ trễ suy luận (ms), và bộ đếm loài đã phát hiện trong phiên.

### 3. Quản lý Lịch sử & Thống kê dịch hại
- **Lịch sử (`/history`):** Bảng dữ liệu phân trang, bộ lọc nguồn (Ảnh/Video/Webcam), xem chi tiết bounding boxes và ảnh kết quả, xóa bản ghi, xuất báo cáo CSV.
- **Thống kê (`/stats`):** Biểu đồ Recharts chuyên nghiệp (phân bố theo loài, xu hướng theo ngày, cơ cấu nguồn) với bảng màu đồng nhất cho từng loài côn trùng.
- **Từ điển Loài gây hại (`/pests`):** Tra cứu đặc điểm nhận dạng, triệu chứng và giải pháp quản lý dịch hại tổng hợp (IPM) cho từng loài sâu bệnh hại lúa.
- **Tùy chọn hiển thị ngôn ngữ 1-1 (Tiếng Việt / English / Song ngữ):** Nút chuyển đổi nhanh trên thanh điều hướng và trong Cài đặt, tự động chuẩn hóa nhãn mô hình thành tên tiếng Việt chuẩn hoặc tên tiếng Anh quốc tế.

---

## 📖 Bảng Đối Chiếu 1-1 Chuẩn 10 Nhóm Sâu Bệnh Hại Lúa (YOLOv11 Dataset)

| STT | Mã Lớp (Class Key) | Tên Tiếng Việt Chuẩn | English Name | Tên Khoa Học (Scientific) |
|:---:|:---|:---|:---|:---|
| 1 | `rice_leaf_roller` | **Sâu cuốn lá lúa** | Rice Leaf Roller | *Cnaphalocrocis medinalis* |
| 2 | `rice_leaf_caterpillar` | **Sâu đo lúa / Sâu ăn lá lúa** | Rice Leaf Caterpillar | *Naranga aenescens* |
| 3 | `asiatic_rice_borer` | **Sâu đục thân 5 vạch kẻ đầu nâu (Sâu đục thân châu Á)** | Asiatic Rice Borer | *Chilo suppressalis* |
| 4 | `yellow_rice_borer` | **Sâu đục thân bướm 2 chấm (Sâu đục thân màu vàng)** | Yellow Rice Borer | *Scirpophaga incertulas* |
| 5 | `rice_gall_midge` | **Muỗi hành (Muỗi đầu nguyễn)** | Rice Gall Midge | *Orseolia oryzae* |
| 6 | `brown_plant_hopper` | **Rầy nâu** | Brown Plant Hopper | *Nilaparvata lugens* |
| 7 | `white_backed_plant_hopper` | **Rầy lưng trắng** | White-backed Plant Hopper | *Sogatella furcifera* |
| 8 | `small_brown_plant_hopper` | **Rầy nâu nhỏ** | Small Brown Plant Hopper | *Laodelphax striatellus* |
| 9 | `rice_water_weevil` | **Súng nước hại lúa (Bọ vòi voi hại lúa)** | Rice Water Weevil | *Lissorhoptrus oryzophilus* |
| 10 | `rice_leafhopper` | **Rầy xanh đuôi đen (Rầy lá lúa nói chung)** | Rice Leafhopper | *Nephotettix virescens* |

---

## 🛠️ Cài đặt và Chạy trên máy cá nhân (Local)

### Yêu cầu môi trường
- Node.js version 18+ (khuyến nghị Node 20+)
- npm hoặc yarn/pnpm

### Các bước thực hiện:
```bash
# 1. Di chuyển vào thư mục dự án
cd web

# 2. Cài đặt các thư viện phụ thuộc
npm install

# 3. Khởi chạy máy chủ phát triển
npm run dev
```

Truy cập: `http://localhost:5173`

> **Mẹo nhanh:** Thêm `?mock=1` vào thanh địa chỉ (`http://localhost:5173/?mock=1`) hoặc bật **Chế độ Demo** trong Cài đặt để chạy thử toàn bộ ứng dụng mà không cần backend Colab.

---

## ☁️ Hướng dẫn Deploy lên Vercel

1. **Đưa mã nguồn lên GitHub:**
   ```bash
   git init
   git add .
   git commit -m "feat: complete RicePest AI frontend"
   git remote add origin <URL_REPO_CUA_BAN>
   git push -u origin main
   ```

2. **Import vào Vercel:**
   - Đăng nhập vào [Vercel Dashboard](https://vercel.com).
   - Bấm **Add New...** -> **Project** -> Chọn repository GitHub vừa tạo.
   - **Framework Preset:** Chọn **Vite**.
   - **Root Directory:** `./` (hoặc `web` nếu repo chứa nhiều thư mục).
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

3. **Cấu hình biến môi trường (Environment Variables) - Tùy chọn:**
   - Tên biến: `VITE_API_URL`
   - Giá trị: URL Cloudflared hiện tại của bạn (ví dụ: `https://example.trycloudflare.com`).
   - *Lưu ý:* Nếu không cấu hình trước ở Vercel, bạn hoàn toàn có thể nhập URL trực tiếp trên giao diện web bất cứ lúc nào qua nút **Cài đặt**.

4. **Bấm "Deploy":**
   File `vercel.json` đã được cấu hình sẵn để rewrite toàn bộ routes về `/index.html`, đảm bảo React Router (SPA) hoạt động trơn tru khi F5 hoặc truy cập trực tiếp các đường dẫn như `/history`, `/stats`, `/pests`.

---

## 🔗 Hướng dẫn Kết nối với Google Colab FastAPI Backend

1. **Khởi chạy Backend trên Colab:**
   - Mở notebook Colab chứa mã nguồn FastAPI + mô hình YOLOv11.
   - Đảm bảo cell khởi chạy API có mở CORS cho tất cả nguồn gốc (`allow_origins=["*"]`).
   - Chạy Cloudflared tunnel trong cell:
     ```bash
     !cloudflared tunnel --url http://127.0.0.1:8000
     ```
   - Chờ Cloudflared in ra đường link tunnel công khai (dạng `https://xxxx.trycloudflare.com`).

2. **Kết nối Frontend:**
   - Mở ứng dụng RicePest AI trên trình duyệt.
   - Nhấp vào biểu tượng bánh răng **Cài đặt** ở góc trên bên phải thanh điều hướng.
   - Dán URL vừa copy vào ô **Backend URL (FastAPI / Cloudflared)**.
   - Nhập **API Key** (nếu backend Colab có cấu hình xác thực `x-api-key`).
   - Bấm nút **"Kiểm tra kết nối"** để kiểm tra phản hồi từ `/health`.
   - Bấm **"Lưu cài đặt"**. Huy hiệu trạng thái trên thanh điều hướng sẽ chuyển sang **Online** màu xanh lá kèm thông tin card GPU (ví dụ: `CUDA:0 (NVIDIA Tesla T4)`).

---

## ⚠️ Lưu ý kỹ thuật quan trọng

1. **Giao thức HTTPS / WSS:**
   - Khi frontend deploy trên Vercel chạy giao thức `https://`, trình duyệt sẽ chặn các kết nối tới `http://` (Mixed Content). Cloudflared tunnel mặc định đã cung cấp sẵn HTTPS và WSS hợp lệ nên kết nối an toàn 100%.
2. **Quyền truy cập Camera (Webcam):**
   - API `navigator.mediaDevices.getUserMedia` bắt buộc trang web phải chạy qua giao thức HTTPS hoặc `localhost`.
3. **CORS trên FastAPI:**
   - Backend Colab cần cấu hình `CORSMiddleware` với:
     ```python
     from fastapi.middleware.cors import CORSMiddleware
     app.add_middleware(
         CORSMiddleware,
         allow_origins=["*"],
         allow_credentials=True,
         allow_methods=["*"],
         allow_headers=["*"],
     )
     ```
