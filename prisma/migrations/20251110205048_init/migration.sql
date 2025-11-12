-- CreateTable
CREATE TABLE "Bot" (
    "id" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "stopLoss" DOUBLE PRECISION NOT NULL,
    "takeProfit" DOUBLE PRECISION NOT NULL,
    "sentimentThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "webhookUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "entryPrice" DOUBLE PRECISION NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "entryTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'open',
    "exitPrice" DOUBLE PRECISION,
    "exitTime" TIMESTAMP(3),

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "entryPrice" DOUBLE PRECISION NOT NULL,
    "exitPrice" DOUBLE PRECISION,
    "profit" DOUBLE PRECISION,
    "sentimentScore" DOUBLE PRECISION,
    "newsTitles" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'completed',
    "rejectionReason" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Bot_ticker_idx" ON "Bot"("ticker");

-- CreateIndex
CREATE UNIQUE INDEX "Bot_webhookUrl_key" ON "Bot"("webhookUrl");

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

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

