#!/usr/bin/env ruby
# FIX PODS SCRIPT - Removes -Werror from all Pods targets
# This runs as a post_install hook in Podfile

require 'xcodeproj'

puts "=== FIX PODS: Starting... ==="

# Open Pods project
pods_project_path = 'Pods/Pods.xcodeproj'
if !File.exist?(pods_project_path)
  puts "[ERROR] Pods project not found at #{pods_project_path}"
  exit 1
end

project = Xcodeproj::Project.open(pods_project_path)

# Target names to fix
firebase_targets = ['RNFBAuth', 'RNFBMessaging', 'RNFBApp', 'FirebaseCore', 'FirebaseAuth']

count = 0
project.targets.each do |target|
  # Check if this is a Firebase-related target
  if firebase_targets.any? { |ft| target.name.include?(ft) } || target.name.include?('RNFB')
    puts "Fixing target: #{target.name}"
    
    target.build_configurations.each do |config|
      # Remove all warning flags that cause errors
      config.build_settings['WARNING_CFLAGS'] = '-w'
      config.build_settings['OTHER_CFLAGS'] = '-w'
      config.build_settings['GCC_TREAT_WARNINGS_AS_ERRORS'] = 'NO'
      config.build_settings['SWIFT_TREAT_WARNINGS_AS_ERRORS'] = 'NO'
      config.build_settings['GCC_WARN_INHIBIT_ALL_WARNINGS'] = 'YES'
      
      # Remove -Werror from existing flags
      if config.build_settings['OTHER_CFLAGS']
        config.build_settings['OTHER_CFLAGS'] = config.build_settings['OTHER_CFLAGS'].to_s.gsub(/-Werror[=a-z-]*/, '').gsub(/-Werror/, '')
      end
      
      count += 1
    end
  end
end

# Save project
project.save

puts "=== FIX PODS: Fixed #{count} build configurations ==="
puts "=== FIX PODS: Complete ==="
