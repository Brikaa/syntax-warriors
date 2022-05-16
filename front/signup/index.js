import * as auth from '/helpers/auth.js';
import * as http from '/helpers/http.js';

(async () => {
    if (auth.is_authorized()) {
        return location.replace('/');
    }

    const signup_elements = {
        form: document.getElementById('signup_form'),
        username_field: document.getElementById('signup_username'),
        email_field: document.getElementById('signup_email'),
        password_field: document.getElementById('signup_password'),
        error_label: document.getElementById('signup_error_label')
    };

    const signin_elements = {
        form: document.getElementById('signin_form'),
        username_field: document.getElementById('signin_username'),
        email_field: document.getElementById('signin_email'),
        password_field: document.getElementById('signin_password'),
        error_label: document.getElementById('signin_error_label')
    };

    signup_elements.form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = signup_elements.username_field.value;
        const email = signup_elements.email_field.value;
        const password = signup_elements.password_field.value;
        const response = await http.post('/signup', {
            username,
            email,
            password
        });

        if (response.status === 400) {
            signup_elements.error_label.innerText = await response.text();
            return;
        }
        if (response.status > 400) {
            signup_elements.error_label.innerText = 'Internal server error';
            return;
        }
        auth.authorize(username, password);
        location.replace('/');
    });

    signin_elements.form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = signin_elements.username_field.value;
        const password = signin_elements.password_field.value;
        auth.authorize(username, password);
        const is_authorized = await auth.is_authorized();
        if (is_authorized) {
            return location.replace('/');
        }
        signin_elements.error_label.innerText = 'Invalid username or password';
    });
})();
