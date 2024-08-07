import { Type } from '@nestjs/common';

export interface DefaultExport<T = unknown> {
  /**
   * Default exports are bound under the name `"default"`, per the ES Module spec:
   * https://tc39.es/ecma262/#table-export-forms-mapping-to-exportentry-records
   */
  default: Type<T>;
}

export type LazyImport<T = any> = () => Promise<Type<T> | DefaultExport<T>>;

// eslint-disable-next-line  @typescript-eslint/no-explicit-any

export interface InjectLazyService {
  <T>(module: LazyImport, service: LazyImport<T>): Promise<T>;
}
