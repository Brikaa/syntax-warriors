import * as http from '/helpers/http.js'

export const is_authorized = async () => {
    const is_authorized_req = await http.post('/is_authorized');
    const is_authorized_str = await is_authorized_req.text();
    const is_authorized = is_authorized_str === 'true';
    if (!is_authorized) {
        localStorage.removeItem('username');
        localStorage.removeItem('password');
    }
    return is_authorized;
}
