import faunadb from "faunadb";

type Client = faunadb.Client
var q = faunadb.query;

function dotPath(path: string) {
  if (path === "id")
    return {
      field: ["id"],
    };
  if (path === "ts")
    return {
      field: ["ts"],
    };
  if (path.includes(".")) {
    return {
      field: ["data", ...path.split(".")],
    };
  } else {
    return {
      field: [path],
    };
  }
}

export class Helper {
  private q: typeof faunadb.query;
  private client: Client;

  constructor({ q, client }: { q: typeof faunadb.query; client: Client }) {
    this.q = q;
    this.client = client;
  }

  /**
   *
   * @param {string} name
   */
  public async CreateCollection(name: string) {
    return this.client.query(q.CreateCollection({ name }));
  }

  /**
   *
   * @param {string} collection
   * @param {any} record
   */
  public async CreateRecord<T>(collection: string, record: any) {
    return this.client.query<T>(
      q.Create(q.Collection(collection), { data: record })
    );
  }

  /**
   *
   * @param {string} collection
   * @param {string} id
   */
  public async ListRecordsInCollection<T>(collection: string, id: string) {
    return this.client.query<T[]>(q.Get(q.Ref(q.Collection(collection), id)));
  }

  /**
   *
   * @param {string} collectio collection name
   * @param {string} id record id
   * @param {any} update JSON of update
   */
  public async UpdateRecord<T>(collectio: string, id: string, update: T) {
    return this.client.query<T>(
      q.Update(q.Ref(q.Collection(collectio), id), {
        data: update,
      })
    );
  }

  /**
   *
   * @param {string} collection collection name
   * @param {string} id record id
   * @param {any} newRecord new record definition
   */
  public async ReplaceRecord<T>(collection: string, id: string, newRecord: T) {
    return this.client.query<T>(
      q.Replace(q.Ref(q.Collection(collection), id), {
        data: newRecord,
      })
    );
  }

  /**
   * deletes a record
   * @param {string} collection collection name
   * @param {string} id record id
   */
  async DeleteRecord<T>(collection: string, id: string) {
    return this.client.query<T>(q.Delete(q.Ref(q.Collection(collection), id)));
  }

  /**
   *
   * @param index
   */
  async ListRecordInIndex<T>(index: string) {
    return this.client.query<T>(q.Match(q.Index(index)));
  }

  /**
   *
   * @param terms Array of term dot paths
   * @param values Array of values dot paths
   */
  async CreateIndex({
    name,
    collection,
    terms,
    values,
  }: {
    name: string;
    collection: string;
    terms: string[];
    values: string[];
  }) {
    const _terms = terms.map((term) => dotPath(term));
    const _values = values.map((value) => dotPath(value));
    console.log({
      name,
      collection,
      terms,
      values,
      _terms,
      _values,
    });
    return this.client.query(
      q.CreateIndex({
        name: name,
        source: q.Collection(collection),
        terms: _terms,
        values: _values,
      })
    );
  }
}

export class Driver {
  public q: typeof faunadb.query;
  public client: Client;
  public helper: Helper;
  constructor(secret: string) {
    this.q = faunadb.query;
    this.client = new faunadb.Client({
      secret,
    });
    this.helper = new Helper({ q, client: this.client });
  }
}