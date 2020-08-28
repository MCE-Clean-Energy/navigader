/**
 * File download code taken with modifications from GitHub gist:
 *
 *   https://gist.github.com/devloco/5f779216c988438777b76e7db113d05c#gistcomment-3410641
 */

import { Nullable } from 'navigader/types';
import { getRequestHeaders } from 'navigader/util';


/** ============================ Types ===================================== */
export type ProgressCallback = (receivedLength: number, contentLength: number) => void;

/** ============================ Download ================================== */
/**
 * Downloads a file and saves it to disk
 *
 * @param {string} url: the URL of the file
 * @param {string} defaultFileName: the name to give the file if no `Content-Disposition` header is
 *   returned with the response
 * @param {ProgressCallback} onProgress: a callback to run when a new chunk is downloaded
 */
export async function downloadFile (
  url: string,
  defaultFileName: string,
  onProgress?: ProgressCallback
) {
  const { fileName, blob } = await fetchFile(url, onProgress);
  saveBlob(blob, fileName ?? defaultFileName);
}

/** ============================ Helpers =================================== */
/**
 * Inspects the `Content-Disposition` header of the response to determine the filename to use for
 * the download
 *
 * @param {Response} response: the `Response` object returned by fetch
 */
function getFileNameFromContentDispositionHeader(response: Response): Nullable<string> {
  const contentDisposition = response.headers.get('content-disposition');
  if (!contentDisposition) return null;

  const standardPattern = /filename=(["']?)(.+)\1/i;
  const wrongPattern = /filename=([^"'][^;"'\n]+)/i;

  if (standardPattern.test(contentDisposition)) {
    return contentDisposition.match(standardPattern)![2];
  }

  if (wrongPattern.test(contentDisposition)) {
    return contentDisposition.match(wrongPattern)![1];
  }

  return null;
}

/**
 * Saves the Blob to a file
 *
 * @param {Blob} blob: the blob to save
 * @param {string} fileName: the name of the file
 */
function saveBlob (blob: Blob, fileName: string) {
  // MS Edge and IE don't allow using a blob object directly as link href, instead it is necessary
  // to use msSaveOrOpenBlob
  if (window.navigator?.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(blob);
    return;
  }

  // For other browsers: create a link pointing to the ObjectURL containing the blob.
  const objUrl = window.URL.createObjectURL(blob);

  let link = document.createElement('a');
  link.href = objUrl;
  link.download = fileName;
  link.click();

  // For Firefox it is necessary to delay revoking the ObjectURL.
  setTimeout(() => {
    window.URL.revokeObjectURL(objUrl);
  }, 250);
}

/**
 * Fetches the file to download. If provided, the `onProgress` callback is called with every
 * chunk loaded.
 *
 * @param {string} url: the URL of the file
 * @param {ProgressCallback} onProgress: a callback to run when a new chunk is downloaded
 */
export async function fetchFile (url: string, onProgress?: ProgressCallback) {
  let requestInit: RequestInit = {
    method: 'GET',
    headers: getRequestHeaders('application/json')
  };

  // Fetch the file
  const response = await fetch(url, requestInit);
  if (!response.ok || !response.body) {
    const responseBody = await response.text();
    throw new Error(responseBody ?? 'Unable to fetch file');
  }

  const reader = response.body.getReader();
  const contentLength = Number(response.headers.get('Content-Length'));

  let receivedLength = 0;
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    chunks.push(value);
    receivedLength += value.length;

    if (typeof onProgress !== 'undefined') {
      onProgress(receivedLength, contentLength);
    }
  }

  const type = response.headers.get('content-type')?.split(';')[0];
  return {
    fileName: getFileNameFromContentDispositionHeader(response),
    blob: new Blob(chunks, { type }),
  };
}
