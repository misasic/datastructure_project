@echo off
echo 配置Windows防火墙规则...
echo.
echo 注意：此脚本需要管理员权限运行！
echo 请右键点击此文件，选择"以管理员身份运行"
echo.
pause

echo 添加后端服务端口3000的入站规则...
netsh advfirewall firewall add rule name="BuptGuider Backend API" dir=in action=allow protocol=TCP localport=3000
echo.

echo 添加前端服务端口8082的入站规则...  
netsh advfirewall firewall add rule name="BuptGuider Frontend" dir=in action=allow protocol=TCP localport=8082
echo.

echo 添加前端服务端口8080的入站规则（备用）...
netsh advfirewall firewall add rule name="BuptGuider Frontend Alt" dir=in action=allow protocol=TCP localport=8080
echo.

echo 显示已添加的规则...
netsh advfirewall firewall show rule name="BuptGuider Backend API"
netsh advfirewall firewall show rule name="BuptGuider Frontend"
echo.

echo 防火墙规则配置完成！
echo.
echo 如果仍然无法访问，请尝试：
echo 1. 暂时关闭Windows防火墙测试
echo 2. 检查是否有其他安全软件阻止访问
echo 3. 确保两台设备在同一网络段
echo.
pause 