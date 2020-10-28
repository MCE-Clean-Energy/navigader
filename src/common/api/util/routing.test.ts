import { appendId } from './routing';

describe('`appendId` method', () => {
  it('Appends a / when no id is provided', () => {
    const uriFactory = appendId('myRoute');
    const uri = uriFactory();
    expect(uri).toEqual('myRoute/');
  });

  it('Appends the ID correctly when provided', () => {
    const uriFactory = appendId('myRoute');
    const uriNumeric = uriFactory(1);
    const uuid = '5eec8ec9-8f01-48b6-bc84-8042ed6ec3e1';
    const uriString = uriFactory(uuid);
    expect(uriNumeric).toEqual('myRoute/1/');
    expect(uriString).toEqual(`myRoute/${uuid}/`);
  });
});
