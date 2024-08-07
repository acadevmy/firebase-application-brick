import { Type } from '@nestjs/common';
import { memoize } from 'lodash-es';

import { DefaultExport, LazyImport } from './types';

export const isDefaultExport = (value: any | DefaultExport): value is DefaultExport =>
  'default' in value;

export const resolveLazyType: <T = any>(lazyImport: LazyImport<T>) => Promise<Type<T>> = memoize(
  async (lazyImport) => {
    let loadedType = await lazyImport();

    if (isDefaultExport(loadedType)) {
      loadedType = loadedType.default;
    }

    return loadedType;
  },
);
