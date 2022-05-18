import * as http from '/helpers/http.js';

export const authorize = (username, password) => {
    localStorage.setItem('username', username);
    localStorage.setItem('password', password);
};

export const sign_out = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('password');
};

const get_username_and_password = () => {
    return {
        username: localStorage.getItem('username') || null,
        password: localStorage.getItem('password') || null
    };
};

export const is_authorized = async () => {
    const user_req = await http.post('/get_user');
    const user_json = await user_req.json();
    return user_json.user !== null;
};

export const get_user = async () => {
    const user_req = await http.post('/get_user');
    const user_json = await user_req.json();
    return user_json.user;
};

export const update_auth = async (updated_auth) => {
    const new_auth = get_username_and_password();
    if (updated_auth.hasOwnProperty('new_username')) {
        new_auth.username = updated_auth.new_username;
    }
    if (updated_auth.hasOwnProperty('new_password')) {
        new_auth.password = updated_auth.new_password;
    }
    authorize(new_auth.username, new_auth.password);
}
