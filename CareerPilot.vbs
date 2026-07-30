' CareerPilot — silent launcher.
' Runs CareerPilot.bat with NO console window so double-clicking the desktop
' icon just opens the dashboard in your browser (a true "app" feel).
Dim shell, fso, here
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
here = fso.GetParentFolderName(WScript.ScriptFullName)
' 0 = hidden window, False = don't wait for it to finish
shell.CurrentDirectory = here
shell.Run """" & here & "\CareerPilot.bat""", 0, False
