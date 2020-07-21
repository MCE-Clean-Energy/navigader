import * as React from 'react';
import moment from 'moment';
import {
  createContainer, VictoryArea, VictoryAxis, VictoryLabel, VictoryLegend, VictoryLine,
  VictoryTooltip
} from 'victory';
import { VictoryVoronoiContainerProps } from 'victory-voronoi-container';
import { VictoryZoomContainerProps } from 'victory-zoom-container';

import { ColorMap } from 'navigader/styles';
import { DateTuple, IntervalData, MonthIndex, Tuple } from 'navigader/types';
import { omitFalsey } from 'navigader/util';
import { date } from 'navigader/util/formatters';
import { useColorMap } from 'navigader/util/hooks';
import _ from 'navigader/util/lodash';
import { NavigaderChart } from './components';
import { getAxisLabel, VictoryCallbackArg } from './util';


/** ============================ Types ===================================== */
type Timestamp = Date;
type GraphDatum = { name: string; timestamp: Timestamp; value: number };

type IntervalDataGraphProps = {
  animate?: boolean;
  axisLabel?: string;
  data: IntervalData | IntervalDataTuple;
  height?: number;
  hideXAxis?: boolean;
  month: MonthIndex;
  onTimeDomainChange?: (domain: DateTuple) => void;
  precision?: number;
  renderInterval?: Tuple<Timestamp>;
  timeDomain?: DateTuple;
  units?: string;
};

export type IntervalDataTuple = Tuple<IntervalData>;
type TimeDomain = { x: DateTuple };

/** ============================ Styles ===================================== */
const DEFAULT_CHART_HEIGHT = 300;
const chartMargins = {
  left: 60,
  right: 0
};

const areaStyle = (colorMap: ColorMap) => ({
  fill: colorMap.getColor('delta')
});

const lineStyle = (intervalName: string, colorMap: ColorMap) => ({
  stroke: colorMap.getColor(intervalName)
});

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
    precision,
    timeDomain,
    units
  } = props;

  // If the data changes without the component unmounting, get a new color map
  const normalizedData = Array.isArray(data) ? data: [data];
  const colorMap = useColorMap(normalizedData, _.map(normalizedData, 'name').concat('delta'));

  const { areaData, domain, visibleData } = useData(normalizedData, month, timeDomain);

  return (
    <NavigaderChart
      containerComponent={
        <VictoryZoomVoronoiContainer
          labels={getLabelFactory(units, precision)}
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
        x={chartMargins.left}
      />
    </NavigaderChart>
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
 * @param {string} [units]: the units of the data being represented (e.g. `kW`, `$`)
 * @param {number} [precision]: the number of decimal places to include in the value
 */
function getLabelFactory (units?: string, precision: number = 2) {
  return function ({ datum }: VictoryCallbackArg<GraphDatum>) {
    return omitFalsey([
      datum.name,
      date.monthDayHourMinute(datum.timestamp) + ':',
      datum.value.toFixed(precision),
      units
    ]).join(' ');
  }
}

/**
 * React hook that organizes the component props into data groups for rendering
 *
 * @param {IntervalData[]} data: the component `data` prop
 * @param {MonthIndex} month: the month currently being rendered
 * @param {DateTuple} timeDomain: the domain of the x-axis
 */
function useData (data: IntervalData[], month: MonthIndex, timeDomain?: DateTuple) {
  const monthData = React.useMemo(
    () => data.map(interval => interval.filter({ month })),
    [data, month]
  );
  
  const visibleData = React.useMemo(
    () => {
      /**
       * Extend the time domain outwards by finding the greatest period of all the intervals being
       * graphed and subtracting it from the start of the domain and adding it to the end of the
       * domain. This resolves an issue where the data is truncated prematurely on the sides of
       * the graph because the time domain is off-hour
       */
      const extendedTimeDomain = (() => {
        if (!timeDomain) return;
        const [start, end] = timeDomain;
    
        // Find the greatest period amongst the intervals. This is the period we will use to round
        const greatestPeriod = Math.max(...monthData.map(datum => datum.period));
        const periodDuration = moment.duration(greatestPeriod, 'minutes');
        return [
          moment(start).subtract(periodDuration).toDate(),
          moment(end).add(periodDuration).toDate()
        ] as DateTuple;
      })();
      
      return monthData.map(interval => interval.filter({ range: extendedTimeDomain }))
    },
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
