import { NextResponse } from 'next/server';

export async function GET() {
  const res = await fetch('https://production.plaid.com/link/token/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.PLAID_CLIENT_ID,
      secret: process.env.PLAID_SECRET,
      user: { client_user_id: 'tony-household' },
      client_name: 'Weekly Spend Agent',
      products: ['transactions'],
      country_codes: ['US'],
      language: 'en',
      redirect_uri: 'https://weekly-spend-agent.vercel.app',
    }),
  });

  const data = await res.json();
  return NextResponse.json(data);
}
