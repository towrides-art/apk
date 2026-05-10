#!/bin/bash
# Override clang setup - Source this file before xcodebuild

set -e

echo "=== OVERRIDING CLANG ==="

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Make wrapper executable
chmod +x "$SCRIPT_DIR/clang_wrapper.sh" 2>/dev/null || true

# Set compiler environment variables
export CC="$SCRIPT_DIR/clang_wrapper.sh"
export CXX="$SCRIPT_DIR/clang_wrapper.sh"
export LD="$SCRIPT_DIR/clang_wrapper.sh"
export LDPLUSPLUS="$SCRIPT_DIR/clang_wrapper.sh"

# Export for child processes
export -p CC CXX LD LDPLUSPLUS 2>/dev/null || true

echo "CC set to: $CC"
echo "Clang override complete."
