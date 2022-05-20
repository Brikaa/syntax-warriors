const data_types_helper = require('../helpers/data_types');
const BadRequestException = require('../exceptions/bad_request_exception');

module.exports.validate_user_info = (user_info) => {
    const { username, email, password } = user_info;
    data_types_helper.validate_data_types(user_info, {
        username: 'string',
        email: 'string',
        password: 'string'
    });
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

module.exports.check_same_user = async (db, username, email) => {
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

    data_types_helper.validate_data_types(user_info, { username: 'string', password: 'string' });

    const users = await db.query(
        'select id, username, email, no_wins, score, is_staff from users where username = ? and password = ?',
        [username, password]
    );

    if (users.length < 1) {
        return null;
    }
    return users[0];
};

module.exports.get_user = get_user;

module.exports.is_user_admin = async (db, user_info) => {
    const user = await get_user(db, user_info);
    return user && !!user.is_staff;
};

module.exports.is_user_logged_in = async (db, user_info) => {
    const user = await get_user(db, user_info);
    return !!user;
};
