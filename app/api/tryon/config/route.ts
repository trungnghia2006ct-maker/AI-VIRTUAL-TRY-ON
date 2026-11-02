import { NextResponse } from 'next/server';
import { getConfiguredTryOnProvider } from '@/lib/tryon-provider';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json(
    { provider: getConfiguredTryOnProvider() },
    { headers: { 'Cache-Control': 'public, max-age=300' } },
  );
}
