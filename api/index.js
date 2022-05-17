const express = require('express');
const cors = require('cors');
const db = require('./db_adapter');
const config = require('./config');
const body_parser = require('body-parser');

const app = express();
const port = config.port;
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true }));
const corsOptions = {
    origin: config.front_url,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use((req, res, next) => {
    if (!req.headers['content-type'].startsWith('application/json')) {
        return res.status(415).send({
            message: 'requests must be of type application/json'
        });
    }
    next();
});

class RequestBodyException {
    constructor(message) {
        this.message = message;
    }
}

const validate_data_types = (what_to_validate, data_types) => {
    for (const field in data_types) {
        if (typeof what_to_validate[field] !== data_types[field]) {
            throw new RequestBodyException(`${field} must be provided as ${data_types[field]}`);
        }
    }
};

// User actions
const validate_user_info = (user_info) => {
    const { username, email, password } = user_info;
    validate_data_types(user_info, { username: 'string', email: 'string', password: 'string' });
    if (username === '') {
        throw new RequestBodyException('The username can not be empty');
    }
    if (password.length < 8) {
        throw new RequestBodyException('The password can not be less than 8 characters long');
    }
    if (email === '') {
        throw new RequestBodyException('The email can not be empty');
    }
    if (username.match('[^A-Za-z0-9]')) {
        throw new RequestBodyException('The username must contain letters or numbers only');
    }
};

const check_same_user = async (username, email) => {
    if (username === undefined && email === undefined) {
        throw new Error('Checking for similar users requires at least a username or an email');
    }

    let where_clause = [];
    let where_parameters = [];
    if (username !== undefined) {
        where_clause.push('username = ?');
        where_parameters.push(username);
    }
    if (email !== undefined) {
        where_clause.push('email = ?');
        where_parameters.push(email);
    }
    const same_users = await db.query(
        `select username, email from users where ${where_clause.join(' or ')}`,
        where_parameters
    );
    if (same_users.length > 0) {
        const what_exists = same_users[0].email === email ? 'email' : 'username';
        throw new RequestBodyException(`This ${what_exists} already exists`);
    }
};

const get_user = async (user_info) => {
    const { username, password } = user_info;

    if (username === null || password === null) {
        return null;
    }

    validate_data_types(user_info, { username: 'string', password: 'string' });

    const users = await db.query(
        'select id, username, email, no_wins, score from users where username = ? and password = ?',
        [username, password]
    );

    if (users.length < 1) {
        return null;
    }
    return users[0];
};

app.post('/get_user', async (req, res, next) => {
    try {
        return res.status(200).json({ user: await get_user(req.body) });
    } catch (e) {
        next(e);
    }
});

app.post('/signup', async (req, res, next) => {
    try {
        validate_user_info(req.body);
        await check_same_user(req.body.username, req.body.email);
        const { username, email, password } = req.body;
        await db.query('insert into users (email, username, password) values (?, ?, ?)', [
            email,
            username,
            password
        ]);
        return res.status(200).send();
    } catch (e) {
        next(e);
    }
});

app.post('/update_user', async (req, res, next) => {
    try {
        const user = await get_user(req.body);
        if (user === null) {
            return res.status(403).send();
        }

        let contains_password = true;
        let contains_email = true;
        let contains_username = true;
        if (!req.body.hasOwnProperty('new_password')) {
            contains_password = false;
            req.body.new_password = 'random placeholder';
        }
        if (!req.body.hasOwnProperty('new_username')) {
            contains_username = false;
            req.body.new_username = user.username;
        }
        if (!req.body.hasOwnProperty('new_email')) {
            contains_email = false;
            req.body.new_email = user.email;
        }

        if (!contains_username && !contains_email && !contains_password) {
            return res.status(200).send();
        }

        const { new_username, new_password, new_email } = req.body;
        validate_user_info({
            username: new_username,
            email: new_email,
            password: new_password
        });
        if (contains_username || contains_email) {
            await check_same_user(
                contains_username ? new_username : undefined,
                contains_email ? new_email : undefined
            );
        }

        let set_clause = [];
        let set_parameters = [];
        if (contains_username) {
            set_clause.push('username = ?');
            set_parameters.push(new_username);
        }
        if (contains_email) {
            set_clause.push('email = ?');
            set_parameters.push(new_email);
        }
        if (contains_password) {
            set_clause.push('password = ?');
            set_parameters.push(new_password);
        }
        await db.query(`update users set ${set_clause.join(', ')} where id = ?`, [
            ...set_parameters,
            user.id
        ]);

        return res.status(200).send();
    } catch (e) {
        next(e);
    }
});

app.use((err, req, res, next) => {
    if (err instanceof RequestBodyException) {
        return res.status(400).send(err.message);
    }
    console.error(e);
    return res.status(500).send();
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

const end_gracefully = () => {
    console.log('Closing the database connection');
    db.end_connection();
    console.log('Ending the process');
    process.exit(0);
};

process.on('SIGINT', () => {
    end_gracefully();
});

process.once('SIGUSR2', () => {
    end_gracefully();
});
