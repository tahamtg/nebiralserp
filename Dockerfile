# ========= Build React =========
FROM node:22 AS frontend-builder

WORKDIR /frontend

COPY nebiralserp/package*.json ./

RUN npm install

COPY nebiralserp/ .

RUN npm run build


# ========= Python =========
FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    nginx \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .

RUN pip install --upgrade pip

RUN pip install --no-cache-dir -r requirements.txt

RUN playwright install --with-deps chromium

COPY backend/ /app/


COPY --from=frontend-builder /frontend/dist /usr/share/nginx/html


COPY nginx/nginx.conf /etc/nginx/nginx.conf


COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 80

CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py collectstatic --noinput && /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf"]