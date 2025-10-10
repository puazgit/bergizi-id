'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { cn } from '@/lib/utils'

const navigation = {
  main: [
    {
      name: 'Fitur',
      href: '/features',
      description: 'Jelajahi fitur-fitur enterprise-grade Bergizi-ID',
      items: [
        { name: 'Menu Management', href: '/features#menu-management' },
        { name: 'Procurement', href: '/features#procurement' },
        { name: 'Production', href: '/features#production' },
        { name: 'Distribution', href: '/features#distribution' },
        { name: 'Reporting & Analytics', href: '/features#reporting' }
      ]
    },
    { name: 'Harga', href: '/pricing' },
    { name: 'Blog', href: '/blog' },
    { name: 'Studi Kasus', href: '/case-studies' }
  ]
}

export function MarketingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded bg-gradient-to-br from-primary to-primary/60" />
            <span className="text-xl font-bold">Bergizi-ID</span>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {navigation.main.map((item) =>
                item.items ? (
                  <NavigationMenuItem key={item.name}>
                    <NavigationMenuTrigger>{item.name}</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid w-[400px] gap-3 p-4">
                        <div className="row-span-3">
                          <NavigationMenuLink asChild>
                            <Link
                              className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                              href={item.href}
                            >
                              <div className="mb-2 mt-4 text-lg font-medium">
                                {item.name}
                              </div>
                              <p className="text-sm leading-tight text-muted-foreground">
                                {item.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </div>
                        {item.items.map((subItem) => (
                          <NavigationMenuLink key={subItem.name} asChild>
                            <Link
                              href={subItem.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none">
                                {subItem.name}
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ) : (
                  <NavigationMenuItem key={item.name}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                        )}
                      >
                        {item.name}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )
              )}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/demo-request">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                Demo Gratis
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm">
                Masuk
              </Button>
            </Link>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.main.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t pt-2">
                <Link
                  href="/demo-request"
                  className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Demo Gratis
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}