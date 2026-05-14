#!/bin/bash
set -e
echo "=== NUKING FIREBASE ==="
rm -rf node_modules/@react-native-firebase node_modules/@notifee node_modules/firebase node_modules/@firebase
cd ios
rm -rf Pods Podfile.lock
pod install --repo-update
rm -rf Pods/RNFBApp Pods/RNFBAuth Pods/RNFBMessaging Pods/Firebase*
find Pods/Target\ Support\ Files -maxdepth 1 -name "RNFB*" -exec rm -rf {} + 2>/dev/null || true
find Pods/Headers -name "RNFB*" -exec rm -rf {} + 2>/dev/null || true
ruby -e "require 'xcodeproj'; p = Xcodeproj::Project.open('Pods/Pods.xcodeproj'); p.targets.to_a.each { |t| t.remove_from_project if t.name =~ /RNFB|Firebase|GoogleUtilities|GTMSessionFetcher|FBLPromises|nanopb|RecaptchaInterop/i }; p.save; a = Xcodeproj::Project.open('../TowRides.xcodeproj'); a.targets.each { |t| t.build_phases.select { |b| b.respond_to?(:name) && b.name.to_s =~ /RNFB|Firebase/i }.each { |b| b.remove_from_project } }; a.save"
echo "=== DONE: ZERO FIREBASE ==="
