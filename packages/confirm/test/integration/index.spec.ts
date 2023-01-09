import path from 'path';
import {
  Dappeteer,
  initSnapEnv,
  DappeteerBrowser,
  DappeteerPage,
} from '@chainsafe/dappeteer';
import openrpc from '../../src/openrpc.json';

describe('confirm snap', function () {
  const INSTALLATION_SNAP_URL = 'https://google.com/';
  let metaMask: Dappeteer;
  let metaMaskPage: DappeteerPage;
  let browser: DappeteerBrowser;
  let connectedPage: DappeteerPage;
  let snapId: string;

  beforeAll(async function () {
    ({ metaMask, snapId, browser, metaMaskPage } = await initSnapEnv({
      automation: 'playwright',
      browser: 'chrome',
      snapIdOrLocation: path.resolve(__dirname, '../..'),
      installationSnapUrl: INSTALLATION_SNAP_URL,
    }));
    connectedPage = await metaMaskPage.browser().newPage();
    await connectedPage.goto(INSTALLATION_SNAP_URL);
  });

  afterAll(async function () {
    await browser.close();
  });

  test('snap invoke confirm accept', async function () {
    const resultPromise = metaMask.snaps.invokeSnap(
      connectedPage,
      snapId,
      'confirm',
    );

    await metaMask.page.waitForTimeout(2000);
    await metaMask.snaps.acceptDialog();

    expect(await resultPromise).toBe(true);
  });

  test('snap invoke confirm reject', async function () {
    const resultPromise = metaMask.snaps.invokeSnap(
      connectedPage,
      snapId,
      'confirm',
      ['Test-prompt', 'Test-description', 'Test-textAreaContent'],
    );
    await metaMask.page.waitForTimeout(1000);
    await metaMask.snaps.rejectDialog();
    const result = await resultPromise;

    expect(result).toBe(false);
  });

  test('snap invoke wrong method', async function () {
    interface resultType {
      code: number;
      data: { originalError: unknown };
      message: string;
    }

    try {
      metaMask.snaps.invokeSnap<resultType>(
        connectedPage,
        snapId,
        'test-not-existing-method',
      );
    } catch (e) {
      expect(e).toBe('Method not found.');
    }
  });

  test('snap invoke rpc.discover', async function () {
    const resultPromise = metaMask.snaps.invokeSnap(
      connectedPage,
      snapId,
      'rpc.discover',
    );
    const result = await resultPromise;
    expect(result).toStrictEqual(openrpc);
  });
});
