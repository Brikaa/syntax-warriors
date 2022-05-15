import * as auth from '/helpers/auth.js';

(async () => {
    const user = await auth.get_user();
    if (user === null) {
        return location.replace('/signup');
    }
})();
