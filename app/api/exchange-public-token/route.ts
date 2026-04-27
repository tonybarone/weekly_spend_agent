import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { public_token } = await req.json();

  const res = await fetch('https://sandbox.plaid.com/item/public_token/exchange', {
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

  const data = await res.json();
  return NextResponse.json(data);
}
