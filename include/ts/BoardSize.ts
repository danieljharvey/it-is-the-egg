export class BoardSize {
  width: number;
  height: number;

  minSize: number = 5;
  maxSize: number = 40;

  constructor(size: number) {
    if (size < this.minSize) size = this.minSize;
    if (size > this.maxSize) size = this.maxSize;
    this.width = this.height = size;
  }

  grow(): void {
    if (this.width < this.maxSize) this.width++;
    if (this.height < this.maxSize) this.height++;
  }

  shrink(): void {
    if (this.width > this.minSize) this.width--;
    if (this.height > this.minSize) this.height--;
  }

  getData() {
    return {
      width: this.width,
      height: this.height
    };
  }
}
