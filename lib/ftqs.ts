// FTQS (Fashion Try-On Quality Scale): thang đo do nhóm đề xuất, không phải chuẩn ngành.
// Module thuần (không import runtime) để dùng chung cho API, dashboard và test.
// Mỗi khía cạnh chấm 1-5. Đổi trọng số/ngưỡng/cổng lỗi ở đây là đổi cách tính của toàn dashboard.

export const FTQS_DIMENSIONS = [
  { key: 'identity', code: 'D1', label: 'Giữ danh tính', weight: 20, gate: true },
  { key: 'garment', code: 'D2', label: 'Độ trung thành áo', weight: 25, gate: true },
  { key: 'fit', code: 'D3', label: 'Độ vừa vặn thực tế', weight: 25, gate: false },
  { key: 'body', code: 'D4', label: 'Toàn vẹn cơ thể', weight: 15, gate: true },
  { key: 'scene', code: 'D5', label: 'Nhất quán cảnh', weight: 10, gate: false },
  { key: 'trust', code: 'D6', label: 'Độ tin cậy mua hàng', weight: 5, gate: false },
] as const;

export type FtqsKey = typeof FTQS_DIMENSIONS[number]['key'];
export type FtqsScores = Partial<Record<FtqsKey, number>>;

// Ảnh được chấp nhận khi FTQS >= ngưỡng và không dính cổng lỗi.
export const FTQS_ACCEPT_THRESHOLD = 70;
export const FTQS_KEYS: readonly FtqsKey[] = FTQS_DIMENSIONS.map((dimension) => dimension.key);

export function isScore(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5;
}

// FTQS 0-100. Chỉ tính khi đã chấm đủ cả 6 khía cạnh; thiếu thì trả null (không ước lượng).
export function ftqsComposite(scores: FtqsScores): number | null {
  let total = 0;
  for (const dimension of FTQS_DIMENSIONS) {
    const score = scores[dimension.key];
    if (!isScore(score)) return null;
    total += (score - 1) / 4 * dimension.weight;
  }
  return total;
}

// Cổng lỗi: bất kỳ khía cạnh có gate nào bị chấm 1 (kể cả khi chưa chấm đủ).
export function ftqsGateFailed(scores: FtqsScores): boolean {
  return FTQS_DIMENSIONS.some((dimension) => dimension.gate && scores[dimension.key] === 1);
}

// null = chưa đủ dữ liệu để kết luận (chấm thiếu khía cạnh).
export function ftqsAccepted(scores: FtqsScores): boolean | null {
  const composite = ftqsComposite(scores);
  if (composite === null) return null;
  return !ftqsGateFailed(scores) && composite >= FTQS_ACCEPT_THRESHOLD;
}

export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function mean(values: number[]): number | null {
  return values.length ? round1(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
}

export function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return round1(sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2);
}

// Khoảng tin cậy Wilson 95% cho tỷ lệ (đơn vị %), phù hợp mẫu nhỏ.
export function wilson(count: number, sample: number, z = 1.96): { low: number; high: number } | null {
  if (!sample) return null;
  const p = count / sample;
  const denominator = 1 + z * z / sample;
  const center = (p + z * z / (2 * sample)) / denominator;
  const margin = z * Math.sqrt(p * (1 - p) / sample + z * z / (4 * sample * sample)) / denominator;
  return { low: round1(Math.max(0, center - margin) * 100), high: round1(Math.min(1, center + margin) * 100) };
}
