import { createHash } from 'node:crypto';
import { NextRequest } from 'next/server';
import { identity, ipKey, json, limitedJson, sameOrigin } from '@/lib/analytics-http';
import { PAGES, record, uuid, type FtqsRating, type Page } from '@/lib/analytics-schema';
import { quality, saveFtqs } from '@/lib/analytics-store';
import { FTQS_KEYS, isScore, type FtqsScores } from '@/lib/ftqs';
import { products } from '@/lib/products';
import { PROMPT_VERSION_PATTERN } from '@/lib/tryon-prompt';
import { createRateLimiter } from '@/lib/rate-limit';

export const runtime = 'nodejs';
const limiter = createRateLimiter({ requests: 30, windowMs: 60000 });
const PROVIDERS = ['gemini', 'huggingface'] as const;
const FIELDS = ['resultId', 'page', 'productId', 'color', 'size', 'provider', 'promptVersion', 'scores'];

// Một khách chấm một kết quả tối đa một lần: id cố định theo (visitor, resultId).
function ftqsId(visitor: string, resultId: string) {
  const h = createHash('sha256').update(`ftqs:${visitor}:${resultId}`).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

function parseScores(value: unknown): FtqsScores | null {
  if (!record(value)) return null;
  const keys = Object.keys(value);
  if (!keys.length || keys.some(key => !(FTQS_KEYS as readonly string[]).includes(key))) return null;
  const scores: FtqsScores = {};
  for (const key of keys) {
    if (!isScore(value[key])) return null;
    scores[key as keyof FtqsScores] = value[key] as number;
  }
  return scores;
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return json({ error: 'Nguồn yêu cầu không hợp lệ.' }, 403);
  try {
    const limit = await limiter.check(ipKey(request));
    if (!limit.allowed) {
      await quality('rate_limited');
      const response = json({ error: 'Bạn gửi quá nhanh. Vui lòng chờ một phút.' }, 429);
      response.headers.set('Retry-After', String(limit.retryAfter));
      return response;
    }
    let input: unknown;
    try { input = await limitedJson(request, 4000); } catch { await quality('invalid'); return json({ error: 'Dữ liệu không hợp lệ hoặc quá lớn.' }, 400); }

    const scores = record(input) ? parseScores(input.scores) : null;
    const product = record(input) ? products.find(item => item.id === input.productId) : undefined;
    if (
      !record(input)
      || Object.keys(input).some(key => !FIELDS.includes(key))
      || !uuid(input.resultId)
      || !PAGES.includes(input.page as Page)
      || !scores
      || !product
      || typeof input.color !== 'string' || !product.colors.some(item => item.name === input.color)
      || typeof input.size !== 'string' || !product.sizes.includes(input.size)
      || !PROVIDERS.includes(input.provider as typeof PROVIDERS[number])
      || (input.promptVersion !== undefined && input.promptVersion !== null
        && (typeof input.promptVersion !== 'string' || input.promptVersion.length > 60 || !PROMPT_VERSION_PATTERN.test(input.promptVersion)))
    ) {
      await quality('invalid');
      return json({ error: 'Vui lòng chấm ít nhất một tiêu chí từ 1 đến 5.' }, 400);
    }

    const user = identity(request, input.page as Page);
    const rating: FtqsRating = {
      ...user.context,
      id: ftqsId(user.context.visitor, input.resultId),
      resultId: input.resultId,
      at: new Date().toISOString(),
      page: input.page as Page,
      productId: product.id,
      color: input.color as string,
      size: input.size as string,
      provider: input.provider as FtqsRating['provider'],
      promptVersion: typeof input.promptVersion === 'string' ? input.promptVersion : null,
      scores,
      suspect: user.bot ? 'bot' : null,
    };
    const result = await saveFtqs(rating);
    if (result === 'duplicate') await quality('duplicate_feedback');
    return user.attach(json({ ok: true, duplicate: result === 'duplicate' }));
  } catch { return json({ error: 'Không thể lưu đánh giá. Vui lòng thử lại.' }, 503); }
}
