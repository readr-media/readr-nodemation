-- CreateTable
CREATE TABLE "ModuleType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "ModuleUnit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "module_type_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "action_code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "icon_key" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ModuleUnit_module_type_id_fkey" FOREIGN KEY ("module_type_id") REFERENCES "ModuleType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
