const express = require('express');
const router = express.Router();

const BadRequestException = require('./bad_request_exception');

const is_valid_date = (date) => {
    return new Date(date) != 'Invalid Date';
};

const sequelize_date = (date) => {
    return date.toISOString().slice(0, 19).replace('T', ' ');
};

const validate_data_types = (what_to_validate, data_types) => {
    for (const field in data_types) {
        let validator;
        const data_type = data_types[field];
        switch (data_type) {
            case 'date':
                validator = (x) => {
                    return is_valid_date(x);
                };
                break;
            case 'array':
                validator = (x) => {
                    return Array.isArray(x);
                };
                break;
            default:
                validator = (x) => {
                    return typeof x === data_type;
                };
        }
        if (!validator(what_to_validate[field])) {
            throw new BadRequestException(`${field} must be provided as ${data_types[field]}`);
        }
    }
};

const validate_user_info = (user_info) => {
    const { username, email, password } = user_info;
    validate_data_types(user_info, { username: 'string', email: 'string', password: 'string' });
    if (username === '') {
        throw new BadRequestException('The username can not be empty');
    }
    if (password.length < 8) {
        throw new BadRequestException('The password can not be less than 8 characters long');
    }
    if (email === '') {
        throw new BadRequestException('The email can not be empty');
    }
    if (username.match('[^A-Za-z0-9]')) {
        throw new BadRequestException('The username must contain letters or numbers only');
    }
};

const check_same_user = async (db, username, email) => {
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
        throw new BadRequestException(`This ${what_exists} already exists`);
    }
};

const get_user = async (db, user_info) => {
    const { username, password } = user_info;

    if (username === null || password === null) {
        return null;
    }

    validate_data_types(user_info, { username: 'string', password: 'string' });

    const users = await db.query(
        'select id, username, email, no_wins, score, is_staff from users where username = ? and password = ?',
        [username, password]
    );

    if (users.length < 1) {
        return null;
    }
    return users[0];
};

const is_user_admin = async (db, user_info) => {
    const user = await get_user(db, user_info);
    return user && !!user.is_staff;
};

const is_user_logged_in = async (db, user_info) => {
    const user = await get_user(db, user_info);
    return !!user;
}

router.use('/admin', async (req, res, next) => {
    try {
        const is_staff = await is_user_admin(req.app.locals.db, req.body);
        if (!is_staff) {
            return res.status(403).send();
        }
        next();
    } catch (e) {
        next(e);
    }
});

router.use(/^\/update_user$/, async (req, res, next) => {
    try {
        const is_logged_in = await is_user_logged_in(req.app.locals.db, req.body);
        if (!is_logged_in) {
            return res.status(403).send();
        }
        next();
    } catch (e) {
        next(e);
    }
});

router.post('/get_user', async (req, res, next) => {
    try {
        return res.status(200).json({ user: await get_user(req.app.locals.db, req.body) });
    } catch (e) {
        next(e);
    }
});

router.post('/signup', async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        validate_user_info(req.body);
        await check_same_user(db, req.body.username, req.body.email);
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

router.post('/update_user', async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const user = await get_user(db, req.body);
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
                db,
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

router.post('/admin/create_contest', async (req, res, next) => {
    try {
        const db = req.app.locals.db;

        validate_data_types(req.body, {
            name: 'string',
            description: 'string',
            start_date: 'date',
            end_date: 'date'
        });

        const { name, description, start_date, end_date } = req.body;

        if (name === '') {
            throw new BadRequestException('The contest name can not be empty');
        }

        const start_date_formatted = new Date(start_date);
        const end_date_formatted = new Date(end_date);

        if (start_date_formatted >= end_date_formatted) {
            throw new BadRequestException('The start date must be before the end date');
        }

        const start_date_sql = sequelize_date(start_date_formatted);
        const end_date_sql = sequelize_date(end_date_formatted);
        const contests_query_values = [name, description, start_date_sql, end_date_sql];

        await db.query(
            'insert into contests (name, description, start_date, end_date) values (?, ?, ?, ?)',
            contests_query_values
        );
        return res.status(200).send();
    } catch (e) {
        next(e);
    }
});

module.exports = router;
