import * as http from '../helpers/http.js';

(async () => {
    const signup_button = document.getElementById('signup_button');
    const username_field = document.getElementById('username');
    const email_field = document.getElementById('email');
    const password_field = document.getElementById('password');
    const error_label = document.getElementById('error_label');

    signup_button.addEventListener('click', async () => {
        const username = username_field.value;
        const email = email_field.value;
        const password = password_field.value;
        const response = await http.post('/signup', {
            username,
            email,
            password
        });

        if (response.status === 400) {
            error_label.innerText = await response.text();
            return;
        }
        if (response.status > 400) {
            error_label.innerText = 'Internal server error';
            return;
        }
        location = '/';
    });
})();
