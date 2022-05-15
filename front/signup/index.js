import * as auth from '/helpers/auth.js';
import * as http from '/helpers/http.js';

(async () => {
    const signup_elements = {
        form: document.getElementById('signup_form'),
        username_field: document.getElementById('signup_username'),
        email_field: document.getElementById('signup_email'),
        password_field: document.getElementById('signup_password'),
        error_label: document.getElementById('signup_error_label')
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
})();
