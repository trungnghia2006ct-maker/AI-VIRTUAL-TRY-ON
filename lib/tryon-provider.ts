import 'server-only';

import type { TryOnProvider } from '@/types/virtual-try-on';

// Trả null khi TRYON_PROVIDER có giá trị không hợp lệ; để trống thì mặc định là gemini.
export function getConfiguredTryOnProvider(): TryOnProvider | null {
  const provider = process.env.TRYON_PROVIDER?.trim().toLowerCase() || 'gemini';
  return provider === 'gemini' || provider === 'huggingface' ? provider : null;
}
