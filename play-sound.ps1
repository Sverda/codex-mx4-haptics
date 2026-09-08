param([Parameter(Mandatory = $true)][string]$SoundPath, [switch]$Background)
$ErrorActionPreference = 'Stop'
function Write-AudioDiagnostic([string]$Status) {
    $entry = @{ time = [DateTime]::UtcNow.ToString('o'); status = $Status; pid = $PID; sound = [IO.Path]::GetFileName($SoundPath) } | ConvertTo-Json -Compress
    Add-Content -LiteralPath (Join-Path $PSScriptRoot 'diagnostics.jsonl') -Value $entry
}
try {
    if ($Background) {
        # Start-Process creates an independent hidden player on Windows.
        $arguments = @('-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
            '-File', ('"' + $PSCommandPath + '"'), '-SoundPath', ('"' + $SoundPath + '"'))
        Start-Process -FilePath (Join-Path $PSHOME 'powershell.exe') -WindowStyle Hidden -ArgumentList $arguments
        exit 0
    }
    Write-AudioDiagnostic 'audio-started'
    $player = New-Object System.Media.SoundPlayer
    try {
        $player.SoundLocation = $SoundPath
        $player.Load()
        Write-AudioDiagnostic 'audio-loaded'
        $player.PlaySync()
        Write-AudioDiagnostic 'audio-completed'
    } finally { $player.Dispose() }
} catch {
    $entry = @{ time = [DateTime]::UtcNow.ToString('o'); status = 'audio-failed'; error = $_.Exception.Message } | ConvertTo-Json -Compress
    Add-Content -LiteralPath (Join-Path $PSScriptRoot 'diagnostics.jsonl') -Value $entry
    exit 1
}
