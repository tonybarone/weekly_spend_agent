import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function supabaseFetch(path: string) {
  const url = `${process.env.SUPABASE_URL}/rest/v1/${path}`;

  const res = await fetch(url, {
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });

  return res.json();
}

export async function GET() {
  const today = new Date();

  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay()); // start of week (Sunday)

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const startStr = start.toISOString().split('T')[0];
  const endStr = end.toISOString().split('T')[0];

  const data = await supabaseFetch(
    `transactions?posted_date=gte.${startStr}&posted_date=lte.${endStr}&pending=eq.false&is_removed=eq.false`
  );

  const total = data
  .filter((tx: any) => tx.amount > 0) // only spending, exclude credits/refunds
  .reduce((sum: number, tx: any) => sum + tx.amount, 0);

  const merchantMap: Record<string, number> = {};

  for (const tx of data) {
    const name = tx.merchant_name || tx.raw_name || 'Unknown';
    merchantMap[name] = (merchantMap[name] || 0) + tx.amount;
  }

  const topMerchants = Object.entries(merchantMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, amount]) => ({ name, amount }));

  const budget = 1000;

  let status = 'on_track';

if (total > 1000) {
  status = 'over_budget';
} else if (total > 700) {
  status = 'warning';
}

return NextResponse.json({
  week_start: startStr,
  week_end: endStr,
  total_spend: total,
  budget,
  remaining: budget - total,
  status,
  top_merchants: topMerchants,
});
}
