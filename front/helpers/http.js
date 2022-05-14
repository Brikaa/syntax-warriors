import * as config from '/config.js';

export const post = async (url, body = {}) => {
    return await fetch(config.api_url + url, {
        method: 'POST',
        headers: {
            'Authorization': localStorage.getItem('auth-token'),
            'content-type': 'application/json'
        },
        body: JSON.stringify(body),
        mode: 'cors'
    });
}
