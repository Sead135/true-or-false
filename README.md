# Правда или ложь

Свайп-игра: утверждение → правда или ложь → звёзды → следующий уровень.  
Гость играет локально (IndexedDB), аккаунт сохраняет прогресс и XP на сервере. Есть админка.

## Стек

- **Nuxt 4** + Vue 3, Tailwind / Nuxt UI (админка)
- **Neon** Postgres + **Drizzle**
- **Better Auth** (email/password, роли `owner` | `admin` | `user`)
- **oxlint** + **oxfmt** (как в React-проектах; шаблоны Vue oxlint пока не линтит)
- Деплой: Node-хостинг (Nitro default; напр. Layero)

## Быстрый старт

Нужны [Bun](https://bun.sh) и база Neon (или любой Postgres).

```bash
cp .env.example .env.local
# заполни DATABASE_URL, BETTER_AUTH_SECRET, ADMIN_* , NUXT_PUBLIC_APP_URL

bun install
bun run db:push
bun run seed:admin
bun run seed:content
bun run dev
```

Открой [http://localhost:3000](http://localhost:3000).  
Админка: зайди под `ADMIN_EMAIL` → `/admin`.

`.env.local` в git не коммитить.

## Переменные окружения

| Переменная                       | Зачем                                      |
| -------------------------------- | ------------------------------------------ |
| `DATABASE_URL`                   | Postgres (Neon)                            |
| `BETTER_AUTH_SECRET`             | Секрет сессий Better Auth                  |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Первый админ (`seed:admin`)                |
| `NUXT_PUBLIC_APP_URL`            | URL сайта как в браузере (без `/` в конце) |
| `BETTER_AUTH_TRUSTED_ORIGINS`    | Опционально: доп. origins через запятую    |

## Скрипты

```bash
bun run dev          # локальная разработка (.env.local)
bun run build        # продакшен-сборка
bun run typecheck
bun run lint         # oxlint (скрипты Vue / TS; шаблоны пока не линтит)
bun run lint:fix
bun run format       # oxfmt
bun run format:check
bun test             # юнит-тесты (звёзды, unlock, хелперы)

bun run db:push      # схема → БД
bun run db:generate  # миграции Drizzle
bun run db:studio

bun run seed:admin   # создать/обновить админа из env
bun run seed:content # уровни и вопросы
```

## Как устроено

**Игра.** Вопросы приходят с ключом ответа на клиент — проверка мгновенная. В конце раунда ответы уходят на сервер, звёзды и прогресс считаются по БД (подделать URL результата нельзя).

**Гость.** Прогресс в IndexedDB; после логина мержится через `/api/progress/sync`.

**Админка.** Уровни, вопросы (включая DnD-порядок), пользователи, статистика. Скрытие и «удаление» — soft (`hidden`), чтобы текущие партии не ломались.

**Роли.** `owner` / `admin` — доступ в `/admin`. Обычный `user` — только игра и аккаунт.

## Структура

```
app/          страницы и UI
server/api/   Nitro API
lib/          схема БД, auth, ачивки, грейдинг
scripts/      сиды
tests/        тесты
```

## Деплой

`bun run build`, те же env что в `.env.local`.

**Auth на проде:** `NUXT_PUBLIC_APP_URL` = канонический URL (`https://твой-домен`).  
Доп. origins (preview и т.п.) — в `BETTER_AUTH_TRUSTED_ORIGINS` через запятую.
