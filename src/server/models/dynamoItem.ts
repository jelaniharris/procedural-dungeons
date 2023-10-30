export abstract class DynamoItem {
  abstract get pk(): string;
  abstract get sk(): string;
  EntityType: string | undefined;

  public keys() {
    return {
      pk: this.pk,
      sk: this.sk,
    };
  }

  abstract toItem(): Record<string, unknown>;
}
