import { Info } from 'lucide-react';
import { getProviderDataNotice } from '@/lib/tryon-provider-labels';
import type { TryOnProvider } from '@/types/virtual-try-on';

interface AiDisclaimerProps {
  variant: 'compact' | 'full';
  provider: TryOnProvider | null;
}

export function AiDisclaimer({ variant, provider }: AiDisclaimerProps) {
  const privacyLink = <a href="/privacy" className="font-semibold underline">Quyền riêng tư</a>;

  if (variant === 'compact') {
    return (
      <div className="mb-4 flex items-start gap-2 rounded-xl bg-sand/55 px-3 py-3 text-xs leading-5 text-ink/80">
        <Info size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
        <div>
          <p>Kết quả do AI tạo, chỉ mang tính tham khảo và không thay thế việc thử đồ thật.</p>
          <p className="mt-1">{getProviderDataNotice(provider)} Ứng dụng không lưu ảnh vào cơ sở dữ liệu. Xem {privacyLink}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 flex items-start gap-2 text-xs leading-5 text-ink/70">
      <Info size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
      <p>
        Ảnh do AI tạo, chỉ mang tính tham khảo: màu sắc, phom dáng, chi tiết và tỷ lệ cơ thể có thể chưa chính xác và phụ thuộc góc chụp, chất lượng ảnh.
        Gợi ý kích thước chỉ để tham khảo và không thay thế việc thử đồ thật. Xem {privacyLink}.
      </p>
    </div>
  );
}
