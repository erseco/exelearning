
export default class Actions {

  constructor(app) {
    this.app = app;
    this.pending = [];
    this.authorizeAddActions = true;
    this.authorizeAddActionsTimer = 5000;
    this.intervalTime = 100;
    this.addCheckActionsInterval();
  }

  /**
   *
   * @param {*} action
   */
  addPendingAction(action) {
    if (this.authorizeAddActions) {
      this.pending.push(action);
      this.authorizeAddActions = false;
      setTimeout(()=>{
        this.authorizeAddActions = true;
      }, this.authorizeAddActionsTimer)
    }
  }

  /**
   *
   */
  addCheckActionsInterval() {
    this.interval = setInterval(() => {
      if (this.pending.length > 0) {
        let action = this.pending.shift();
        let element = document.getElementById(action.element);
        element.setAttribute("pending-action", true);
        element.dispatchEvent(new Event(action.event));
      }
    }, this.intervalTime)
  }

}
