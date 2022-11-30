import path from 'path';
import {
  Dappeteer,
  initSnapEnv,
  DappeteerPage,
  DappeteerBrowser,
} from '@chainsafe/dappeteer';

describe('notification snap', function () {
  let dappeteer: Dappeteer;
  let browser: DappeteerBrowser;
  let connectedPage: DappeteerPage;
  let snapId: string;

  beforeAll(async function () {
    ({ dappeteer, snapId, browser } = await initSnapEnv({
      automation: 'playwright',
      browser: 'chrome',
      snapIdOrLocation: path.resolve(__dirname, '../..'),
      hasPermissions: true,
      hasKeyPermissions: false,
    }));
    connectedPage = await dappeteer.page.browser().newPage();
    await connectedPage.goto('https://google.com');
  });

  afterAll(async function () {
    await browser.close();
  });

  test('inApp notification', async function () {
    const resultPromise = dappeteer.snaps.invokeSnap(
      connectedPage,
      snapId,
      'inApp',
    );

    const result = await resultPromise;

    expect(result).toBe(null);
  });

  test('native notification', async function () {
    const resultPromise = dappeteer.snaps.invokeSnap(
      connectedPage,
      snapId,
      'native',
    );
    const result = await resultPromise;

    expect(result).toBe(null);
  });

  test('throw error for wrong method', async function () {
    interface resultType {
      code: number;
      data: { originalError: unknown };
      message: string;
    }
    try {
      await dappeteer.snaps.invokeSnap<resultType>(
        connectedPage,
        snapId,
        'notAMethod',
      );
    } catch (e) {
      expect((e as resultType).message).toBe('Method not found.');
    }
  });
});
