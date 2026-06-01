'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/weekly-recap')
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) {
    return <main style={{ padding: 40 }}>Loading weekly spend...</main>;
  }

  const progress = Math.min((data.total_spend / data.budget) * 100, 100);

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: 32,
        fontFamily: 'Inter, system-ui, sans-serif',
        background:
          'radial-gradient(circle at top left, #fde68a 0, transparent 28%), radial-gradient(circle at top right, #bfdbfe 0, transparent 30%), linear-gradient(135deg, #f8fafc, #eef2ff)',
        color: '#111827',
      }}
    >
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <p style={{ textTransform: 'uppercase', letterSpacing: 2, color: '#6366f1', fontWeight: 700 }}>
            Barone Household Money Rhythm
          </p>
          <h1 style={{ fontSize: 48, margin: 0 }}>Weekly Spend Agent</h1>
          <p style={{ color: '#6b7280', fontSize: 18 }}>
            {data.week_start} → {data.week_end}
          </p>
        </div>

        <section
          style={{
            background: 'rgba(255,255,255,0.82)',
            border: '1px solid rgba(255,255,255,0.8)',
            borderRadius: 28,
            padding: 34,
            boxShadow: '0 24px 70px rgba(31,41,55,0.14)',
            backdropFilter: 'blur(16px)',
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <p style={{ color: '#6b7280', margin: 0 }}>Spent this week</p>
              <h2 style={{ fontSize: 68, lineHeight: 1, margin: '10px 0' }}>
                ${data.total_spend.toFixed(2)}
              </h2>
              <p style={{ fontSize: 18 }}>
                <strong>${data.remaining.toFixed(2)}</strong> left from your ${data.budget} weekly target
              </p>
            </div>

            <div
              style={{
                alignSelf: 'flex-start',
                padding: '10px 14px',
                borderRadius: 999,
                background:
                  data.status === 'over_budget'
                    ? '#fee2e2'
                    : data.status === 'warning'
                    ? '#fef3c7'
                    : '#dcfce7',
                color:
                  data.status === 'over_budget'
                    ? '#991b1b'
                    : data.status === 'warning'
                    ? '#92400e'
                    : '#166534',
                fontWeight: 800,
              }}
            >
              {data.status === 'over_budget'
                ? 'Over Budget'
                : data.status === 'warning'
                ? 'Watch Pace'
                : 'On Track'}
            </div>
          </div>

          <div style={{ marginTop: 26 }}>
            <div
              style={{
                height: 16,
                background: '#e5e7eb',
                borderRadius: 999,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  background:
                    data.status === 'over_budget'
                      ? 'linear-gradient(90deg, #ef4444, #fb7185)'
                      : data.status === 'warning'
                      ? 'linear-gradient(90deg, #f59e0b, #facc15)'
                      : 'linear-gradient(90deg, #10b981, #22c55e)',
                }}
              />
            </div>
          </div>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 18,
          }}
        >
          <div style={{ background: '#111827', color: 'white', borderRadius: 24, padding: 24 }}>
            <p style={{ color: '#9ca3af', marginTop: 0 }}>Transactions counted</p>
            <h3 style={{ fontSize: 40, margin: 0 }}>{data.transaction_count}</h3>
          </div>

          <div style={{ background: 'white', borderRadius: 24, padding: 24, boxShadow: '0 12px 36px rgba(0,0,0,0.08)' }}>
            <h3 style={{ marginTop: 0 }}>Top Merchants</h3>
            {data.top_merchants.length === 0 ? (
              <p style={{ color: '#6b7280' }}>No spending yet this week.</p>
            ) : (
              data.top_merchants.map((m: any) => (
                <div key={m.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                  <span>{m.name}</span>
                  <strong>${m.amount.toFixed(2)}</strong>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
