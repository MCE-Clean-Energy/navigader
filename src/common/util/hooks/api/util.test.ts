import { Frame288DataType } from 'navigader/types';
import { filterClause } from 'navigader/util';
import { fixtures } from 'navigader/util/testing';
import { hourInterval } from './test_utils';
import { applyDataFilters, applyDynamicRestFilters } from './util';


describe('API hook utilities', () => {
  describe('`applyDataFilters` helper', () => {
    it('returns `false` if no model is provided', () => {
      expect(applyDataFilters(undefined, undefined)).toBeFalsy();
    });

    it('returns `true` if a model is provided but no filters are', () => {
      expect(applyDataFilters({ data: {} }, {})).toBeTruthy();
    });

    it('applies single `data_types` filters appropriately', () => {
      // "default" filter
      expect(applyDataFilters(
        { data: { default: fixtures.makeIntervalData([]) }},
        { data_types: 'default' }
      )).toBeTruthy();

      expect(applyDataFilters(
        { data: {}},
        { data_types: 'default' }
      )).toBeFalsy();

      // Frame 288 filters
      const frame288Types: Frame288DataType[] = ['average', 'maximum', 'minimum'];
      frame288Types.forEach((frame288Type) => {
        expect(applyDataFilters(
          { data: { [frame288Type]: fixtures.makeFrame288(() => 1) }},
          { data_types: frame288Type }
        )).toBeTruthy();

        expect(applyDataFilters(
          { data: {}},
          { data_types: frame288Type }
        )).toBeFalsy();
      });
    });

    it('applies multiple `data_types` filters appropriately', () => {
      const compoundDataObject = {
        data: {
          default: fixtures.makeIntervalData([]),
          average: fixtures.makeFrame288(() => 1)
        }
      };

      // should handle multiple data types that are present
      expect(
        applyDataFilters(compoundDataObject, { data_types: ['average', 'default'] })
      ).toBeTruthy();

      // should handle subsets of present data types
      expect(applyDataFilters(compoundDataObject, { data_types: 'average' })).toBeTruthy();
      expect(applyDataFilters(compoundDataObject, { data_types: ['average'] })).toBeTruthy();
      expect(applyDataFilters(compoundDataObject, { data_types: 'default' })).toBeTruthy();
      expect(applyDataFilters(compoundDataObject, { data_types: ['default'] })).toBeTruthy();

      // should handle data types not present
      expect(
        applyDataFilters(compoundDataObject, { data_types: ['average', 'default', 'minimum'] })
      ).toBeFalsy();

      expect(
        applyDataFilters(compoundDataObject, { data_types: ['average', 'minimum'] })
      ).toBeFalsy();

      expect(applyDataFilters(compoundDataObject, { data_types: 'minimum' })).toBeFalsy();
    });

    it('applies `period` filters appropriately', () => {
      expect(applyDataFilters(
        { data: {} },
        { period: 60 }
      )).toBeFalsy();

      expect(applyDataFilters(
        { data: { default: hourInterval }},
        { period: 60 }
      )).toBeTruthy();

      expect(applyDataFilters(
        { data: { default: hourInterval }},
        { period: 15 }
      )).toBeFalsy();
    });

    it('applies combined filters', () => {
      expect(applyDataFilters(
        { data: { default: hourInterval }},
        { data_types: 'default', period: 60 }
      )).toBeTruthy();

      // wrong period
      expect(applyDataFilters(
        { data: { default: hourInterval }},
        { data_types: 'default', period: 15 }
      )).toBeFalsy();

      // wrong data type
      expect(applyDataFilters(
        { data: { default: hourInterval }},
        { data_types: ['default', 'average'], period: 60 }
      )).toBeFalsy();
    });
  });

  describe('`applyDynamicRestFilters` helper', () => {
    it('returns `true` if no filters are provided', () => {
      expect(applyDataFilters({ data: {} }, {})).toBeTruthy();
    });

    it('applies `in` filters appropriately', () => {
      const model = { field: 2 };
      expect(applyDynamicRestFilters(model, {
        filter: {
          field: filterClause.in([1, 2, 3])
        }
      })).toBeTruthy();

      expect(applyDynamicRestFilters(model, {
        filter: {
          field: filterClause.in([4, 5, 6])
        }
      })).toBeFalsy();
    });

    it('applies `equals` filters appropriately', () => {
      const model = { field: 2 };
      expect(applyDynamicRestFilters(model, {
        filter: {
          field: filterClause.equals(2)
        }
      })).toBeTruthy();

      expect(applyDynamicRestFilters(model, {
        filter: {
          field: filterClause.equals(7)
        }
      })).toBeFalsy();
    });

    it('returns `false` if the model is missing the field being filtered on', () => {
      expect(applyDynamicRestFilters({}, {
        filter: {
          badField1: filterClause.in([1, 2, 3])
        }
      })).toBeFalsy();

      expect(applyDynamicRestFilters({}, {
        filter: {
          badField2: filterClause.equals(4)
        }
      })).toBeFalsy();
    });

    it('applies multiple filters appropriately', () => {
      const complexModel = {
        fieldA: 2,
        fieldB: 'foo',
        fieldC: {
          subFieldA: 420
        }
      };

      expect(applyDynamicRestFilters(complexModel, {
        filter: {
          fieldA: filterClause.equals(2),
          fieldB: filterClause.in(['foo', 'bar', 'baz']),
          'fieldC.subFieldA': filterClause.equals(420)
        }
      })).toBeTruthy();
    });
  });
});
