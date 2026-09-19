# R67 - Atualizador online Golnexa

Esta versao adiciona a base nativa que elimina o USB nas versoes seguintes.

## Regra do Android

O Android exige que o usuario autorize a fonte e confirme a instalacao. O aplicativo nunca desinstala a versao atual e a assinatura do APK continua sendo validada pelo Android.

## Variaveis no Render

Deixe `ANDROID_UPDATE_ENABLED=false` ate publicar um APK novo por HTTPS. Para liberar uma versao, configure:

- `ANDROID_UPDATE_ENABLED=true`
- `ANDROID_UPDATE_VERSION_CODE=4` (sempre maior que o instalado)
- `ANDROID_UPDATE_VERSION_NAME=1.0.1`
- `ANDROID_UPDATE_APK_URL=https://.../golnexa.apk`
- `ANDROID_UPDATE_APK_SHA256=<64 caracteres>`
- `ANDROID_UPDATE_MANDATORY=false`
- `ANDROID_UPDATE_MINIMUM_VERSION_CODE=0`
- `ANDROID_UPDATE_NOTES=Melhorias e correcoes`

O APK precisa usar o mesmo `applicationId` e o mesmo certificado de assinatura. O download e recusado se nao for HTTPS, exceder 200 MiB ou tiver SHA-256 diferente.