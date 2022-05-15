import * as http from '/helpers/http.js';

export const authorize = (username, password) => {
    localStorage.setItem('auth-token', `${username}-${password}`);
};

export const is_authorized = async () => {
    const user_req = await http.post('/get_user');
    const user_json = await user_req.json();
    return user_json.user !== null;
}

export const get_user = async () => {
    const user_req = await http.post('/get_user');
    const user_json = await user_req.json();
    return user_json.user;
}
