type Method = () => void;
export class Delegate {
  private funcs: Method[] = [];
  public add = (method: Method) => {
    if (!this.funcs.some(m => m === method)) {
      this.funcs.push(method);
    }
  };
  public remove = (method: Method) => {
    const index = this.funcs.indexOf(method);
    if (index < 0) {
      return;
    }
    this.funcs = this.funcs.splice(index, 1);
  };
  public call = () => {
    for (const func of this.funcs) {
      func();
    }
  };
  public dispose = () => {
    this.funcs = [];
  };
}
