import * as React from 'react';
import ContainerDimensions, { Dimensions } from 'react-container-dimensions';
import {
  createContainer, VictoryArea, VictoryAxis, VictoryChart, VictoryLabel, VictoryLegend, VictoryLine,
  VictoryTheme, VictoryTooltip
} from 'victory';
import { VictoryVoronoiContainerProps } from 'victory-voronoi-container';
import { VictoryZoomContainerProps } from 'victory-zoom-container';

import { IntervalDataWrapper } from 'navigader/models';
import { ColorMap, makeStylesHook } from 'navigader/styles';
import { MonthIndex, Tuple } from 'navigader/types';
import { omitFalsey } from 'navigader/util';
import { date } from 'navigader/util/formatters';
import { useColorMap } from 'navigader/util/hooks';
import _ from 'navigader/util/lodash';
import { getAxisLabel, VictoryCallbackArg } from './util';


/** ============================ Types ===================================== */
type Timestamp = Date;
type GraphDatum = { name: string; timestamp: Timestamp; value: number };

type IntervalDataGraphProps = {
  animate?: boolean;
  axisLabel?: string;
  data: IntervalDataWrapper | Tuple<IntervalDataWrapper>;
  height?: number;
  hideXAxis?: boolean;
  month: MonthIndex;
  onTimeDomainChange?: (domain: TimeTuple) => void;
  renderInterval?: [Timestamp, Timestamp];
  timeDomain?: TimeTuple;
  units?: string;
};

export type IntervalDataTuple = [IntervalDataWrapper, IntervalDataWrapper];
export type TimeTuple = [Date, Date];
type TimeDomain = { x: TimeTuple };

/** ============================ Styles ===================================== */
const DEFAULT_CHART_HEIGHT = 300;
const chartMargins = {
  left: 60,
  right: 0
};

const areaStyle = (colorMap: ColorMap) => ({
  fill: colorMap.getColor('delta'),
  opacity: 0.3
});

const lineStyle = (intervalName: string, colorMap: ColorMap) => ({
  opacity: 0.3,
  stroke: colorMap.getColor(intervalName)
});

const useStyles = makeStylesHook(() => ({
  container: {
    '& svg': {
      overflow: 'visible'
    }
  }
}), 'IntervalDataGraph');

/** ============================ Components ================================ */
const VictoryZoomVoronoiContainer = createContainer<
  VictoryZoomContainerProps,
  VictoryVoronoiContainerProps
>('zoom', 'voronoi');

export const IntervalDataGraph: React.FC<IntervalDataGraphProps> = (props) => {
  const {
    axisLabel,
    data,
    height = DEFAULT_CHART_HEIGHT,
    hideXAxis,
    month,
    onTimeDomainChange,
    timeDomain,
    units
  } = props;

  const classes = useStyles();
  
  // If the data changes without the component unmounting, get a new color map
  const normalizedData = data instanceof IntervalDataWrapper ? [data] : data;
  const colorMap = useColorMap(normalizedData, _.map(normalizedData, 'name').concat('delta'));

  const { areaData, domain, visibleData } = useData(normalizedData, month, timeDomain);

  return (
    <ContainerDimensions>
      {({ width }: Dimensions) =>
        <div className={classes.container}>
          <VictoryChart
            containerComponent={
              <VictoryZoomVoronoiContainer
                labels={getLabelFactory(units)}
                minimumZoom={{ x: 1000 * 60 * 60 * 3 }}
                // @ts-ignore
                onZoomDomainChange={handleZoom}
                responsive
                zoomDomain={{ x: timeDomain, y: domain.y }}
                zoomDimension="x"
              />
            }
            domain={domain}
            height={height}
            padding={{ ...chartMargins, top: 10 }}
            scale={{ x: 'time' }}
            theme={VictoryTheme.material}
            width={width}
          >
            {!hideXAxis && <VictoryAxis tickFormat={date.monthDayHourMinute} />}
            <VictoryAxis
              crossAxis={false}
              dependentAxis
              label={getAxisLabel(axisLabel, units)}
              axisLabelComponent={<VictoryLabel dy={-30} />}
            />

            {areaData &&
              <VictoryArea
                data={areaData.data.map(d => ({ ...d, name: 'Delta' }))}
                interpolation="monotoneX"
                labelComponent={
                  // @ts-ignore
                  <VictoryTooltip orientation={
                    ({ datum }: VictoryCallbackArg<GraphDatum>) =>
                      datum.value < 0
                        ? 'bottom'
                        : 'top'
                  } />
                }
                style={{ data: areaStyle(colorMap) }}
                x="timestamp"
                y="value"
              />
            }

            {visibleData.map(intervalData =>
              <VictoryLine
                data={intervalData.data.map(d => ({ ...d, name: intervalData.name }))}
                interpolation="monotoneX"
                key={intervalData.name}
                style={{ data: lineStyle(intervalData.name, colorMap) }}
                x="timestamp"
                y="value"
              />
            )}

            <VictoryLegend
              colorScale={
                // Append the "delta" legend icon if there are 2 intervals
                normalizedData.map(interval => colorMap.getColor(interval.name)).concat(
                  normalizedData.length === 2 ? [colorMap.getColor('delta')] : []
                )
              }
              data={
                normalizedData.map(interval => ({ name: interval.name })).concat(
                  normalizedData.length === 2 ? [{ name: 'Delta' }] : []
                )
              }
              gutter={20}
              orientation="horizontal"
              x={chartMargins.left}
            />
          </VictoryChart>
        </div>
      }
    </ContainerDimensions>
  );
  
  /** ============================ Callbacks =============================== */
  function handleZoom (domain: TimeDomain) {
    if (onTimeDomainChange) {
      onTimeDomainChange(domain.x);
    }
  }
};

/** ============================ Helpers =================================== */
/**
 * Returns a function that will be used by Victory to generate tooltips for the interval data
 *
 * @param {string} units: the units of the data being represented (e.g. `kW`, `$`)
 */
function getLabelFactory (units?: string) {
  return function ({ datum }: VictoryCallbackArg<GraphDatum>) {
    return omitFalsey([
      datum.name,
      date.monthDayHourMinute(datum.timestamp) + ':',
      datum.value.toFixed(2),
      units
    ]).join(' ');
  }
}

/**
 * React hook that organizes the component props into data groups for rendering
 *
 * @param {IntervalDataWrapper[]} data: the component `data` prop
 * @param {MonthIndex} month: the month currently being rendered
 * @param {TimeTuple} timeDomain: the domain of the x-axis
 */
function useData (
  data: IntervalDataWrapper[],
  month: MonthIndex,
  timeDomain?: TimeTuple
) {
  const monthData = React.useMemo(
    () => data.map(interval => interval.filter({ month })),
    [data, month]
  );
  
  // Extend the time domain outwards to the nearest hour. This resolves an issue where the data is
  // truncated prematurely on the sides of the graph because the time domain is off-hour
  const visibleData = React.useMemo(
    () => monthData.map(interval => interval.filter({ range: timeDomain })),
    [monthData, timeDomain]
  );
  
  // Compute the area between the two intervals (if 2 are provided)
  const areaData = React.useMemo(
    () => visibleData.length === 2 ? visibleData[1].subtract(visibleData[0]) : undefined,
    [visibleData]
  );
  
  // Get the domain
  const allIntervals = omitFalsey([...monthData, areaData]);
  const valueDomain: [number, number] = allIntervals.reduce(([curMin, curMax], interval) => {
    const intervalDomain = interval.valueDomain();
    return [
      Math.min(curMin, intervalDomain[0]),
      Math.max(curMax, intervalDomain[1])
    ];
  }, [Infinity, -Infinity]);
  
  return {
    areaData,
    domain: {
      x: monthData[0].timeDomain(),
      y: valueDomain
    },
    visibleData,
  };
}
