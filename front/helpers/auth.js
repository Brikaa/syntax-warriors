import * as http from '/helpers/http.js';

export const authorize = (username, password) => {
    localStorage.setItem('auth-token', `${username}-${password}`);
};

export const is_authorized = async () => {
    const is_authorized_req = await http.post('/is_authorized');
    const is_authorized_str = await is_authorized_req.text();
    const is_authorized = is_authorized_str === 'true';
    return is_authorized;
};
