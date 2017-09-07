export class BoardSize {
  public height: number;
  public width: number;

  protected minSize: number = 5;
  protected maxSize: number = 40;

  constructor(size: number) {
    if (size < this.minSize) {
      size = this.minSize;
    }
    if (size > this.maxSize) {
      size = this.maxSize;
    }
    this.width = this.height = size;
  }

  public grow(): void {
    if (this.width < this.maxSize) {
      this.width++;
    }
    if (this.height < this.maxSize) {
      this.height++;
    }
  }

  public shrink(): void {
    if (this.width > this.minSize) {
      this.width--;
    }
    if (this.height > this.minSize) {
      this.height--;
    }
  }

  public getData() {
    return {
      width: this.width,
      height: this.height
    };
  }
}
