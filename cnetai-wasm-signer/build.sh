#!/bin/bash

# Build script for CNetAI WASM signer

# Check if wasm-pack is installed
if ! command -v wasm-pack &> /dev/null
then
    echo "wasm-pack could not be found. Installing..."
    cargo install wasm-pack
fi

# Build the WASM package
echo "Building WASM package..."
wasm-pack build --target web --out-dir pkg

echo "Build complete! WASM package is in the pkg/ directory."