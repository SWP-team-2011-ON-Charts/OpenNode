@echo off

set DEPLOY_DIR=out

..\lib\jsbuilder\JSBuilder.bat --projectFile build.jsb3 --deployDir %DEPLOY_DIR% --verbose
