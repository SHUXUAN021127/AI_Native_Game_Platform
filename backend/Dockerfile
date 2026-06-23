# 后端生产镜像。放在 backend/ 目录下，命名为 Dockerfile。
#
# 关键点：这个镜像里装了 Chromium —— Cover Agent 截图必须有浏览器，
# 所以后端只能跑在能装浏览器的容器/服务器上，不能用 serverless。

FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=8000

WORKDIR /app

# 先单独拷 requirements 以利用构建缓存
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 安装 Chromium 及其系统依赖（版本自动匹配上面 pip 装的 playwright）
RUN playwright install --with-deps chromium

# 再拷源码# 后端生产镜像。放在 backend/ 目录下，命名为 Dockerfile。
      ##
      ## 关键点：镜像里装了 Chromium —— Cover Agent 截图必须有浏览器。
      ## 本次新增：强制 UTF-8 环境，避免容器默认 ASCII locale 导致中文/emoji 编码报错。
      #
      #FROM python:3.12-slim
      #
      #ENV PYTHONUNBUFFERED=1 \
      #    PIP_NO_CACHE_DIR=1 \
      #    PYTHONUTF8=1 \
      #    LANG=C.UTF-8 \
      #    LC_ALL=C.UTF-8 \
      #    PORT=8000
      #
      #WORKDIR /app
      #
      #COPY requirements.txt .
      #RUN pip install --no-cache-dir -r requirements.txt
      #
      ## 安装 Chromium 及其系统依赖（版本自动匹配 pip 装的 playwright）
      #RUN playwright install --with-deps chromium
      #
      #COPY . .
      #
      #EXPOSE 8000
      #
      #CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
COPY . .

EXPOSE 8000

# 生产用：不要 --reload。SQLite 下建议单 worker（多 worker 写会争用）；
# 换 Postgres 后可加 --workers。
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
