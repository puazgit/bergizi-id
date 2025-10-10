import { PrismaClient, FeedbackType, FeedbackStatus, FeedbackPriority, BeneficiaryType } from '@prisma/client'

export async function seedFeedback(prisma: PrismaClient) {
  console.log('  → Creating feedback data...')

  // Get existing SPPG data - make sure to include all SPPGs
  const sppgs = await prisma.sPPG.findMany({
    orderBy: { createdAt: 'asc' }
  })

  // Get programs and distributions separately  
  const programs = await prisma.nutritionProgram.findMany({
    take: 5,
    include: {
      menus: {
        take: 3
      }
    }
  })

  const distributions = await prisma.foodDistribution.findMany({
    take: 5
  })

  if (sppgs.length === 0) {
    console.log('  ⚠ No SPPG found, skipping feedback seed')
    return
  }

  const feedbackData = []

  for (const sppg of sppgs) {
    // Create diverse feedback for each SPPG
    const feedbackCount = sppg.name.includes('Demo') ? 15 : 25

    for (let i = 0; i < feedbackCount; i++) {
      const program = programs.length > 0 ? programs[Math.floor(Math.random() * programs.length)] : null
      const menu = program?.menus && program.menus.length > 0 ? 
        program.menus[Math.floor(Math.random() * program.menus.length)] : null
      const distribution = distributions.length > 0 ? 
        distributions[Math.floor(Math.random() * distributions.length)] : null

      // Sample feedback data with variety
      const feedbackTypes = [
        { type: FeedbackType.COMPLIMENT, weight: 0.3 },
        { type: FeedbackType.COMPLAINT, weight: 0.2 },
        { type: FeedbackType.SUGGESTION, weight: 0.25 },
        { type: FeedbackType.QUALITY_ISSUE, weight: 0.15 },
        { type: FeedbackType.SERVICE_ISSUE, weight: 0.1 }
      ]

      const beneficiaryTypes = [
        { type: BeneficiaryType.CHILD, weight: 0.6 },
        { type: BeneficiaryType.PREGNANT_MOTHER, weight: 0.15 },
        { type: BeneficiaryType.LACTATING_MOTHER, weight: 0.15 },
        { type: BeneficiaryType.ELDERLY, weight: 0.08 },
        { type: BeneficiaryType.DISABILITY, weight: 0.02 }
      ]

      // Weighted random selection
      const getRandomWeighted = <T>(items: Array<{type: T, weight: number}>) => {
        const random = Math.random()
        let sum = 0
        for (const item of items) {
          sum += item.weight
          if (random <= sum) return item.type
        }
        return items[0].type
      }

      const feedbackType = getRandomWeighted(feedbackTypes)
      const beneficiaryType = getRandomWeighted(beneficiaryTypes)

      // Generate realistic feedback content based on type
      const feedbackContent = generateFeedbackContent(feedbackType, beneficiaryType)
      
      // Rating based on feedback type
      const rating = generateRating(feedbackType)

      // Priority based on type and rating
      const priority = determinePriority(feedbackType, rating)

      // Status distribution
      const statusWeights = [
        { type: FeedbackStatus.PENDING, weight: 0.3 },
        { type: FeedbackStatus.IN_REVIEW, weight: 0.2 },
        { type: FeedbackStatus.RESPONDED, weight: 0.35 },
        { type: FeedbackStatus.RESOLVED, weight: 0.15 }
      ]
      const status = getRandomWeighted(statusWeights)

      // Create timestamps
      const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Last 30 days
      const respondedAt = status !== FeedbackStatus.PENDING ? 
        new Date(createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : null
      const resolvedAt = status === FeedbackStatus.RESOLVED ? respondedAt : null

      feedbackData.push({
        sppgId: sppg.id,
        programId: program?.id,
        beneficiaryName: generateBeneficiaryName(beneficiaryType, i),
        beneficiaryType,
        school: beneficiaryType === BeneficiaryType.CHILD ? generateSchoolName(i) : null,
        grade: beneficiaryType === BeneficiaryType.CHILD ? generateGrade() : null,
        age: generateAge(beneficiaryType),
        feedbackType,
        subject: feedbackContent.subject,
        message: feedbackContent.message,
        rating: rating > 0 ? rating : null,
        tags: generateTags(feedbackType),
        menuId: menu?.id,
        distributionId: distribution?.id,
        photos: Math.random() > 0.8 ? [generatePhotoUrl()] : [],
        anonymous: Math.random() > 0.7,
        responseRequired: Math.random() > 0.6,
        status,
        priority,
        category: generateCategory(feedbackType),
        sentiment: generateSentiment(feedbackType, rating),
        resolved: status === FeedbackStatus.RESOLVED,
        respondedAt,
        respondedBy: respondedAt ? `staff-${Math.floor(Math.random() * 3) + 1}` : null,
        response: respondedAt ? generateResponse(feedbackType) : null,
        resolvedAt,
        actionTaken: resolvedAt ? generateActionTaken(feedbackType) : null,
        createdAt,
        updatedAt: respondedAt || createdAt
      })
    }
  }

  // Create all feedback records
  const createdFeedback = await prisma.beneficiaryFeedback.createMany({
    data: feedbackData,
    skipDuplicates: true
  })

  console.log(`  ✓ Created ${createdFeedback.count} feedback records`)
  
  // Log statistics
  const stats = {
    total: feedbackData.length,
    byType: feedbackData.reduce((acc, f) => {
      acc[f.feedbackType] = (acc[f.feedbackType] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    byStatus: feedbackData.reduce((acc, f) => {
      acc[f.status] = (acc[f.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }
  
  console.log('  📊 Feedback Statistics:')
  console.log(`     Total: ${stats.total}`)
  console.log(`     By Type:`, stats.byType)
  console.log(`     By Status:`, stats.byStatus)
}

// Helper functions for generating realistic data
function generateFeedbackContent(type: FeedbackType, beneficiaryType: BeneficiaryType) {
  // Customize content based on beneficiary type
  const beneficiarySpecific = beneficiaryType === BeneficiaryType.CHILDREN ? 'anak' : 
                              beneficiaryType === BeneficiaryType.PREGNANT_MOTHER ? 'ibu hamil' : 
                              beneficiaryType === BeneficiaryType.LACTATING_MOTHER ? 'ibu menyusui' : 'keluarga'
  
  const contents = {
    [FeedbackType.COMPLIMENT]: [
      {
        subject: "Makanan Sangat Lezat dan Bergizi",
        message: `Saya sangat puas dengan kualitas makanan yang diberikan. Rasanya enak dan porsinya cukup untuk ${beneficiarySpecific}. Terima kasih atas pelayanan yang baik.`
      },
      {
        subject: "Pelayanan Staff Sangat Ramah",
        message: "Staff yang bertugas sangat ramah dan sabar dalam melayani. Mereka selalu menjelaskan menu dengan baik dan memastikan makanan sesuai kebutuhan gizi kami."
      },
      {
        subject: "Program Gizi Sangat Membantu",
        message: "Program ini sangat membantu keluarga kami. Kualitas makanan baik dan sesuai dengan kebutuhan gizi harian. Semoga program ini terus berlanjut."
      }
    ],
    [FeedbackType.COMPLAINT]: [
      {
        subject: "Makanan Sering Terlambat Datang",
        message: "Distribusi makanan sering terlambat dari jadwal yang ditentukan. Ini membuat kami harus menunggu lama dan mengganggu jadwal makan anak."
      },
      {
        subject: "Porsi Makanan Kurang Sesuai",
        message: "Porsi makanan yang diberikan terasa kurang untuk kebutuhan harian. Terutama untuk anak yang sedang dalam masa pertumbuhan."
      },
      {
        subject: "Kebersihan Kemasan Perlu Diperbaiki",
        message: "Beberapa kali menemukan kemasan makanan yang kurang bersih atau sedikit rusak. Mohon lebih diperhatikan kualitas kemasannya."
      }
    ],
    [FeedbackType.SUGGESTION]: [
      {
        subject: "Saran Variasi Menu Mingguan",
        message: "Alangkah baiknya jika menu bisa lebih bervariasi setiap minggu. Mungkin bisa ditambahkan menu tradisional atau buah-buahan segar."
      },
      {
        subject: "Perlu Aplikasi Mobile untuk Info Program",
        message: "Saran untuk membuat aplikasi mobile agar kami bisa mendapat informasi terbaru tentang jadwal distribusi dan menu harian."
      },
      {
        subject: "Jadwal Distribusi Bisa Lebih Fleksibel",
        message: "Saran agar jadwal distribusi bisa lebih fleksibel, mungkin ada beberapa pilihan waktu untuk mengakomodasi jadwal kerja orang tua."
      }
    ],
    [FeedbackType.QUALITY_ISSUE]: [
      {
        subject: "Makanan Terasa Kurang Segar",
        message: "Beberapa kali mendapat makanan yang terasa kurang segar, terutama sayuran yang sudah agak layu. Mohon diperhatikan proses penyimpanannya."
      },
      {
        subject: "Rasa Makanan Terlalu Asin",
        message: "Makanan yang diberikan terasa terlalu asin untuk anak-anak. Mungkin bisa dikurangi penggunaan garamnya agar lebih sehat."
      },
      {
        subject: "Tekstur Nasi Sering Terlalu Lembek",
        message: "Nasi yang disajikan sering terlalu lembek dan kurang pulen. Mungkin perlu diperbaiki cara memasaknya."
      }
    ],
    [FeedbackType.SERVICE_ISSUE]: [
      {
        subject: "Antrian Distribusi Kurang Teratur",
        message: "Sistem antrian saat distribusi makanan kurang teratur, sehingga terjadi penumpukan dan waktu tunggu yang lama."
      },
      {
        subject: "Informasi Jadwal Sering Berubah",
        message: "Informasi jadwal distribusi sering berubah mendadak tanpa pemberitahuan yang jelas, sehingga kami sering datang sia-sia."
      },
      {
        subject: "Staff Perlu Pelatihan Komunikasi",
        message: "Beberapa staff terlihat kurang ramah dalam berkomunikasi dan kurang sabar dalam menjelaskan informasi kepada penerima manfaat."
      }
    ]
  }

  const typeContents = contents[type as keyof typeof contents] || contents[FeedbackType.COMPLIMENT]
  return typeContents[Math.floor(Math.random() * typeContents.length)]
}

function generateRating(type: FeedbackType): number {
  switch (type) {
    case FeedbackType.COMPLIMENT:
      return Math.random() > 0.3 ? 5 : 4
    case FeedbackType.SUGGESTION:
      return Math.random() > 0.5 ? 4 : 3
    case FeedbackType.COMPLAINT:
      return Math.random() > 0.7 ? 3 : 2
    case FeedbackType.QUALITY_ISSUE:
    case FeedbackType.SERVICE_ISSUE:
      return Math.random() > 0.6 ? 2 : 1
    default:
      return 3
  }
}

function determinePriority(type: FeedbackType, rating?: number): FeedbackPriority {
  if (type === FeedbackType.QUALITY_ISSUE || type === FeedbackType.SERVICE_ISSUE) {
    return FeedbackPriority.HIGH
  }
  if (type === FeedbackType.COMPLAINT && rating && rating <= 2) {
    return FeedbackPriority.CRITICAL
  }
  if (type === FeedbackType.COMPLAINT) {
    return FeedbackPriority.HIGH
  }
  return FeedbackPriority.MEDIUM
}

function generateBeneficiaryName(type: BeneficiaryType, index: number): string {
  const childNames = [
    "Ahmad Rizki", "Siti Fatimah", "Budi Santoso", "Rina Kartika", "Doni Pratama",
    "Maya Sari", "Andi Wijaya", "Lina Marlina", "Reza Kurniawan", "Dea Anggraini",
    "Farel Naufal", "Kiara Putri", "Bayu Aji", "Citra Dewi", "Hafiz Rahman"
  ]
  
  const adultNames = [
    "Ibu Sari Rahayu", "Ibu Dewi Lestari", "Ibu Tri Wahyuni", "Ibu Eka Susanti", 
    "Ibu Nina Marliana", "Ibu Rita Sartika", "Ibu Yuni Astuti", "Ibu Wati Sukmawati",
    "Nenek Suminah", "Kakek Sutrisno", "Ibu Indah Permata", "Ibu Sri Mulyani"
  ]

  if (type === BeneficiaryType.CHILD) {
    return childNames[index % childNames.length]
  } else {
    return adultNames[index % adultNames.length]
  }
}

function generateSchoolName(index: number): string {
  const schools = [
    "SDN 01 Jakarta Pusat", "SDN 05 Jakarta Selatan", "SDN 12 Jakarta Utara",
    "SDN 08 Jakarta Timur", "SDN 15 Jakarta Barat", "SDN 22 Depok",
    "SDN 07 Bogor", "SDN 18 Tangerang", "SDN 03 Bekasi", "SDN 25 Cibubur"
  ]
  return schools[index % schools.length]
}

function generateGrade(): string {
  const grades = ["1", "2", "3", "4", "5", "6"]
  return grades[Math.floor(Math.random() * grades.length)]
}

function generateAge(type: BeneficiaryType): number {
  switch (type) {
    case BeneficiaryType.CHILD:
      return Math.floor(Math.random() * 6) + 6 // 6-12 tahun
    case BeneficiaryType.PREGNANT_MOTHER:
    case BeneficiaryType.LACTATING_MOTHER:
      return Math.floor(Math.random() * 15) + 20 // 20-35 tahun
    case BeneficiaryType.ELDERLY:
      return Math.floor(Math.random() * 20) + 60 // 60-80 tahun
    case BeneficiaryType.DISABILITY:
      return Math.floor(Math.random() * 40) + 15 // 15-55 tahun
    default:
      return 25
  }
}

function generateTags(type: FeedbackType): string[] {
  const tagOptions = {
    [FeedbackType.COMPLIMENT]: ["rasa", "kualitas", "pelayanan", "gizi", "porsi"],
    [FeedbackType.COMPLAINT]: ["terlambat", "porsi", "kualitas", "jadwal", "pelayanan"],
    [FeedbackType.SUGGESTION]: ["variasi", "jadwal", "aplikasi", "informasi", "menu"],
    [FeedbackType.QUALITY_ISSUE]: ["rasa", "tekstur", "kesegaran", "kemasan", "suhu"],
    [FeedbackType.SERVICE_ISSUE]: ["antrian", "jadwal", "komunikasi", "informasi", "koordinasi"]
  }

  const options = tagOptions[type as keyof typeof tagOptions] || tagOptions[FeedbackType.COMPLIMENT]
  const numTags = Math.floor(Math.random() * 3) + 1 // 1-3 tags
  return options.slice(0, numTags)
}

function generateCategory(type: FeedbackType): string {
  const categories = {
    [FeedbackType.COMPLIMENT]: "appreciation",
    [FeedbackType.COMPLAINT]: "service",
    [FeedbackType.SUGGESTION]: "improvement",
    [FeedbackType.QUALITY_ISSUE]: "quality",
    [FeedbackType.SERVICE_ISSUE]: "service"
  }
  return categories[type as keyof typeof categories] || "general"
}

function generateSentiment(type: FeedbackType, rating?: number): string {
  if (type === FeedbackType.COMPLIMENT) return "positive"
  if (type === FeedbackType.COMPLAINT || type === FeedbackType.QUALITY_ISSUE || type === FeedbackType.SERVICE_ISSUE) {
    return "negative"
  }
  if (rating && rating >= 4) return "positive"
  if (rating && rating <= 2) return "negative"
  return "neutral"
}

function generatePhotoUrl(): string {
  const photoIds = ["food1", "food2", "food3", "packaging1", "distribution1"]
  const photoId = photoIds[Math.floor(Math.random() * photoIds.length)]
  return `https://images.unsplash.com/photo-${photoId}?w=400&h=300&fit=crop`
}

function generateResponse(type: FeedbackType): string {
  const responses = {
    [FeedbackType.COMPLIMENT]: [
      "Terima kasih atas feedback positif Anda. Kami senang mendengar bahwa layanan kami memuaskan dan bermanfaat bagi keluarga Anda.",
      "Kami sangat menghargai apresiasi yang diberikan. Feedback seperti ini memotivasi tim kami untuk terus memberikan pelayanan terbaik."
    ],
    [FeedbackType.COMPLAINT]: [
      "Terima kasih telah menyampaikan keluhan Anda. Kami telah mencatat masalah ini dan akan segera melakukan perbaikan pada sistem distribusi kami.",
      "Kami meminta maaf atas ketidaknyamanan yang dialami. Tim kami akan mengevaluasi dan memperbaiki proses yang bermasalah."
    ],
    [FeedbackType.SUGGESTION]: [
      "Terima kasih atas saran yang konstruktif. Masukan Anda sangat berharga untuk pengembangan program ini ke depannya.",
      "Saran Anda akan kami pertimbangkan dalam rapat evaluasi program bulan depan. Terima kasih atas partisipasinya."
    ],
    [FeedbackType.QUALITY_ISSUE]: [
      "Kami meminta maaf atas masalah kualitas yang dialami. Tim quality control akan melakukan inspeksi lebih ketat untuk mencegah hal serupa.",
      "Terima kasih telah melaporkan masalah ini. Kami akan meningkatkan standar quality control dalam proses produksi."
    ],
    [FeedbackType.SERVICE_ISSUE]: [
      "Kami meminta maaf atas pelayanan yang kurang memuaskan. Staff kami akan mendapat pelatihan tambahan untuk meningkatkan kualitas layanan.",
      "Masalah yang Anda sampaikan akan menjadi fokus perbaikan sistem pelayanan kami. Terima kasih atas kesabarannya."
    ]
  }

  const typeResponses = responses[type as keyof typeof responses] || responses[FeedbackType.COMPLIMENT]
  return typeResponses[Math.floor(Math.random() * typeResponses.length)]
}

function generateActionTaken(type: FeedbackType): string {
  const actions = {
    [FeedbackType.COMPLAINT]: [
      "Memperbaiki jadwal distribusi dan sistem koordinasi dengan tim lapangan",
      "Meningkatkan kapasitas produksi dan memperbaiki sistem logistik distribusi"
    ],
    [FeedbackType.QUALITY_ISSUE]: [
      "Meningkatkan standar quality control dan pelatihan tim dapur",
      "Memperbaiki sistem penyimpanan dan proses handling makanan"
    ],
    [FeedbackType.SERVICE_ISSUE]: [
      "Memberikan pelatihan customer service kepada seluruh staff lapangan",
      "Memperbaiki sistem informasi dan komunikasi dengan penerima manfaat"
    ],
    [FeedbackType.SUGGESTION]: [
      "Mengintegrasikan saran ke dalam roadmap pengembangan program",
      "Membentuk tim khusus untuk mengevaluasi dan implementasi saran"
    ]
  }

  const typeActions = actions[type as keyof typeof actions] || ["Feedback telah dicatat dan akan ditindaklanjuti sesuai prosedur"]
  return typeActions[Math.floor(Math.random() * typeActions.length)]
}