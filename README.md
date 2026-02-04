# 💰 Finance Tracker

> **Serious Pet Project:** Полнофункциональная система учета личных финансов с микросервисной архитектурой, асинхронной обработкой задач и интерактивной аналитикой.

![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python)
![Django](https://img.shields.io/badge/Django-5.0-092E20?logo=django)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![Status](https://img.shields.io/badge/Status-MVP_v1.0-success)

---

## 📋 Оглавление
1.  [О проекте и Функционал](#-о-проекте-и-функционал)
2.  [Архитектура системы](#-архитектура-системы)
3.  [Технологический стек](#-технологический-стек)
4.  [Установка и Настройка](#-установка-и-настройка)
5.  [Запуск и Использование](#-запуск-и-использование)
6.  [Разработка и Тестирование](#-разработка-и-тестирование)
7.  [Структура проекта](#-структура-проекта)

---

## 💡 О проекте и Функционал

Приложение решает проблему агрегации личных финансов в разных валютах. В отличие от простых трекеров, здесь реализована строгая финансовая логика (ACID транзакции), двойная конвертация валют и профессиональный цикл регистрации.

### Ключевые возможности:
*   **Мультивалютность:** Поддержка **BYN, USD, EUR**.
*   **Умная аналитика:**
    *   Автоматическое скачивание курсов валют (через внешнее API).
    *   Динамическая конвертация всех трат в выбранную валюту "на лету".
    *   Графики расходов/доходов с фильтрацией по дням, неделям, месяцам и годам.
*   **Безопасность:**
    *   Вход по Email.
    *   **Double Opt-In:** Регистрация с подтверждением почты (письмо с токеном).
    *   Полная изоляция данных пользователей.
*   **Управление данными:**
    *   CRUD для кошельков и категорий.
    *   Защита истории транзакций (только удаление, без редактирования сумм).
    *   Автоматический пересчет баланса кошелька при любых операциях.

---

## 🏗 Архитектура системы

Проект построен как **Монорепозиторий** с использованием **Docker Compose**.
Вся система работает за **Nginx** (Reverse Proxy), имитируя реальную Production-среду.

### Схема взаимодействия контейнеров:

1.  **Nginx (Port 80):** Единая точка входа.
    *   Маршрутизирует `/api/` и `/admin/` -> **Backend**.
    *   Маршрутизирует `/` -> **Frontend**.
2.  **Backend (Django):** REST API сервер.
    *   Общается с **PostgreSQL** (данные).
    *   Общается с **Redis** (кэширование курсов валют + очередь задач).
3.  **Frontend (Node.js):** React SPA.
    *   Запускается в dev-режиме (Vite) с поддержкой Hot Module Replacement (HMR) через веб-сокеты.
4.  **Async Workers:**
    *   **Celery Worker:** Обрабатывает фоновые задачи (отправка писем, тяжелые вычисления).
    *   **Celery Beat:** Планировщик (запускает обновление курсов валют раз в сутки).
5.  **Mailhog:** Локальный SMTP-сервер. Перехватывает все исходящие письма для тестирования.

---

## 🛠 Технологический стек

### Backend
*   **Framework:** Django 5.0, Django REST Framework.
*   **Auth:** Djoser, SimpleJWT (Access + Refresh tokens).
*   **Database:** PostgreSQL 15.
*   **Async:** Celery 5, Redis 7.
*   **Testing:** Pytest, Model Bakery.

### Frontend
*   **Core:** React 18, TypeScript, Vite.
*   **UI/UX:** Mantine UI v7 (Components, Modals, Notifications, Dates).
*   **State:** React Hooks.
*   **Charts:** Recharts.
*   **Network:** Axios (Interceptors для авто-обновления токенов).

---

## 🚀 Установка и Настройка

### 1. Требования
*   Docker & Docker Compose (V2)
*   Make (рекомендуется для удобства)
*   Git

### 2. Клонирование
```bash
git clone <URL_РЕПОЗИТОРИЯ>
cd finance-tracker
```

### 3. Конфигурация (.env)
Создайте файл `.env` в корне проекта.
**Важно:** Для локальной разработки используйте следующие настройки:

```ini
# --- DJANGO ---
SECRET_KEY=dev-insecure-key-change-me
DEBUG=True
ALLOWED_HOSTS=*

# --- DATABASE (Postgres) ---
POSTGRES_DB=finance_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=db
POSTGRES_PORT=5432

```

---

## ▶️ Запуск и Использование

Мы используем `Makefile` для автоматизации команд.

### Первый запуск (Сборка)
```bash
make build
```
*Эта команда соберет образы Frontend и Backend, скачает зависимости и запустит все 7 контейнеров.*

### Повседневный запуск
```bash
make up
```

### Доступ к интерфейсам
После запуска система доступна по адресам:

| Сервис | URL | Описание |
| :--- | :--- | :--- |
| **Web App** | `http://localhost` | Основное приложение (React) |
| **API Docs** | `http://localhost/api/docs/` | Swagger документация API |
| **Admin Panel** | `http://localhost/admin/` | Админка Django |
| **Mailhog** | `http://localhost:8025` | **СЮДА ПРИХОДЯТ ПИСЬМА** |

### Первый вход (Регистрация)
1.  Перейдите на `http://localhost/register`.
2.  Заполните форму.
3.  Откройте **Mailhog** (`http://localhost:8025`).
4.  Найдите письмо и кликните по ссылке активации.
5.  Войдите в систему.

### Создание Суперпользователя
Для доступа в админку Django:
```bash
make su
```

---

## 💻 Разработка и Тестирование

### Команды Makefile
*   `make logs` — Смотреть логи всех контейнеров (выход: Ctrl+C).
*   `make mig` — Создать и применить миграции БД (автоматически чинит права доступа).
*   `make down` — Остановить и удалить контейнеры.
*   `make test-back` — Запустить тесты Бэкенда (Pytest).
*   `make test-front` — Запустить тесты Фронтенда (Vitest).

### Работа с базой данных
Если вы изменили модели Django:
```bash
make mig
```

### Тестирование
Проект покрыт тестами (Unit + Integration).
*   **Backend:** Тестируются модели, сигналы (баланс), API ViewSets и Celery задачи.
*   **Frontend:** Тестируются утилиты форматирования и рендеринг компонентов.

---

## 📂 Структура проекта

```text
finance-tracker/
├── backend/                # Django проект
│   ├── config/             # Настройки проекта (settings, urls, celery)
│   ├── finance/            # Приложение финансов (Models, Views, Tasks)
│   ├── users/              # Приложение пользователей (Auth, Email)
│   ├── tests/              # Pytest тесты
│   └── Dockerfile
├── frontend/               # React проект
│   ├── src/
│   │   ├── components/     # Переиспользуемые UI компоненты и Модалки
│   │   ├── pages/          # Страницы (Dashboard, Login, etc.)
│   │   ├── services/       # API слой (Axios requests)
│   │   └── types/          # TypeScript интерфейсы
│   └── Dockerfile
├── nginx/                  # Конфигурация Nginx
├── docker-compose.yml      # Оркестрация контейнеров
├── Makefile                # Команды быстрого запуска
└── README.md               # Документация
```