/**
 * Simple priority queue for simulation events
 */
export class PriorityQueue<T extends { time: number }> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
    // Keep sorted by time (ascending)
    this.items.sort((a, b) => a.time - b.time);
  }

  pop(): T | undefined {
    return this.items.shift();
  }

  peek(): T | undefined {
    return this.items[0];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }

  clear(): void {
    this.items = [];
  }
}
