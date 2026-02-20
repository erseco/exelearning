import Modal from '../modal.js';

export default class ModalInfo extends Modal {
    constructor(manager) {
        let id = 'modalInfo';
        let titleDefault = _('Info');
        super(manager, id, titleDefault, true);
    }
}
