/*
  Warnings:

  - You are about to drop the column `caloriesContrib` on the `menu_ingredients` table. All the data in the column will be lost.
  - You are about to drop the column `carbsContrib` on the `menu_ingredients` table. All the data in the column will be lost.
  - You are about to drop the column `fatContrib` on the `menu_ingredients` table. All the data in the column will be lost.
  - You are about to drop the column `proteinContrib` on the `menu_ingredients` table. All the data in the column will be lost.
  - You are about to drop the column `calcium` on the `nutrition_menus` table. All the data in the column will be lost.
  - You are about to drop the column `calories` on the `nutrition_menus` table. All the data in the column will be lost.
  - You are about to drop the column `carbohydrates` on the `nutrition_menus` table. All the data in the column will be lost.
  - You are about to drop the column `fat` on the `nutrition_menus` table. All the data in the column will be lost.
  - You are about to drop the column `fiber` on the `nutrition_menus` table. All the data in the column will be lost.
  - You are about to drop the column `iron` on the `nutrition_menus` table. All the data in the column will be lost.
  - You are about to drop the column `protein` on the `nutrition_menus` table. All the data in the column will be lost.
  - You are about to drop the column `sodium` on the `nutrition_menus` table. All the data in the column will be lost.
  - You are about to drop the column `sugar` on the `nutrition_menus` table. All the data in the column will be lost.
  - You are about to drop the column `vitaminA` on the `nutrition_menus` table. All the data in the column will be lost.
  - You are about to drop the column `vitaminC` on the `nutrition_menus` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "menu_ingredients" DROP COLUMN "caloriesContrib",
DROP COLUMN "carbsContrib",
DROP COLUMN "fatContrib",
DROP COLUMN "proteinContrib";

-- AlterTable
ALTER TABLE "nutrition_menus" DROP COLUMN "calcium",
DROP COLUMN "calories",
DROP COLUMN "carbohydrates",
DROP COLUMN "fat",
DROP COLUMN "fiber",
DROP COLUMN "iron",
DROP COLUMN "protein",
DROP COLUMN "sodium",
DROP COLUMN "sugar",
DROP COLUMN "vitaminA",
DROP COLUMN "vitaminC";
