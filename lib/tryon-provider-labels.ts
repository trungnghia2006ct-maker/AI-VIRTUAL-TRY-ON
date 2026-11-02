import type { TryOnProvider } from '@/types/virtual-try-on';

// Đổi thành false khi Gemini API chạy bằng Cloud Project có billing (gói trả phí).
// Xem docs/PRIVACY_REVIEW.md để biết khác biệt điều khoản giữa hai gói.
export const GEMINI_FREE_TIER = true;

const PROVIDER_LABELS: Record<TryOnProvider, string> = {
  gemini: 'Gemini API',
  huggingface: 'Hugging Face IDM-VTON',
};

export function getProviderLabel(provider: TryOnProvider | null): string {
  return provider ? PROVIDER_LABELS[provider] : 'dịch vụ AI bên thứ ba';
}

export function getProviderDataNotice(provider: TryOnProvider | null): string {
  if (provider === 'gemini') {
    return GEMINI_FREE_TIER
      ? 'Ảnh được gửi đến Gemini API (gói miễn phí). Theo điều khoản của Google, dữ liệu gửi lên gói miễn phí có thể được dùng để cải thiện sản phẩm và có thể được người đánh giá xem. Vui lòng không tải ảnh cá nhân hoặc nhạy cảm, và chỉ dùng khi bạn từ 18 tuổi trở lên.'
      : 'Ảnh được gửi đến Gemini API để tạo kết quả thử đồ.';
  }
  if (provider === 'huggingface') {
    return 'Ảnh được gửi đến Space Hugging Face IDM-VTON do bên thứ ba vận hành để tạo kết quả thử đồ.';
  }
  return 'Ảnh được gửi đến dịch vụ AI bên thứ ba để tạo kết quả thử đồ.';
}
