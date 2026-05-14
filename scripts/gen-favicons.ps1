#requires -Version 5.1
# Generate favicon set from public/isotype.png
# Outputs: favicon-16.png, favicon-32.png, favicon-48.png, favicon-96.png,
#          apple-touch-icon.png (180), android-chrome-192.png, android-chrome-512.png,
#          og.png (1200x630), favicon.ico (multi-size: 16/32/48 PNG-encoded)

Add-Type -AssemblyName System.Drawing

$root   = Split-Path -Parent $PSScriptRoot
$src    = Join-Path $root 'public\isotype.png'
$outDir = Join-Path $root 'public'

if (-not (Test-Path $src)) { throw "Missing source: $src" }

function Resize-Png {
    param(
        [string]$SourcePath,
        [string]$DestPath,
        [int]$Size
    )
    $img = [System.Drawing.Image]::FromFile($SourcePath)
    try {
        $bmp = New-Object System.Drawing.Bitmap($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $bmp.SetResolution(72, 72)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        try {
            $g.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $g.SmoothingMode      = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $g.PixelOffsetMode    = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
            $g.Clear([System.Drawing.Color]::Transparent)
            $g.DrawImage($img, (New-Object System.Drawing.Rectangle 0, 0, $Size, $Size))
        } finally { $g.Dispose() }
        $bmp.Save($DestPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Dispose()
    } finally { $img.Dispose() }
    Write-Host ("[ok] {0,-30} {1}px" -f (Split-Path $DestPath -Leaf), $Size)
}

function New-OgImage {
    param([string]$SourcePath, [string]$DestPath)
    $W = 1200; $H = 630
    $img = [System.Drawing.Image]::FromFile($SourcePath)
    try {
        $bmp = New-Object System.Drawing.Bitmap($W, $H, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $bmp.SetResolution(72, 72)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        try {
            $g.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $g.SmoothingMode      = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $g.PixelOffsetMode    = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

            # Background — phosphor terminal black
            $bg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 10, 14, 10))
            $g.FillRectangle($bg, 0, 0, $W, $H)
            $bg.Dispose()

            # Centered isotype, 480px
            $S = 480
            $x = [int](($W - $S) / 2)
            $y = [int](($H - $S) / 2)
            $g.DrawImage($img, (New-Object System.Drawing.Rectangle $x, $y, $S, $S))
        } finally { $g.Dispose() }
        $bmp.Save($DestPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Dispose()
    } finally { $img.Dispose() }
    Write-Host ("[ok] {0,-30} {1}x{2}" -f (Split-Path $DestPath -Leaf), $W, $H)
}

# Build .ico containing PNG-compressed entries (modern format, supported in
# every browser that handles favicon.ico today; smaller than BMP entries).
function New-MultiIco {
    param(
        [string[]]$PngPaths,  # ordered by size ascending
        [string]$DestPath
    )
    $entries = foreach ($p in $PngPaths) {
        $bytes = [System.IO.File]::ReadAllBytes($p)
        $img   = [System.Drawing.Image]::FromFile($p)
        $w = $img.Width; $h = $img.Height
        $img.Dispose()
        [PSCustomObject]@{
            Width  = $w
            Height = $h
            Bytes  = $bytes
        }
    }

    $count = $entries.Count
    $headerSize = 6 + (16 * $count)

    $ms = New-Object System.IO.MemoryStream
    $bw = New-Object System.IO.BinaryWriter($ms)

    # ICONDIR
    $bw.Write([UInt16]0)       # reserved
    $bw.Write([UInt16]1)       # type: 1 = ICO
    $bw.Write([UInt16]$count)  # image count

    $offset = $headerSize
    foreach ($e in $entries) {
        $w = if ($e.Width  -ge 256) { 0 } else { [byte]$e.Width  }
        $h = if ($e.Height -ge 256) { 0 } else { [byte]$e.Height }
        $bw.Write([byte]$w)             # width  (0 = 256)
        $bw.Write([byte]$h)             # height (0 = 256)
        $bw.Write([byte]0)              # color count
        $bw.Write([byte]0)              # reserved
        $bw.Write([UInt16]1)            # color planes
        $bw.Write([UInt16]32)           # bits per pixel
        $bw.Write([UInt32]$e.Bytes.Length)
        $bw.Write([UInt32]$offset)
        $offset += $e.Bytes.Length
    }
    foreach ($e in $entries) { $bw.Write($e.Bytes) }

    $bw.Flush()
    [System.IO.File]::WriteAllBytes($DestPath, $ms.ToArray())
    $bw.Dispose(); $ms.Dispose()
    Write-Host ("[ok] {0,-30} multi-size ({1} entries)" -f (Split-Path $DestPath -Leaf), $count)
}

# --- Build PNG set ---
$sizes = @(16, 32, 48, 96, 180, 192, 512)
$nameMap = @{
    16  = 'favicon-16.png'
    32  = 'favicon-32.png'
    48  = 'favicon-48.png'
    96  = 'favicon-96.png'
    180 = 'apple-touch-icon.png'
    192 = 'android-chrome-192.png'
    512 = 'android-chrome-512.png'
}

foreach ($s in $sizes) {
    Resize-Png -SourcePath $src -DestPath (Join-Path $outDir $nameMap[$s]) -Size $s
}

# --- OG image ---
New-OgImage -SourcePath $src -DestPath (Join-Path $outDir 'og.png')

# --- ICO (16/32/48 PNG-embedded) ---
$icoSrc = @(
    (Join-Path $outDir $nameMap[16])
    (Join-Path $outDir $nameMap[32])
    (Join-Path $outDir $nameMap[48])
)
New-MultiIco -PngPaths $icoSrc -DestPath (Join-Path $outDir 'favicon.ico')

Write-Host "`nDone. Output in $outDir"
