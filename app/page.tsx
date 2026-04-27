'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    Plaid?: any;
  }
}

export default function Home() {
  const connectPlaid = async () => {
    const res = await fetch('/api/create-link-token');
    const data = await res.json();

    if (!data.link_token) {
      alert('Plaid link token was not created. Check Vercel environment variables.');
      console.error(data);
      return;
    }

    if (!window.Plaid) {
      alert('Plaid script has not loaded yet. Wait a few seconds and try again.');
      return;
    }

    const handler = window.Plaid.create({
      token: data.link_token,
      onSuccess: async (public_token: string) => {
        const exchangeRes = await fetch('/api/exchange-public-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_token }),
        });

        const exchangeData = await exchangeRes.json();
        console.log(exchangeData);

        if (exchangeData.access_token) {
          alert('Account connected!');
        } else {
          alert('Account connected, but token exchange had an issue. Check console/logs.');
        }
      },
    });

    handler.open();
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <main style={{ padding: 40, fontFamily: 'Arial, sans-serif' }}>
      <h1>Weekly Spend Agent</h1>
      <p>Connect a test credit card through Plaid Sandbox.</p>
      <button
        onClick={connectPlaid}
        style={{
          padding: '12px 18px',
          borderRadius: 8,
          border: '1px solid #222',
          cursor: 'pointer',
          fontSize: 16,
        }}
      >
        Connect Credit Card
      </button>
    </main>
  );
}
