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

class RequestBodyException {
    constructor(message) {
        this.message = message;
    }
}

const handle_api_errors = (e, res) => {
    if (e instanceof RequestBodyException) {
        return res.status(400).send(e.message);
    }
    console.error(e);
    return res.status(500);
};

const validate_data_types = (data, types) => {
    if (data.length !== types.length) {
        throw new Error('Provided data does not match types array');
    }
    for (let i = 0; i < types.length; ++i) {
        if (typeof data[i] !== types[i]) {
            throw new RequestBodyException(
                `Invalid data type for ${data[i]}, expected: ${types[i]}`
            );
        }
    }
};

// User actions
const validate_user_info = async (user_info) => {
    const { username, email, password } = user_info;
    return new Promise(async (resolve, reject) => {
        try {
            validate_data_types([username, email, password], ['string', 'string', 'string']);
        } catch (e) {
            reject(e);
        }
        if (username === '') {
            reject(new RequestBodyException('The username can not be empty'));
        }
        if (password.length < 8) {
            reject(new RequestBodyException('The password can not be less than 8 characters long'));
        }
        if (email === '') {
            reject(new RequestBodyException('The email can not be empty'));
        }
        if (username.match('[^A-Za-z0-9]')) {
            reject(new RequestBodyException('The username must contain letters or numbers only'));
        }
        const same_usernames = await db.query(
            'select username, email from users where username = ? or email = ?',
            [username, email]
        );
        if (same_usernames.length > 0) {
            const what_exists = same_usernames[0].email === email ? 'email' : 'username';
            reject(new RequestBodyException(`This ${what_exists} already exists`));
        }
        resolve();
    });
};

app.post('/get_user', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (username === null || password === null) {
            return res.status(200).send({ user: null });
        }

        validate_data_types([username, password], ['string', 'string']);

        const users = await db.query(
            'select username, email, no_wins, score from users where username = ? and password = ?',
            [username, password]
        );

        if (users.length < 1) {
            return res.status(200).json({ user: null });
        }
        return res.status(200).json({ user: users[0] });
    } catch (e) {
        handle_api_errors(e, res);
    }
});

app.post('/signup', async (req, res) => {
    try {
        await validate_user_info(req.body);
        const { username, email, password } = req.body;
        await db.query('insert into users (email, username, password) values (?, ?, ?)', [
            email,
            username,
            password
        ]);
        return res.status(200).send();
    } catch (e) {
        handle_api_errors(e, res);
    }
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
