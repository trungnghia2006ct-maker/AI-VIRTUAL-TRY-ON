import { GEMINI_FREE_TIER } from '@/lib/tryon-provider-labels';
import { getConfiguredTryOnProvider } from '@/lib/tryon-provider';

const PRIVACY_POLICY_VERSION = '1.0.0';
const PRIVACY_POLICY_UPDATED = '31/10/2026';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 first:mt-6">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-6 text-ink/75">{children}</div>
    </section>
  );
}

function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, index) => <li key={index}>• {item}</li>)}
    </ul>
  );
}

export default function PrivacyPage() {
  const provider = getConfiguredTryOnProvider();
  const showGemini = provider === null || provider === 'gemini';
  const showHuggingFace = provider === null || provider === 'huggingface';

  return (
    <main className="container-wide py-8 sm:py-12 lg:py-16">
      <div className="max-w-3xl rounded-2xl border border-ink/10 bg-white p-6 shadow-soft sm:p-8">
        <p className="eyebrow">Quyền riêng tư</p>
        <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Cam kết bảo mật ảnh thử đồ</h1>
        <p className="mt-3 text-xs text-ink/55">Phiên bản {PRIVACY_POLICY_VERSION} · Cập nhật ngày {PRIVACY_POLICY_UPDATED}</p>

        <Section title="1. Chúng tôi xử lý dữ liệu gì">
          <Bullets items={[
            'Ảnh bạn tải lên hoặc chọn người mẫu: chỉ dùng để tạo kết quả thử đồ và được gửi đến nhà cung cấp AI (mục 3).',
            'Thông tin thử đồ: mã sản phẩm, màu, kích thước, nhà cung cấp AI, phiên bản prompt, thời lượng xử lý và trạng thái thành công hoặc lỗi.',
            'Đánh giá của bạn: 👍/👎, lý do và nhận xét tùy chọn tối đa 500 ký tự (đừng nhập thông tin cá nhân). Phản hồi được gắn với mã cookie ngẫu nhiên để cập nhật thay vì ghi trùng; chỉ người có quyền quản trị phân tích xem được nhận xét.',
            'Đánh giá chi tiết chất lượng ảnh (tùy chọn): điểm từ 1 đến 5 cho từng tiêu chí (giữ danh tính, màu và chi tiết áo, độ vừa vặn, lỗi cơ thể, nền và ánh sáng, độ tin cậy), kèm sản phẩm, màu, kích thước, nhà cung cấp AI và phiên bản prompt. Mỗi kết quả được chấm một lần, gắn với mã cookie ngẫu nhiên. Ảnh của bạn không được lưu cùng đánh giá.',
            'Phân tích hành vi: cookie mã ngẫu nhiên tối đa 90 ngày, phiên 30 phút. Ghi trang đã xem (không có tham số URL), nhóm nguồn truy cập, loại thiết bị, nhấp vào thành phần đã chọn, độ sâu cuộn, thời gian tab hoạt động và các bước thử đồ/giỏ hàng. Không lưu IP, toàn bộ User-Agent, nội dung biểu mẫu hay ảnh vào analytics.',
            'Chiều cao và cân nặng (tùy chọn): chỉ dùng trên trình duyệt để gợi ý kích thước, không gửi đến máy chủ.',
            'Địa chỉ IP: được giữ tạm trong bộ nhớ máy chủ để giới hạn số lượt thử, không ghi vào cơ sở dữ liệu. Nền tảng lưu trữ có thể ghi nhật ký truy cập theo cơ chế riêng của họ.',
            'Giỏ hàng và số liệu phiên ở trang /metrics: lưu ngay trong trình duyệt của bạn (localStorage / sessionStorage).',
          ]} />
        </Section>

        <Section title="2. Chúng tôi không lưu gì">
          <Bullets items={[
            'Ảnh gốc và ảnh kết quả: không được lưu vào cơ sở dữ liệu của ứng dụng.',
            'Thông tin định danh như tên, email, số điện thoại: ứng dụng không thu thập.',
            'Dữ liệu thử đồ, phân tích hành vi và đánh giá không được dùng cho quảng cáo. Lịch sử các phiên bản nhận xét không được lưu.',
          ]} />
        </Section>

        <Section title="3. Bên xử lý thứ ba">
          {showGemini && (
            <div>
              <p className="font-semibold text-ink">
                Gemini API (Google) · <a className="underline" href="https://ai.google.dev/gemini-api/terms">Điều khoản</a>
              </p>
              {GEMINI_FREE_TIER ? (
                <Bullets items={[
                  'Ứng dụng hiện dùng Gemini API gói miễn phí. Theo điều khoản của Google (kiểm tra ngày 31/10/2026), nội dung gửi lên gói miễn phí có thể được Google dùng để cải thiện sản phẩm và có thể được người đánh giá đọc.',
                  'Google yêu cầu không gửi thông tin cá nhân, bí mật hoặc nhạy cảm lên gói miễn phí. Vui lòng chỉ dùng ảnh bạn sẵn sàng chia sẻ.',
                  'Gemini API yêu cầu người dùng từ 18 tuổi trở lên. Theo điều khoản, gói miễn phí không dùng được cho người dùng ở Khu vực Kinh tế Châu Âu, Anh và Thụy Sĩ; vui lòng không dùng tính năng này nếu bạn ở các khu vực đó.',
                  'Chúng tôi không kiểm soát việc Google lưu giữ dữ liệu; thời hạn lưu giữ không được nêu cụ thể trong điều khoản.',
                ]} />
              ) : (
                <p>Ảnh được gửi đến Gemini API để tạo kết quả. Vui lòng đọc điều khoản của Google ở liên kết trên để biết cách Google xử lý dữ liệu.</p>
              )}
            </div>
          )}
          {showHuggingFace && (
            <div>
              <p className="font-semibold text-ink">
                Hugging Face · Space <a className="underline" href="https://huggingface.co/spaces/yisol/IDM-VTON">IDM-VTON</a>
              </p>
              {/* TODO(verify): chưa xác minh license IDM-VTON và chính sách dữ liệu của Hugging Face, xem docs/PRIVACY_REVIEW.md. */}
              <Bullets items={[
                'Ảnh được gửi đến một Space công khai do bên thứ ba vận hành. Chúng tôi chưa xác minh được cách Space hoặc Hugging Face lưu giữ ảnh, nên không thể cam kết về việc này.',
                'Space có thể phải xếp hàng hoặc hết quota GPU; khi đó lượt thử có thể thất bại.',
              ]} />
            </div>
          )}
        </Section>

        <Section title="4. Khuyến nghị khi dùng">
          <Bullets items={[
            'Không tải ảnh nhạy cảm hoặc ảnh có thể nhận diện thông tin cá nhân khác (giấy tờ, địa chỉ...).',
            'Chỉ tải ảnh của chính bạn hoặc ảnh của người đã đồng ý cho bạn sử dụng.',
            'Không tải ảnh của trẻ em hoặc người dưới 18 tuổi.',
          ]} />
        </Section>

        <Section title="5. Thời gian lưu giữ, quyền xóa và liên hệ">
          <Bullets items={[
            'Thời gian lưu giữ dữ liệu thử đồ, phân tích hành vi và đánh giá: 90 ngày kể từ lúc ghi nhận, sau đó dữ liệu bị xóa theo tác vụ dọn dẹp do quản trị viên cấu hình. Dashboard tổng hợp tối đa 90 ngày gần nhất; các tín hiệu chỉ mang tính ước tính.',
            'Bạn có thể tắt theo dõi hành vi ở cuối trang. Ứng dụng tôn trọng tín hiệu Do Not Track / Global Privacy Control. Phản hồi bạn chủ động gửi vẫn được lưu.',
            'Bạn có thể dừng quá trình thử đồ bất kỳ lúc nào trong màn xử lý.',
            'Bạn có thể yêu cầu xóa dữ liệu liên quan đến mình qua email bên dưới. Vì dữ liệu không gắn với danh tính nên có thể cần bạn cung cấp thời điểm và sản phẩm đã thử.',
            <>Email liên hệ: <a className="underline" href="mailto:phanlehieu2006@gmail.com">phanlehieu2006@gmail.com</a>.</>,
          ]} />
        </Section>

        <Section title="6. Cập nhật chính sách">
          <p>
            Chính sách này ở phiên bản {PRIVACY_POLICY_VERSION}, cập nhật ngày {PRIVACY_POLICY_UPDATED}.
            Khi có thay đổi, phiên bản và ngày cập nhật sẽ được đổi tương ứng.
          </p>
        </Section>
      </div>
    </main>
  );
}
