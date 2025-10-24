import React, { Children, cloneElement, isValidElement, useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_MARGIN = { top: 16, right: 24, bottom: 32, left: 40 };

const getMargin = (margin) => ({ ...DEFAULT_MARGIN, ...(margin ?? {}) });

export function ResponsiveContainer({ width = '100%', height = 240, children, className }) {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: typeof height === 'number' ? height : 0 });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setSize((prev) => {
        const nextHeight = typeof height === 'number' ? height : entry.contentRect.height || prev.height;
        return { width: entry.contentRect.width, height: nextHeight };
      });
    });

    observer.observe(element);
    setSize({
      width: element.clientWidth,
      height: typeof height === 'number' ? height : element.clientHeight || size.height,
    });

    return () => observer.disconnect();
  }, [height]);

  const resolvedHeight = typeof height === 'number' ? height : Math.max(size.height, 120);

  const content = useMemo(() => {
    if (typeof children === 'function') {
      return children(size.width, resolvedHeight);
    }
    if (!isValidElement(children)) return null;
    return cloneElement(children, { width: size.width, height: resolvedHeight });
  }, [children, size.width, resolvedHeight]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: width === '100%' ? '100%' : width, height: resolvedHeight }}
    >
      {content}
    </div>
  );
}

function useChartChildren(children, predicates) {
  const array = Children.toArray(children);
  return predicates.map((predicate) => array.filter(predicate));
}

function resolveCells(children) {
  return Children.toArray(children)
    .filter((child) => isValidElement(child) && child.type?.displayName === 'RechartsCell')
    .map((child) => child.props);
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value ?? 0);
}

export function LineChart({ data = [], width = 400, height = 240, margin, children }) {
  const [{ length }] = useState({ length: data.length });
  const [lineChildren, xAxisChildren, yAxisChildren, gridChildren, legendChildren, tooltipChildren] = useChartChildren(
    children,
    [
      (child) => child.type?.displayName === 'RechartsLine',
      (child) => child.type?.displayName === 'RechartsXAxis',
      (child) => child.type?.displayName === 'RechartsYAxis',
      (child) => child.type?.displayName === 'RechartsCartesianGrid',
      (child) => child.type?.displayName === 'RechartsLegend',
      (child) => child.type?.displayName === 'RechartsTooltip',
    ],
  );

  const line = lineChildren[0]?.props ?? {};
  const xAxis = xAxisChildren[0]?.props ?? {};
  const yAxis = yAxisChildren[0]?.props ?? {};
  const cells = resolveCells(lineChildren[0]?.props?.children);
  const showGrid = gridChildren.length > 0;
  const showLegend = legendChildren.length > 0;
  const showTooltip = tooltipChildren.length > 0;

  const xKey = xAxis.dataKey ?? 'name';
  const yKey = line.dataKey ?? 'value';

  const values = data.map((entry) => Number(entry?.[yKey] ?? 0));
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);
  const range = maxValue - minValue || 1;

  const margins = getMargin(margin);
  const innerWidth = Math.max(width - margins.left - margins.right, 10);
  const innerHeight = Math.max(height - margins.top - margins.bottom, 10);

  const ticks = Array.from({ length: 4 }, (_, index) => {
    const ratio = index / 3;
    return {
      value: minValue + range * (1 - ratio),
      y: margins.top + innerHeight * ratio,
    };
  });

  const points = data.map((entry, index) => {
    const ratio = length > 1 ? index / (length - 1) : 0;
    const value = Number(entry?.[yKey] ?? 0);
    const yRatio = (value - minValue) / range;
    return {
      x: margins.left + innerWidth * ratio,
      y: margins.top + innerHeight * (1 - yRatio),
      value,
      label: entry?.[xKey],
      color: cells[index]?.fill ?? line.stroke ?? 'var(--theme-primary-color, #6366f1)',
    };
  });

  const path = points
    .map((point, idx) => `${idx === 0 ? 'M' : 'L'}${point.x.toFixed(2)},${point.y.toFixed(2)}`)
    .join(' ');

  const areaPath = `${points.length ? `M${margins.left},${margins.top + innerHeight} ` : ''}${points
    .map((point) => `L${point.x.toFixed(2)},${point.y.toFixed(2)}`)
    .join(' ')}${points.length ? ` L${margins.left + innerWidth},${margins.top + innerHeight} Z` : ''}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Line chart">
      <rect width="100%" height="100%" fill="none" />
      {showGrid &&
        ticks.map((tick) => (
          <line
            key={`grid-${tick.y}`}
            x1={margins.left}
            x2={margins.left + innerWidth}
            y1={tick.y}
            y2={tick.y}
            stroke="rgba(148, 163, 184, 0.25)"
            strokeDasharray="4 4"
          />
        ))}

      <line
        x1={margins.left}
        x2={margins.left}
        y1={margins.top}
        y2={margins.top + innerHeight}
        stroke="rgba(148, 163, 184, 0.4)"
      />
      <line
        x1={margins.left}
        x2={margins.left + innerWidth}
        y1={margins.top + innerHeight}
        y2={margins.top + innerHeight}
        stroke="rgba(148, 163, 184, 0.4)"
      />

      <path d={areaPath} fill={line.fill ?? 'rgba(99, 102, 241, 0.12)'} />
      <path d={path} fill="none" stroke={line.stroke ?? 'var(--theme-primary-color, #6366f1)'} strokeWidth={line.strokeWidth ?? 3} />

      {points.map((point, index) => (
        <g key={`point-${index}`}>
          <circle cx={point.x} cy={point.y} r={line.dot?.r ?? 4} fill={point.color} />
          {showTooltip && (
            <title>{`${point.label ?? index + 1}: ${formatNumber(point.value)}`}</title>
          )}
        </g>
      ))}

      {ticks.map((tick, index) => (
        <text key={`y-label-${index}`} x={margins.left - 8} y={tick.y + 4} fontSize="11" textAnchor="end" fill="currentColor">
          {formatNumber(tick.value)}
        </text>
      ))}

      {points.map((point, index) => (
        <text
          key={`x-label-${index}`}
          x={point.x}
          y={margins.top + innerHeight + 20}
          fontSize="11"
          textAnchor="middle"
          fill="currentColor"
        >
          {point.label}
        </text>
      ))}

      {showLegend && (
        <g transform={`translate(${margins.left}, ${margins.top - 8})`}>
          <rect width="12" height="12" rx="2" fill={line.stroke ?? 'var(--theme-primary-color, #6366f1)'} />
          <text x="18" y="10" fontSize="12" fill="currentColor">
            {legendChildren[0]?.props?.payload?.[0]?.value ?? line.name ?? yAxis.label ?? 'Series'}
          </text>
        </g>
      )}
    </svg>
  );
}

export function CartesianGrid() {
  return null;
}
CartesianGrid.displayName = 'RechartsCartesianGrid';

export function XAxis() {
  return null;
}
XAxis.displayName = 'RechartsXAxis';

export function YAxis() {
  return null;
}
YAxis.displayName = 'RechartsYAxis';

export function Tooltip() {
  return null;
}
Tooltip.displayName = 'RechartsTooltip';

export function Legend(props) {
  return <g {...props} />;
}
Legend.displayName = 'RechartsLegend';

export function Line() {
  return null;
}
Line.displayName = 'RechartsLine';

export function BarChart({ data = [], width = 400, height = 240, margin, children }) {
  const [barChildren, xAxisChildren, yAxisChildren, gridChildren, tooltipChildren, legendChildren] = useChartChildren(
    children,
    [
      (child) => child.type?.displayName === 'RechartsBar',
      (child) => child.type?.displayName === 'RechartsXAxis',
      (child) => child.type?.displayName === 'RechartsYAxis',
      (child) => child.type?.displayName === 'RechartsCartesianGrid',
      (child) => child.type?.displayName === 'RechartsTooltip',
      (child) => child.type?.displayName === 'RechartsLegend',
    ],
  );

  const bar = barChildren[0]?.props ?? {};
  const xAxis = xAxisChildren[0]?.props ?? {};
  const showGrid = gridChildren.length > 0;
  const showTooltip = tooltipChildren.length > 0;
  const showLegend = legendChildren.length > 0;
  const cells = resolveCells(bar.children);

  const dataKey = bar.dataKey ?? 'value';
  const xKey = xAxis.dataKey ?? 'name';

  const values = data.map((entry) => Number(entry?.[dataKey] ?? 0));
  const maxValue = Math.max(...values, 1);

  const margins = getMargin(margin);
  const innerWidth = Math.max(width - margins.left - margins.right, 10);
  const innerHeight = Math.max(height - margins.top - margins.bottom, 10);

  const barWidth = innerWidth / Math.max(data.length, 1) - 16;

  const ticks = Array.from({ length: 4 }, (_, index) => {
    const ratio = index / 3;
    return {
      value: maxValue * (1 - ratio),
      y: margins.top + innerHeight * ratio,
    };
  });

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Bar chart">
      <rect width="100%" height="100%" fill="none" />
      {showGrid &&
        ticks.map((tick) => (
          <line
            key={`grid-${tick.y}`}
            x1={margins.left}
            x2={margins.left + innerWidth}
            y1={tick.y}
            y2={tick.y}
            stroke="rgba(148, 163, 184, 0.25)"
            strokeDasharray="4 4"
          />
        ))}

      <line
        x1={margins.left}
        x2={margins.left}
        y1={margins.top}
        y2={margins.top + innerHeight}
        stroke="rgba(148, 163, 184, 0.4)"
      />
      <line
        x1={margins.left}
        x2={margins.left + innerWidth}
        y1={margins.top + innerHeight}
        y2={margins.top + innerHeight}
        stroke="rgba(148, 163, 184, 0.4)"
      />

      {data.map((entry, index) => {
        const value = Number(entry?.[dataKey] ?? 0);
        const ratio = maxValue === 0 ? 0 : value / maxValue;
        const barHeight = innerHeight * ratio;
        const x = margins.left + index * (innerWidth / Math.max(data.length, 1)) + 8;
        const y = margins.top + innerHeight - barHeight;
        const fill = cells[index]?.fill ?? bar.fill ?? 'var(--theme-primary-color, #6366f1)';
        const radius = bar.radius ?? 6;
        return (
          <g key={`bar-${index}`}>
            <rect x={x} y={y} width={Math.max(barWidth, 8)} height={barHeight} fill={fill} rx={radius} />
            {showTooltip && <title>{`${entry?.[xKey]}: ${formatNumber(value)}`}</title>}
            <text x={x + Math.max(barWidth, 8) / 2} y={margins.top + innerHeight + 20} fontSize="11" textAnchor="middle" fill="currentColor">
              {entry?.[xKey]}
            </text>
          </g>
        );
      })}

      {ticks.map((tick, index) => (
        <text key={`y-label-${index}`} x={margins.left - 8} y={tick.y + 4} fontSize="11" textAnchor="end" fill="currentColor">
          {formatNumber(tick.value)}
        </text>
      ))}

      {showLegend && (
        <g transform={`translate(${margins.left}, ${margins.top - 8})`}>
          <rect width="12" height="12" rx="2" fill={bar.fill ?? 'var(--theme-primary-color, #6366f1)'} />
          <text x="18" y="10" fontSize="12" fill="currentColor">
            {legendChildren[0]?.props?.payload?.[0]?.value ?? bar.name ?? 'Series'}
          </text>
        </g>
      )}
    </svg>
  );
}

export function Bar({ children }) {
  return children ?? null;
}
Bar.displayName = 'RechartsBar';

export function Cell() {
  return null;
}
Cell.displayName = 'RechartsCell';

export function PieChart({ width = 400, height = 240, children }) {
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Pie chart">
      <rect width="100%" height="100%" fill="none" />
      {Children.map(children, (child) =>
        isValidElement(child) ? cloneElement(child, { cx: width / 2, cy: height / 2 }) : null,
      )}
    </svg>
  );
}
PieChart.displayName = 'RechartsPieChart';

export function Pie({ data = [], dataKey = 'value', nameKey = 'name', cx = 200, cy = 120, innerRadius = 40, outerRadius = 80, paddingAngle = 0, children }) {
  const cells = resolveCells(children);
  const total = data.reduce((sum, entry) => sum + Number(entry?.[dataKey] ?? 0), 0) || 1;
  const entries = data.map((entry, index) => ({
    value: Number(entry?.[dataKey] ?? 0),
    name: entry?.[nameKey] ?? `Slice ${index + 1}`,
    fill: cells[index]?.fill ?? entry.fill ?? `var(--theme-secondary-color, #14b8a6)`,
  }));

  let currentAngle = -90;
  const center = { x: cx, y: cy };

  return (
    <g>
      {entries.map((entry, index) => {
        const angle = (entry.value / total) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        currentAngle = endAngle + paddingAngle;

        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        const x1 = center.x + outerRadius * Math.cos(startRad);
        const y1 = center.y + outerRadius * Math.sin(startRad);
        const x2 = center.x + outerRadius * Math.cos(endRad);
        const y2 = center.y + outerRadius * Math.sin(endRad);

        const largeArcFlag = angle > 180 ? 1 : 0;

        const pathData = [
          `M ${center.x + innerRadius * Math.cos(startRad)} ${center.y + innerRadius * Math.sin(startRad)}`,
          `L ${x1} ${y1}`,
          `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
          `L ${center.x + innerRadius * Math.cos(endRad)} ${center.y + innerRadius * Math.sin(endRad)}`,
          `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${center.x + innerRadius * Math.cos(startRad)} ${center.y + innerRadius * Math.sin(startRad)}`,
          'Z',
        ].join(' ');

        const midAngle = ((startAngle + endAngle) / 2) * (Math.PI / 180);
        const labelRadius = outerRadius + 16;
        const labelX = center.x + labelRadius * Math.cos(midAngle);
        const labelY = center.y + labelRadius * Math.sin(midAngle);

        return (
          <g key={`slice-${index}`}>
            <path d={pathData} fill={entry.fill} stroke="white" strokeWidth="1" />
            <text x={labelX} y={labelY} fontSize="11" textAnchor={labelX >= center.x ? 'start' : 'end'} fill="currentColor">
              {`${entry.name} (${total ? Math.round((entry.value / total) * 100) : 0}%)`}
            </text>
            <title>{`${entry.name}: ${formatNumber(entry.value)}`}</title>
          </g>
        );
      })}
    </g>
  );
}
Pie.displayName = 'RechartsPie';

export default {
  ResponsiveContainer,
  LineChart,
  BarChart,
  PieChart,
  Line,
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
};
