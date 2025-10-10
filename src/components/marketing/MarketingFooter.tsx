import Link from 'next/link'
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const footerLinks = {
  product: [
    { name: 'Fitur', href: '/features' },
    { name: 'Harga', href: '/pricing' },
    { name: 'Demo', href: '/demo-request' },
    { name: 'Dokumentasi', href: '/docs' }
  ],
  company: [
    { name: 'Tentang Kami', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Karir', href: '/careers' },
    { name: 'Kontak', href: '/contact' }
  ],
  resources: [
    { name: 'Studi Kasus', href: '/case-studies' },
    { name: 'Webinar', href: '/webinars' },
    { name: 'White Papers', href: '/resources' },
    { name: 'API Reference', href: '/api' }
  ],
  legal: [
    { name: 'Kebijakan Privasi', href: '/privacy' },
    { name: 'Syarat & Ketentuan', href: '/terms' },
    { name: 'Keamanan', href: '/security' },
    { name: 'Compliance', href: '/compliance' }
  ]
}

const socialLinks = [
  { name: 'Facebook', href: '#', icon: Facebook },
  { name: 'Twitter', href: '#', icon: Twitter },
  { name: 'Instagram', href: '#', icon: Instagram },
  { name: 'LinkedIn', href: '#', icon: Linkedin }
]

export function MarketingFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Main Footer */}
        <div className="grid gap-8 py-16 lg:grid-cols-6">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <div className="h-8 w-8 rounded bg-gradient-to-br from-primary to-primary/60" />
              <span className="text-xl font-bold">Bergizi-ID</span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-md">
              Platform Enterprise-Grade untuk manajemen SPPG yang scalable, secure, dan professional. 
              Melayani ribuan SPPG di seluruh Indonesia dengan standar internasional.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Jakarta, Indonesia</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+62 21-1234-5678</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>hello@bergizi.id</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Produk</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Perusahaan</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t py-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Dapatkan Update Terbaru
              </h3>
              <p className="text-muted-foreground">
                Berlangganan newsletter kami untuk mendapatkan tips, insights, dan update fitur terbaru.
              </p>
            </div>
            <form className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Masukkan email Anda"
                className="flex-1"
              />
              <Button type="submit">
                Berlangganan
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t py-8 flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm text-muted-foreground mb-4 lg:mb-0">
            © {new Date().getFullYear()} Bergizi-ID. All rights reserved.
          </p>
          
          {/* Social Links */}
          <div className="flex space-x-4">
            {socialLinks.map((social) => {
              const Icon = social.icon
              return (
                <Link
                  key={social.name}
                  href={social.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon className="h-5 w-5" />
                  <span className="sr-only">{social.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </footer>
  )
}