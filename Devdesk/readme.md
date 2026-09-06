# DevDesk - Project & Issue Management Platform

DevDesk is a comprehensive project and issue management platform designed for software developers, teams, and small organizations. It provides tools for managing projects, tracking issues, organizing tasks, and monitoring project progress.

## Features

- **User Authentication**: Secure registration, login, and session management
- **Dashboard**: Real-time overview of projects, issues, and activities
- **Project Management**: Create, edit, and track projects with status tracking
- **Issue Tracking**: Complete issue management with priorities, types, and statuses
- **Comments**: Collaborative discussion on issues
- **Team Management**: Add team members to projects and assign issues
- **Search & Filtering**: Find projects and issues quickly
- **Analytics**: Visual insights into project and team performance
- **Activity History**: Track important events and changes

## Technology Stack

### Backend
- Java 17
- Spring Boot 3.1.5
- Spring Security with JWT
- Spring Data JPA
- PostgreSQL

### Frontend
- React 18
- Material-UI
- Recharts for analytics
- Axios for API communication

## Project Structure
devdesk/
├── backend/
│ ├── src/main/java/com/devdesk/
│ │ ├── config/
│ │ ├── controller/
│ │ ├── dto/
│ │ ├── entity/
│ │ ├── repository/
│ │ ├── security/
│ │ └── service/
│ └── pom.xml
├── frontend/
│ ├── public/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── services/
│ │ └── styles/
│ └── package.json
└── README.md


## Installation Instructions

### Prerequisites
1. Java 17 or higher
2. Maven 3.6+
3. Node.js 16+
4. PostgreSQL 13+
5. npm or yarn

### Step 1: Install PostgreSQL

**Windows:**
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer and follow the wizard
3. Set a password for the 'postgres' user
4. Complete the installation

**macOS:**
brew install postgresql
brew services start postgresql

Linux (Ubuntu/Debian):
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

### Step 2: Create Database
Connect to PostgreSQL and create the database:
psql -U postgres
CREATE DATABASE devdesk;
\q

### Step 3: Configure Backend
Navigate to the backend directory:
cd backend

Update src/main/resources/application.properties with your PostgreSQL credentials:
spring.datasource.url=jdbc:postgresql://localhost:5432/devdesk
spring.datasource.username=your_username
spring.datasource.password=your_password

### Step 4: Run Backend
mvn spring-boot:run

### Step 5: Configure Frontend
Navigate to the frontend directory:

bash
cd frontend
Install dependencies:

bash
npm install
### Step 6: Run Frontend
bash
npm start
The frontend will start on http://localhost:3000



