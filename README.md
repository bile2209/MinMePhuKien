# Min Mê Phụ Kiện — website thương hiệu (static)

Website tĩnh, không framework, tối ưu SEO, tốc độ tải, PWA cơ bản. Chỉ giới thiệu
thương hiệu — mọi giao dịch điều hướng sang Facebook và TikTok.

## Cấu trúc thư mục
```
site/
  index.html            trang chủ
  404.html               trang lỗi 404
  offline.html           trang hiển thị khi mất mạng (service worker)
  manifest.json          PWA manifest
  service-worker.js      cache app-shell tối thiểu
  robots.txt
  sitemap.xml
  css/style.css
  js/main.js
  assets/icons/          favicon + icon PWA (placeholder, xem bên dưới)
  assets/og-cover.jpg     ảnh chia sẻ Open Graph (placeholder)
  blog/                  8 bài viết SEO + trang danh sách blog/index.html
```

## Cần thay trước khi lên hàng thật
1. **Ảnh** — toàn bộ ảnh hiện tại là ảnh minh hoạ lấy từ Unsplash (chỉ để dựng
   giao diện). Trước khi public, thay bằng ảnh chụp thật của Min Mê Phụ Kiện
   (ảnh sản phẩm, ảnh kho đồ) ở `index.html`, các trang `blog/*.html` và
   `assets/og-cover.jpg`.
2. **Domain** — file đang trỏ tới `https://minmephukien.example.com`. Tìm-thay
   (find & replace) toàn bộ chuỗi này bằng domain thật trong: `index.html`,
   `blog/*.html`, `robots.txt`, `sitemap.xml`.
3. **Icon PWA** — `assets/icons/icon-192.png`, `icon-512.png`,
   `icon-maskable-512.png` hiện là placeholder chữ "M" đơn giản. Thay bằng
   logo thật (giữ đúng kích thước và vùng an toàn cho bản maskable).
4. **Đánh giá khách hàng** — phần "Đánh giá" đang dùng 3 review mẫu, ẩn danh,
   không gắn ảnh người thật. Thay bằng đánh giá thật khi có.

## Vì sao không có LocalBusiness Schema
Yêu cầu ban đầu có nhắc `LocalBusiness Schema`, nhưng website chỉ bán qua
Facebook/TikTok, không có địa chỉ cửa hàng vật lý — nên mình **không tự bịa**
địa chỉ/số điện thoại giả để nhét vào schema (dữ liệu NAP sai sẽ hại SEO chứ
không lợi). Thay vào đó trang dùng `Organization`, `WebSite`, `Article`,
`BreadcrumbList` và `FAQPage` schema — đều dựa trên thông tin có thật. Nếu sau
này có địa chỉ nhận hàng/cửa hàng thật, có thể bổ sung `LocalBusiness` dễ dàng.

## Triển khai
Site không cần build step — deploy thẳng thư mục `site/`:

- **Cloudflare Pages / Netlify**: kéo thả thư mục `site/` hoặc trỏ build
  output tới `site/`, build command để trống.
- **GitHub Pages (user/organization page hoặc custom domain)**: đẩy nội dung
  `site/` lên nhánh `gh-pages` hoặc thư mục gốc repo `username.github.io`.
  ⚠️ Nếu deploy dạng **project page** (`username.github.io/ten-repo`), toàn bộ
  đường dẫn tuyệt đối trong code (`/css/style.css`, `/blog/...`, …) sẽ lệch vì
  GitHub Pages phục vụ ở subpath. Khi đó cần thêm `<base href="/ten-repo/">`
  vào `<head>` hoặc đổi các path sang tương đối — dùng custom domain là cách
  đơn giản nhất để tránh vấn đề này.

## Ghi chú kỹ thuật
- Không dùng Bootstrap/jQuery/AOS — hiệu ứng "AOS-style" tự viết bằng
  `IntersectionObserver` (`[data-reveal]` trong CSS/JS) để tránh tải thêm thư
  viện ngoài, giữ Lighthouse Performance cao.
- Font tải qua Google Fonts với `media="print" onload="this.media='all'"` để
  không chặn render (loại bỏ render-blocking CSS).
- Ảnh dùng `loading="lazy"` (trừ ảnh hero dùng `fetchpriority="high"` để tối
  ưu LCP) và có sẵn `width`/`height` để tránh Cumulative Layout Shift.
- Dark mode: tự theo hệ thống (`prefers-color-scheme`) + nút chuyển tay, lưu
  lựa chọn vào `localStorage`.
- 8 bài blog được sinh từ một template dùng chung
  (`build_blog.py`, không cần thiết phải giữ lại sau khi deploy) — mỗi bài đã
  có breadcrumb, mục lục, Article + BreadcrumbList schema, CTA, internal link.
  Muốn thêm bài mới: thêm một entry vào danh sách `ARTICLES` trong
  `build_blog.py` rồi chạy lại script.
