import Modal from '../modal.js';

export default class ModalAlert extends Modal {
    constructor(manager) {
        let id = 'modalAlert';
        let titleDefault = _('Alert');
        super(manager, id, titleDefault, true);
    }
}
