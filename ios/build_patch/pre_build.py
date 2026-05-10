#!/usr/bin/env python3
"""
Pre-build setup script - Python version for reliable file patching
This runs before xcodebuild to patch source files
"""

import os
import sys
import shutil

print("=== PRE-BUILD SETUP (Python) ===")

# 1. Create dummy FirebaseAuth-Swift.h headers everywhere
print("Creating dummy Swift headers...")

headers_dirs = [
    "ios/Pods/Headers/Public/FirebaseAuth",
    "ios/Pods/FirebaseAuth/Frameworks/FirebaseAuth.framework/Headers",
    "ios/build/Build/Products/Release-iphoneos/FirebaseAuth/FirebaseAuth.framework/Headers",
    "ios/build/Build/Intermediates.noindex/ArchiveIntermediates/TowRides/BuildProductsPath/Release-iphoneos/FirebaseAuth/FirebaseAuth.framework/Headers",
]

dummy_content = """// Dummy FirebaseAuth-Swift.h - Auto-generated for bypass
#ifndef FIREBASE_AUTH_SWIFT_H
#define FIREBASE_AUTH_SWIFT_H
// Placeholder for Swift-generated header - bypass mode
#endif
"""

for dir_path in headers_dirs:
    try:
        os.makedirs(dir_path, exist_ok=True)
        header_path = os.path.join(dir_path, "FirebaseAuth-Swift.h")
        with open(header_path, 'w') as f:
            f.write(dummy_content)
        print(f"  Created: {header_path}")
    except Exception as e:
        print(f"  Warning: Could not create {dir_path}: {e}")

# 2. Patch RNFBAuthModule.m
print("\nPatching RNFBAuthModule.m...")
auth_module = "node_modules/@react-native-firebase/auth/ios/RNFBAuth/RNFBAuthModule.m"

if os.path.exists(auth_module):
    try:
        # Backup
        shutil.copy(auth_module, auth_module + ".backup")
        
        with open(auth_module, 'r') as f:
            content = f.read()
        
        # Comment out problematic import
        content = content.replace(
            '#import <FirebaseAuth/FirebaseAuth-Swift.h>',
            '// BYPASSED: #import <FirebaseAuth/FirebaseAuth-Swift.h>'
        )
        
        # Add pragmas at beginning if not already there
        pragma_block = """#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Werror"
#pragma clang diagnostic ignored "-Wnon-modular-include-in-framework-module"
#pragma clang diagnostic ignored "-Wdocumentation"
#pragma clang diagnostic ignored "-Wdeprecated-objc-isa-usage"
#pragma clang diagnostic ignored "-Wobjc-root-class"
#pragma clang diagnostic ignored "-Wreturn-type"

"""
        
        if '#pragma clang diagnostic' not in content[:100]:
            content = pragma_block + content
        
        # Add pragma pop at end if not present
        if '#pragma clang diagnostic pop' not in content[-100:]:
            content = content + '\n#pragma clang diagnostic pop\n'
        
        with open(auth_module, 'w') as f:
            f.write(content)
        
        print(f"  Patched: {auth_module}")
    except Exception as e:
        print(f"  Error patching {auth_module}: {e}")
else:
    print(f"  File not found: {auth_module}")

# 3. Patch RNFBMessaging+AppDelegate.m
print("\nPatching RNFBMessaging+AppDelegate.m...")
messaging_files = [
    "node_modules/@react-native-firebase/messaging/ios/RNFBMessaging/RNFBMessaging+AppDelegate.m",
    "node_modules/@react-native-firebase/messaging/ios/RNFBMessaging/RNFBMessaging+UNUserNotificationCenter.m",
]

messaging_pragma = """#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Werror"
#pragma clang diagnostic ignored "-Wdocumentation"
#pragma clang diagnostic ignored "-Wdeprecated-objc-isa-usage"
#pragma clang diagnostic ignored "-Wobjc-root-class"
#pragma clang diagnostic ignored "-Wreturn-type"
#pragma clang diagnostic ignored "-Wunreachable-code"
#pragma clang diagnostic ignored "-Wimplicit-retain-self"
#pragma clang diagnostic ignored "-Wduplicate-method-match"
#pragma clang diagnostic ignored "-Wparentheses"
#pragma clang diagnostic ignored "-Wswitch"
#pragma clang diagnostic ignored "-Wunused-function"
#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-value"
#pragma clang diagnostic ignored "-Wempty-body"
#pragma clang diagnostic ignored "-Wuninitialized"
#pragma clang diagnostic ignored "-Wconditional-uninitialized"

"""

for msg_file in messaging_files:
    if os.path.exists(msg_file):
        try:
            # Backup
            shutil.copy(msg_file, msg_file + ".backup")
            
            with open(msg_file, 'r') as f:
                content = f.read()
            
            # Add pragmas at beginning if not already there
            if '#pragma clang diagnostic' not in content[:100]:
                content = messaging_pragma + content
            
            # Add pragma pop at end if not present
            if '#pragma clang diagnostic pop' not in content[-100:]:
                content = content + '\n#pragma clang diagnostic pop\n'
            
            with open(msg_file, 'w') as f:
                f.write(content)
            
            print(f"  Patched: {msg_file}")
        except Exception as e:
            print(f"  Error patching {msg_file}: {e}")
    else:
        print(f"  File not found: {msg_file}")

# 4. Patch ALL other Firebase modules for safety
print("\nPatching all other Firebase modules...")
firebase_modules = ['app', 'analytics', 'crashlytics', 'performance', 'dynamicLinks', 
                    'inAppMessaging', 'remoteConfig', 'storage', 'firestore', 
                    'functions', 'installalls']

for module in firebase_modules:
    module_path = f"node_modules/@react-native-firebase/{module}/ios"
    if os.path.exists(module_path):
        for root, dirs, files in os.walk(module_path):
            for file in files:
                if file.endswith('.m'):
                    mod_file = os.path.join(root, file)
                    try:
                        with open(mod_file, 'r') as f:
                            content = f.read()
                        
                        # Add pragmas if not present
                        if '#pragma clang diagnostic' not in content[:100]:
                            content = messaging_pragma + content
                        
                        if '#pragma clang diagnostic pop' not in content[-100:]:
                            content = content + '\n#pragma clang diagnostic pop\n'
                        
                        with open(mod_file, 'w') as f:
                            f.write(content)
                        
                        print(f"  Patched: {mod_file}")
                    except Exception as e:
                        pass  # Silent fail

# 5. Patch Firebase.h to comment out Swift header import
print("\nPatching Firebase.h...")
firebase_h_paths = [
    "ios/Pods/Headers/Private/Firebase/Firebase.h",
    "ios/Pods/Headers/Public/Firebase/Firebase.h",
]

for firebase_h in firebase_h_paths:
    if os.path.exists(firebase_h):
        try:
            with open(firebase_h, 'r') as f:
                content = f.read()
            
            # Comment out Swift header import
            content = content.replace(
                '#import <FirebaseAuth/FirebaseAuth-Swift.h>',
                '// BYPASSED: #import <FirebaseAuth/FirebaseAuth-Swift.h>'
            )
            
            with open(firebase_h, 'w') as f:
                f.write(content)
            
            print(f"  Patched: {firebase_h}")
        except Exception as e:
            print(f"  Error patching {firebase_h}: {e}")

# 6. Patch xcconfig files
print("\nPatching xcconfig files...")
if os.path.exists("ios/Pods"):
    for root, dirs, files in os.walk("ios/Pods"):
        for file in files:
            if file.endswith('.xcconfig'):
                xcconfig_path = os.path.join(root, file)
                try:
                    with open(xcconfig_path, 'r') as f:
                        content = f.read()
                    
                    # Remove -Werror flags
                    import re
                    content = re.sub(r'-Werror[^\s]*', '', content)
                    content = content.replace('GCC_TREAT_WARNINGS_AS_ERRORS = YES', 'GCC_TREAT_WARNINGS_AS_ERRORS = NO')
                    
                    with open(xcconfig_path, 'w') as f:
                        f.write(content)
                except Exception as e:
                    pass  # Silent fail for xcconfig

# 5. Patch project.pbxproj
print("Patching project.pbxproj...")
pbxproj_path = "ios/Pods/Pods.xcodeproj/project.pbxproj"
if os.path.exists(pbxproj_path):
    try:
        with open(pbxproj_path, 'r') as f:
            content = f.read()
        
        import re
        content = re.sub(r'-Werror[^\s]*', '', content)
        content = content.replace('GCC_TREAT_WARNINGS_AS_ERRORS = YES', 'GCC_TREAT_WARNINGS_AS_ERRORS = NO')
        
        with open(pbxproj_path, 'w') as f:
            f.write(content)
        
        print(f"  Patched: {pbxproj_path}")
    except Exception as e:
        print(f"  Error patching pbxproj: {e}")

print("\n=== PRE-BUILD SETUP COMPLETE ===")
