import Toast from '../toast.js';

export default class ToastDefault extends Toast {
    constructor(manager) {
        let id = 'toastDefault';
        super(manager, id);
    }
}
