import { RawPaginationSet } from 'navigader/types';
import { parsePaginationSet } from './pagination';

describe('`parsePaginationSet` method', () => {
  type Coordinate = { x: number; y: number };
  const paginationSet: RawPaginationSet<{ coordinates: Coordinate[] }> = {
    count: 3,
    results: {
      coordinates: [
        { x: 1, y: 2 },
        { x: 2, y: 3 },
        { x: 3, y: 4 },
      ],
    },
  };

  const invertCoord = ({ x, y }: Coordinate): Coordinate => ({ y: x, x: y });

  it('Parses schema input with no parse function correctly', () => {
    const parsed = parsePaginationSet(paginationSet, 'coordinates');

    expect(parsed.count).toEqual(paginationSet.count);
    for (let i = 0; i < parsed.data.length; i++) {
      expect(parsed.data[i].x).toEqual(paginationSet.results.coordinates[i].x);
      expect(parsed.data[i].y).toEqual(paginationSet.results.coordinates[i].y);
    }
  });

  it('Parses schema input with parse function correctly', () => {
    const parsed = parsePaginationSet(paginationSet, ({ coordinates }) =>
      coordinates.map(invertCoord)
    );

    expect(parsed.count).toEqual(paginationSet.count);
    for (let i = 0; i < parsed.data.length; i++) {
      expect(parsed.data[i].x).toEqual(paginationSet.results.coordinates[i].y);
      expect(parsed.data[i].y).toEqual(paginationSet.results.coordinates[i].x);
    }
  });
});
