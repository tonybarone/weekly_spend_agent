import { NextResponse } from 'next/server';

async function supabaseFetch(path: string, options: RequestInit = {}) {
  const url = `${process.env.SUPABASE_URL}/rest/v1/${path}`;

  return fetch(url, {
    ...options,
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
}

export async function GET() {
  const itemsRes = await supabaseFetch('plaid_items?select=*');

  if (!itemsRes.ok) {
    return NextResponse.json(
      { error: await itemsRes.text() },
      { status: 500 }
    );
  }

  const items = await itemsRes.json();

  for (const item of items) {
    const plaidRes = await fetch('https://sandbox.plaid.com/transactions/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.PLAID_CLIENT_ID,
        secret: process.env.PLAID_SECRET,
        access_token: item.access_token,
        cursor: item.next_cursor,
        count: 500,
      }),
    });

    const plaidData = await plaidRes.json();

    if (!plaidRes.ok) {
      return NextResponse.json(plaidData, { status: 400 });
    }

    const added = plaidData.added || [];
    const modified = plaidData.modified || [];
    const removed = plaidData.removed || [];
    const transactionsToUpsert = [...added, ...modified];

    if (transactionsToUpsert.length > 0) {
      const formatted = transactionsToUpsert.map((tx: any) => ({
        transaction_id: tx.transaction_id,
        account_id: tx.account_id,
        posted_date: tx.date,
        authorized_date: tx.authorized_date,
        amount: tx.amount,
        merchant_name: tx.merchant_name,
        raw_name: tx.name,
        pending: tx.pending,
        category: tx.category || null,
        personal_finance_category: tx.personal_finance_category || null,
        iso_currency_code: tx.iso_currency_code,
        is_removed: false,
      }));

      const txRes = await supabaseFetch(
        'transactions?on_conflict=transaction_id',
        {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates' },
          body: JSON.stringify(formatted),
        }
      );

      if (!txRes.ok) {
        return NextResponse.json(
          { error: await txRes.text() },
          { status: 500 }
        );
      }
    }

    for (const removedTx of removed) {
      await supabaseFetch(
        `transactions?transaction_id=eq.${removedTx.transaction_id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ is_removed: true }),
        }
      );
    }

    await supabaseFetch(`plaid_items?id=eq.${item.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        next_cursor: plaidData.next_cursor,
        updated_at: new Date().toISOString(),
      }),
    });
  }

  return NextResponse.json({
    success: true,
    message: 'Transactions synced',
  });
}
