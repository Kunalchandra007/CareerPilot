' CareerPilot silent scan wrapper.
' Runs daily-scan.ps1 with NO visible window at all (true background scan).
' Windows Task Scheduler calls this via wscript.exe so no console ever flashes.
' Output still goes to scan.log; new jobs land in data/pipeline.md.
Dim shell, fso, here, cmd
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
here = fso.GetParentFolderName(WScript.ScriptFullName)
shell.CurrentDirectory = here
cmd = "pwsh.exe -NoProfile -ExecutionPolicy Bypass -File """ & here & "\daily-scan.ps1"""
' 0 = hidden window, True = wait for it to finish (so the task shows as running).
shell.Run cmd, 0, True
