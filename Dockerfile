# =========================
# React Build
# =========================

FROM node:22 AS frontend

WORKDIR /frontend

COPY website/package*.json ./

RUN npm install

COPY website/ .

RUN npm run build


# =========================
# Django + Scrapy + Nginx
# =========================

FROM python:3.14-slim

WORKDIR /app

RUN apt-get update && \
    apt-get install -y nginx supervisor && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# React build
COPY --from=frontend /frontend/dist ./website/dist

# Nginx config
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Supervisor
COPY supervisord.conf /app/supervisord.conf

EXPOSE 80

CMD ["supervisord", "-c", "/app/supervisord.conf"]