#!/bin/bash
# Скрипт получения текущей версии
# Должен вернуть версию в формате строки

if command -v example-app &> /dev/null; then
    example-app --version
else
    echo ""
fi

