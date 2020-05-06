import * as React from 'react';
import { fireEvent, waitForElement, RenderResult } from '@testing-library/react';

import { makeFileList, renderContextDependentComponent } from 'navigader/util/testing';
import { renderFileSize, UploadPage } from './UploadPage';


describe('Upload page', () => {
  describe('`renderFileSize` helper function', () => {
    it('Handles "bytes"', () => {
      expect(renderFileSize(1)).toEqual('1 byte');
      expect(renderFileSize(123)).toEqual('123 bytes');
    });
    
    it('Handles "KB"', () => {
      expect(renderFileSize(1000)).toEqual('1 KB');
      expect(renderFileSize(123049)).toEqual('123 KB');
      expect(renderFileSize(123456)).toEqual('123.5 KB');
      expect(renderFileSize(123897)).toEqual('123.9 KB');
      expect(renderFileSize(123987)).toEqual('124 KB');
    });
    
    it('Handles "MB"', () => {
      expect(renderFileSize(1000000)).toEqual('1 MB');
      expect(renderFileSize(123000001)).toEqual('123 MB');
      expect(renderFileSize(123456000)).toEqual('123.5 MB');
      expect(renderFileSize(123897000)).toEqual('123.9 MB');
      expect(renderFileSize(123987000)).toEqual('124 MB');
    });
    
    it('Handles "GB"', () => {
      expect(renderFileSize(1000000000)).toEqual('1 GB');
      expect(renderFileSize(123000001042)).toEqual('123 GB');
      expect(renderFileSize(123456000000)).toEqual('123.5 GB');
      expect(renderFileSize(123897000000)).toEqual('123.9 GB');
      expect(renderFileSize(123987000000)).toEqual('124 GB');
    });
    
    it('Handles 0 or negative elegantly', () => {
      expect(renderFileSize(0)).toEqual('');
      expect(renderFileSize(-123)).toEqual('');
    });
  });
  
  describe('Upload flow', () => {
    type GetByRole = RenderResult['getByRole'];
    type GetByTestId = RenderResult['getByTestId'];
    
    // Can't use the file selector, so attach a file to the input directly
    function selectFile (getByTestId: GetByTestId, name: string) {
      const file = new File([], name, { type: 'text/csv' });
      const fileInput = getByTestId('hidden-upload-input');
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
      const { getByTestId, getByText } = renderContextDependentComponent(<UploadPage />);
      
      // Select a file to upload
      selectFile(getByTestId, 'test_upload.csv');
      
      // Upload button should now be enabled
      await waitForElement(() => !getUploadButton(getByTestId).disabled );
      fireEvent.click(getUploadButton(getByTestId));
      
      // Success message should now show
      await waitForElement(() => true);
      expect(getByText('Success!')).toBeInTheDocument();
    });
    
    it('allows uploading twice', async () => {
      const { getByRole, getByTestId, getByText } = renderContextDependentComponent(<UploadPage />);
      
      // Select a file to upload, enter a name and upload
      selectFile(getByTestId, 'my_upload.csv');
      await waitForElement(() => !getUploadButton(getByTestId).disabled );
      fireEvent.click(getUploadButton(getByTestId));
      
      // Success message should now show
      await waitForElement(() => true);
      expect(getByText('Success!')).toBeInTheDocument();
      
      // Select another file. Doing so should reset the upload card
      selectFile(getByTestId, 'my_other_upload.csv');
      await waitForElement(() => true);
      expect(getNameInput(getByRole).value).toEqual('my_other_upload');
    });
  });
});
