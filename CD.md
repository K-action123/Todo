# Todo Application - CI/CD Pipeline & Deployment Guide

## 🎯 Project Overview

A full-stack Todo application with:
- **Frontend**: React + Nginx
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **CI/CD**: GitHub Actions
- **Container Registry**: Docker Hub

**Docker Hub Images:**
- `hoodk123/todo-backend:latest`
- `hoodk123/todo-frontend:latest`

---

## 📚 Table of Contents

1. [Architecture](#architecture)
2. [Lessons Learned](#lessons-learned)
3. [Common Mistakes & Solutions](#common-mistakes--solutions)
4. [CI/CD Pipeline Explained](#cicd-pipeline-explained)
5. [Local Development](#local-development)
6. [Testing Strategy](#testing-strategy)
7. [Deployment](#deployment)
8. [Next Steps](#next-steps)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Actions CI/CD                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Build   │→ │   Test   │→ │  Health  │→ │  Push   │ │
│  │  Images  │  │  Backend │  │  Checks  │  │  to Hub │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓
                    Docker Hub
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  Production Environment                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Frontend │  │ Backend  │  │ MongoDB  │              │
│  │  (Nginx) │→ │(Node.js) │→ │          │              │
│  │  Port 80 │  │ Port 5000│  │Port 27017│              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
```

---

## 💡 Lessons Learned

### 1. **Test BEFORE You Push**
**❌ What We Did Wrong:**
- Pushed code without local testing
- Discovered bugs in CI/CD (expensive debugging cycle)
- Each push took 2-3 minutes to fail

**✅ The Right Way:**
```bash
# Always run locally first:
docker-compose up -d
docker-compose exec backend npm test
curl http://localhost:80
curl http://localhost:5000/health

# Then push:
git add .
git commit -m "message"
git push
```

**Key Takeaway:** Local testing saves time and CI/CD minutes!

---

### 2. **Don't Duplicate Test Execution**
**❌ What We Did Wrong:**
- Ran `npm test` in Dockerfile (`RUN npm test`)
- Then ran tests again in CI/CD (`docker compose run backend npm test`)
- Tests ran twice, wasting time

**✅ The Right Way:**

**For Frontend** (no external dependencies):
```dockerfile
# Frontend Dockerfile
RUN npm test  # ✅ Run during build - tests are isolated
```

**For Backend** (needs MongoDB):
```dockerfile
# Backend Dockerfile
# ❌ DON'T run npm test here - needs database!
```

```yaml
# CI/CD Pipeline
- name: Run backend tests
  run: docker compose exec -T backend npm test  # ✅ Run after services are up
```

**Key Takeaway:** 
- **Unit tests** (no dependencies) → Run in Dockerfile
- **Integration tests** (need DB, APIs) → Run in CI/CD after services start

---

### 3. **Schema Mismatch Between Tests and API**
**❌ What We Did Wrong:**
```javascript
// Test sent:
{ title: "Test Todo" }

// API expected:
{ task: "Test Todo" }  // Different field name!
```

**✅ The Right Way:**
- Always reference your schema when writing tests
- Use the EXACT field names from your Mongoose models
- Test locally to catch mismatches early

**Key Takeaway:** Write tests alongside features, not after!

---

### 4. **Missing Docker Image Tags**
**❌ What We Did Wrong:**
```yaml
# docker-compose.yml
backend:
  build: ./backend
  # ❌ No image tag = can't push to Docker Hub
```

**✅ The Right Way:**
```yaml
backend:
  build: ./backend
  image: hoodk123/todo-backend:latest  # ✅ Add image tag
```

**Key Takeaway:** `docker compose push` only works with `image:` tags!

---

### 5. **Port Mapping Confusion**
**❌ What We Did Wrong:**
```yaml
frontend:
  ports:
    - "3000:80"  # Frontend on port 3000
```

```yaml
# CI/CD checking wrong port:
curl http://localhost:80  # ❌ Nothing here!
```

**✅ The Right Way:**
```yaml
frontend:
  ports:
    - "80:80"  # ✅ Frontend on standard HTTP port
```

**Key Takeaway:** Port format is `HOST:CONTAINER`. Keep it simple: use 80 for frontend, 5000 for backend.

---

### 6. **Using `docker compose run` Instead of `exec`**
**❌ What We Did Wrong:**
```bash
docker compose run backend npm test
# Creates NEW container → NOT connected to MongoDB network!
```

**✅ The Right Way:**
```bash
docker compose exec -T backend npm test
# Runs in EXISTING container → Connected to MongoDB!
```

**Key Takeaway:** 
- `run` = new isolated container
- `exec` = existing networked container

---

### 7. **Empty Subtasks Validation Issue**
**❌ What We Did Wrong:**
```javascript
// server.js
subtasks.map(sub => ({
  subtaskText: sub.subtaskText ? sub.subtaskText.trim() : ''  // ❌ Empty string fails validation
}))
```

**✅ The Right Way:**
```javascript
subtasks
  .filter(sub => sub.subtaskText && sub.subtaskText.trim() !== '')  // ✅ Filter out empty
  .map(sub => ({
    subtaskText: sub.subtaskText.trim()
  }))
```

**Key Takeaway:** Validate and sanitize data BEFORE saving to database!

---

## 🔧 Common Mistakes & Solutions

| Mistake | Error Message | Solution |
|---------|--------------|----------|
| Forgot `-d` flag | Pipeline hangs forever | Use `docker compose up -d` |
| Wrong field name in test | `400 Bad Request` | Match schema exactly |
| `npm not found` in nginx | `/docker-entrypoint.sh: npm: not found` | Don't run tests in final stage |
| Images not pushed | `Skipped` in logs | Add `image:` tags to docker-compose.yml |
| Backend tests fail | `ECONNREFUSED MongoDB` | Use `exec` not `run` |
| Healthcheck fails | `curl: (7) Failed to connect` | Check port mapping, wait longer |

---

## 🚀 CI/CD Pipeline Explained

### Pipeline Flow

```
1. Checkout Code
   ↓
2. Build Images (Frontend tests run here)
   ↓
3. Start Services (docker compose up -d)
   ↓
4. Wait for Health (backend + frontend ready)
   ↓
5. Run Backend Tests (integration tests)
   ↓
6. Health Checks (verify both services)
   ↓
7. Login to Docker Hub
   ↓
8. Push Images (only on main branch push)
   ↓
9. Cleanup (docker compose down -v)
```

hope that it will have a better impact which is amazing here