@echo off
chcp 65001 >nul
echo =====================================================
echo           个性化旅游系统 - 数据初始化脚本
echo =====================================================
echo.
echo 本脚本将初始化系统数据，满足 task_requirements.txt 的要求
echo 目标：生成 200+ 条真实的景点和学校数据
echo.
echo 请确保：
echo 1. 已安装 Node.js 
echo 2. 已运行 npm install 安装依赖
echo 3. 数据库服务正在运行
echo.
pause

echo.
echo [1/3] 检查 Node.js 环境...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js 未安装或未添加到 PATH
    pause
    exit /b 1
)

echo.
echo [2/3] 检查项目依赖...
if not exist "node_modules\" (
    echo 📦 正在安装项目依赖...
    npm install
)

echo.
echo [3/3] 运行数据初始化...
echo 🚀 开始执行最终数据初始化脚本...
node final-data-init.js

if %errorlevel% equ 0 (
    echo.
    echo ✅ 数据初始化成功完成！
    echo.
    echo 📋 生成的数据包括：
    echo    • 100+ 个真实景点数据
    echo    • 100+ 个真实大学数据
    echo    • 总计满足 200+ 条数据要求
    echo.
    echo 🎯 所有数据均基于真实信息，确保数据质量
    echo.
) else (
    echo.
    echo ❌ 数据初始化失败！
    echo 请检查数据库连接和配置
    echo.
)

echo 按任意键退出...
pause >nul 