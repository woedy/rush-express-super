# Rush Express Customer

Minimal Flutter app for Rush Express customer flows (auth, orders, tracking).

## Setup
- Run `flutter pub get`.
- Use API base URL override if needed: `flutter run --dart-define=API_URL=http://10.0.2.2:8000`.
- Offline cache is stored with `shared_preferences` for last orders and tracking timeline.

## Firebase messaging (push notifications)
1) Create a Firebase project and add an Android app with package `com.rushexpress.customer`.
2) Download `google-services.json` into `mobile-customer/android/app/`.
3) Add the Google Services Gradle plugin in `android/build.gradle.kts` and `android/app/build.gradle.kts`.
4) Run `flutterfire configure` (optional) to generate config files.
5) Start the app and approve notification permissions.

