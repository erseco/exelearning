import MenuStructureCompose from './menuStructureCompose.js';
import MenuStructureBehaviour from './menuStructureBehaviour.js';
export default class MenuStructure {
    constructor(structureEngine) {
        this.engine = structureEngine;
        this.menuStructure = document.querySelector('#main #menu_nav');
    }

    /**
     *
     */
    async load() {
        this.compose();
        this.behaviour();
    }

    /**
     *
     */
    compose() {
        this.menuStructureCompose = new MenuStructureCompose(this.engine);
        this.menuStructureCompose.compose();
    }

    /**
     *
     */
    behaviour() {
        this.menuStructureBehaviour = new MenuStructureBehaviour(this.engine);
        this.menuStructureBehaviour.behaviour(true);
    }
}
