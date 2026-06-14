import './globals.css';

export const metadata = {
  title: 'ANDY - Autonomous Neural Director',
  description: 'JARVIS-style AI command center for Vineet and autonomous agents'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
