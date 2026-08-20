```dockerfile
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
# Django + Scrapy
# =========================

FROM python:3.14-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# React build
COPY --from=frontend /frontend/dist ./website/dist

EXPOSE 8000

CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "nebiralserpback.asgi:application"]
```
