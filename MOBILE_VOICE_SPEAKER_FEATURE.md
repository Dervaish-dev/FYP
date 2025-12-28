# Mobile Voice Journal - Speaker Toggle Feature

## Overview
Added speaker/earpiece toggle functionality to the voice journal call dialog on mobile, allowing users to switch between speaker mode and earpiece mode during voice calls.

## Implementation

### Flutter UI Changes

#### File: `/lib/widgets/retell_voice_webview.dart`

**Added State Variables**:
```dart
bool _isSpeakerOn = true; // Speaker mode on by default
static const platform = MethodChannel('com.neurocompanion/audio');
```

**Speaker Toggle Method**:
```dart
Future<void> _toggleSpeaker() async {
  try {
    await platform.invokeMethod('setSpeakerMode', {'enabled': !_isSpeakerOn});
    setState(() {
      _isSpeakerOn = !_isSpeakerOn;
    });
  } catch (e) {
    print('Failed to toggle speaker: $e');
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to toggle speaker: $e'),
          backgroundColor: Colors.orange,
        ),
      );
    }
  }
}
```

**Auto-Enable Speaker on Call Start**:
```dart
@override
void initState() {
  super.initState();
  _initializeWebView();
  _enableSpeakerMode(); // Enable speaker by default
}

Future<void> _enableSpeakerMode() async {
  try {
    await platform.invokeMethod('setSpeakerMode', {'enabled': true});
  } catch (e) {
    print('Failed to enable speaker on init: $e');
  }
}
```

**UI Button**:
```dart
// Speaker toggle button (above End Call button)
SizedBox(
  width: double.infinity,
  child: OutlinedButton.icon(
    onPressed: _toggleSpeaker,
    style: OutlinedButton.styleFrom(
      foregroundColor: _isSpeakerOn ? theme.primary : theme.text.withOpacity(0.7),
      side: BorderSide(
        color: _isSpeakerOn ? theme.primary : theme.text.withOpacity(0.3),
        width: 2,
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      padding: const EdgeInsets.symmetric(vertical: 14),
    ),
    icon: Icon(
      _isSpeakerOn ? Icons.volume_up : Icons.phone_in_talk,
      size: 22,
    ),
    label: Text(
      _isSpeakerOn ? 'Speaker On' : 'Speaker Off (Earpiece)',
      style: const TextStyle(
        fontSize: 15,
        fontWeight: FontWeight.w600,
      ),
    ),
  ),
),
```

### iOS Implementation

#### File: `/ios/Runner/AppDelegate.swift`

**Method Channel Setup**:
```swift
import AVFoundation

override func application(...) -> Bool {
  GeneratedPluginRegistrant.register(with: self)
  
  // Set up audio method channel
  let controller: FlutterViewController = window?.rootViewController as! FlutterViewController
  let audioChannel = FlutterMethodChannel(name: "com.neurocompanion/audio",
                                         binaryMessenger: controller.binaryMessenger)
  
  audioChannel.setMethodCallHandler({ [weak self] (call: FlutterMethodCall, result: @escaping FlutterResult) -> Void in
    if call.method == "setSpeakerMode" {
      guard let args = call.arguments as? [String: Any],
            let enabled = args["enabled"] as? Bool else {
        result(FlutterError(code: "INVALID_ARGUMENT", message: "enabled parameter required", details: nil))
        return
      }
      self?.setSpeakerMode(enabled: enabled, result: result)
    } else {
      result(FlutterMethodNotImplemented)
    }
  })
  
  return super.application(application, didFinishLaunchingWithOptions: launchOptions)
}
```

**Speaker Mode Handler**:
```swift
private func setSpeakerMode(enabled: Bool, result: @escaping FlutterResult) {
  do {
    let audioSession = AVAudioSession.sharedInstance()
    try audioSession.setCategory(.playAndRecord, mode: .voiceChat, options: [.allowBluetooth])
    
    if enabled {
      try audioSession.overrideOutputAudioPort(.speaker)
    } else {
      try audioSession.overrideOutputAudioPort(.none)
    }
    
    try audioSession.setActive(true)
    result(true)
  } catch {
    result(FlutterError(code: "AUDIO_ERROR", 
                       message: "Failed to set speaker mode: \(error.localizedDescription)", 
                       details: nil))
  }
}
```

#### File: `/ios/Runner/Info.plist`

**Added Microphone Permission**:
```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app needs microphone access to record voice journals</string>
```

### Android Implementation

#### File: `/android/app/src/main/kotlin/.../MainActivity.kt`

**Method Channel Setup**:
```kotlin
import android.content.Context
import android.media.AudioManager
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    private val AUDIO_CHANNEL = "com.neurocompanion/audio"
    
    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, AUDIO_CHANNEL)
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "setSpeakerMode" -> {
                        val enabled = call.argument<Boolean>("enabled")
                        if (enabled == null) {
                            result.error("INVALID_ARGUMENT", "enabled parameter required", null)
                            return@setMethodCallHandler
                        }
                        setSpeakerMode(enabled, result)
                    }
                    else -> result.notImplemented()
                }
            }
    }
    
    private fun setSpeakerMode(enabled: Boolean, result: MethodChannel.Result) {
        try {
            val audioManager = getSystemService(Context.AUDIO_SERVICE) as AudioManager
            audioManager.mode = AudioManager.MODE_IN_COMMUNICATION
            audioManager.isSpeakerphoneOn = enabled
            result.success(true)
        } catch (e: Exception) {
            result.error("AUDIO_ERROR", "Failed to set speaker mode: ${e.message}", null)
        }
    }
}
```

#### File: `/android/app/src/main/AndroidManifest.xml`

**Added Audio Permissions**:
```xml
<!-- Audio permissions for voice calls -->
<uses-permission android:name="android.permission.RECORD_AUDIO"/>
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS"/>
```

## Architecture

### Platform Channel Communication

```
Flutter (Dart)
    ↓ MethodChannel('com.neurocompanion/audio')
    ↓ platform.invokeMethod('setSpeakerMode', {'enabled': true/false})
    ↓
Native Platform
    ↓
iOS: AVAudioSession.overrideOutputAudioPort(.speaker | .none)
Android: AudioManager.isSpeakerphoneOn = true/false
    ↓
Result → Flutter (success: true | error)
```

## User Experience

### Default Behavior
- **Speaker mode is ON** when call starts
- Audio plays through device speaker (loudspeaker)
- User can hear AI prompts clearly without holding phone to ear

### Toggle Button
- Located above "End Call & Save" button
- **When Speaker ON**: 
  - Shows `🔊 Speaker On` with blue primary color
  - Icon: `volume_up`
  - Audio through loudspeaker
  
- **When Speaker OFF**: 
  - Shows `📞 Speaker Off (Earpiece)` with gray color
  - Icon: `phone_in_talk`
  - Audio through earpiece (normal phone call mode)

### Visual States
```
┌─────────────────────────────────┐
│  🎙️ Voice Recording Active     │
│                                 │
│     [Pulsing Mic Icon]          │
│                                 │
│         00:23                   │
│   Speak naturally about...      │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🔊 Speaker On           │   │  ← Toggle button
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 📞 End Call & Save      │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

## Error Handling

### Platform Channel Errors
```dart
try {
  await platform.invokeMethod('setSpeakerMode', {'enabled': !_isSpeakerOn});
  setState(() {
    _isSpeakerOn = !_isSpeakerOn;
  });
} catch (e) {
  // Shows orange snackbar with error message
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Text('Failed to toggle speaker: $e'),
      backgroundColor: Colors.orange,
    ),
  );
}
```

### Possible Error Scenarios
1. **Permission Denied**: User denied microphone permission
2. **Audio Session Conflict**: Another app is using audio
3. **Platform Not Implemented**: Running on unsupported platform (web, desktop)
4. **Native Exception**: Platform-specific audio errors

## Testing Checklist

### iOS Testing
- [ ] Speaker mode enables on call start
- [ ] Can toggle between speaker and earpiece
- [ ] Audio routes correctly to speaker
- [ ] Audio routes correctly to earpiece
- [ ] Microphone permission request appears
- [ ] Works with Bluetooth headset connected
- [ ] Error handling for denied permissions

### Android Testing
- [ ] Speaker mode enables on call start
- [ ] Can toggle between speaker and earpiece
- [ ] `AudioManager.isSpeakerphoneOn` works correctly
- [ ] Audio permissions granted
- [ ] Works with Bluetooth headset connected
- [ ] Error handling for denied permissions

### UI/UX Testing
- [ ] Button shows correct icon (volume_up vs phone_in_talk)
- [ ] Button shows correct text (Speaker On vs Off)
- [ ] Button colors change correctly (primary vs gray)
- [ ] Toggle is responsive (no lag)
- [ ] Error messages display correctly
- [ ] Button disabled during 'connecting' state

## Known Limitations

1. **Web Platform**: Platform channels don't work on web (WebView handles audio routing)
2. **Desktop**: Not implemented for desktop platforms (Windows/macOS/Linux)
3. **Bluetooth Priority**: Bluetooth devices may override speaker settings
4. **Background Mode**: Audio routing may reset when app backgrounds

## Technical Details

### Method Channel Name
```dart
'com.neurocompanion/audio'
```

### Method Name
```dart
'setSpeakerMode'
```

### Parameters
```dart
{
  'enabled': bool // true = speaker, false = earpiece
}
```

### Return Value
```dart
true // success
FlutterError // failure with code, message, details
```

## Audio Session Configuration

### iOS
```swift
Category: .playAndRecord
Mode: .voiceChat
Options: [.allowBluetooth]
Output: .speaker | .none
```

### Android
```kotlin
Mode: AudioManager.MODE_IN_COMMUNICATION
SpeakerphoneOn: true | false
```

## Future Enhancements

### Potential Features
1. **Auto-detect Bluetooth**: Disable speaker button when Bluetooth connected
2. **Persistent Preference**: Remember user's speaker preference
3. **Visual Indicator**: Show current audio route (speaker/earpiece/Bluetooth)
4. **Volume Control**: Add volume slider for speaker mode
5. **Proximity Sensor**: Auto-switch to earpiece when phone near face

### Code Improvements
1. Add proper dispose to reset audio session
2. Add listener for audio route changes
3. Add vibration feedback on toggle
4. Add animation to button state change

---

**Status**: Implementation Complete ✅  
**Files Modified**: 5 files (1 Dart, 2 iOS, 2 Android)  
**Lines Added**: ~150 lines  
**Ready for**: Device testing (iOS/Android)  
**Dependencies**: None (uses native platform APIs)
