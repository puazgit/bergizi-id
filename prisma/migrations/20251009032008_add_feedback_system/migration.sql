-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('COMPLAINT', 'SUGGESTION', 'COMPLIMENT', 'INQUIRY', 'QUALITY_ISSUE', 'SERVICE_ISSUE', 'PORTION_ISSUE', 'NUTRITION_CONCERN');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'RESPONDED', 'RESOLVED', 'CLOSED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "FeedbackPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "beneficiary_feedback" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "programId" TEXT,
    "beneficiaryId" TEXT,
    "beneficiaryName" TEXT NOT NULL,
    "beneficiaryType" "BeneficiaryType" NOT NULL,
    "school" TEXT,
    "grade" TEXT,
    "age" INTEGER,
    "feedbackType" "FeedbackType" NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "rating" INTEGER,
    "tags" TEXT[],
    "menuId" TEXT,
    "distributionId" TEXT,
    "photos" TEXT[],
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "FeedbackPriority" NOT NULL DEFAULT 'MEDIUM',
    "category" TEXT,
    "sentiment" TEXT,
    "aiAnalysis" JSONB,
    "responseRequired" BOOLEAN NOT NULL DEFAULT false,
    "respondedAt" TIMESTAMP(3),
    "respondedBy" TEXT,
    "response" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "actionTaken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beneficiary_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_summary" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalFeedback" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "positiveFeedback" INTEGER NOT NULL DEFAULT 0,
    "negativeFeedback" INTEGER NOT NULL DEFAULT 0,
    "neutralFeedback" INTEGER NOT NULL DEFAULT 0,
    "qualityFeedback" INTEGER NOT NULL DEFAULT 0,
    "serviceFeedback" INTEGER NOT NULL DEFAULT 0,
    "nutritionFeedback" INTEGER NOT NULL DEFAULT 0,
    "portionFeedback" INTEGER NOT NULL DEFAULT 0,
    "responseRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageResponseTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "resolutionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "satisfactionScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "recommendationScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedback_summary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "beneficiary_feedback_sppgId_status_idx" ON "beneficiary_feedback"("sppgId", "status");

-- CreateIndex
CREATE INDEX "beneficiary_feedback_feedbackType_rating_idx" ON "beneficiary_feedback"("feedbackType", "rating");

-- CreateIndex
CREATE INDEX "beneficiary_feedback_createdAt_idx" ON "beneficiary_feedback"("createdAt");

-- CreateIndex
CREATE INDEX "feedback_summary_sppgId_period_idx" ON "feedback_summary"("sppgId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_summary_sppgId_period_date_key" ON "feedback_summary"("sppgId", "period", "date");

-- AddForeignKey
ALTER TABLE "beneficiary_feedback" ADD CONSTRAINT "beneficiary_feedback_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficiary_feedback" ADD CONSTRAINT "beneficiary_feedback_programId_fkey" FOREIGN KEY ("programId") REFERENCES "nutrition_programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficiary_feedback" ADD CONSTRAINT "beneficiary_feedback_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "nutrition_menus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficiary_feedback" ADD CONSTRAINT "beneficiary_feedback_distributionId_fkey" FOREIGN KEY ("distributionId") REFERENCES "food_distributions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficiary_feedback" ADD CONSTRAINT "beneficiary_feedback_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "school_beneficiaries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_summary" ADD CONSTRAINT "feedback_summary_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;
