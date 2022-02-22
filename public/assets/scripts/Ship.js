class Ship {
  constructor(name, size) {
    this.name = name;
    this.size = +size;
    this.health = +size;
  }

  attacked() {
    this.health--;
    return `You hit enemy ${this.name}!`;
  }

  sinkedMsg() {
    return `You sank the enemies ${this.name}!`;
  }

  isSinked() {
    return this.health === 0;
  }
}

export default Ship;
