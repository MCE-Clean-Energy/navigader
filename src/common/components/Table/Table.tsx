import classNames from 'classnames';
import _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import MuiPaper from '@material-ui/core/Paper';
import MuiTable from '@material-ui/core/Table';
import MuiTableBody from '@material-ui/core/TableBody';
import MuiTableCell from '@material-ui/core/TableCell';
import MuiTableContainer from '@material-ui/core/TableContainer';
import MuiTableHead from '@material-ui/core/TableHead';
import MuiTableRow from '@material-ui/core/TableRow';
import MuiTableSortLabel from '@material-ui/core/TableSortLabel';
import MuiToolbar from '@material-ui/core/Toolbar';
import { createStyles, Theme, WithStyles, withStyles } from '@material-ui/core/styles';

import {
  DataSelector,
  ObjectWithId,
  PageSizeOption,
  SortDir,
  SortFields,
  TableInterface,
  TableProps,
  TableState,
} from 'navigader/types';
import { omitFalsey } from 'navigader/util';

import { Button } from '../Button';
import { Checkbox } from '../Checkbox';
import * as Flex from '../Flex';
import { Progress } from '../Progress';
import { Typography } from '../Typography';
import { TablePagination } from './Pagination';
import { TableContext } from './util';

/** ============================ Types ===================================== */
// Props provided by the `mapStateToProps` function
type InjectedProps<T extends ObjectWithId> = { data: T[] };

// Props provided by `withStyles`
type StyleClasses = WithStyles<typeof styles>;

// Merged props available to the `TableWithData` component
type ConnectedTableProps<T extends ObjectWithId> = StyleClasses & TableProps<T> & InjectedProps<T>;

// Props that should be provided to the HOC returned from `TableFactory` but which are not used by
// `TableWithData`
type DisconnectedTableProps<T extends ObjectWithId> = React.RefAttributes<TableInterface<T>> &
  TableProps<T> & {
    dataSelector: DataSelector<T>;
  };

export type TableCellProps = {
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
  className?: string;
  colSpan?: number;
  rowSpan?: number;
  sortBy?: string;
  sortDir?: SortDir;
  // These props should not be provided by consuming components-- they are provided by the
  // `TableHead` and `TableBody` components
  _columnIndex?: number;
  _isHeaderRow?: boolean;
};

type TableRowProps<T extends ObjectWithId> = React.PropsWithChildren<{
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;

  // These props should not be provided by consuming components-- they are provided by the
  // `TableHead` and `TableBody` components
  _datum?: T;
  _disableSelect?: boolean;
  _isHeaderRow?: boolean;
  _onChange?: (checked: boolean) => void;
  _selected?: boolean;
}>;

/** ============================ Styles ==================================== */
const styles = (theme: Theme) =>
  createStyles({
    fab: {
      margin: '-10px -10px 0 0',
      position: 'absolute',
      right: 0,
      top: 0,
    },
    headerWithFab: { marginRight: 40 },
    paper: { position: 'relative' },
    progressBarSpacer: { height: 4 },
    table: {
      '& .disabled-select-component': {
        display: 'flex',
        flexFlow: 'row nowrap',
        justifyContent: 'center',
        width: '100%',
      },
    },
    toolbar: {
      justifyContent: 'space-between',
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(1),
    },
  });

/** ============================ Components ================================ */
class TableWithData<T extends ObjectWithId> extends React.Component<
  ConnectedTableProps<T>,
  TableState
> {
  static defaultPageSize: PageSizeOption = 20;
  tableRef: React.RefObject<HTMLTableElement>;

  constructor(props: ConnectedTableProps<T>) {
    super(props);

    // Make a ref to refer to the table DOM node
    this.tableRef = React.createRef();
    const { initialSorting } = props;
    this.state = {
      loading: false,
      page: 0,
      pageSize: TableWithData.defaultPageSize,
      selections: new Set(),
      sorting: { sortDir: initialSorting?.dir, sortKey: initialSorting?.key },
    };
  }

  componentDidMount() {
    this.fetch();
  }

  componentDidUpdate(prevProps: Readonly<TableProps<T>>, prevState: Readonly<TableState>) {
    // If any of the pagination state fields have changed, re-fetch
    const { page: pageNew, pageSize: pageSizeNew, sorting: sortingNew } = this.state;
    const { page: pageOld, pageSize: pageSizeOld, sorting: sortingOld } = prevState;
    const { sortDir: sortDirNew, sortKey: sortKeyNew } = sortingNew;
    const { sortDir: sortDirOld, sortKey: sortKeyOld } = sortingOld;

    const allTheSame = _.every(
      [
        [pageNew, pageOld],
        [pageSizeNew, pageSizeOld],
        [sortDirNew, sortDirOld],
        [sortKeyNew, sortKeyOld],
      ].map(([newParam, oldParam]) => _.isEqual(newParam, oldParam))
    );

    if (!allTheSame) {
      this.fetch();
    }

    // If the selections have changed, call the `onSelect` callback
    const { onSelect = () => {} } = this.props;
    const { selections: selectionsNew } = this.state;
    const { selections: selectionsOld } = prevState;
    if (selectionsNew !== selectionsOld) {
      const data = this.getData();
      onSelect([...selectionsNew].map((index) => data[index]));
    }
  }

  /**
   * Returns true if the table's data can fit on a single page of default size. If there's no data,
   * that counts as a single page.
   */
  get isSinglePage() {
    const { count } = this.state;
    return _.isUndefined(count) || count <= TableWithData.defaultPageSize;
  }

  fetch() {
    const { page, pageSize, sorting } = this.state;
    this.setState({ loading: true });
    this.props
      .dataFn({ page, pageSize, ...sorting })
      .then((paginationSet) =>
        this.setState({
          count: paginationSet.count,
          dataIds: _.map(paginationSet.data, 'id'),
        })
      )
      .finally(() => this.setState({ loading: false }));
  }

  getData() {
    const { data } = this.props;
    const { dataIds } = this.state;
    return dataIds ? omitFalsey(dataIds.map((id) => _.find(data, ['id', id]))) : [];
  }

  /**
   * Called when the header's selection checkbox changes state
   *
   * @param {boolean} selectAll: true if the checkbox is now checked (i.e. if all rows ought to
   *   become selected)
   */
  toggleAllSelections(selectAll: boolean) {
    const { disableSelect = () => false } = this.props;
    const data = this.getData();

    // Can't do anything without data
    if (!data) return;
    if (selectAll) {
      const selectables = data.filter((d) => !disableSelect(d));
      const selectedIndices = selectables.map((d) => data.indexOf(d));
      this.setState({ selections: new Set(selectedIndices) });
    } else {
      this.setState({ selections: new Set() });
    }
  }

  /**
   * Called when a row's selection checkbox changes state
   *
   * @param {number} rowIndex: the index of the row whose selection state is toggling
   * @param {boolean} checked: true if the checkbox is now checked (i.e. if the row is now selected)
   */
  toggleRowSelection(rowIndex: number, checked: boolean) {
    const newSelections = new Set(this.state.selections);

    if (checked) newSelections.add(rowIndex);
    else newSelections.delete(rowIndex);

    this.setState({ selections: newSelections });
  }

  renderContext() {
    const { count, selections, sorting } = this.state;
    const {
      children,
      disableSelect = () => false,
      DisabledSelectComponent,
      hover = true,
      onSelect,
    } = this.props;

    const data = this.getData();
    const selectables = data.filter((d) => !disableSelect(d));

    const tableContext = {
      allSelected: selectables.length > 0 && selectables.length === selections.size,
      data,
      disableSelect,
      DisabledSelectComponent,
      hover,
      selectable: Boolean(onSelect),
      selections,
      setSortState: (newState: SortFields) => this.setState({ sorting: newState }),
      sortState: sorting,
      toggleAllSelections: this.toggleAllSelections.bind(this),
      toggleRowSelection: this.toggleRowSelection.bind(this),
    };

    // Component to render when there is no data
    const EmptyRow: React.FC = ({ children }) => {
      if (count !== 0) return null;

      // Calculate the number of columns in the table
      const colSpan = this.tableRef.current?.tHead?.getElementsByTagName('th').length;
      return (
        <TableRow>
          <TableCell colSpan={colSpan}>{children}</TableCell>
        </TableRow>
      );
    };

    return (
      <TableContext.Provider value={tableContext}>
        {children(data || [], EmptyRow)}
      </TableContext.Provider>
    );
  }

  renderFAB() {
    const { classes, onFabClick } = this.props;
    if (!onFabClick) return null;
    return <Button.Fab className={classes.fab} color="primary" name="plus" onClick={onFabClick} />;
  }

  renderProgressBar() {
    const { loading } = this.state;
    return loading ? <Progress /> : <div className={this.props.classes.progressBarSpacer} />;
  }

  renderToolbar() {
    const { classes, headerActions, onFabClick, title } = this.props;
    const { count } = this.state;

    // If there's no title, a single page of data and no header actions, hide the toolbar
    if (!title && this.isSinglePage && !headerActions) return null;

    const data = this.getData();
    const headerClassname = classNames({ [classes.headerWithFab]: !!onFabClick });

    return (
      <MuiToolbar className={classes.toolbar} data-testid="table-toolbar">
        <Typography variant="h6">{title}</Typography>
        {data && (
          <Flex.Container alignItems="center" className={headerClassname}>
            {headerActions}
            {!this.isSinglePage && (
              <TablePagination
                count={count!}
                paginationState={this.state}
                // Reset selections when pagination state changes
                updatePaginationState={(newState) =>
                  this.setState({ ...newState, selections: new Set() })
                }
              />
            )}
          </Flex.Container>
        )}
      </MuiToolbar>
    );
  }

  render() {
    const { classes, containerClassName, raised = false, size } = this.props;
    const tableProps = { className: classes.table, ref: this.tableRef, size };

    return (
      <MuiPaper className={classes.paper} elevation={raised ? 8 : 0}>
        {this.renderToolbar()}
        {this.renderFAB()}
        <MuiTableContainer className={containerClassName}>
          {this.renderProgressBar()}
          <MuiTable {...tableProps}>{this.renderContext()}</MuiTable>
        </MuiTableContainer>
      </MuiPaper>
    );
  }
}

const TableBody: React.FC = (props) => {
  const { data, disableSelect, selections, toggleRowSelection } = React.useContext(TableContext);

  // Keeps track of the index of each row. This is augmented once per table row in the loop
  let rowIndex = 0;

  return (
    <MuiTableBody>
      {React.Children.map(props.children, (child) => {
        // If the child is not a valid element or if it isn't a table row component, return
        // unchanged
        if (!React.isValidElement(child) || child.type !== TableRow) return child;

        // Augment the row index
        const index = rowIndex++;
        const datum = data[index];
        return React.cloneElement<TableRowProps<ObjectWithId>>(child, {
          _datum: datum,
          _isHeaderRow: false,
          _onChange: (checked: boolean) => toggleRowSelection(index, checked),
          _selected: selections.has(index),
          _disableSelect: disableSelect(datum),
        });
      })}
    </MuiTableBody>
  );
};

const TableHead: React.FC = (props) => {
  const { allSelected, data, toggleAllSelections, disableSelect } = React.useContext(TableContext);
  const selectables = data.filter((d) => !disableSelect(d));
  return (
    <MuiTableHead>
      {React.isValidElement(props.children)
        ? React.cloneElement<TableRowProps<never>>(props.children, {
            _isHeaderRow: true,
            _onChange: toggleAllSelections,
            _selected: allSelected,
            _disableSelect: selectables.length === 0,
          })
        : props.children}
    </MuiTableHead>
  );
};

function TableRow<T extends ObjectWithId>(props: TableRowProps<T>) {
  const {
    children,
    className,
    onMouseEnter,
    onMouseLeave,
    _datum,
    _disableSelect,
    _isHeaderRow,
    _onChange,
    _selected,
  } = props;
  const { data, DisabledSelectComponent, hover, selectable } = React.useContext(TableContext);

  // If the row is selectable, add in a checkbox to the front of the row
  let checkboxCell = null;
  let colIndex = 0;
  if (selectable && data.length > 0) {
    // The `onChange` callback depends on the cell's context
    checkboxCell = (
      <TableCell _columnIndex={colIndex++} _isHeaderRow={_isHeaderRow}>
        {_disableSelect && !_isHeaderRow && DisabledSelectComponent ? (
          <div className="disabled-select-component">
            <DisabledSelectComponent datum={_datum} />
          </div>
        ) : (
          <Checkbox checked={_selected} disabled={_disableSelect} onChange={_onChange} />
        )}
      </TableCell>
    );
  }

  return (
    <MuiTableRow
      className={className}
      hover={hover && !_isHeaderRow}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {checkboxCell}
      {React.Children.map(children, (child) =>
        // Add the `_columnIndex` and `_isHeaderRow` props
        React.isValidElement(child)
          ? React.cloneElement(child, { _columnIndex: colIndex++, _isHeaderRow })
          : null
      )}
    </MuiTableRow>
  );
}

const TableCell: React.FC<TableCellProps> = (props) => {
  const { children, sortBy, sortDir, _columnIndex, _isHeaderRow, ...rest } = props;
  const { setSortState, sortState } = React.useContext(TableContext);
  const tableCellProps = { ...rest };

  // For accessibility, a table's first column is set to be a <th> element, with a scope of "row",
  // and table header elements are given a scope of "col". This enables screen readers to identify a
  // cell's value by its row and column name.
  //
  // See more here: https://material-ui.com/components/tables/#structure
  if (_columnIndex === 0 || _isHeaderRow) {
    Object.assign(tableCellProps, {
      component: 'th',
      scope: _isHeaderRow ? 'col' : 'row',
    });
  }

  if (sortBy) {
    const active = sortBy === sortState?.sortKey;
    return (
      <MuiTableCell {...tableCellProps}>
        <MuiTableSortLabel
          active={active}
          direction={active ? sortState?.sortDir : getDefaultSortDir()}
          onClick={updateSortState}
        >
          {children}
        </MuiTableSortLabel>
      </MuiTableCell>
    );
  }

  return <MuiTableCell children={children} {...tableCellProps} />;

  /** ========================== Callbacks ================================= */
  /**
   * Triggered when the user clicks the sort label, indicating they want to sort on a given column
   */
  function updateSortState() {
    const newDir =
      sortState?.sortKey === sortBy ? toggleSortDir(sortState?.sortDir) : getDefaultSortDir();

    setSortState({
      sortDir: newDir,
      // `sortBy` isn't a required prop, but is required for rendering the sort label and thus
      // for triggering this callback, hence the non-null assertion
      sortKey: sortBy!,
    });
  }

  /**
   * Returns the column's default sorting direction, falling back on the global default sort
   * direction if no sort direction is provided
   */
  function getDefaultSortDir() {
    return sortDir || DEFAULT_SORT_DIR;
  }

  /**
   * Toggles sort direction from ascending to descending or vice versa. If not provided an initial
   * direction, returns the global default sorting direction
   *
   * @param {SortDir} [dir]: initial sort direction
   */
  function toggleSortDir(dir?: SortDir) {
    switch (dir) {
      case 'asc':
        return 'desc';
      case 'desc':
        return 'asc';
      default:
        return DEFAULT_SORT_DIR;
    }
  }
};

/**
 * This is a verbose way of retaining the `Table` component's generic type parameter while using
 * `connect`.
 */
export function TableFactory<T extends ObjectWithId>() {
  // Create the `ConnectedTable`. This connects the `TableWithData` component to the redux store and
  // extracts the data from the store using the component's `dataSelector` prop. From there it's up
  // to the component to filter that data down to the actual list of data to render, using its state
  // parameter `dataIds`.
  //
  // Additionally, this injects the styles into the component. This mess of types contains multiple
  // typecasts, and I'm not at all confident in its robustness. Nevertheless it satisfies the
  // linter, so it satisfies me.
  const ConnectedTable = withStyles(styles)(
    connect<InjectedProps<T>, {}, DisconnectedTableProps<T>>(
      (state, ownProps) => ({ data: ownProps.dataSelector(state) }),
      null,
      null,
      { forwardRef: true }
    )(TableWithData as React.ComponentType<ConnectedTableProps<T>>)
  ) as React.ComponentType<DisconnectedTableProps<T>>;

  // Attach the various table components to the `ConnectedTable` for easy access
  return Object.assign(ConnectedTable, {
    Body: TableBody,
    Cell: TableCell,
    Head: TableHead,
    Pagination: TablePagination,
    Row: TableRow,
  });
}

/**
 * Provided as a convenience for components that do not need typechecking, or which only need the
 * `Table` component to access its sub-components.
 */
export const Table = TableFactory<any>();

/** ============================ Constants ================================= */
const DEFAULT_SORT_DIR = 'asc';
