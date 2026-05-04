'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/weekly-recap')
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Weekly Spend</h1>

      <h2>${data.total_spend.toFixed(2)}</h2>
      <p>Remaining: ${data.remaining.toFixed(2)}</p>

      <h3>Top Merchants</h3>
      <ul>
        {data.top_merchants.map((m: any) => (
          <li key={m.name}>
            {m.name}: ${m.amount.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}
