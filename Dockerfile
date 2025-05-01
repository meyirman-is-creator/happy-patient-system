# Используем официальный Node.js образ
FROM node:20-alpine AS base

# Установка необходимых зависимостей для компиляции пакетов
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Установка pnpm (более эффективный пакетный менеджер)
RUN npm install -g pnpm

# Копируем файлы зависимостей
COPY package*.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Копируем Prisma схему и генерируем клиент
COPY prisma ./prisma/
RUN npx prisma generate

# Копируем весь проект
COPY . .

# Билдим Next.js проект
RUN pnpm build

# Стадия production
FROM node:20-alpine AS production

WORKDIR /app

# Установка только production зависимостей
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --prod --frozen-lockfile

# Копируем Prisma схему и клиент
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/node_modules/.prisma ./node_modules/.prisma

# Копируем билд
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public

# Переменные окружения
ENV NODE_ENV=production
ENV PORT=3000

# Экспозируем порт
EXPOSE 3000

# Запускаем приложение
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]