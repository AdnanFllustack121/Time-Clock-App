-- CreateTable
CREATE TABLE `Users` (
    `id` INTEGER NOT NULL,
    `firstName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `contact` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `isSuperAdmin` BOOLEAN NULL,
    `isAdmin` BOOLEAN NULL,
    `storeURL` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Attendance` (
    `id` INTEGER NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `in_time` DATETIME(3) NOT NULL,
    `out_time` DATETIME(3) NULL,
    `note` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL,
    `storeURL` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Leaves` (
    `id` INTEGER NOT NULL,
    `type` VARCHAR(191) NULL,
    `reason` VARCHAR(191) NULL,
    `storeURL` VARCHAR(191) NULL,
    `duration` VARCHAR(191) NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NULL,
    `createdBy` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
