import os
import requests
import time
from dotenv import load_dotenv

class AliyunTurboAPI:
    def __init__(self):
        # 加载环境变量
        load_dotenv()
        self.api_key = os.getenv('DASHSCOPE_API_KEY')
        self.create_url = "https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis"
        self.headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json',
            'X-DashScope-Async': 'enable'
        }

    def generate_video(self, image_url, prompt, output_path, resolution="720P", duration=5, prompt_extend=True):
        """通过HTTP方式异步创建任务并轮询获取视频"""
        try:
            payload = {
                "model": "wanx2.1-i2v-turbo",
                "input": {
                    "img_url": image_url,
                    "prompt": prompt
                },
                "parameters": {
                    "resolution": resolution,
                    "duration": duration,
                    "prompt_extend": prompt_extend
                }
            }
            print("发送请求:", payload)
            resp = requests.post(self.create_url, headers=self.headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            print("API响应:", data)
            task_id = data.get("task_id") or data.get("output", {}).get("task_id")
            if not task_id:
                print("任务创建失败:", data)
                return False
            print(f"任务创建成功，task_id: {task_id}")
            # 轮询查询结果
            return self.poll_video_task(task_id, output_path)
        except Exception as e:
            print(f"生成视频时出错: {str(e)}")
            return False

    def poll_video_task(self, task_id, output_path, interval=10, max_wait=900):
        """轮询查询任务状态，下载视频"""
        query_url = f"https://dashscope.aliyuncs.com/api/v1/tasks/{task_id}"
        waited = 0
        while waited < max_wait:
            try:
                resp = requests.get(query_url, headers=self.headers)
                resp.raise_for_status()
                data = resp.json()
                print("轮询响应:", data)
                status = data.get("status") or data.get("output", {}).get("task_status")
                print(f"当前状态: {status}")
                if status == "SUCCEEDED":
                    video_url = data.get("output", {}).get("video_url")
                    if video_url:
                        print("视频生成成功，下载地址：", video_url)
                        # 下载视频
                        video_resp = requests.get(video_url)
                        with open(output_path, 'wb') as f:
                            f.write(video_resp.content)
                        print(f"视频已保存到: {output_path}")
                        return True
                    else:
                        print("任务成功但未找到视频URL")
                        return False
                elif status == "FAILED":
                    print("视频生成失败:", data)
                    return False
                else:
                    time.sleep(interval)
                    waited += interval
            except Exception as e:
                print(f"查询任务时出错: {str(e)}")
                time.sleep(interval)
                waited += interval
        print("超时未完成")
        return False

def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--image_url', required=True, help='输入图片URL')
    parser.add_argument('--prompt', required=True, help='视频生成提示词')
    parser.add_argument('--output_path', required=True, help='输出视频路径')
    parser.add_argument('--resolution', default='720P', help='视频分辨率(480P/720P)')
    parser.add_argument('--duration', type=int, default=5, help='视频时长(3-5秒)')
    parser.add_argument('--prompt_extend', type=bool, default=True, help='是否开启prompt智能改写')
    
    args = parser.parse_args()
    
    # 创建API实例
    api = AliyunTurboAPI()
    
    # 生成视频
    success = api.generate_video(
        args.image_url,
        args.prompt,
        args.output_path,
        args.resolution,
        args.duration,
        args.prompt_extend
    )
    
    if success:
        print("视频生成成功")
    else:
        print("视频生成失败")

if __name__ == "__main__":
    main() 