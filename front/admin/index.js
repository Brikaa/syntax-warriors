import * as auth from '/helpers/auth.js';

(async () => {
    const user = await auth.get_user();
    if (!user.is_staff) {
        location.replace('/');
    }
})();
