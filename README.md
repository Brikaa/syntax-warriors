# Syntax Warriors
Database Systems 2022 term project (Software Engineering)

## Project Definition
A full-stack web application for programming contests, inspired by [EMKC](https://github.com/engineer-man/emkc).
Uses [Piston](https://github.com/engineer-man/piston) for code execution.

The main focus is on performing database queries. Many of the web development best practices were not followed
for simplicity. For example, the passwords are stored as plain text in the database and all of the requests performed
on the API endpoints are POST requests.

## Building the project
### Prerequisites
- NodeJS (>= 18)
- NPM
- MySQL (Docker images are ok)

### Steps
1. Clone the repository using `git clone`
2. `cd` into the directory of the project
2. `cd` into `src`
3. Copy `db/config.js.sample` into `db/config.js`
4. Edit `config.js` with your MySQL information
5. Run `npm install` to install the node modules
6. Run `npm run initdb` to initialize the database
7. Run `npm run migrate` to apply the database migrations
8. Run `npm run api` and `npm run front`
9. Access the website at `127.0.0.1:3000`, port `3000`

## Team members
- Omar Adel Brikaa
- Ahmed Wael Wanas
- Mootaz Medhat AbdelWahab
- Ali Esmat Orfi
- Adham Hazem Shafhei
