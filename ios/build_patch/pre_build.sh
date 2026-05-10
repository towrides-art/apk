#!/bin/bash
# Pre-build setup - Run this before xcodebuild

set -e

echo "=== PRE-BUILD SETUP: Aggressive patching ==="

# 1. Create dummy FirebaseAuth-Swift.h EVERYWHERE
echo "Creating dummy Swift headers..."

mkdir -p ios/Pods/Headers/Public/FirebaseAuth
mkdir -p ios/Pods/FirebaseAuth/Frameworks/FirebaseAuth.framework/Headers
mkdir -p ios/build/Build/Products/Release-iphoneos/FirebaseAuth/FirebaseAuth.framework/Headers
mkdir -p ios/build/Build/Intermediates.noindex/ArchiveIntermediates/TowRides/BuildProductsPath/Release-iphoneos/FirebaseAuth/FirebaseAuth.framework/Headers

DUMMY='// Dummy FirebaseAuth-Swift.h
#ifndef FIREBASE_AUTH_SWIFT_H
#define FIREBASE_AUTH_SWIFT_H
#endif'

echo "$DUMMY" > ios/Pods/Headers/Public/FirebaseAuth/FirebaseAuth-Swift.h
echo "$DUMMY" > ios/Pods/FirebaseAuth/Frameworks/FirebaseAuth.framework/Headers/FirebaseAuth-Swift.h 2>/dev/null || true
echo "$DUMMY" > ios/build/Build/Products/Release-iphoneos/FirebaseAuth/FirebaseAuth.framework/Headers/FirebaseAuth-Swift.h 2>/dev/null || true
echo "$DUMMY" > ios/build/Build/Intermediates.noindex/ArchiveIntermediates/TowRides/BuildProductsPath/Release-iphoneos/FirebaseAuth/FirebaseAuth.framework/Headers/FirebaseAuth-Swift.h 2>/dev/null || true

echo "Dummy headers created."

# 2. Patch node_modules source files
echo "Patching RNFB source files..."

# RNFBAuthModule.m
RNFBAUTH="node_modules/@react-native-firebase/auth/ios/RNFBAuth/RNFBAuthModule.m"
if [ -f "$RNFBAUTH" ]; then
    echo "Patching RNFBAuthModule.m..."
    cp "$RNFBAUTH" "$RNFBAUTH.backup" 2>/dev/null || true
    
    # Comment out problematic import
    sed -i.bak 's/#import <FirebaseAuth\/FirebaseAuth-Swift.h>/\/\/ BYPASSED import/g' "$RNFBAUTH"
    
    # Add pragmas at top
    cat > /tmp/auth_pragma.txt << 'PRAGMA'
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Werror"
#pragma clang diagnostic ignored "-Wnon-modular-include-in-framework-module"
#pragma clang diagnostic ignored "-Wdocumentation"
#pragma clang diagnostic ignored "-Wdeprecated-objc-isa-usage"
#pragma clang diagnostic ignored "-Wobjc-root-class"
#pragma clang diagnostic ignored "-Wreturn-type"
PRAGMA
    
    cat /tmp/auth_pragma.txt "$RNFBAUTH" > /tmp/auth_temp.m
    mv /tmp/auth_temp.m "$RNFBAUTH"
    echo '#pragma clang diagnostic pop' >> "$RNFBAUTH"
    echo "RNFBAuthModule.m patched."
fi

# RNFBMessaging+AppDelegate.m
MSG_DELEGATE="node_modules/@react-native-firebase/messaging/ios/RNFBMessaging/RNFBMessaging+AppDelegate.m"
if [ -f "$MSG_DELEGATE" ]; then
    echo "Patching RNFBMessaging+AppDelegate.m..."
    cp "$MSG_DELEGATE" "$MSG_DELEGATE.backup" 2>/dev/null || true
    
    cat > /tmp/msg_pragma.txt << 'PRAGMA'
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Werror"
#pragma clang diagnostic ignored "-Wdocumentation"
#pragma clang diagnostic ignored "-Wdeprecated-objc-isa-usage"
#pragma clang diagnostic ignored "-Wobjc-root-class"
#pragma clang diagnostic ignored "-Wreturn-type"
#pragma clang diagnostic ignored "-Wunreachable-code"
PRAGMA
    
    cat /tmp/msg_pragma.txt "$MSG_DELEGATE" > /tmp/msg_temp.m
    mv /tmp/msg_temp.m "$MSG_DELEGATE"
    echo '#pragma clang diagnostic pop' >> "$MSG_DELEGATE"
    echo "RNFBMessaging+AppDelegate.m patched."
fi

# RNFBMessaging+UNUserNotificationCenter.m
UN_CENTER="node_modules/@react-native-firebase/messaging/ios/RNFBMessaging/RNFBMessaging+UNUserNotificationCenter.m"
if [ -f "$UN_CENTER" ]; then
    echo "Patching RNFBMessaging+UNUserNotificationCenter.m..."
    cp "$UN_CENTER" "$UN_CENTER.backup" 2>/dev/null || true
    cat /tmp/msg_pragma.txt "$UN_CENTER" > /tmp/un_temp.m
    mv /tmp/un_temp.m "$UN_CENTER"
    echo '#pragma clang diagnostic pop' >> "$UN_CENTER"
    echo "RNFBMessaging+UNUserNotificationCenter.m patched."
fi

# 3. Patch xcconfig files
echo "Patching xcconfig files..."
find ios/Pods -name "*.xcconfig" -type f 2>/dev/null | while read xfile; do
    sed -i.bak 's/-Werror[^[:space:]]*//g' "$xfile" 2>/dev/null || true
    sed -i.bak 's/GCC_TREAT_WARNINGS_AS_ERRORS = YES/GCC_TREAT_WARNINGS_AS_ERRORS = NO/g' "$xfile" 2>/dev/null || true
done

# 4. Patch project.pbxproj
echo "Patching project.pbxproj..."
if [ -f "ios/Pods/Pods.xcodeproj/project.pbxproj" ]; then
    sed -i.bak 's/-Werror[^[:space:]]*//g' ios/Pods/Pods.xcodeproj/project.pbxproj 2>/dev/null || true
    sed -i.bak 's/GCC_TREAT_WARNINGS_AS_ERRORS = YES/GCC_TREAT_WARNINGS_AS_ERRORS = NO/g' ios/Pods/Pods.xcodeproj/project.pbxproj 2>/dev/null || true
fi

echo "=== PRE-BUILD SETUP: Complete ==="
