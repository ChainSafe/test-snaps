import path from 'path';
import {
  Dappeteer,
  initSnapEnv,
  DappeteerPage,
  DappeteerBrowser,
} from '@chainsafe/dappeteer';

describe('manage state snap', function () {
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
    browser.close();
  });

  test('retrieve test data if it was not updated before', async function () {
    const getResult = await dappeteer.snaps.invokeSnap(
      connectedPage,
      snapId,
      'retrieveTestData',
      ['get'],
    );
    expect(getResult).toStrictEqual({ testState: [] });
  });

  test('store data and retrieve it', async function () {
    const updateDataResult = await dappeteer.snaps.invokeSnap(
      connectedPage,
      snapId,
      'storeTestData',
      [{ newState: 'hello' }],
    );
    expect(updateDataResult).toBe(true);
    await dappeteer.snaps.invokeSnap(connectedPage, snapId, 'storeTestData', [
      { moreState: 'hello' },
    ]);
    const getDataResult = await dappeteer.snaps.invokeSnap(
      connectedPage,
      snapId,
      'retrieveTestData',
      ['get'],
    );
    expect(getDataResult).toStrictEqual({
      testState: [{ newState: 'hello' }, { moreState: 'hello' }],
    });
  });

  test('clear stored data', async function () {
    const getDataResult = await dappeteer.snaps.invokeSnap(
      connectedPage,
      snapId,
      'retrieveTestData',
      ['get'],
    );
    expect(getDataResult).toStrictEqual({
      testState: [{ newState: 'hello' }, { moreState: 'hello' }],
    });

    const clearDataResult = await dappeteer.snaps.invokeSnap(
      connectedPage,
      snapId,
      'clearTestData',
      ['clear'],
    );

    expect(clearDataResult).toBe(true);

    const getAfterClearStateResult = await dappeteer.snaps.invokeSnap(
      connectedPage,
      snapId,
      'retrieveTestData',
      ['get'],
    );
    expect(getAfterClearStateResult).toStrictEqual({ testState: [] });
  });

  test('throw error for wrong method', async function () {
    interface resultType {
      code: number;
      data: { originalError: unknown };
      message: string;
    }
    const result = await dappeteer.snaps.invokeSnap<resultType>(
      connectedPage,
      snapId,
      'giveMeData',
      ['get'],
    );
    expect(result.message).toBe('Method not found.');
  });
});
