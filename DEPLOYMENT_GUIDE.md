# iOS Deployment Guide

## Current Configuration

**Developer Account:** Jasmine Erkel (jasmine@erkel.com)
**Team ID:** 8U6N58MTLU
**Bundle Identifier:** com.jasmineerkel.obddiagnosticapp
**Signing:** Automatic (managed by Xcode)

## Deploying to Jasmine's iPhone

1. **Connect your iPhone** to the Mac via USB
2. **Unlock your iPhone**
3. **Trust the computer:**
   - A popup will appear on your iPhone: "Trust This Computer?"
   - Tap "Trust"
   - Enter your device passcode if prompted
   - If Screen Time is enabled, you may need to enter your Screen Time passcode
4. **Open Xcode:**
   - Open `OBDDiagnosticApp.xcworkspace` (NOT the .xcodeproj file)
5. **Select your device:**
   - At the top of Xcode, click the device selector
   - Choose "Jasmine's iPhone" from the list
6. **Run the app:**
   - Click the Play button (▶) or press Cmd+R
   - If prompted for keychain access, enter your **Mac login password**
   - Click "Always Allow" to avoid repeated prompts

## Deploying to Ethan's Phone

1. **Connect Ethan's iPhone** to the Mac via USB
2. **Unlock Ethan's iPhone**
3. **Trust the computer:**
   - A popup will appear on Ethan's iPhone: "Trust This Computer?"
   - Tap "Trust"
   - Enter device passcode if prompted
4. **Open Xcode:**
   - Open `OBDDiagnosticApp.xcworkspace`
5. **Select Ethan's device:**
   - At the top of Xcode, click the device selector
   - Choose "Ethan's iPhone" (or whatever name appears) from the list
6. **Run the app:**
   - Click the Play button (▶) or press Cmd+R
   - The same signing configuration works for both devices

## Important Notes

- Both phones use the **same Apple Developer account** (Jasmine's)
- Both phones use the **same signing certificate**
- You can have both phones connected at the same time
- Just switch between them using the device selector in Xcode

## Troubleshooting

### "Trust This Computer" not appearing
- Disconnect and reconnect the iPhone
- Make sure the iPhone is unlocked
- Try a different USB cable or port

### Password not working
- Use your **Mac login password**, not your Apple ID password
- Click "Always Allow" to avoid repeated prompts

### App not installing
- Make sure the phone is unlocked during installation
- Check that Developer Mode is enabled on the iPhone:
  - Settings > Privacy & Security > Developer Mode > ON
  - Restart the iPhone after enabling

### Device not showing in Xcode
- Check that the phone is unlocked and trusted
- Disconnect and reconnect the USB cable
- Restart Xcode if needed

## Quick Reference

**Xcode Workspace:** `ios/OBDDiagnosticApp.xcworkspace`
**Project Location:** `/Users/jasmineerkel/OBD_Project/obd-diagnostic-app/OBDDiagnosticApp/`
**Certificate:** Apple Development: jasmine@erkel.com (7927HGNDMX)
