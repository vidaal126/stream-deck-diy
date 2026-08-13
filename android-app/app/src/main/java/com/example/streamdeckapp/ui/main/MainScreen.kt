package com.example.streamdeckapp.ui.main

import android.app.AlertDialog
import android.content.Context
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.EditText
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import androidx.navigation3.runtime.NavKey

private const val PREFS_NAME = "stream_deck_prefs"
private const val KEY_SERVER_URL = "server_url"

// Placeholder LAN address; every network is different. Editable in-app via
// long-press on first launch (and later, since DHCP can hand out a new IP).
private const val DEFAULT_SERVER_URL = "http://192.168.1.100:3000"

private fun getServerUrl(context: Context): String {
  val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
  return prefs.getString(KEY_SERVER_URL, DEFAULT_SERVER_URL) ?: DEFAULT_SERVER_URL
}

private fun setServerUrl(context: Context, url: String) {
  context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit().putString(KEY_SERVER_URL, url).apply()
}

private fun showServerUrlDialog(context: Context, webView: WebView) {
  val input = EditText(context).apply { setText(getServerUrl(context)) }
  AlertDialog.Builder(context)
    .setTitle("Endereço do servidor")
    .setMessage("Ex: http://192.168.1.100:3000")
    .setView(input)
    .setPositiveButton("Salvar") { _, _ ->
      val url = input.text.toString().trim()
      if (url.isNotEmpty()) {
        setServerUrl(context, url)
        webView.loadUrl(url)
      }
    }
    .setNegativeButton("Cancelar", null)
    .show()
}

@Composable
fun MainScreen(
  onItemClick: (NavKey) -> Unit,
  modifier: Modifier = Modifier,
) {
  AndroidView(
    modifier = Modifier.fillMaxSize(),
    factory = { context ->
      WebView(context).apply {
        // The page ships its own responsive viewport meta tag, so the legacy
        // desktop-site flags (useWideViewPort/loadWithOverviewMode) are not needed.
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        webViewClient = WebViewClient()
        // Long-press anywhere to change the server address without reinstalling
        // the app (useful if the PC's LAN IP changes).
        setOnLongClickListener {
          showServerUrlDialog(context, this)
          true
        }
        loadUrl(getServerUrl(context))
      }
    }
  )
}
