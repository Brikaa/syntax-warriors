import * as config from '../config.js';

(async () => {
    const signup_button = document.getElementById("signup_button");
    const username_field = document.getElementById('username');
    const email_field = document.getElementById('email');
    const password_field = document.getElementById('password');

    signup_button.addEventListener('click', async () => {
        const username = username_field.value;
        const email = email_field.value;
        const password = password_field.value;
        await fetch(config.api_url + '/signup', {
            method: "POST",
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                username,
                email,
                password
            }),
            mode: 'cors'
        });
    })
})();
