# ============================================================
#  نشر تطبيق النور الإسلامي على السيرفر
#  Deploy El-Noor Islamic App to Windows Server
# ============================================================
#  هذا السكربت يحزم الملفات المطلوبة فقط (بدون node_modules)
#  ويرفعها إلى السيرفر، ثم يثبّت الاعتماديات ويشغّل الخدمة.
# ============================================================
#  الاستخدام:
#    1) عدّل متغيرات السيرفر بالأسفل
#    2) شغّل: .\deploy\publish-to-server.ps1
# ============================================================

# ================== إعدادات السيرفر ==================
# عدّل هذه القيم لتطابق سيرفرك
$ServerUser     = "Administrator"          # اسم المستخدم للسيرفر
$ServerHost     = "203.0.113.50"           # IP العام للسيرفر
$RemoteDir      = "C:\noor"                # مسار التطبيق على السيرفر
$SshKeyPath     = ""                       # مسار ملف المفتاح الخاص (اتركه فارغاً لاستخدام كلمة المرور)
# ====================================================

$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$BundleName  = "noor-deploy.zip"
$BundlePath  = Join-Path $env:TEMP $BundleName

$ErrorActionPreference = "Stop"
Write-Host ""
Write-Host "=== نشر تطبيق النور الإسلامي على السيرفر ===" -ForegroundColor Cyan
Write-Host ""

# --------------------------------------------------
# 1) التحقق من البناء
# --------------------------------------------------
if (-not (Test-Path (Join-Path $ProjectRoot "dist\server.cjs"))) {
    Write-Host "[خطأ] مجلد dist غير موجود. شغّل أولاً: npm run build" -ForegroundColor Red
    exit 1
}
Write-Host "[✓] تم العثور على بناء الإنتاج" -ForegroundColor Green

# --------------------------------------------------
# 2) حزم الملفات المطلوبة فقط
# --------------------------------------------------
Write-Host "[…] حزم ملفات النشر..." -ForegroundColor Yellow

$items = @(
    "dist",
    "public",
    "package.json",
    "package-lock.json",
    ".env.production"
)

# إنشاء ملف zip يدوياً (ضغط مجلد dist و public)
if (Test-Path $BundlePath) { Remove-Item $BundlePath -Force }

Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression
$zip = [System.IO.Compression.ZipFile]::Open($BundlePath, [System.IO.Compression.ZipArchiveMode]::Create)

function Add-DirToZip($sourceDir, $zip, [string]$entryPrefix) {
    Get-ChildItem -Path $sourceDir -Recurse -File | ForEach-Object {
        $relative = $_.FullName.Substring((Resolve-Path $sourceDir).Path.Length + 1)
        $entryName = if ($entryPrefix) { "$entryPrefix/$relative" } else { $relative }
        $entryName = $entryName -replace '\\', '/'
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $entryName, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
}

Add-DirToZip (Join-Path $ProjectRoot "dist") $zip "dist"
Add-DirToZip (Join-Path $ProjectRoot "public") $zip "public"

# إضافة الملفات المفردة
foreach ($file in @("package.json", ".env.production")) {
    $src = Join-Path $ProjectRoot $file
    if (Test-Path $src) {
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $src, $file, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
}
$zip.Dispose()

$sizeMB = [math]::Round((Get-Item $BundlePath).Length / 1MB, 2)
Write-Host "[✓] تم إنشاء الحزمة: $BundlePath ($sizeMB MB)" -ForegroundColor Green

# --------------------------------------------------
# 3) رفع الحزمة للسيرفر
# --------------------------------------------------
Write-Host ""
Write-Host "[…] رفع الحزمة إلى $ServerHost : $RemoteDir ..." -ForegroundColor Yellow

$remoteBundle = "C:\Windows\Temp\$BundleName"

if ($SshKeyPath) {
    scp -i $SshKeyPath $BundlePath "${ServerUser}@${ServerHost}:$remoteBundle"
} else {
    Write-Host ""
    Write-Host "  [!] لم يتم تحديد مفتاح SSH. سيتم استخدام كلمة المرور." -ForegroundColor Yellow
    Write-Host "  [!] يُنصح بشدة باستخدام مفتاح SSH بدلاً من كلمة المرور." -ForegroundColor Yellow
    Write-Host ""
    scp $BundlePath "${ServerUser}@${ServerHost}:$remoteBundle"
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "[خطأ] فشل رفع الحزمة. تحقق من بيانات الاتصال." -ForegroundColor Red
    exit 1
}
Write-Host "[✓] تم رفع الحزمة" -ForegroundColor Green

# --------------------------------------------------
# 4) التثبيت على السيرفر
# --------------------------------------------------
Write-Host ""
Write-Host "[…] تثبيت الملفات وتشغيل الخدمة على السيرفر..." -ForegroundColor Yellow

$remoteScript = @"
`$ErrorActionPreference = 'Stop'
if (Test-Path '$RemoteDir') { Remove-Item '$RemoteDir' -Recurse -Force }
New-Item -ItemType Directory -Force -Path '$RemoteDir' | Out-Null
Expand-Archive -Path '$remoteBundle' -DestinationPath '$RemoteDir' -Force
Copy-Item '$RemoteDir\.env.production' '$RemoteDir\.env' -Force
Set-Location '$RemoteDir'
npm install --omit=dev --no-audit --no-fund
`$env:NODE_ENV='production'
`$env:PORT='3001'
node dist\server.cjs
"@

$remoteScriptPath = Join-Path $env:TEMP "noor-remote-install.ps1"
$remoteScript | Out-File -FilePath $remoteScriptPath -Encoding UTF8

if ($SshKeyPath) {
    scp -i $SshKeyPath $remoteScriptPath "${ServerUser}@${ServerHost}:C:\Windows\Temp\noor-remote-install.ps1"
    ssh -i $SshKeyPath "${ServerUser}@${ServerHost}" "powershell -ExecutionPolicy Bypass -File C:\Windows\Temp\noor-remote-install.ps1"
} else {
    scp $remoteScriptPath "${ServerUser}@${ServerHost}:C:\Windows\Temp\noor-remote-install.ps1"
    ssh "${ServerUser}@${ServerHost}" "powershell -ExecutionPolicy Bypass -File C:\Windows\Temp\noor-remote-install.ps1"
}

Write-Host ""
Write-Host "=== اكتمل النشر ===" -ForegroundColor Green
Write-Host "  الرابط: https://noor.zka2soba3y.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "  الخطوات التالية على السيرفر:" -ForegroundColor White
Write-Host "   1) تأكد من تشغيل Watchdog الدائم (انظر deploy/README.md)" -ForegroundColor Gray
Write-Host "   2) تأكد من تشغيل Cloudflare Tunnel على المنفذ 8080 (انظر deploy/README.md)" -ForegroundColor Gray
Write-Host ""
