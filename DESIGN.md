# Hotel Admin Dashboard Design Reference

## Mục tiêu

Tài liệu này là chuẩn giao diện dùng chung cho SPA quản trị khách sạn xây dựng bằng Nuxt. Thiết kế tham chiếu lấy từ dashboard trong Figma, sau đó ánh xạ nội dung phân tích mẫu sang nghiệp vụ khách sạn. Những thông số quan sát trực tiếp từ Figma được phân biệt với các quy ước đề xuất cho những thành phần không xuất hiện trong frame.

## Nguồn tham chiếu

- [Figma: Dashboard UI Kit](https://www.figma.com/design/iosGJctxtLbGhV6JK6pEzV/Dashboard-UI-Kit---Dashboard--Free-Admin-Dashboard--Community-?node-id=549-8646&t=QTBXvD1OVBhUZC7u-)
- Node đã đọc: `24155:24867` — frame dashboard, kích thước 892 × 1086.
- Cấu trúc quan sát: 4 thẻ KPI, biểu đồ đường kèm danh sách nguồn truy cập, biểu đồ cột, biểu đồ donut và một biểu đồ toàn chiều ngang.
- Frame dashboard này không chứa sidebar, topbar, bảng dữ liệu, form hay nút hành động; header riêng trong cùng file được tham chiếu tại node `24155:24866`. Các quy tắc cho phần không có trong frame là hướng dẫn mở rộng cho sản phẩm, không phải thông số được trích từ Figma.

## Ngôn ngữ thiết kế

- Giao diện sáng, tối giản, ưu tiên nền trung tính và các bề mặt lớn bo tròn.
- Dùng màu nhấn dịu trên KPI và biểu đồ; chữ và đường dữ liệu chính có độ tương phản cao.
- Sắp xếp theo lưới linh hoạt, khoảng trắng rõ ràng; tránh đường viền và trang trí không cần thiết.
- Các trang nghiệp vụ dùng chung shell, nhịp khoảng cách, kiểu chữ và component. Thay đổi nội dung và dữ liệu, không tự tạo hệ màu hoặc kiểu card riêng từng trang.

## Màu sắc

| Token | Giá trị | Vai trò |
|---|---|---|
| `--color-page` | `#FFFFFF` | Nền ngoài của trang; màu trắng là quy ước nền cho app shell. |
| `--color-surface` | `#F9F9FA` | Nền card/khối biểu đồ trong thiết kế tham chiếu. |
| `--color-kpi-lavender` | `#EDEEFC` | Nền pastel KPI; giá trị token trong Figma là `#edeefc`. |
| `--color-kpi-blue` | `#E6F1FD` | Nền pastel KPI thứ hai, lấy từ token Figma `color-1`. |
| `--color-text` | `#1C1C1C` | Chữ và số chính. |
| `--color-text-muted` | `rgba(0, 0, 0, 0.4)` | Chữ phụ, nhãn trục và thông tin thứ cấp. |
| `--color-divider` | `rgba(0, 0, 0, 0.2)` | Dấu phân cách nhẹ khi cần thiết. |
| `--color-chart-cyan` | `#33D1FF` | Dữ liệu/seri biểu đồ. |
| `--color-chart-mint` | `#6BE6D3` | Dữ liệu/seri biểu đồ. |
| `--color-chart-green` | `#71DD8C` | Dữ liệu/seri biểu đồ. |
| `--color-chart-purple` | `#B899EB` | Dữ liệu/seri biểu đồ. |
| `--color-chart-blue` | `#A0BCE8` | Dữ liệu/seri biểu đồ. |

Màu pastel chỉ dùng làm nền hoặc phân biệt dữ liệu, không dùng thay màu trạng thái nghiệp vụ. Với trạng thái phòng/đặt phòng, kết hợp nhãn chữ và màu semantic riêng; không chỉ truyền đạt trạng thái bằng màu.

## Typography

- Font tham chiếu: **Inter**, sans-serif.
- Dùng weight 400 cho nội dung thông thường và 600 cho tiêu đề card/nhãn được nhấn mạnh.
- Cỡ chữ quan sát trong frame: 12 px (nhãn, chú thích), 14 px (tiêu đề card và nội dung ngắn), 24 px (chỉ số KPI).
- Line-height quan sát: 16 px, 20 px và 36 px tương ứng với các nhóm chữ trên.
- Với tiêu đề trang hoặc nội dung bảng chưa có trong frame, dùng Inter 600 và phân cấp vừa phải; không tăng kích thước tùy tiện giữa các trang.
- Tôn trọng khả năng hiển thị tiếng Việt; dùng fallback `Inter, system-ui, sans-serif`.

## Layout và khoảng cách

Các giá trị dưới đây được quan sát trong frame Figma; dùng làm cơ sở desktop và co giãn theo viewport:

| Thuộc tính | Giá trị |
|---|---:|
| Padding bên trong card | 24 px |
| Khoảng cách giữa các khối dashboard | 28 px |
| Khoảng cách trong nhóm nội dung | 8 px hoặc 16 px |
| Bo góc card | 20 px |
| Bo góc thành phần nhỏ | 4 px, 8 px hoặc 12 px theo vai trò |
| Chiều cao khối biểu đồ lớn đầu tiên | 330 px |
| Chiều cao các khối biểu đồ tiếp theo | 280 px |

- Khu vực đầu trang có 4 KPI card co giãn và xuống hàng khi không đủ chỗ; chiều rộng tối thiểu quan sát cho mỗi card là khoảng 200 px.
- Lưới biểu đồ gồm khối chính và khối phụ ở hàng đầu, hai khối cân bằng ở hàng tiếp, rồi đến khối toàn chiều ngang.
- Cho phép cuộn nội dung thay vì ép biểu đồ hoặc bảng quá hẹp. Trên mobile, chuyển các hàng nhiều cột thành một cột và giữ thứ tự ưu tiên nghiệp vụ.
- Với SPA quản lý khách sạn, dùng app shell nhất quán có điều hướng và header; đặt trang trong vùng nội dung shell. Kích thước sidebar cần được chốt khi triển khai; thông số header được ghi ở mục Topbar dùng chung bên dưới.

## Topbar dùng chung

Tham chiếu header Figma tại node `24155:24866`:

- Cao 68 px, padding ngang 28 px, đường phân cách dưới nhẹ.
- Bên trái là nút điều khiển điều hướng và breadcrumb; breadcrumb dùng nhãn cha muted, dấu `/` nhẹ và trang hiện tại màu chữ chính.
- Bên phải là nút tìm kiếm nền `rgba(0, 0, 0, 0.04)`, rộng 160 px, cao 28 px, bo góc 16 px và gợi ý phím tắt `⌘K`/`Ctrl K`, tiếp theo là hành động thông báo và tài khoản.
- Khoảng cách giữa biểu tượng là 8 px; khoảng cách tham chiếu giữa ô tìm kiếm và nhóm hành động là 20 px.
- Dùng chung component `AppTopbar` trong layout chính. Nhãn breadcrumb lấy từ metadata route; tìm kiếm lọc các route quản trị, hỗ trợ click, `Ctrl+K`/`⌘K`, chọn trang và `Esc`.
- Trên viewport hẹp, giảm padding và thu gọn ô tìm kiếm thành nút biểu tượng; giữ điều khiển menu, breadcrumb hiện tại, thông báo và avatar có thể truy cập.

## Sidebar thông báo dùng chung

Tham chiếu panel bên phải Figma tại node `24155:24865`:

- Panel rộng 280 px, nền trắng, padding 16 px và bo góc phía trong; desktop hiển thị bên phải app shell và thu hẹp vùng nội dung.
- Nút chuông trên `AppTopbar` bật/tắt panel; nút đóng trong panel cung cấp cùng hành vi. Trên mobile, panel chuyển thành drawer tạm thời phủ lên nội dung và có thể đóng bằng vùng scrim.
- Giữ thứ bậc ba nhóm **Thông báo**, **Hoạt động**, **Liên hệ**. Notification dùng icon nền pastel và thời gian muted; hoạt động dùng avatar initials với timeline mảnh; liên hệ dùng avatar tròn và tên.
- Nội dung hiện tại là dữ liệu minh họa phía client cho nghiệp vụ khách sạn, không phải thông báo realtime. Không tải ảnh avatar ngoài; dùng MDI và màu nền pastel từ hệ thiết kế.
- Drawer chỉ render khi được mở; trạng thái mở/đóng không lưu giữa các lần tải trang.

## Sidebar điều hướng dùng chung

Tham chiếu sidebar Figma tại node `24155:24864`:

- Drawer desktop rộng 212 px, nền trắng, có đường phân cách phải nhẹ; vùng nội dung có lề ngang 16 px.
- Phần thương hiệu giữ Staywise ở đầu sidebar; bộ chuyển khách sạn hiện ở chân sidebar.
- Điều hướng nhanh có hai tab **Yêu thích** và **Gần đây**. Danh sách rỗng có hướng dẫn ngắn; nút dấu sao đặt cạnh tiêu đề trang trong main content để thêm/bỏ route yêu thích.
- Route được chia nhóm có thể thu gọn/mở rộng; nhóm chứa trang hiện tại tự mở khi route thay đổi. Route hiện tại và route con dùng cùng trạng thái active.
- Mỗi hàng menu cao mục tiêu 36 px; nhãn 12 px; nhóm cách nhau khoảng 8 px. Hàng active dùng nền xám rất nhạt, icon/nhãn inactive dùng màu muted.
- Danh sách yêu thích và lịch sử route đã biết được lưu trong `localStorage` của trình duyệt dưới khóa `hotel-admin:navigation`; dữ liệu lỗi hoặc route đã bị xóa được xử lý bằng giá trị mặc định/lọc bỏ.
- Trên mobile, drawer hoạt động dạng temporary và tự đóng khi chọn route; desktop vẫn cho phép ẩn/hiện từ topbar.

## Trang danh sách phòng

- Trang phòng dùng hai card theo thứ tự: **Tìm kiếm** phía trên và **Danh sách** phía dưới.
- Card tìm kiếm chia vùng thông tin khách (tên, địa chỉ, điện thoại, email) với vùng thông tin phòng (khoảng ngày nhận/trả, loại phòng, trạng thái).
- Loại phòng có công tắc giữa chế độ chọn một và chọn nhiều; điều kiện chỉ áp dụng sau khi bấm **Tìm kiếm**. **Xóa tìm kiếm** đặt cạnh nút tìm kiếm ở cuối card.
- Card danh sách hiển thị tổng số bản ghi và khoảng bản ghi đang xem; bảng có thông tin liên hệ khách, loại/số phòng, ngày ở, trạng thái có nhãn chữ và tổng tiền. Điều hướng trang nằm dưới bảng.
- Trên viewport hẹp, bộ lọc xếp thành một cột; bảng giữ độ rộng tối thiểu và cuộn ngang trong card, không làm tràn toàn trang.
- Trang tải dữ liệu từ API; hỗ trợ tạo phòng và cập nhật trạng thái phòng. Kết quả thao tác dùng popup chung, tiêu đề lấy từ `message` của API và nội dung mô tả kết quả.

## Component

### KPI card

- Nền pastel nhẹ, padding 24 px, bo góc 20 px.
- Nhãn 14/20 px, màu chữ chính; chỉ số 24/36 px, weight 600.
- Dòng thay đổi/so sánh dùng 12/16 px và icon nhỏ; không để chỉ báo xu hướng phụ thuộc vào màu đơn thuần.
- Ánh xạ sang số liệu khách sạn như doanh thu, công suất phòng, lượt check-in và đặt phòng sắp tới.

### Card và biểu đồ

- Card biểu đồ dùng nền `--color-surface`, padding 24 px, bo góc 20 px.
- Tiêu đề card dùng 14/20 px, weight 600. Nhãn, chú giải và trục dùng 12 px hoặc 14 px, màu muted.
- Chỉ dùng màu seri đã định nghĩa; giữ màu và thứ tự seri nhất quán giữa các trang.
- Chọn biểu đồ theo câu hỏi dữ liệu: xu hướng theo thời gian (line), so sánh nhóm (bar), tỷ trọng (donut). Luôn có tiêu đề và chú giải dễ hiểu.

### Button, input, bảng và trạng thái

Các component này không có trong frame được đọc. Để các trang nhất quán, áp dụng quy ước dự án sau cho đến khi có thiết kế chi tiết:

- **Primary button:** nền `--color-text`, chữ trắng, bo góc 8 px; dùng cho hành động chính duy nhất trong một vùng.
- **Secondary button:** nền trắng, chữ `--color-text`, viền trung tính nhẹ, bo góc 8 px.
- **Destructive action:** dùng màu semantic cảnh báo/đỏ chỉ cho hành động phá hủy; yêu cầu xác nhận khi thao tác không thể hoàn tác.
- **Input/select:** nền trắng, chiều cao mục tiêu 40 px, bo góc 8 px, viền trung tính; trạng thái focus phải nhìn thấy rõ bằng bàn phím.
- **Bảng:** tiêu đề cột rõ ràng, hàng có nhịp dọc ổn định, căn phải số liệu, trạng thái đặt phòng/phòng hiển thị dạng nhãn có chữ.
- **Loading/empty/error:** giữ nguyên bố cục card; cung cấp skeleton, hướng dẫn khi chưa có dữ liệu và thông báo lỗi có hành động thử lại phù hợp.
- **Operation result popup:** dialog dùng chung cho kết quả thao tác; tiêu đề hiển thị `message` từ API, phần nội dung nêu ngữ cảnh thành công/thất bại. Khi lỗi, liệt kê chi tiết field và correlation ID nếu API cung cấp; dùng biểu tượng và màu semantic phù hợp, không dựa riêng vào màu để truyền đạt kết quả.
- **Global loading:** phủ toàn viewport trong lúc chuyển page hoặc có request qua API client; giữ hiển thị cho đến khi mọi request đang chạy hoàn tất, kể cả khi có request đồng thời hoặc refresh JWT.
- Đảm bảo focus, hover, disabled và tương phản; vùng bấm đủ lớn, icon có nhãn truy cập khi không có text.

## Ánh xạ nội dung sang nghiệp vụ hotel

| Mẫu tham chiếu | Ví dụ trong quản lý khách sạn |
|---|---|
| KPI cards | Doanh thu, công suất phòng, check-in hôm nay, đặt phòng sắp đến |
| Line chart | Doanh thu/đặt phòng theo ngày hoặc tháng |
| Danh sách nguồn | Kênh đặt phòng: trực tiếp, OTA và đối tác |
| Bar chart | Công suất theo loại phòng hoặc hiệu suất theo ngày |
| Donut chart | Tỷ trọng trạng thái đặt phòng hoặc cơ cấu kênh |
| Khối biểu đồ toàn chiều ngang | Xu hướng doanh thu, đặt phòng hoặc check-in trong khoảng thời gian chọn |

Tên và thứ tự số liệu cần phản ánh tác vụ chính của từng trang; không giữ nhãn mẫu như “Views”, “Visits” hoặc “Traffic” trong sản phẩm khách sạn.

## Quy tắc triển khai Nuxt

- Khai báo token màu, font, khoảng cách và bo góc tập trung; component dùng token thay vì giá trị rải rác.
- Dùng chung layout và component cho mọi route; chỉ đưa khác biệt theo trang vào dữ liệu, cấu hình hoặc slot có chủ đích.
- Tách component theo trách nhiệm: app shell, page header, KPI card, chart card, filter, table và status badge.
- Kiểm tra responsive ở desktop, tablet và mobile; không để bố cục phụ thuộc vào đúng kích thước frame Figma.
- Khi có thiết kế Figma cho sidebar, form, table hoặc dialog, cập nhật tài liệu này và phân biệt token gốc với ngoại lệ có chủ đích.

## Thư viện giao diện

Route `/ui-library` là playground tham khảo các quy chuẩn/component dùng chung, được đặt trong nhóm menu **Hệ thống**. Trang này cần cập nhật cùng tài liệu khi hệ token hoặc mẫu component nền tảng thay đổi.

- Mỗi chủ đề được trình bày trong card riêng: màu sắc, typography, button, input/lựa chọn, status/feedback, dialog/menu/popup, card và bảng.
- Dùng chính token trong tài liệu này, Inter, Vuetify và MDI; không tạo palette riêng cho trang mẫu.
- Ví dụ tương tác chỉ phục vụ demo ở client; không gọi API, ghi dữ liệu thật hoặc lưu state giữa các lần tải.
- Mọi icon-only control có accessible label; menu/dialog có thể đóng bằng hành động rõ ràng và hành vi bàn phím mặc định.
- Lưới card co về một cột trên mobile; bảng minh họa cuộn bên trong vùng chứa, không làm tràn viewport.
