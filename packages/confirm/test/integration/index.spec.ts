import path from 'path';
import {
  Dappeteer,
  initSnapEnv,
  DappeteerPage,
  DappeteerBrowser,
} from '@chainsafe/dappeteer';
import openrpc from '../../src/openrpc.json';

describe('confirm snap', function () {
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

  test('snap invoke confirm accept', async function () {
    const resultPromise = dappeteer.snaps.invokeSnap(
      connectedPage,
      snapId,
      'confirm',
      ['Test-prompt', 'Test-description', 'Test-textAreaContent'],
    );

    await dappeteer.snaps.acceptDialog();
    const result = await resultPromise;

    expect(result).toBe(true);
  });

  test('snap invoke confirm reject', async function () {
    const resultPromise = dappeteer.snaps.invokeSnap(
      connectedPage,
      snapId,
      'confirm',
      ['Test-prompt', 'Test-description', 'Test-textAreaContent'],
    );

    await dappeteer.snaps.rejectDialog();
    const result = await resultPromise;

    expect(result).toBe(false);
  });

  test('snap invoke wrong method', async function () {
    interface resultType {
      code: number;
      data: { originalError: unknown };
      message: string;
    }
    const resultPromise = dappeteer.snaps.invokeSnap<resultType>(
      connectedPage,
      snapId,
      'test-faliure',
    );

    const result = await resultPromise;

    expect(result.message).toBe('Method not found.');
  });

  test('snap invoke rpc.discover', async function () {
    const resultPromise = dappeteer.snaps.invokeSnap(
      connectedPage,
      snapId,
      'rpc.discover',
    );
    const result = await resultPromise;
    expect(result).toStrictEqual(openrpc);
  });
});
