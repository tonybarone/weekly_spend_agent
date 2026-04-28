import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { public_token } = await req.json();

  const plaidRes = await fetch('https://sandbox.plaid.com/item/public_token/exchange', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.PLAID_CLIENT_ID,
      secret: process.env.PLAID_SECRET,
      public_token,
    }),
  });

  const plaidData = await plaidRes.json();

  if (!plaidData.access_token || !plaidData.item_id) {
    return NextResponse.json(plaidData, { status: 400 });
  }

  const supabaseRes = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/plaid_items?on_conflict=item_id`,
    {
      method: 'POST',
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        item_id: plaidData.item_id,
        access_token: plaidData.access_token,
        next_cursor: null,
        institution_name: 'Plaid Sandbox',
      }),
    }
  );

  if (!supabaseRes.ok) {
    const error = await supabaseRes.text();
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    item_id: plaidData.item_id,
  });
}
