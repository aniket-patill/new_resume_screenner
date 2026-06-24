# HiringAI Server Deployment Runbook

This runbook covers:
- Fresh deployment of HiringAI on the shared server
- Redeployment of updates to the same stack
- Validation, nginx wiring, and basic cleanup

## 1) Server + App Layout

- Server: `ubuntu@139.99.62.133`
- Active deploy path: `/home/hiringai-v1`
- Compose project: `hiringai-v1`
- Public app URL: `http://139.99.62.133:8092`

### Service ports (isolated)
- Frontend: `127.0.0.1:3200 -> 80`
- Backend: `127.0.0.1:8200 -> 8000`
- MySQL: `127.0.0.1:3310 -> 3306`
- Redis: `127.0.0.1:6381 -> 6379`
- Qdrant: `127.0.0.1:6336 -> 6333`

## 2) Local Packaging

From local Windows PowerShell:

```powershell
cd D:\Hiring-Ai\new_resume_screenner

tar -czf hiringai-deploy.tar.gz `
  --exclude=.git `
  --exclude=backend/__pycache__ `
  --exclude=backend/media `
  --exclude=frontend/node_modules `
  --exclude=frontend/dist `
  --exclude=*.log `
  docker-compose.yml backend frontend README.md docs

scp D:\Hiring-Ai\new_resume_screenner\hiringai-deploy.tar.gz ubuntu@139.99.62.133:/home/ubuntu/
```

## 3) Fresh Deployment

### 3.1 Prepare directory and extract

```bash
ssh ubuntu@139.99.62.133
mkdir -p /home/hiringai-v1
mv /home/ubuntu/hiringai-deploy.tar.gz /home/hiringai-v1/
cd /home/hiringai-v1
tar -xzf hiringai-deploy.tar.gz
```

### 3.2 Configure backend env

```bash
cp /home/hiringai-v1/backend/.env.example /home/hiringai-v1/backend/.env
nano /home/hiringai-v1/backend/.env
```

Minimum important values:
- `DEBUG=False`
- `DB_HOST=db`
- `DB_USER=root`
- `DB_PASSWORD=`
- `DB_NAME=hiringai`
- `REDIS_URL=redis://redis:6379/0`
- `QDRANT_URL=http://qdrant:6333`
- `FRONTEND_URL=http://139.99.62.133:8092`
- `ONEDRIVE_REDIRECT_URI=http://139.99.62.133:8092/onedrive/callback/`

### 3.3 Start stack

```bash
cd /home/hiringai-v1
sudo FRONTEND_PORT_BIND=3200 BACKEND_PORT_BIND=8200 MYSQL_PORT_BIND=3310 REDIS_PORT_BIND=6381 QDRANT_HTTP_PORT_BIND=6336 VITE_API_URL=http://139.99.62.133:8092 VITE_CLERK_PUBLISHABLE_KEY="your_clerk_key" docker compose -f docker-compose.yml -p hiringai-v1 up -d --build --scale worker=3
```

### 3.4 Verify containers

```bash
sudo docker compose -f /home/hiringai-v1/docker-compose.yml -p hiringai-v1 ps
curl -i http://127.0.0.1:8200/health
curl -i http://127.0.0.1:3200
```

## 4) Nginx Mapping on `:8092`

Create `/etc/nginx/sites-available/hiringai-v1`:

```nginx
server {
    listen 8092;
    server_name 139.99.62.133;

    location = /health {
        proxy_pass http://127.0.0.1:8200/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8200/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
        client_max_body_size 50M;
    }

    location /media/ {
        proxy_pass http://127.0.0.1:8200/media/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
        client_max_body_size 50M;
    }

    location /onedrive/ {
        proxy_pass http://127.0.0.1:8200/onedrive/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
        client_max_body_size 50M;
    }

    location /check_onedrive_authenticated {
        proxy_pass http://127.0.0.1:8200/check_onedrive_authenticated;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
    }

    location /folders {
        proxy_pass http://127.0.0.1:8200/folders;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
    }

    location /onedrive-folder-files {
        proxy_pass http://127.0.0.1:8200/onedrive-folder-files;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
    }

    location /save-onedrive-folder {
        proxy_pass http://127.0.0.1:8200/save-onedrive-folder;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
        client_max_body_size 50M;
    }

    location / {
        proxy_pass http://127.0.0.1:3200;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
    }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/hiringai-v1 /etc/nginx/sites-enabled/hiringai-v1
sudo nginx -t
sudo systemctl reload nginx
```

Validate:

```bash
curl -i http://139.99.62.133:8092/health
curl -i http://139.99.62.133:8092
curl -i http://139.99.62.133:8092/api/resume/candidates/
```

## 5) Redeployment

```bash
cd /home/hiringai-v1
mv /home/ubuntu/hiringai-deploy.tar.gz /home/hiringai-v1/
tar -xzf hiringai-deploy.tar.gz
sudo FRONTEND_PORT_BIND=3200 BACKEND_PORT_BIND=8200 MYSQL_PORT_BIND=3310 REDIS_PORT_BIND=6381 QDRANT_HTTP_PORT_BIND=6336 VITE_API_URL=http://139.99.62.133:8092 VITE_CLERK_PUBLISHABLE_KEY="your_clerk_key" docker compose -f docker-compose.yml -p hiringai-v1 up -d --build --scale worker=3
```

## 6) Logs and Monitoring

```bash
sudo docker compose -f /home/hiringai-v1/docker-compose.yml -p hiringai-v1 ps
sudo docker compose -f /home/hiringai-v1/docker-compose.yml -p hiringai-v1 logs --tail=200 backend
sudo docker compose -f /home/hiringai-v1/docker-compose.yml -p hiringai-v1 logs --tail=200 frontend
sudo docker compose -f /home/hiringai-v1/docker-compose.yml -p hiringai-v1 logs --tail=200 worker
curl -i http://127.0.0.1:8200/health
curl -i http://139.99.62.133:8092/health
```

## 7) Cleanup

Remove deployment archive after a successful deploy:

```bash
rm -f /home/hiringai-v1/hiringai-deploy.tar.gz
rm -f /home/ubuntu/hiringai-deploy.tar.gz
```

## 8) Notes

- This stack is intentionally bound to `127.0.0.1` on the host to avoid collisions with other projects.
- Nginx on `8092` is the public entrypoint.
- `QDRANT_HTTP_PORT_BIND` is published only for debugging; the app itself talks to `qdrant:6333` on the Docker network.
