export default {
    updateToken(state, token) {
        state.token = token;
    },
    updateSnackbar(state, snackbar) {
        state.snackbar.active = snackbar.active;
        state.snackbar.color = snackbar.color || "success";
        state.snackbar.timeout = snackbar.timeout || 5000;
        state.snackbar.content = snackbar.content || '';
    },
    updateUser(state, user) {
        state.user = {...state.user, ...user};
    }
}