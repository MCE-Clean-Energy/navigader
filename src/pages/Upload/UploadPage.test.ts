import { renderFileSize } from './UploadPage';


describe('`renderFileSize` helper function', () => {
  test('Handles "bytes"', () => {
    expect(renderFileSize(1)).toEqual('1 byte');
    expect(renderFileSize(123)).toEqual('123 bytes');
  });
  
  test('Handles "KB"', () => {
    expect(renderFileSize(1000)).toEqual('1 KB');
    expect(renderFileSize(123049)).toEqual('123 KB');
    expect(renderFileSize(123456)).toEqual('123.5 KB');
    expect(renderFileSize(123897)).toEqual('123.9 KB');
    expect(renderFileSize(123987)).toEqual('124 KB');
  });
  
  test('Handles "MB"', () => {
    expect(renderFileSize(1000000)).toEqual('1 MB');
    expect(renderFileSize(123000001)).toEqual('123 MB');
    expect(renderFileSize(123456000)).toEqual('123.5 MB');
    expect(renderFileSize(123897000)).toEqual('123.9 MB');
    expect(renderFileSize(123987000)).toEqual('124 MB');
  });
  
  test('Handles "GB"', () => {
    expect(renderFileSize(1000000000)).toEqual('1 GB');
    expect(renderFileSize(123000001042)).toEqual('123 GB');
    expect(renderFileSize(123456000000)).toEqual('123.5 GB');
    expect(renderFileSize(123897000000)).toEqual('123.9 GB');
    expect(renderFileSize(123987000000)).toEqual('124 GB');
  });
  
  test('Handles 0 or negative elegantly', () => {
    expect(renderFileSize(0)).toEqual('');
    expect(renderFileSize(-123)).toEqual('');
  })
});
