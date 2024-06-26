#!/bin/bash

# Collection of shortcuts
# for rapid development

case "$1" in
  "init")
    python3 -m venv .env
    source ./.env/bin/activate
    if [ -f "requirements.txt" ]; then
      pip3 install -r requirements.txt
    fi
    ;;
  "activate")
    source ./.env/bin/activate
    ;;
  "install")
    pip3 install "${@:2}"
    pip3 freeze > requirements.txt
    ;;
  "start")
    python3 main.py "${@:2}"
    ;;
  *)
    echo "Unknown command: $1"
    exit 1
    ;;
esac
