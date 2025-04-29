#!/bin/sh

set -e

ENTRY_POINT="./src/index.ts"
BIN_NAME="./out/introspector-ts"

bun install
bun build $ENTRY_POINT --outfile $BIN_NAME --compile
chmod 751 $BIN_NAME
