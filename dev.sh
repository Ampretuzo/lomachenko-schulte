#!/usr/bin/env sh

if ! [ -x "$(command -v live-server)" ]; then
    Color_Off="\033[0m"
    Blue="\033[0;34m"
    echo 'live-server not installed!' >&2
    echo -e "Run ${Blue}npm install -g live-server${Color_Off} to install it." >&2
    exit 1
fi

live-server --port=1111 # --no-browser
