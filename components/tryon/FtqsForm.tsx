'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { FTQS_DIMENSIONS, type FtqsKey, type FtqsScores } from '@/lib/ftqs';
import type { TryOnProvider } from '@/types/virtual-try-on';

// Câu hỏi viết theo kiểu đồng ý (1 = rất không đồng ý, 5 = rất đồng ý) để điểm cao luôn là tốt.
const QUESTIONS: Record<FtqsKey, string> = {
  identity: 'Khuôn mặt, tóc và dáng người vẫn giống ảnh gốc của tôi.',
  garment: 'Màu sắc và chi tiết của áo giống áo thật.',
  fit: 'Áo trông vừa vặn, tự nhiên với size tôi đã chọn.',
  body: 'Tay, vai, cổ không bị lỗi hay biến dạng.',
  scene: 'Nền và ánh sáng được giữ nguyên.',
  trust: 'Tôi tin ảnh này đủ để quyết định chọn màu và size.',
};
const LEVELS = [1, 2, 3, 4, 5] as const;

interface FtqsFormProps {
  resultId: string;
  productId: string;
  color: string;
  size: string;
  provider: TryOnProvider;
  promptVersion: string | null;
}

export function FtqsForm({ resultId, productId, color, size, provider, promptVersion }: FtqsFormProps) {
  const page = usePathname();
  const [open, setOpen] = useState(false);
  const [scores, setScores] = useState<FtqsScores>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const answered = Object.keys(scores).length;

  async function submit() {
    if (!answered || status === 'sending') return;
    setStatus('sending');
    setError('');
    try {
      const response = await fetch('/api/analytics/ftqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ resultId, page, productId, color, size, provider, ...(promptVersion ? { promptVersion } : {}), scores }),
        signal: AbortSignal.timeout(15000),
      });
      const body = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(body.error || 'Không thể gửi đánh giá.');
      setStatus('success');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể gửi đánh giá. Vui lòng thử lại.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return <p role="status" className="rounded-2xl border border-ink/10 bg-white p-5 text-sm text-moss">Cảm ơn bạn đã chấm chi tiết cho kết quả này.</p>;
  }

  return (
    <section className="rounded-2xl border border-ink/10 bg-white p-5" aria-label="Đánh giá chi tiết chất lượng ảnh thử đồ">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="text-left text-sm font-semibold underline-offset-2 hover:underline"
      >
        Đánh giá chi tiết ảnh này (khoảng 30 giây, không bắt buộc)
      </button>
      {open && (
        <form className="mt-4 space-y-4" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
          <p className="text-xs leading-5 text-ink/55">1 = rất không đồng ý, 5 = rất đồng ý. Bạn có thể bỏ trống câu không chắc. Ảnh của bạn không được lưu cùng đánh giá.</p>
          {FTQS_DIMENSIONS.map((dimension) => (
            <fieldset key={dimension.key} disabled={status === 'sending'}>
              <legend className="text-sm leading-5">{QUESTIONS[dimension.key]}</legend>
              <div className="mt-2 flex gap-1.5">
                {LEVELS.map((level) => (
                  <label
                    key={level}
                    className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border text-sm font-semibold ${scores[dimension.key] === level ? 'border-ink bg-ink text-white' : 'border-ink/15 bg-white hover:border-ink/40'}`}
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      name={`ftqs-${dimension.key}`}
                      value={level}
                      checked={scores[dimension.key] === level}
                      onChange={() => { setScores((current) => ({ ...current, [dimension.key]: level })); setStatus('idle'); }}
                      aria-label={`${QUESTIONS[dimension.key]} Mức ${level} trên 5`}
                    />
                    {level}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <button type="submit" className="btn-primary px-4 py-2 disabled:opacity-50" disabled={!answered || status === 'sending'}>
            {status === 'sending' ? 'Đang gửi…' : status === 'error' ? 'Thử gửi lại' : 'Gửi đánh giá chi tiết'}
          </button>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        </form>
      )}
    </section>
  );
}
