#!/bin/bash
# Скрипт проверки установки Example App
# Должен вернуть "1" или "true" или "installed" если установлено, иначе "0" или "false"

if command -v example-app &> /dev/null; then
    echo "1"
else
    echo "0"
fi

