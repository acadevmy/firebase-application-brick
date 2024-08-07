import { createNestOnCall } from '../../nestjs-firebase-adapter';
import { TriggersModule } from '../../triggers.module';

export const findAllCats = createNestOnCall(TriggersModule, async ({ injectLazyService }) => {
  const service = await injectLazyService(
    () => import('../cats.module'),
    () => import('../services/cats.service'),
  );

  return service.findAll();
});
