import type { Metadata } from 'next';

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  siteName: 'coinswiper.io',
  title: 'coinswiper.io - Vote on your favorite tokens',
  description: 'Vote on your favorite tokens',
  images: [
    {
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'coinswiper.io',
    },
  ],
};

const defaultTwitter: Metadata['twitter'] = {
  card: 'summary_large_image',
  title: 'coinswiper.io - Vote on your favorite tokens',
  description: 'Vote on your favorite tokens',
  images: ['/og-image.png'],
  creator: '@coinswiper',
};

export const defaultMetadata: Metadata = {
  title: {
    default: 'coinswiper.io - Vote on your favorite tokens',
    template: '%s | coinswiper.io',
  },
  description: 'coinswiper.io - Vote on your favorite tokens',
  keywords: [
    'cryptocurrency',
    'trading',
    'analysis',
    'crypto',
    'defi',
    'tokens',
    'real-time',
    'market analysis',
    'trading pairs',
    'vote',
    'favorite tokens',
    'vote on tokens',
    'token voting',
    'token voting platform',
    'token voting website',
    'token voting app',
    'token voting service',
    'token voting platform',
  ],
  authors: [{ name: 'coinswiper.io team' }],
  creator: 'coinswiper.io',
  publisher: 'coinswiper.io',
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: defaultOpenGraph,
  twitter: defaultTwitter,
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  metadataBase: new URL('https://coinswiper.io'),
};

export default defaultMetadata; 