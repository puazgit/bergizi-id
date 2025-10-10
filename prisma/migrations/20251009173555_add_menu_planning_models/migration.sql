-- CreateEnum
CREATE TYPE "AgeGroup" AS ENUM ('BALITA_6_23', 'BALITA_2_5', 'ANAK_6_12', 'REMAJA_13_18', 'DEWASA_19_59', 'LANSIA_60_PLUS');

-- CreateEnum
CREATE TYPE "ActivityLevel" AS ENUM ('SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE');

-- CreateEnum
CREATE TYPE "MenuPlanStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'REVIEWED', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'ACTIVE', 'COMPLETED', 'ARCHIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('PLANNED', 'CONFIRMED', 'IN_PRODUCTION', 'PRODUCED', 'DISTRIBUTED', 'COMPLETED', 'CANCELLED', 'SUBSTITUTED');

-- CreateTable
CREATE TABLE "menu_plans" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "MenuPlanStatus" NOT NULL DEFAULT 'DRAFT',
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "totalDays" INTEGER NOT NULL DEFAULT 0,
    "totalMenus" INTEGER NOT NULL DEFAULT 0,
    "averageCostPerDay" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalEstimatedCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nutritionScore" DOUBLE PRECISION,
    "varietyScore" DOUBLE PRECISION,
    "costEfficiency" DOUBLE PRECISION,
    "meetsNutritionStandards" BOOLEAN NOT NULL DEFAULT false,
    "meetsbudgetConstraints" BOOLEAN NOT NULL DEFAULT false,
    "planningRules" JSONB,
    "generationMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_assignments" (
    "id" TEXT NOT NULL,
    "menuPlanId" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "assignedDate" TIMESTAMP(3) NOT NULL,
    "mealType" "MealType" NOT NULL,
    "plannedPortions" INTEGER NOT NULL DEFAULT 0,
    "estimatedCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "calories" INTEGER NOT NULL DEFAULT 0,
    "protein" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "carbohydrates" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isSubstitute" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'PLANNED',
    "isProduced" BOOLEAN NOT NULL DEFAULT false,
    "isDistributed" BOOLEAN NOT NULL DEFAULT false,
    "actualPortions" INTEGER,
    "actualCost" DOUBLE PRECISION,
    "productionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_plan_templates" (
    "id" TEXT NOT NULL,
    "menuPlanId" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "templatePattern" JSONB NOT NULL,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_plan_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_standards" (
    "id" TEXT NOT NULL,
    "targetGroup" "TargetGroup" NOT NULL,
    "ageGroup" "AgeGroup" NOT NULL,
    "gender" "Gender",
    "activityLevel" "ActivityLevel" NOT NULL DEFAULT 'MODERATE',
    "calories" INTEGER NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "carbohydrates" DOUBLE PRECISION NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,
    "fiber" DOUBLE PRECISION NOT NULL,
    "calcium" DOUBLE PRECISION,
    "iron" DOUBLE PRECISION,
    "vitaminA" DOUBLE PRECISION,
    "vitaminC" DOUBLE PRECISION,
    "vitaminD" DOUBLE PRECISION,
    "vitaminE" DOUBLE PRECISION,
    "folate" DOUBLE PRECISION,
    "zinc" DOUBLE PRECISION,
    "caloriesMin" INTEGER,
    "caloriesMax" INTEGER,
    "proteinMin" DOUBLE PRECISION,
    "proteinMax" DOUBLE PRECISION,
    "source" TEXT,
    "referenceYear" INTEGER,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutrition_standards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "menu_plans_programId_startDate_endDate_idx" ON "menu_plans"("programId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "menu_plans_sppgId_idx" ON "menu_plans"("sppgId");

-- CreateIndex
CREATE INDEX "menu_plans_createdBy_idx" ON "menu_plans"("createdBy");

-- CreateIndex
CREATE INDEX "menu_assignments_menuPlanId_assignedDate_idx" ON "menu_assignments"("menuPlanId", "assignedDate");

-- CreateIndex
CREATE INDEX "menu_assignments_menuId_idx" ON "menu_assignments"("menuId");

-- CreateIndex
CREATE INDEX "menu_assignments_assignedDate_idx" ON "menu_assignments"("assignedDate");

-- CreateIndex
CREATE UNIQUE INDEX "menu_assignments_menuPlanId_assignedDate_mealType_key" ON "menu_assignments"("menuPlanId", "assignedDate", "mealType");

-- CreateIndex
CREATE INDEX "menu_plan_templates_sppgId_category_idx" ON "menu_plan_templates"("sppgId", "category");

-- CreateIndex
CREATE INDEX "menu_plan_templates_createdBy_idx" ON "menu_plan_templates"("createdBy");

-- CreateIndex
CREATE INDEX "nutrition_standards_targetGroup_ageGroup_idx" ON "nutrition_standards"("targetGroup", "ageGroup");

-- CreateIndex
CREATE UNIQUE INDEX "nutrition_standards_targetGroup_ageGroup_gender_activityLev_key" ON "nutrition_standards"("targetGroup", "ageGroup", "gender", "activityLevel");

-- AddForeignKey
ALTER TABLE "menu_plans" ADD CONSTRAINT "menu_plans_programId_fkey" FOREIGN KEY ("programId") REFERENCES "nutrition_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_plans" ADD CONSTRAINT "menu_plans_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_plans" ADD CONSTRAINT "menu_plans_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_plans" ADD CONSTRAINT "menu_plans_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_assignments" ADD CONSTRAINT "menu_assignments_menuPlanId_fkey" FOREIGN KEY ("menuPlanId") REFERENCES "menu_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_assignments" ADD CONSTRAINT "menu_assignments_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "nutrition_menus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_assignments" ADD CONSTRAINT "menu_assignments_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "food_productions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_plan_templates" ADD CONSTRAINT "menu_plan_templates_menuPlanId_fkey" FOREIGN KEY ("menuPlanId") REFERENCES "menu_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_plan_templates" ADD CONSTRAINT "menu_plan_templates_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_plan_templates" ADD CONSTRAINT "menu_plan_templates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
