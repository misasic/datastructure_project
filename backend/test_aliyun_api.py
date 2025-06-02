import os
import requests
from pathlib import Path
from PIL import Image, ImageDraw
from generate_video_aliyun import AliyunTurboAPI

def create_test_image():
    # 创建一个简单的测试图片
    image_path = os.path.join("backend", "temp", "image_0.jpg")
    
    print(f"正在创建测试图片到: {image_path}")
    try:
        # 创建一个512x512的彩色图片
        img = Image.new('RGB', (512, 512), color='white')
        draw = ImageDraw.Draw(img)
        
        # 画一个简单的图案
        for i in range(0, 512, 64):
            for j in range(0, 512, 64):
                color = (i % 255, j % 255, (i + j) % 255)
                draw.rectangle([i, j, i+32, j+32], fill=color)
        
        # 确保目录存在
        os.makedirs(os.path.dirname(image_path), exist_ok=True)
        
        # 保存图片，使用较高的质量设置
        img.save(image_path, "JPEG", quality=95, optimize=True)
        print("测试图片创建成功")
        return image_path
    except Exception as e:
        print(f"创建测试图片时发生错误: {str(e)}")
        return None

def test_api():
    # 检查环境变量
    api_key = os.getenv("DASHSCOPE_API_KEY")
    if not api_key:
        print("错误: 未设置DASHSCOPE_API_KEY环境变量")
        print("请设置环境变量: DASHSCOPE_API_KEY=your_api_key")
        return
    
    print("环境变量检查通过")
    
    try:
        # 使用Python HTTP服务器提供的图片URL
        image_url = "http://39.107.221.54:8000/image_0.jpg"
        print(f"使用图片URL: {image_url}")
        
        # 设置输出路径
        output_path = os.path.join("backend", "temp", "test_output.mp4")
        print(f"输出视频路径: {output_path}")
        
        # 创建API实例并生成视频
        api = AliyunTurboAPI()
        success = api.generate_video(
            image_url=image_url,
            prompt="生成一个流畅的视频",
            output_path=output_path,
            resolution="720P",
            duration=5,
            prompt_extend=True
        )
        
        if success:
            print("测试成功！视频已生成")
            print(f"视频保存在: {output_path}")
        else:
            print("测试失败！请检查错误信息。")
            
    except Exception as e:
        print(f"测试过程中发生错误: {str(e)}")
        print("测试失败！请检查错误信息。")

if __name__ == "__main__":
    test_api() 