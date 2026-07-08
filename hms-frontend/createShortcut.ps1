# PowerShell script to create a Windows Desktop Shortcut for AuraHealth HMS
$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath('Desktop')
$Shortcut = $WshShell.CreateShortcut("$DesktopPath\AuraHealth HMS.lnk")

# Set Target and Working Directory
$Shortcut.TargetPath = "cmd.exe"
$Shortcut.Arguments = "/c cd /d `"d:\vishal\Hospital\hms-frontend`" && npm.cmd run electron:dev"
$Shortcut.WorkingDirectory = "d:\vishal\Hospital\hms-frontend"
$Shortcut.Description = "Launch AuraHealth Hospital Management System Console"

# Set custom logo.ico as the desktop icon
$Shortcut.IconLocation = "d:\vishal\Hospital\hms-frontend\public\logo.ico"

# Save shortcut
$Shortcut.Save()

Write-Host "Desktop shortcut created successfully at: $DesktopPath\AuraHealth HMS.lnk"
