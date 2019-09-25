#!/usr/bin/env sh

set -e

dir=$(dirname $0)

openssl rand -hex 32 >$dir/seller.key
openssl rand -hex 32 >$dir/buyer.key

function error() {
  echo >&2 "Error: $1"
  exit 2
}

function confirm() {
  local user_input
  while true; do
    read -p "$1 [Y/n] " user_input
    if [[ $user_input =~ ^(Y|y|Yes|yes)?$ ]]; then
      break
    fi
    if [[ $user_input =~ ^N|n|No|no$ ]]; then
      error ''
    fi
    echo "Please answer Yes or No."
  done
}
