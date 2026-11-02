import type { AnalyticsSummary } from '@/lib/analytics-summary';

type Ftqs = AnalyticsSummary['ftqs'];
type Ratio = { count: number; sample: number; percent: number | null };

const providerNames: Record<string, string> = { gemini: 'Gemini', huggingface: 'Hugging Face' };
const show = (value: number | null, suffix = '') => (value === null ? 'Chưa đủ dữ liệu' : `${value}${suffix}`);
const pct = (value: Ratio) => (value.percent === null ? 'Chưa đủ dữ liệu' : `${value.percent}% (${value.count}/${value.sample})`);

function Card({ name, value, note }: { name: string; value: string; note: string }) {
  return (
    <article className="rounded-xl bg-cream p-4">
      <p className="text-xs text-ink/60">{name}</p>
      <p className="mt-2 font-display text-2xl font-bold">{value}</p>
      <p className="mt-1 text-[11px] leading-4 text-ink/50">{note}</p>
    </article>
  );
}

function Groups({ title, rows }: { title: string; rows: Ftqs['byProvider'] }) {
  return (
    <div className="min-w-0">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {!rows.length ? <p className="text-sm text-ink/50">Chưa có dữ liệu.</p> : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.label} className="border-b border-ink/5 pb-2 text-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <strong className="break-words">{providerNames[row.label] ?? row.label}</strong>
                <span className="tabular-nums text-xs text-ink/55">{row.total} lượt chấm</span>
              </div>
              <p className="mt-1 text-xs text-ink/70">
                FTQS trung bình: {show(row.composite.mean)} (n={row.composite.sample}) · Chấp nhận: {pct(row.acceptance)}
                {row.acceptance.ci ? ` · KTC 95%: ${row.acceptance.ci.low}–${row.acceptance.ci.high}%` : ''}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function FtqsSection({ data, available }: { data: Ftqs; available: boolean }) {
  return (
    <section className="rounded-2xl border border-ink/10 bg-white p-5 shadow-soft sm:p-7">
      <div className="mb-6 flex items-start gap-3">
        <span className="rounded-lg bg-sand px-2.5 py-1.5 text-xs font-bold text-moss">08</span>
        <div>
          <h2 className="font-display text-xl font-bold">FTQS · Chất lượng ảnh thử đồ</h2>
          <p className="mt-1 text-xs leading-5 text-ink/55">
            Fashion Try-On Quality Scale: thang đo do nhóm đề xuất, không phải chuẩn ngành. Khách tự chấm từng khía cạnh từ 1 đến 5.
            FTQS (0–100) chỉ tính cho lượt chấm đủ 6 khía cạnh. Ảnh được chấp nhận khi FTQS ≥ {data.threshold} và không có khía cạnh bắt buộc (D1, D2, D4) bị chấm 1.
          </p>
        </div>
      </div>
      {!available && <p role="alert" className="mb-5 rounded-xl bg-amber-100 p-4 text-sm">Chưa tìm thấy bảng product_ftqs trong Supabase. Hãy chạy migration 20261102010000_ftqs_ratings.sql để bắt đầu thu điểm FTQS.</p>}
      {!data.total ? (
        <p role="status" className="rounded-xl bg-sand p-5 text-sm">Chưa có đánh giá FTQS trong kỳ và bộ lọc này. Số liệu sẽ xuất hiện khi khách chấm kết quả thử đồ; không có dữ liệu mẫu nào được chèn.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <Card name="FTQS trung bình (0–100)" value={show(data.composite.mean)} note={`Trung vị ${show(data.composite.median)} · n=${data.composite.sample} lượt chấm đủ`} />
            <Card name="Tỷ lệ chấp nhận" value={data.acceptance.percent === null ? 'Chưa đủ dữ liệu' : `${data.acceptance.percent}%`} note={`${data.acceptance.count}/${data.acceptance.sample}${data.acceptance.ci ? ` · KTC 95%: ${data.acceptance.ci.low}–${data.acceptance.ci.high}%` : ''}`} />
            <Card name="Dính lỗi nghiêm trọng" value={data.gateFailures.percent === null ? 'Chưa đủ dữ liệu' : `${data.gateFailures.percent}%`} note={`${data.gateFailures.count}/${data.gateFailures.sample} lượt chấm có D1, D2 hoặc D4 = 1`} />
            <Card name="Tổng lượt chấm" value={String(data.total)} note={`${data.complete} lượt chấm đủ 6 khía cạnh`} />
          </div>
          <h3 className="mb-3 mt-7 text-sm font-semibold">Điểm theo khía cạnh</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-xs text-ink/55">
                <tr><th className="pb-2 pr-3 font-semibold">Khía cạnh</th><th className="pb-2 pr-3 font-semibold">Trọng số</th><th className="pb-2 pr-3 font-semibold">Trung bình</th><th className="pb-2 pr-3 font-semibold">Trung vị</th><th className="pb-2 pr-3 font-semibold">Điểm ≥ 4</th><th className="pb-2 font-semibold">n</th></tr>
              </thead>
              <tbody>
                {data.dimensions.map((row) => (
                  <tr key={row.key} className="border-t border-ink/5">
                    <td className="py-2 pr-3">{row.code} · {row.label}{row.gate ? ' *' : ''}</td>
                    <td className="py-2 pr-3 tabular-nums">{row.weight}%</td>
                    <td className="py-2 pr-3 tabular-nums">{show(row.mean)}</td>
                    <td className="py-2 pr-3 tabular-nums">{show(row.median)}</td>
                    <td className="py-2 pr-3 tabular-nums">{pct(row.top2)}</td>
                    <td className="py-2 tabular-nums">{row.sample}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-ink/55">* Khía cạnh có cổng lỗi: điểm 1 làm ảnh bị loại dù FTQS tổng cao.</p>
          <div className="mt-7 grid gap-7 md:grid-cols-2">
            <Groups title="Theo provider" rows={data.byProvider} />
            <Groups title="Theo phiên bản prompt" rows={data.byPromptVersion} />
          </div>
        </>
      )}
      <p className="mt-5 text-xs leading-5 text-ink/55">Đây là điểm do khách tự chấm nên mang tính chủ quan; không có chỉ số đồng thuận giữa nhiều người chấm. Mẫu nhỏ cần diễn giải thận trọng (xem khoảng tin cậy). Không lưu ảnh cùng đánh giá.</p>
    </section>
  );
}
