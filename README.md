<div align="center">
ProjectHub Frontend 🌐

## Angular 17 Application

![Tests](https://img.shields.io/badge/Coverage-55.2%25-brightgreen.svg)
![Angular](https://img.shields.io/badge/Angular-17-red.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)
![License](https://img.shields.io/badge/License-MIT-brightgreen.svg)

**Live Demo**: http://www.projecthub.lol

</div>

---
<img width="1919" height="909" alt="dashboard" src="https://github.com/user-attachments/assets/782b6d9f-ad95-470a-9a59-caa91a224001" />


## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Testing](#testing)
- [CI/CD Pipeline](#cicd-pipeline)
- [Security Analysis](#security-analysis)
- [Build & Deployment](#build--deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

ProjectHub Frontend is a modern, responsive Angular 17 Single Page Application (SPA) for project management. It provides an intuitive interface for teams to manage projects, tasks, and collaboration.

### Key Metrics:
- **55.2% test coverage** across 3000+ lines  
- **Security Rating A** (SonarQube - 0 issues)  
- **OWASP ZAP**: 135/140 checks passed  
- **Production optimized** builds  
- **Automated CI/CD** with GitHub Actions  
- **Fully responsive** design  

---

## Features

### 📱 User Interface
- **Dashboard** - Live project/task statistics  
- **Kanban Board** - Drag & drop task management  
- **Projects** - Create, view, edit projects  
- **Tasks** - To Do → In Progress → Completed workflow  
- **Teams** - Member management & invitations  
- **Activity Feed** - Real-time action history  

### 🎨 Design
- **Modern UI/UX** with Angular Material  
- **Fully Responsive** (mobile, tablet, desktop)  
- **Loading states** & smooth transitions  
- **Error handling** with user-friendly messages  
- **Dark/Light theme** support  

### 🔌 Technical
- **JWT Authentication** flows  
- **HTTP Interceptors** for auth & error handling  
- **Reactive Forms** validation  
- **Route Guards** & lazy loading  
- **Production optimized** builds  

---

## Technology Stack

**Frontend:** Angular 17, TypeScript 5, SCSS  
**State Management:** RxJS (NgRx optional)  
**HTTP:** Angular HttpClient  
**Forms:** ReactiveFormsModule  
**Styling:** Angular Material, Custom SCSS  
**Build Tool:** Angular CLI  
**Deployment:** Nginx static hosting  
**Container:** Docker  
**CI/CD:** GitHub Actions  

---

## Quick Start

### Prerequisites

- Node.js >= 20.x  
- npm >= 10.x  
- Angular CLI >= 17.x  
- Git  

### Installation

```bash
# Clone repository
git clone https://github.com/P-r-a-n-a-v-N-a-i-r/projecthub-angular.git
cd projecthub-frontend

# Install dependencies
npm install

# Start development server
ng serve
```

Open browser:  
`http://localhost:4200`

---

## Production Build

```bash
ng build --configuration production
```

Build output directory:  
`dist/projecthub-frontend/`

---

## Testing

### Run Tests

```bash
# Unit tests
ng test

# E2E tests
ng e2e

# Test coverage
ng test --code-coverage
```

### Test Results

- ✓ 55.2% coverage (3000+ lines)  
- ✓ Angular generated boilerplate tests  
- ✓ Component & service unit tests  
- ✓ HttpClient mock testing  

---

## CI/CD Pipeline

GitHub Actions Workflow:

```
Push to main
    ↓
SonarQube Analysis (Security A)
    ↓
Snyk Dependency Scan
    ↓
ng build --prod
    ↓
Deploy to Nginx/EC2
    ↓
OWASP ZAP Full Scan (135/140 PASS)
```

### Results

- **SonarQube:** Security A (0 issues), Reliability B  
- **OWASP ZAP:** 5 warnings (HTTP headers), No failures  
- **Snyk:** 5 Angular 17.3.x issues (upgrade recommended)  

---

## Security Analysis

### SonarQube

- Security: A (0 open issues)  
- Reliability: B (26 issues - null checks)  
- Maintainability: A (49 issues - code organization)  
- Coverage: 55.2%  

### OWASP ZAP

- FAIL-NEW: 0  
- WARN-NEW: 5  
- PASS: 135 (96% success rate)  
- Warnings: Missing HTTP security headers (CSP, HSTS, etc.)

### Snyk

- Dependencies: 199 total  
- Issues: 5 medium (Angular 17.3.x)  
- Fix: Upgrade to Angular 19.2.x  

---

## Build & Deployment

### Production Build

```bash
ng build --configuration production --base-href /
```

### Nginx Configuration (EC2)

```
server {
    listen 80;
    server_name projecthub.lol;
    
    root /var/www/projecthub/dist;
    index index.html;
    
    location /api/ {
        proxy_pass http://localhost:5000/api/;
    }
}
```

### Docker Deployment

```bash
# Build Angular
ng build --prod

# Docker (Nginx + static files)
docker build -t projecthub-frontend .
docker run -p 80:80 projecthub-frontend
```

---

## Contributing

1. Fork the repository  
2. Create feature branch: `git checkout -b feature/amazing-feature`  
3. Install dependencies: `npm install`  
4. Make changes & add tests  
5. Run tests: `ng test`  
6. Commit: `git commit -m "Add amazing feature"`  
7. Push: `git push origin feature/amazing-feature`  
8. Open Pull Request  

### Guidelines

- Follow Angular style guide  
- Write component tests  
- Update README if changing public API  
- Ensure CI/CD passes  

---

## License

This project is licensed under the MIT License.
