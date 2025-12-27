#!/bin/bash
# Скрипт получения последней версии
# Должен вернуть последнюю доступную версию

# Пример получения версии через API
curl -s https://api.github.com/repos/example/example-app/releases/latest | grep -oP '"tag_name": "\K[^"]*' | head -1

