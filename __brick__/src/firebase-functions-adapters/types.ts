export interface DefaultExport {
  /**
   * Default exports are bound under the name `"default"`, per the ES Module spec:
   * https://tc39.es/ecma262/#table-export-forms-mapping-to-exportentry-records
   */
  default: any;
}

export type LoaderFn = () => Promise<any | DefaultExport>;

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export const isDefaultExport = (value: any | DefaultExport): value is DefaultExport =>
  'default' in value;
