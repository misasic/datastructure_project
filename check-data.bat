@echo off
chcp 65001 >nul
echo =====================================================
echo           个性化旅游系统 - 数据检查
echo =====================================================
echo.
echo 正在检查数据库中的数据...
echo.

cd backend
node verify-data.js

echo.
echo 按任意键退出...
pause >nul 