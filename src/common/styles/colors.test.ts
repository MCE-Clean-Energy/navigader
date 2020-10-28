import { ColorMap } from './colors';

describe('`ColorMap` class', () => {
  it('can add arbitrary entities to the map', () => {
    const colorMap = new ColorMap();

    // Non-primitives are looked up by identity, not value
    const myFunc = () => null;
    const myArr: any[] = [];

    const color1 = colorMap.getColor(1);
    const color2 = colorMap.getColor('1');
    const color4 = colorMap.getColor(null);
    const color3 = colorMap.getColor(myFunc);
    const color5 = colorMap.getColor(myArr);

    // Should produce the same color when asked again
    expect(colorMap.getColor(1)).toEqual(color1);
    expect(colorMap.getColor('1')).toEqual(color2);
    expect(colorMap.getColor(null)).toEqual(color4);
    expect(colorMap.getColor(myFunc)).toEqual(color3);
    expect(colorMap.getColor(myArr)).toEqual(color5);
  });
});
