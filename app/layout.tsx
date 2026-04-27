export const metadata = {
  title: 'Weekly Spend Agent',
  description: 'Household spending recap tool',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
