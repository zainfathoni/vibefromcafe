type PagesFunction<
  Env = unknown,
  Params extends string = string,
  Data = unknown,
> = (context: {
  request: Request;
  env: Env;
  params: Record<Params, string | string[] | undefined>;
  data: Data;
  next: () => Promise<Response>;
  waitUntil: (promise: Promise<unknown>) => void;
  functionPath: string;
}) => Response | Promise<Response>;

interface KVNamespaceListKey<Metadata = unknown> {
  name: string;
  expiration?: number;
  metadata?: Metadata;
}

interface KVNamespaceListResult<Metadata = unknown> {
  keys: KVNamespaceListKey<Metadata>[];
  list_complete: boolean;
  cursor?: string;
}

interface KVNamespace {
  get(key: string): Promise<string | null>;
  get(key: string, type: "text"): Promise<string | null>;
  get<T>(key: string, type: "json"): Promise<T | null>;
  put(
    key: string,
    value: string | ArrayBuffer | ArrayBufferView | ReadableStream,
    options?: {
      expiration?: number;
      expirationTtl?: number;
      metadata?: unknown;
    },
  ): Promise<void>;
  list<Metadata = unknown>(options?: {
    prefix?: string;
    limit?: number;
    cursor?: string;
  }): Promise<KVNamespaceListResult<Metadata>>;
}
