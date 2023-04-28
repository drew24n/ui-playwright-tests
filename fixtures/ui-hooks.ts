import {test as base} from '@playwright/test';
import {BaseClass} from 'src/ui/base-class';

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
const test = base.extend<{globalHooks: void}>({
  globalHooks: [
    async ({browser}, use, testInfo) => {
      /** 'beforeEach' global hook starts here */
      for (const context of browser.contexts()) {
        await context.tracing.start({screenshots: true, snapshots: true});
        await context.tracing.startChunk({title: test.info().title});
        for (const page of context.pages()) {
          /** make pages load faster by skipping images and fonts downloading */
          const baseClass = new BaseClass(page);
          await baseClass.stopRequest('**/*.{png,jpg,jpeg,webp,svg,gif}');
        }
      }
      await use();
      /** 'afterEach' global hook starts here */
      for (const context of browser.contexts()) {
        if (testInfo.status === 'failed') {
          await context.tracing.stopChunk({
            path: `traces/${test.info().title}.zip`.replace(/\s/g, '_'),
          });
        }
        for (const page of context.pages()) {
          if (testInfo.status === 'failed') {
            await page.screenshot({
              path: `screenshots/${test.info().title}.png`.replace(/\s/g, '_'),
              fullPage: true,
            });
          }
        }
      }
      for (const context of browser.contexts()) {
        await context.tracing.stop();
      }
    },
    {scope: 'test', auto: true},
  ],
});

export {test};
