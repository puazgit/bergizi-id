'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Card } from '@/components/ui/card'

const faqs = [
  {
    question: 'Apakah ada biaya setup atau implementasi?',
    answer: 'Tidak ada biaya setup untuk paket Professional. Untuk paket Enterprise, kami menyediakan implementasi gratis termasuk data migration, training, dan onboarding.'
  },
  {
    question: 'Bagaimana sistem billing dan pembayaran?',
    answer: 'Kami menggunakan sistem billing bulanan atau tahunan. Pembayaran dapat dilakukan melalui transfer bank, virtual account, atau kartu kredit. Untuk enterprise, tersedia opsi payment terms.'
  },
  {
    question: 'Apakah bisa upgrade atau downgrade paket?',
    answer: 'Ya, Anda dapat upgrade atau downgrade paket kapan saja. Perubahan akan berlaku pada billing cycle berikutnya, dan kami akan melakukan prorated adjustment.'
  },
  {
    question: 'Bagaimana dengan data security dan backup?',
    answer: 'Data Anda di-encrypt dengan standar enterprise (AES-256) dan disimpan di data center yang ISO 27001 certified. Backup otomatis dilakukan setiap hari dengan retention 30 hari.'
  },
  {
    question: 'Apakah ada batasan jumlah user?',
    answer: 'Untuk paket Starter dan Professional, tidak ada batasan jumlah user internal. Batasan hanya pada jumlah beneficiaries yang dilayani. Enterprise unlimited untuk semua.'
  },
  {
    question: 'Bagaimana proses migrasi dari sistem lama?',
    answer: 'Tim technical kami akan membantu migrasi data dari sistem lama secara gratis. Proses biasanya memakan waktu 1-2 minggu termasuk data cleaning dan validation.'
  },
  {
    question: 'Apakah tersedia training untuk tim?',
    answer: 'Ya, kami menyediakan comprehensive training untuk admin dan end users. Training dapat dilakukan online atau on-site sesuai kebutuhan.'
  },
  {
    question: 'Bagaimana dengan support dan maintenance?',
    answer: 'Semua paket include technical support. Professional mendapat priority support, Enterprise mendapat dedicated account manager dan 24/7 support.'
  },
  {
    question: 'Apakah bisa custom development?',
    answer: 'Untuk kebutuhan custom yang spesifik, kami menyediakan custom development services. Tim development kami berpengalaman dengan integrasi ke sistem government dan third-party.'
  },
  {
    question: 'Bagaimana jika ingin cancel subscription?',
    answer: 'Tidak ada kontrak minimum. Anda bisa cancel kapan saja dengan notice 30 hari. Data akan tetap accessible selama 90 hari setelah cancellation untuk export.'
  }
]

export function PricingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Pertanyaan yang sering ditanyakan tentang paket dan layanan Bergizi-ID.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <Card key={index} className="p-6">
            <button
              onClick={() => toggleFAQ(index)}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="font-semibold pr-4">{faq.question}</h3>
              {openIndex === index ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              )}
            </button>
            {openIndex === index && (
              <div className="mt-4 pt-4 border-t text-muted-foreground">
                {faq.answer}
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-muted-foreground mb-4">
          Masih ada pertanyaan lain? Tim kami siap membantu.
        </p>
        <div className="flex gap-4 justify-center">
          <a 
            href="mailto:hello@bergizi.id" 
            className="text-primary hover:underline"
          >
            hello@bergizi.id
          </a>
          <span className="text-muted-foreground">•</span>
          <a 
            href="tel:+622112345678" 
            className="text-primary hover:underline"
          >
            +62 21-1234-5678
          </a>
        </div>
      </div>
    </section>
  )
}