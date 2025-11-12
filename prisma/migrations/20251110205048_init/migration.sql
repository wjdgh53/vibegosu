-- CreateTable
CREATE TABLE "Bot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticker" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "stopLoss" REAL NOT NULL,
    "takeProfit" REAL NOT NULL,
    "sentimentThreshold" REAL NOT NULL DEFAULT 0.7,
    "webhookUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Position" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "botId" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "entryPrice" REAL NOT NULL,
    "quantity" REAL NOT NULL,
    "entryTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'open',
    "exitPrice" REAL,
    "exitTime" DATETIME,
    CONSTRAINT "Position_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "botId" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "entryPrice" REAL NOT NULL,
    "exitPrice" REAL,
    "profit" REAL,
    "sentimentScore" REAL,
    "newsTitles" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'completed',
    "rejectionReason" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Trade_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Bot_webhookUrl_key" ON "Bot"("webhookUrl");

-- CreateIndex
CREATE INDEX "Bot_ticker_idx" ON "Bot"("ticker");

-- CreateIndex
CREATE INDEX "Position_botId_idx" ON "Position"("botId");

-- CreateIndex
CREATE INDEX "Position_ticker_idx" ON "Position"("ticker");

-- CreateIndex
CREATE INDEX "Position_status_idx" ON "Position"("status");

-- CreateIndex
CREATE INDEX "Trade_botId_idx" ON "Trade"("botId");

-- CreateIndex
CREATE INDEX "Trade_ticker_idx" ON "Trade"("ticker");

-- CreateIndex
CREATE INDEX "Trade_timestamp_idx" ON "Trade"("timestamp");

-- CreateIndex
CREATE INDEX "Notification_timestamp_idx" ON "Notification"("timestamp");
