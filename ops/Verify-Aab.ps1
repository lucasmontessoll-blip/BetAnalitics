param(
  [Parameter(Mandatory=$true)][string]$Aab,
  [Parameter(Mandatory=$true)][string]$Bundletool,
  [int]$ExpectedVersionCode = 3,
  [string]$ExpectedSha256 = ''
)
$ErrorActionPreference = 'Stop'
try {
  if (!(Test-Path -LiteralPath $Aab -PathType Leaf)) { throw 'AAB ausente' }
  if (!(Test-Path -LiteralPath $Bundletool -PathType Leaf)) { throw 'Bundletool ausente' }
  $AabPath = (Resolve-Path -LiteralPath $Aab).Path
  $ToolPath = (Resolve-Path -LiteralPath $Bundletool).Path
  $Hash = (Get-FileHash -LiteralPath $AabPath -Algorithm SHA256).Hash
  Write-Host "AAB_SHA256=$Hash"
  if ($ExpectedSha256 -and $Hash -ne $ExpectedSha256) { throw 'Hash diferente do esperado' }
  $Version = @(& java -jar $ToolPath dump manifest "--bundle=$AabPath" '--xpath=/manifest/@android:versionCode')
  if ($LASTEXITCODE -ne 0) { throw 'Falha ao ler versionCode' }
  $ActualVersion = ($Version -join '').Trim()
  Write-Host "AAB_VERSION_CODE=$ActualVersion"
  if ($ActualVersion -ne [string]$ExpectedVersionCode) { throw 'VersionCode diferente do esperado' }
  $Package = @(& java -jar $ToolPath dump manifest "--bundle=$AabPath" '--xpath=/manifest/@package')
  if ($LASTEXITCODE -ne 0 -or ($Package -join '').Trim() -ne 'com.betanalytics.pro') { throw 'Application ID incorreto' }
  $Verify = @(& jarsigner '-J-Duser.language=en' '-J-Duser.country=US' -verify $AabPath 2>&1)
  $VerifyCode = $LASTEXITCODE
  if ($VerifyCode -ne 0 -or !($Verify -match 'jar verified\.') -or ($Verify -match 'jar is unsigned')) { throw 'Assinatura nao verificada' }
  Write-Host 'JARSIGNER_VERIFIED=True'
  Write-Host 'UPLOAD_CERTIFICATE_MATCH=NOT_CHECKED'
  Write-Host 'DEVICE_TEST=NOT_EXECUTED'
  Write-Host 'STORE_RELEASE_APPROVED=False'
  Write-Host 'AAB_STATIC_CHECK=PASS'
} catch {
  Write-Host "AAB_STATIC_CHECK=FAIL;REASON=$($_.Exception.Message)"
  exit 1
}
