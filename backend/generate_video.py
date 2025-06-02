import argparse
import os
import torch
from diffusers import StableVideoDiffusionPipeline
from PIL import Image
import numpy as np
from tqdm import tqdm

def load_images(input_dir):
    """加载输入目录中的所有图片"""
    images = []
    for filename in sorted(os.listdir(input_dir)):
        if filename.endswith(('.jpg', '.jpeg', '.png')):
            image_path = os.path.join(input_dir, filename)
            image = Image.open(image_path)
            images.append(image)
    return images

def generate_video(images, output_path, style, duration, fps, resolution):
    """使用Stable Video Diffusion生成视频"""
    # 初始化模型
    pipe = StableVideoDiffusionPipeline.from_pretrained(
        "stabilityai/stable-video-diffusion-img2vid",
        torch_dtype=torch.float16,
        variant="fp16"
    )
    
    if torch.cuda.is_available():
        pipe = pipe.to("cuda")
    
    # 设置视频参数
    width, height = map(int, resolution.split('x'))
    num_frames = duration * fps
    
    # 为每张图片生成视频片段
    video_segments = []
    for image in tqdm(images, desc="生成视频片段"):
        # 调整图片大小
        image = image.resize((width, height))
        
        # 生成视频片段
        video_frames = pipe(
            image,
            num_frames=num_frames,
            num_inference_steps=25,
            motion_bucket_id=127,
            noise_aug_strength=0.1
        ).frames
        
        video_segments.extend(video_frames)
    
    # 保存视频
    video_frames = np.stack(video_segments)
    video_frames = (video_frames * 255).astype(np.uint8)
    
    # 使用OpenCV保存视频
    import cv2
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    for frame in video_frames:
        # 转换颜色空间从RGB到BGR
        frame_bgr = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        out.write(frame_bgr)
    
    out.release()

def main():
    parser = argparse.ArgumentParser(description='使用Stable Video Diffusion生成视频')
    parser.add_argument('--input_dir', required=True, help='输入图片目录')
    parser.add_argument('--output_path', required=True, help='输出视频路径')
    parser.add_argument('--style', default='cinematic', help='视频风格')
    parser.add_argument('--duration', type=int, default=10, help='视频时长（秒）')
    parser.add_argument('--fps', type=int, default=30, help='帧率')
    parser.add_argument('--resolution', default='1280x720', help='视频分辨率')
    
    args = parser.parse_args()
    
    # 加载图片
    images = load_images(args.input_dir)
    if not images:
        raise ValueError("没有找到有效的图片文件")
    
    # 生成视频
    generate_video(
        images,
        args.output_path,
        args.style,
        args.duration,
        args.fps,
        args.resolution
    )

if __name__ == '__main__':
    main() 