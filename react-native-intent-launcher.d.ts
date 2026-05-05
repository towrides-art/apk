declare module 'react-native-intent-launcher' {
  export interface IntentLauncher {
    startActivity(options: { action: string }): void;
  }

  export const IntentLauncher: IntentLauncher;
}
