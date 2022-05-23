import * as config from '/config.js';

export const post = async (url, body = {}) => {
    if (!body.hasOwnProperty('username')) {
        body.username = localStorage.getItem('username') || null;
        body.password = localStorage.getItem('password') || null;
    }
    return await fetch(config.api_url + url, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(body),
        mode: 'cors'
    });
};
