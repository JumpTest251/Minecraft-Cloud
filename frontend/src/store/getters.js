export default {
    userData(state) {
        const token = state.token;
        if (!token) return;

        const base64Url = token.split('.')[1];
        return JSON.parse(atob(base64Url));

    },
    loggedIn(state) {
        return !!state.token;
    },
    headers(state) {
        return {
            headers: {
                Authorization: state.token
            }
        }
    },
    user(state) {
        return state.user;
    }
}