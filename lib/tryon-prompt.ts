import type { Product } from '@/types/product';
import type { TryOnProvider } from '@/types/virtual-try-on';

// Đây là nơi duy nhất chứa prompt thử đồ. Mỗi lần sửa nội dung prompt PHẢI tăng version
// của template tương ứng để metrics và feedback so sánh được giữa các phiên bản.
//
// Changelog:
// - tryon-gemini@1.0.0: prompt gốc chuyển từ app/api/tryon/route.ts.
// - tryon-huggingface@1.0.0: chuỗi mô tả garment gốc chuyển từ app/api/tryon/route.ts.

export const PROMPT_VERSION_PATTERN = /^[a-z0-9-]+@\d+\.\d+\.\d+$/;

interface PromptInput {
  product: Pick<Product, 'name'>;
  color: string;
  size: string;
}

interface PromptTemplate {
  id: string;
  version: string;
  provider: TryOnProvider;
  render: (input: PromptInput) => string;
}

export const PROMPT_TEMPLATES: Record<TryOnProvider, PromptTemplate> = {
  gemini: {
    id: 'tryon-gemini',
    version: '1.0.0',
    provider: 'gemini',
    render: () => 'Mặc chiếc áo trong ảnh thứ hai lên người trong ảnh thứ nhất. Giữ nguyên khuôn mặt, tư thế, dáng người, nền và ánh sáng. Áo vừa vặn tự nhiên, đúng màu và chi tiết.',
  },
  huggingface: {
    id: 'tryon-huggingface',
    version: '1.0.0',
    provider: 'huggingface',
    render: ({ product, color, size }) => `${product.name}, màu ${color}, kích thước ${size}.`,
  },
};

export function getTryOnPrompt(input: PromptInput & { provider: TryOnProvider }) {
  const template = PROMPT_TEMPLATES[input.provider];
  return {
    id: template.id,
    version: template.version,
    key: `${template.id}@${template.version}`,
    text: template.render(input),
  };
}
