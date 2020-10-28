import * as React from 'react';
import { fireEvent, waitFor, RenderResult } from '@testing-library/react';
import mock from 'xhr-mock';

import { util } from 'navigader/api';
import { makeFileList, renderContextDependentComponent } from 'navigader/util/testing';
import { UploadPage } from './UploadPage';
import { fileSize } from 'navigader/util/formatters';


describe('Upload page', () => {
  describe('`fileSize` helper function', () => {
    it('Handles "bytes"', () => {
      expect(fileSize(1)).toEqual('1 byte');
      expect(fileSize(123)).toEqual('123 bytes');
    });

    it('Handles "KB"', () => {
      expect(fileSize(1000)).toEqual('1 KB');
      expect(fileSize(123049)).toEqual('123 KB');
      expect(fileSize(123456)).toEqual('123.5 KB');
      expect(fileSize(123897)).toEqual('123.9 KB');
      expect(fileSize(123987)).toEqual('124 KB');
    });

    it('Handles "MB"', () => {
      expect(fileSize(1000000)).toEqual('1 MB');
      expect(fileSize(123000001)).toEqual('123 MB');
      expect(fileSize(123456000)).toEqual('123.5 MB');
      expect(fileSize(123897000)).toEqual('123.9 MB');
      expect(fileSize(123987000)).toEqual('124 MB');
    });

    it('Handles "GB"', () => {
      expect(fileSize(1000000000)).toEqual('1 GB');
      expect(fileSize(123000001042)).toEqual('123 GB');
      expect(fileSize(123456000000)).toEqual('123.5 GB');
      expect(fileSize(123897000000)).toEqual('123.9 GB');
      expect(fileSize(123987000000)).toEqual('124 GB');
    });

    it('Handles 0 or negative elegantly', () => {
      expect(fileSize(0)).toEqual('');
      expect(fileSize(-123)).toEqual('');
    });
  });

  describe('Upload flow', () => {
    type GetByRole = RenderResult['getByRole'];
    type GetByTestId = RenderResult['getByTestId'];

    // Replace the real XHR object with the mock XHR object before each test and put the real XHR
    // object back after each test
    beforeEach(() => mock.setup());
    afterEach(() => mock.teardown());

    // Can't use the file selector, so attach a file to the input directly
    function selectFile (getByTestId: GetByTestId, name: string) {
      const file = new File([], name, { type: 'text/csv' });
      const fileInput = getByTestId('hidden-upload-input-15');
      fireEvent.change(fileInput, { target: { files: makeFileList([file]) }});
    }

    function getUploadButton (getByTestId: GetByTestId) {
      return getByTestId('upload-button') as HTMLButtonElement;
    }

    function getNameInput (getByRole: GetByRole) {
      return getByRole('textbox') as HTMLInputElement;
    }

    function enterFileName (getByRole: GetByRole, name: string) {
      fireEvent.change(getNameInput(getByRole), { target: { value: name }});
    }

    it('changes the upload name when the input value changes', () => {
      const { getByRole, getByTestId } = renderContextDependentComponent(<UploadPage />);

      // Select a file to upload, enter a name and upload
      selectFile(getByTestId, "file_name_i_dont_want_to_keep.csv");
      expect(getNameInput(getByRole).value).toEqual('file_name_i_dont_want_to_keep');

      // Update the file name
      enterFileName(getByRole, 'File name I like');
      expect(getNameInput(getByRole).value).toEqual('File name I like');
    });

    it('shows a success message when upload works', async () => {
      const { findByText, getByTestId } = renderContextDependentComponent(<UploadPage />);

      // Mock XHR to respond successfully
      mock.post(util.beoRoute.v1('load/origin_file/'), {
        status: 201
      });

      // Select a file to upload
      selectFile(getByTestId, 'test_upload.csv');

      // Upload button should now be enabled
      await waitFor(() => !getUploadButton(getByTestId).disabled);
      fireEvent.click(getUploadButton(getByTestId));

      // Success message should now show
      expect(await findByText('Success!')).toBeInTheDocument();
    });

    it('allows uploading twice', async () => {
      const { findByText, getByRole, getByTestId } = renderContextDependentComponent(<UploadPage />);

      // Select a file to upload, enter a name and upload
      selectFile(getByTestId, 'my_upload.csv');
      await waitFor(() => !getUploadButton(getByTestId).disabled);
      fireEvent.click(getUploadButton(getByTestId));

      // Mock XHR to respond successfully
      mock.post(util.beoRoute.v1('load/origin_file/'), {
        status: 201
      });

      // Success message should now show
      expect(await findByText('Success!')).toBeInTheDocument();

      // Select another file. Doing so should reset the upload card
      selectFile(getByTestId, 'my_other_upload.csv');
      expect(getNameInput(getByRole).value).toEqual('my_other_upload');
    });
  });
});
