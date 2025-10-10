import { MarketingHeader } from '@/components/marketing/MarketingHeader'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'

export const metadata = {
  title: {
    default: 'Bergizi-ID - Solusi SPPG Terdepan di Indonesia',
    template: '%s | Bergizi-ID'
  },
  description: 'Platform Enterprise-Grade untuk manajemen SPPG yang scalable, secure, dan professional. Melayani ribuan SPPG di seluruh Indonesia.',
  keywords: [
    'SPPG', 'Satuan Pelayanan Pemenuhan Gizi', 'Manajemen SPPG', 
    'Enterprise SaaS', 'Nutrisi', 'Gizi', 'Indonesia'
  ],
  authors: [{ name: 'Bergizi-ID Team' }],
  creator: 'Bergizi-ID',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://bergizi.id',
    title: 'Bergizi-ID - Solusi SPPG Terdepan di Indonesia',
    description: 'Platform Enterprise-Grade untuk manajemen SPPG yang scalable, secure, dan professional.',
    siteName: 'Bergizi-ID'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bergizi-ID - Solusi SPPG Terdepan di Indonesia',
    description: 'Platform Enterprise-Grade untuk manajemen SPPG yang scalable, secure, dan professional.',
    creator: '@bergizi_id'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
}

interface MarketingLayoutProps {
  children: React.ReactNode
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="flex-1">
        {children}
      </main>
      <MarketingFooter />
    </div>
  )
}