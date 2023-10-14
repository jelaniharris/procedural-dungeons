/* eslint-disable @typescript-eslint/no-explicit-any */

export type LootChanceType<T> = {
  item: T;
  weight: number;
  quantity: number;
};

export class LootChance<T> {
  table: LootChanceType<T>[];

  constructor(table?: LootChanceType<T>[] | undefined) {
    this.table = [];
    if (table !== undefined) this.table = table;
  }

  clear() {
    this.table = [];
  }

  add(item: any, weight?: number, quantity?: number) {
    if (!weight || weight <= 0) weight = 1;
    if (!quantity || quantity <= 0) quantity = Number.POSITIVE_INFINITY;
    this.table.push({
      item: item,
      weight: weight,
      quantity: quantity,
    });
  }

  choose(randomFunction: (() => number) | undefined): T | null {
    if (this.table.length === 0) return null;

    let totalWeight = 0;

    // Get the total amount of weight
    for (let i = 0; i < this.table.length; i++) {
      const tableEntry = this.table[i];
      if (tableEntry.quantity > 0) {
        totalWeight += tableEntry.weight;
      }
    }

    let choice = 0;
    const randomChance = Math.floor(
      (randomFunction ? randomFunction() : Math.random()) * totalWeight + 1
    );

    let weight = 0;
    for (let i = 0; i < this.table.length; i++) {
      const tableEntry = this.table[i];

      // No quantity, then move on to the next entry
      if (tableEntry.quantity <= 0) continue;

      weight += tableEntry.weight;
      if (randomChance <= weight) {
        choice = i;
        break;
      }
    }

    const chosenLoot = this.table[choice];
    this.table[choice].quantity--;

    return chosenLoot.item;
  }
}
