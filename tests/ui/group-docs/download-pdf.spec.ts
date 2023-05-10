import {DownloadPage} from 'src/ui/pages/group-docs/download-page';
import {test, expect} from 'src/fixtures/base';
import {parsePdf} from 'src/helpers/misc';

test.describe('Downloads:', () => {
  const filesURL = process.env.FILES_PAGE_URL;
  let downloadPage: DownloadPage;

  test.beforeEach(async ({page}) => {
    downloadPage = new DownloadPage(page);
    await page.goto(filesURL, {waitUntil: 'load'});
  });

  test('Download pdf and check its content', async () => {
    const downloadBtn = downloadPage.downloadBtn();
    const [, buffer] = await downloadPage.downloadFile(downloadBtn);
    const pdfText = await parsePdf(buffer).then(({pages}) =>
      pages.map((page) => page.content.map(({str}) => str).toString()).join()
    );
    expect(pdfText).toContain('lorem');
  });
});