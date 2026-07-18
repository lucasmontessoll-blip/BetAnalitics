package com.betanalytics.pro;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onBackPressed() {
    try {
      if (this.bridge != null && this.bridge.getWebView() != null) {
        this.bridge.getWebView().post(new Runnable() {
          @Override
          public void run() {
            MainActivity.this.bridge.getWebView().evaluateJavascript("window.dispatchEvent(new Event('betAndroidBackButton'));", null);
          }
        });
        return;
      }
    } catch (Exception e) {
      // fallback seguro
    }

    super.onBackPressed();
  }
}