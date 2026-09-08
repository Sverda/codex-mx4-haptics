param([Parameter(Mandatory = $true)][string]$SoundPath)
$ErrorActionPreference = 'Stop'
try {
    $player = New-Object System.Media.SoundPlayer
    try {
        $player.SoundLocation = $SoundPath
        $player.Load()
        $player.PlaySync()
    } finally { $player.Dispose() }
} catch {
    $entry = @{ time = [DateTime]::UtcNow.ToString('o'); status = 'audio-failed'; error = $_.Exception.Message } | ConvertTo-Json -Compress
    Add-Content -LiteralPath (Join-Path $PSScriptRoot 'diagnostics.jsonl') -Value $entry
    exit 1
}
