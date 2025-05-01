# Используем Bun образ
FROM oven/bun:1 AS base

WORKDIR /app

# Копируем файлы зависимостей
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Копируем Prisma схему и генерируем клиент
COPY prisma ./prisma/
RUN bunx prisma generate

# Копируем весь проект
COPY . .

# Билдим Next.js проект
RUN bun run build

# Стадия production
FROM oven/bun:1 AS production

WORKDIR /app

# Установка только production зависимостей
COPY package.json bun.lockb* ./
RUN bun install --production --frozen-lockfile

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
CMD ["sh", "-c", "bunx prisma migrate deploy && bun start"]