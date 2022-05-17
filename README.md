# Syntax Warriors
Database Systems 2022 term project (Software Engineering)

## Project Definition
A full-stack web application for programming contests.
Uses [Piston](https://github.com/engineer-man/piston) for code execution.

## Building the project
### Prerequisites
- NodeJS
- NPM
- MySQL (Docker images are ok)

### Steps
1. Clone the repository using `git clone`
2. `cd` into the directory of the project
3. Copy `db/config.js.sample` into `db/config.js`
4. Edit `config.js` with your MySQL information
5. Run `npm install` to install the node modules 
6. Run `npm run initdb` to initialize the database
7. Run `npm run migrate` to apply the database migrations
8. Run `npm run api` and `npm run front`
9. Access the website at localhost, port 3000

## Team members
- Omar Adel Brikaa
- Ahmed Wael Wanas
- Mootaz Medhat AbdelWahab
- Ali Esmat Orfi
- Adham Hazem Shafhei
