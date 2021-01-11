type Method<T> = (sender: T) => void;
export class Delegate<T> {
  private funcs: Method<T>[] = [];
  public addListen = (method: Method<T>) => {
    if (!this.funcs.some(m => m === method)) {
      this.funcs.push(method);
    }
  };
  public remove = (method: Method<T>) => {
    const index = this.funcs.indexOf(method);
    if (index < 0) {
      return;
    }
    this.funcs = this.funcs.splice(index, 1);
  };
  public call = (sender: T) => {
    for (const func of this.funcs) {
      func(sender);
    }
  };
  public dispose = () => {
    this.funcs = [];
  };
}
