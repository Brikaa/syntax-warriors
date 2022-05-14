import * as auth from '/helpers/auth.js';

(() => {
    if (auth.is_authorized()) {
        location.replace('/contests');
        return;
    }
    location.replace('/signup');
})();
