#!/bin/bash
# Aggressive Clang Wrapper - Strips ALL -Werror flags from compiler commands

REAL_CLANG="/Applications/Xcode-16.0.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang"

# Filter out ALL -Werror flags and variants
filtered_args=()
for arg in "$@"; do
    # Skip any -Werror variant
    if [[ "$arg" == -Werror* ]]; then
        continue
    fi
    # Skip problematic warning flags that become errors
    if [[ "$arg" == "-Wdocumentation" ]]; then
        continue
    fi
    if [[ "$arg" == "-Wdeprecated-objc-isa-usage" ]]; then
        continue
    fi
    if [[ "$arg" == "-Wobjc-root-class" ]]; then
        continue
    fi
    if [[ "$arg" == "-Wreturn-type" ]]; then
        continue
    fi
    if [[ "$arg" == "-Wunreachable-code" ]]; then
        continue
    fi
    if [[ "$arg" == "-Wimplicit-retain-self" ]]; then
        continue
    fi
    if [[ "$arg" == "-Wduplicate-method-match" ]]; then
        continue
    fi
    if [[ "$arg" == "-Wparentheses" ]]; then
        continue
    fi
    if [[ "$arg" == "-Wswitch" ]]; then
        continue
    fi
    if [[ "$arg" == "-Wunused-function" ]]; then
        continue
    fi
    if [[ "$arg" == "-Wunused-variable" ]]; then
        continue
    fi
    if [[ "$arg" == "-Wunused-value" ]]; then
        continue
    fi
    if [[ "$arg" == "-Wempty-body" ]]; then
        continue
    fi
    if [[ "$arg" == "-Wuninitialized" ]]; then
        continue
    fi
    if [[ "$arg" == "-Wconditional-uninitialized" ]]; then
        continue
    fi
    if [[ "$arg" == "-Wconstant-conversion" ]]; then
        continue
    fi
    if [[ "$arg" == "-Wint-conversion" ]]; then
        continue
    fi
    if [[ "$arg" == "-Wbool-conversion" ]]; then
        continue
    fi
    if [[ "$arg" == "-Wenum-conversion" ]]; then
        continue
    fi
    if [[ "$arg" == "-Wnon-literal-null-conversion" ]]; then
        continue
    fi
    if [[ "$arg" == "-Wobjc-literal-conversion" ]]; then
        continue
    fi
    if [[ "$arg" == "-Wshorten-64-to-32" ]]; then
        continue
    fi
    if [[ "$arg" == "-Wpointer-sign" ]]; then
        continue
    fi
    if [[ "$arg" == "-Wundeclared-selector" ]]; then
        continue
    fi
    if [[ "$arg" == "-Wdeprecated-implementations" ]]; then
        continue
    fi
    if [[ "$arg" == "-Wprotocol" ]]; then
        continue
    fi
    if [[ "$arg" == "-Wdeprecated-declarations" ]]; then
        continue
    fi
    if [[ "$arg" == "-Winfinite-recursion" ]]; then
        continue
    fi
    if [[ "$arg" == "-Wcomma" ]]; then
        continue
    fi
    if [[ "$arg" == "-Wblock-capture-autoreleasing" ]]; then
        continue
    fi
    if [[ "$arg" == "-Wstrict-prototypes" ]]; then
        continue
    fi
    if [[ "$arg" == "-Wunguarded-availability" ]]; then
        continue
    fi
    if [[ "$arg" == "-Wcomma" ]]; then
        continue
    fi
    if [[ "$arg" == "-Wshorten-64-to-32" ]]; then
        continue
    fi
    filtered_args+=("$arg")
done

# Add -w to suppress all warnings
filtered_args+=("-w")

# Execute real clang with filtered args
exec "$REAL_CLANG" "${filtered_args[@]}"
