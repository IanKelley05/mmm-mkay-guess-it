# Deterministic close-up from the existing 1920x1080 Kenny portrait.
Add-Type -AssemblyName System.Drawing
$projectRoot = Split-Path -Parent $PSScriptRoot
$source = [System.Drawing.Image]::FromFile((Join-Path $projectRoot 'assets/characters/kenny-mccormick.png'))
try {
    $crop = New-Object System.Drawing.Rectangle 620,145,680,680
    foreach ($size in @(16,32,180)) {
        $bitmap = New-Object System.Drawing.Bitmap $size,$size
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        try {
            $graphics.Clear([System.Drawing.Color]::Transparent)
            $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $target = New-Object System.Drawing.Rectangle 0,0,$size,$size
            $graphics.DrawImage($source,$target,$crop,[System.Drawing.GraphicsUnit]::Pixel)
            $name = if ($size -eq 180) { 'kenny-touch-icon.png' } else { "kenny-favicon-$size.png" }
            $bitmap.Save((Join-Path $projectRoot "assets/$name"),[System.Drawing.Imaging.ImageFormat]::Png)
        } finally {
            $graphics.Dispose()
            $bitmap.Dispose()
        }
    }
} finally { $source.Dispose() }
