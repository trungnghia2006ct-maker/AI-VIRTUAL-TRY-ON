'use client';

import { useQuery } from '@tanstack/react-query';
import type { TryOnProvider } from '@/types/virtual-try-on';

async function fetchProvider(): Promise<TryOnProvider | null> {
  const response = await fetch('/api/tryon/config');
  if (!response.ok) return null;
  const body = await response.json() as unknown;
  if (typeof body !== 'object' || body === null || !('provider' in body)) return null;
  return body.provider === 'gemini' || body.provider === 'huggingface' ? body.provider : null;
}

// Trả null khi đang tải, lỗi hoặc cấu hình không hợp lệ; UI dùng cách diễn đạt trung tính.
export function useTryOnProvider(): TryOnProvider | null {
  const { data } = useQuery({
    queryKey: ['tryon-provider'],
    queryFn: fetchProvider,
    staleTime: Infinity,
  });
  return data ?? null;
}
