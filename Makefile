DC = docker compose
BACKEND = backend
EXEC = $(DC) exec $(BACKEND)
MANAGE = python manage.py

.PHONY: up down logs build fix mig su shell help

# ==============================================================================
# Docker Management
# ==============================================================================

up: ## Запустить контейнеры (в фоне)
	$(DC) up -d

build: ## Пересобрать и запустить контейнеры
	$(DC) up -d --build

down: ## Остановить контейнеры
	$(DC) down

logs: ## Смотреть логи (backend и db)
	$(DC) logs -f

# ==============================================================================
# Django Commands
# ==============================================================================

mig:
	$(EXEC) $(MANAGE) makemigrations
	$(EXEC) $(MANAGE) migrate
	@make fix

su: ## Создать суперпользователя
	$(EXEC) $(MANAGE) createsuperuser

sh: ## Зайти внутрь контейнера backend (bash)
	$(EXEC) bash

# ==============================================================================
# Utils
# ==============================================================================

fix:
	sudo chown -R $(USER):$(USER) .

prune: ## Полная очистка Docker (удаляет все остановленные контейнеры и неиспользуемые образы)
	docker system prune -a --volumes

help: ## Показать список команд
	@echo "Usage: make [command]"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
