import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { DailyThroughputPoint } from '../data/complianceData';

interface ComplianceD3LineChartProps {
  data: DailyThroughputPoint[];
  timeWindow: 7 | 14 | 30;
  selectedPoint?: DailyThroughputPoint | null;
  onTimeWindowChange?: (days: 7 | 14 | 30) => void;
  onSelectPoint?: (point: DailyThroughputPoint) => void;
}

export const ComplianceD3LineChart: React.FC<ComplianceD3LineChartProps> = ({
  data,
  timeWindow,
  selectedPoint,
  onTimeWindowChange,
  onSelectPoint,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [hoveredPoint, setHoveredPoint] = useState<DailyThroughputPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const [chartMode, setChartMode] = useState<'dual' | 'rate'>('dual');
  const [showThroughput, setShowThroughput] = useState(true);
  const [showFlagged, setShowFlagged] = useState(true);
  const [showAreaFill, setShowAreaFill] = useState(true);

  // Filter data according to selected time window
  const filteredData = useMemo(() => {
    return data.slice(-timeWindow);
  }, [data, timeWindow]);

  useEffect(() => {
    if (!containerRef.current || typeof ResizeObserver === 'undefined') return;

    let resizeFrame = 0;
    const observer = new ResizeObserver(([entry]) => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        setContainerWidth(Math.round(entry.contentRect.width));
      });
    });

    observer.observe(containerRef.current);
    return () => {
      cancelAnimationFrame(resizeFrame);
      observer.disconnect();
    };
  }, []);

  // Aggregate stats for the current view
  const stats = useMemo(() => {
    const total = filteredData.reduce((acc, curr) => acc + curr.totalThroughput, 0);
    const approved = filteredData.reduce((acc, curr) => acc + curr.approvedClean, 0);
    const flagged = filteredData.reduce((acc, curr) => acc + curr.flaggedCount, 0);
    const avgThroughput = Math.round(total / (filteredData.length || 1));
    const avgFlagRate = total > 0 ? ((flagged / total) * 100).toFixed(2) : '0.00';
    const peakDay = filteredData.reduce<DailyThroughputPoint | null>(
      (max, curr) => (!max || curr.totalThroughput > max.totalThroughput ? curr : max),
      null
    );
    const peakFlagDay = filteredData.reduce<DailyThroughputPoint | null>(
      (max, curr) => (!max || curr.flaggedCount > max.flaggedCount ? curr : max),
      null
    );

    return { total, approved, flagged, avgThroughput, avgFlagRate, peakDay, peakFlagDay };
  }, [filteredData]);

  // D3 Chart Drawing with ResizeObserver
  useEffect(() => {
    if (!containerRef.current || !svgRef.current || filteredData.length === 0) return;

    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll('*').remove(); // Clear previous rendering

    const rect = containerRef.current.getBoundingClientRect();
    const width = Math.max(rect.width, 320);
    const height = Math.max(rect.height || 360, 320);

    const margin = { top: 35, right: chartMode === 'dual' ? 65 : 45, bottom: 45, left: 65 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    if (innerWidth <= 0 || innerHeight <= 0) return;

    // SVG container setup
    const svg = svgElement
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('style', 'overflow: visible;');

    // Defs for gradients and filters
    const defs = svg.append('defs');

    // Glow filter for throughput
    const filterThroughput = defs.append('filter')
      .attr('id', 'glow-throughput')
      .attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
    filterThroughput.append('feDropShadow')
      .attr('dx', '0').attr('dy', '3').attr('stdDeviation', '3')
      .attr('flood-color', '#0284c7').attr('flood-opacity', '0.4');

    // Glow filter for flagged
    const filterFlagged = defs.append('filter')
      .attr('id', 'glow-flagged')
      .attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
    filterFlagged.append('feDropShadow')
      .attr('dx', '0').attr('dy', '3').attr('stdDeviation', '3')
      .attr('flood-color', '#f43f5e').attr('flood-opacity', '0.4');

    // Gradient for Total Throughput Area
    const throughputGradient = defs
      .append('linearGradient')
      .attr('id', 'throughput-area-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    throughputGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#0284c7')
      .attr('stop-opacity', 0.28);

    throughputGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#0284c7')
      .attr('stop-opacity', 0.01);

    // Gradient for Flagged Area
    const flaggedGradient = defs
      .append('linearGradient')
      .attr('id', 'flagged-area-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    flaggedGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#f43f5e')
      .attr('stop-opacity', 0.35);

    flaggedGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#f43f5e')
      .attr('stop-opacity', 0.02);

    // Gradient for Rate Curve Area
    const rateGradient = defs
      .append('linearGradient')
      .attr('id', 'rate-area-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    rateGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#e11d48')
      .attr('stop-opacity', 0.32);

    rateGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#0284c7')
      .attr('stop-opacity', 0.02);

    // Main Chart Group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // X Scale (Dates)
    const dates = filteredData.map((d) => new Date(d.date));
    const minDate = dates.length > 0 ? new Date(Math.min(...dates.map((d) => d.getTime()))) : new Date();
    const maxDate = dates.length > 0 ? new Date(Math.max(...dates.map((d) => d.getTime()))) : new Date();
    const xScale = d3.scaleTime().domain([minDate, maxDate]).range([0, innerWidth]);

    if (chartMode === 'dual') {
      // Dual-Axis Mode: Left Volume (Throughput), Right Count (Flags)
      const maxThroughputVal = filteredData.length > 0
        ? Math.max(...filteredData.map((d) => d.totalThroughput))
        : 3000;
      const yScaleThroughput = d3
        .scaleLinear()
        .domain([0, Math.ceil(maxThroughputVal * 1.15)])
        .range([innerHeight, 0])
        .nice();

      const maxFlaggedVal = filteredData.length > 0
        ? Math.max(...filteredData.map((d) => d.flaggedCount))
        : 150;
      const yScaleFlagged = d3
        .scaleLinear()
        .domain([0, Math.ceil(maxFlaggedVal * 1.25)])
        .range([innerHeight, 0])
        .nice();

      // Subtle horizontal gridlines based on Throughput scale
      const yGrid = d3
        .axisLeft(yScaleThroughput)
        .tickSize(-innerWidth)
        .tickFormat(() => '')
        .ticks(5);

      g.append('g')
        .attr('class', 'grid-lines')
        .call(yGrid)
        .selectAll('line')
        .attr('stroke', '#f1f5f9')
        .attr('stroke-dasharray', '3,3');

      g.select('.grid-lines').select('.domain').remove();

      // Line and Area Generators
      const throughputLine = d3
        .line<DailyThroughputPoint>()
        .x((d) => xScale(new Date(d.date)))
        .y((d) => yScaleThroughput(d.totalThroughput))
        .curve(d3.curveMonotoneX);

      const throughputArea = d3
        .area<DailyThroughputPoint>()
        .x((d) => xScale(new Date(d.date)))
        .y0(innerHeight)
        .y1((d) => yScaleThroughput(d.totalThroughput))
        .curve(d3.curveMonotoneX);

      const flaggedLine = d3
        .line<DailyThroughputPoint>()
        .x((d) => xScale(new Date(d.date)))
        .y((d) => yScaleFlagged(d.flaggedCount))
        .curve(d3.curveMonotoneX);

      const flaggedArea = d3
        .area<DailyThroughputPoint>()
        .x((d) => xScale(new Date(d.date)))
        .y0(innerHeight)
        .y1((d) => yScaleFlagged(d.flaggedCount))
        .curve(d3.curveMonotoneX);

      // Render Throughput Area & Line
      if (showThroughput) {
        if (showAreaFill) {
          g.append('path')
            .datum(filteredData)
            .attr('class', 'throughput-area')
            .attr('d', throughputArea)
            .attr('fill', 'url(#throughput-area-grad)');
        }

        g.append('path')
          .datum(filteredData)
          .attr('class', 'throughput-line')
          .attr('d', throughputLine)
          .attr('fill', 'none')
          .attr('stroke', '#0284c7')
          .attr('stroke-width', 2.75)
          .attr('filter', 'url(#glow-throughput)')
          .attr('stroke-linecap', 'round');
      }

      // Render Flagged Area & Line
      if (showFlagged) {
        if (showAreaFill) {
          g.append('path')
            .datum(filteredData)
            .attr('class', 'flagged-area')
            .attr('d', flaggedArea)
            .attr('fill', 'url(#flagged-area-grad)');
        }

        g.append('path')
          .datum(filteredData)
          .attr('class', 'flagged-line')
          .attr('d', flaggedLine)
          .attr('fill', 'none')
          .attr('stroke', '#f43f5e')
          .attr('stroke-width', 2.5)
          .attr('filter', 'url(#glow-flagged)')
          .attr('stroke-linecap', 'round');

        // Add small circle markers for flagged anomaly points
        g.selectAll<SVGCircleElement, DailyThroughputPoint>('.flagged-dot')
          .data(filteredData)
          .enter()
          .append('circle')
          .attr('class', 'flagged-dot')
          .attr('cx', (d: DailyThroughputPoint) => xScale(new Date(d.date)))
          .attr('cy', (d: DailyThroughputPoint) => yScaleFlagged(d.flaggedCount))
          .attr('r', 3)
          .attr('fill', '#f43f5e')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 1.5);
      }

      // Peak Flag Pin Callout Marker
      if (stats.peakFlagDay && stats.peakFlagDay.flaggedCount > 0 && showFlagged) {
        const peakX = xScale(new Date(stats.peakFlagDay.date));
        const peakY = yScaleFlagged(stats.peakFlagDay.flaggedCount);

        const peakGroup = g.append('g').attr('class', 'peak-marker');
        // Vertical dashed stem
        peakGroup.append('line')
          .attr('x1', peakX).attr('y1', peakY)
          .attr('x2', peakX).attr('y2', Math.max(0, peakY - 24))
          .attr('stroke', '#f43f5e').attr('stroke-width', 1.25)
          .attr('stroke-dasharray', '2,2');

        // Floating pill container
        const pill = peakGroup.append('g')
          .attr('transform', `translate(${peakX}, ${Math.max(14, peakY - 26)})`);
        pill.append('rect')
          .attr('x', -46).attr('y', -11).attr('width', 92).attr('height', 20)
          .attr('rx', 6).attr('fill', '#881337')
          .attr('stroke', '#f43f5e').attr('stroke-width', 1);
        pill.append('text')
          .attr('text-anchor', 'middle').attr('dy', '3')
          .attr('fill', '#ffffff').attr('font-size', '9px').attr('font-weight', '700')
          .text(`Peak: ${stats.peakFlagDay.flaggedCount} Flags`);
      }

      // Highlight currently selectedPoint if set
      if (selectedPoint) {
        const found = filteredData.find((d) => d.date === selectedPoint.date);
        if (found) {
          const selX = xScale(new Date(found.date));
          const selY = yScaleThroughput(found.totalThroughput);

          const selGroup = g.append('g').attr('class', 'selected-point-indicator');
          // Pulse halo ring
          selGroup.append('circle')
            .attr('cx', selX).attr('cy', selY)
            .attr('r', 11).attr('fill', 'rgba(2, 132, 199, 0.25)')
            .attr('stroke', '#0284c7').attr('stroke-width', 2)
            .attr('stroke-dasharray', '3,2');
          selGroup.append('circle')
            .attr('cx', selX).attr('cy', selY)
            .attr('r', 4.5).attr('fill', '#ffffff')
            .attr('stroke', '#0284c7').attr('stroke-width', 2);
        }
      }

      // Left Y-Axis: Daily Verification Throughput
      const yAxisLeft = d3
        .axisLeft(yScaleThroughput)
        .ticks(5)
        .tickFormat((d) => d3.format(',')(d));

      const yAxisLeftGroup = g
        .append('g')
        .attr('class', 'y-axis-left')
        .call(yAxisLeft);

      yAxisLeftGroup.select('.domain').attr('stroke', '#cbd5e1');
      yAxisLeftGroup.selectAll('.tick line').attr('stroke', '#e2e8f0');
      yAxisLeftGroup
        .selectAll('.tick text')
        .attr('fill', '#0369a1')
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .attr('font-family', 'monospace');

      // Left Y-Axis Label
      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -48)
        .attr('x', -innerHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#0284c7')
        .attr('font-size', '11px')
        .attr('font-weight', '700')
        .text('Daily Throughput (Rx)');

      // Right Y-Axis: Flagged Prescriptions
      const yAxisRight = d3.axisRight(yScaleFlagged).ticks(5);

      const yAxisRightGroup = g
        .append('g')
        .attr('class', 'y-axis-right')
        .attr('transform', `translate(${innerWidth}, 0)`)
        .call(yAxisRight);

      yAxisRightGroup.select('.domain').attr('stroke', '#cbd5e1');
      yAxisRightGroup.selectAll('.tick line').attr('stroke', '#e2e8f0');
      yAxisRightGroup
        .selectAll('.tick text')
        .attr('fill', '#e11d48')
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .attr('font-family', 'monospace');

      // Right Y-Axis Label
      g.append('text')
        .attr('transform', 'rotate(90)')
        .attr('y', -innerWidth - 48)
        .attr('x', innerHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#f43f5e')
        .attr('font-size', '11px')
        .attr('font-weight', '700')
        .text('Flagged Anomalies (Rx)');

    } else {
      // Anomaly Rate % Risk Curve Mode
      const maxRateVal = Math.max(6, Math.ceil(Math.max(...filteredData.map((d) => d.flaggedRatePercent)) * 1.25));
      const yScaleRate = d3
        .scaleLinear()
        .domain([0, maxRateVal])
        .range([innerHeight, 0])
        .nice();

      // Shaded Regulatory Zones
      // Safe Green Zone: 0% to 4%
      const y4 = yScaleRate(Math.min(4, maxRateVal));
      const y0 = yScaleRate(0);
      g.append('rect')
        .attr('x', 0).attr('y', y4)
        .attr('width', innerWidth).attr('height', Math.max(0, y0 - y4))
        .attr('fill', '#f0fdf4').attr('opacity', 0.85);

      // Warning Amber Zone: 4% to 5%
      const y5 = yScaleRate(Math.min(5, maxRateVal));
      if (maxRateVal >= 4) {
        g.append('rect')
          .attr('x', 0).attr('y', y5)
          .attr('width', innerWidth).attr('height', Math.max(0, y4 - y5))
          .attr('fill', '#fffbeb').attr('opacity', 0.85);
      }

      // Critical Red Zone: > 5%
      if (maxRateVal >= 5) {
        g.append('rect')
          .attr('x', 0).attr('y', 0)
          .attr('width', innerWidth).attr('height', Math.max(0, y5))
          .attr('fill', '#fff1f2').attr('opacity', 0.85);
      }

      // Zone text labels
      g.append('text')
        .attr('x', innerWidth - 8).attr('y', yScaleRate(2))
        .attr('text-anchor', 'end').attr('fill', '#15803d').attr('font-size', '10px').attr('font-weight', '600')
        .text('Nominal Pass Band (<4%)');

      if (maxRateVal >= 4.5) {
        g.append('text')
          .attr('x', innerWidth - 8).attr('y', yScaleRate(4.5))
          .attr('text-anchor', 'end').attr('fill', '#b45309').attr('font-size', '10px').attr('font-weight', '600')
          .text('Elevated Surveillance (4-5%)');
      }

      if (maxRateVal >= 5.5) {
        g.append('text')
          .attr('x', innerWidth - 8).attr('y', yScaleRate(Math.min(maxRateVal - 0.4, 5.8)))
          .attr('text-anchor', 'end').attr('fill', '#be123c').attr('font-size', '10px').attr('font-weight', '700')
          .text('Statutory Breach Threshold (>5%)');
      }

      // Horizontal grid
      const yGrid = d3
        .axisLeft(yScaleRate)
        .tickSize(-innerWidth)
        .tickFormat(() => '')
        .ticks(5);

      g.append('g')
        .attr('class', 'grid-lines')
        .call(yGrid)
        .selectAll('line')
        .attr('stroke', '#e2e8f0')
        .attr('stroke-dasharray', '2,2');
      g.select('.grid-lines').select('.domain').remove();

      // Rate Area & Line
      const rateArea = d3
        .area<DailyThroughputPoint>()
        .x((d) => xScale(new Date(d.date)))
        .y0(innerHeight)
        .y1((d) => yScaleRate(d.flaggedRatePercent))
        .curve(d3.curveMonotoneX);

      const rateLine = d3
        .line<DailyThroughputPoint>()
        .x((d) => xScale(new Date(d.date)))
        .y((d) => yScaleRate(d.flaggedRatePercent))
        .curve(d3.curveMonotoneX);

      if (showAreaFill) {
        g.append('path')
          .datum(filteredData)
          .attr('d', rateArea)
          .attr('fill', 'url(#rate-area-grad)');
      }

      g.append('path')
        .datum(filteredData)
        .attr('d', rateLine)
        .attr('fill', 'none')
        .attr('stroke', '#e11d48')
        .attr('stroke-width', 2.75)
        .attr('filter', 'url(#glow-flagged)')
        .attr('stroke-linecap', 'round');

      // Add circle points on rate curve
      g.selectAll<SVGCircleElement, DailyThroughputPoint>('.rate-dot')
        .data(filteredData)
        .enter()
        .append('circle')
        .attr('class', 'rate-dot')
        .attr('cx', (d: DailyThroughputPoint) => xScale(new Date(d.date)))
        .attr('cy', (d: DailyThroughputPoint) => yScaleRate(d.flaggedRatePercent))
        .attr('r', 3.5)
        .attr('fill', (d: DailyThroughputPoint) => d.flaggedRatePercent >= 5 ? '#e11d48' : d.flaggedRatePercent >= 4 ? '#f59e0b' : '#0284c7')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1.5);

      // Y-Axis Rate
      const yAxisRate = d3
        .axisLeft(yScaleRate)
        .ticks(6)
        .tickFormat((d) => `${d}%`);

      const yAxisRateGroup = g
        .append('g')
        .attr('class', 'y-axis-rate')
        .call(yAxisRate);

      yAxisRateGroup.select('.domain').attr('stroke', '#cbd5e1');
      yAxisRateGroup.selectAll('.tick line').attr('stroke', '#e2e8f0');
      yAxisRateGroup
        .selectAll('.tick text')
        .attr('fill', '#991b1b')
        .attr('font-size', '11px')
        .attr('font-weight', '700')
        .attr('font-family', 'monospace');

      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -48)
        .attr('x', -innerHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#991b1b')
        .attr('font-size', '11px')
        .attr('font-weight', '700')
        .text('Anomaly Interception Rate (%)');
    }

    // X-Axis (Dates)
    const tickCount = Math.min(filteredData.length, width < 600 ? 5 : 8);
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(tickCount)
      .tickFormat((d) => d3.timeFormat('%b %d')(d as Date));

    const xAxisGroup = g
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis);

    xAxisGroup.select('.domain').attr('stroke', '#cbd5e1');
    xAxisGroup.selectAll('.tick line').attr('stroke', '#cbd5e1');
    xAxisGroup
      .selectAll('.tick text')
      .attr('fill', '#64748b')
      .attr('font-size', '11px')
      .attr('font-family', 'sans-serif')
      .attr('dy', '1em');

    // Guideline & Hover Indicator Elements
    const crosshair = g
      .append('line')
      .attr('class', 'crosshair')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#64748b')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4,4')
      .style('opacity', 0)
      .style('pointer-events', 'none');

    const focusDot1 = g
      .append('circle')
      .attr('r', 6)
      .attr('fill', '#0284c7')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('opacity', 0)
      .style('pointer-events', 'none');

    const focusDot2 = g
      .append('circle')
      .attr('r', 6)
      .attr('fill', '#f43f5e')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('opacity', 0)
      .style('pointer-events', 'none');

    // Bisector for tooltip snapping
    const bisectDate = d3.bisector<DailyThroughputPoint, Date>((d) => new Date(d.date)).center;

    // Overlay to capture mouse events
    svg
      .append('rect')
      .attr('class', 'mouse-overlay')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair')
      .on('mousemove', (event: MouseEvent) => {
        const [mx] = d3.pointer(event);
        const hoveredDate = xScale.invert(mx);
        const index = bisectDate(filteredData, hoveredDate);
        const d = filteredData[index];

        if (!d) return;

        const cx = xScale(new Date(d.date));

        crosshair
          .attr('x1', cx)
          .attr('x2', cx)
          .style('opacity', 1);

        focusDot1
          .attr('cx', cx)
          .attr('cy', innerHeight * 0.4)
          .style('opacity', 1);

        focusDot2
          .attr('cx', cx)
          .attr('cy', innerHeight * 0.7)
          .style('opacity', chartMode === 'dual' ? 1 : 0);

        setHoveredPoint(d);
        setTooltipPos({
          x: margin.left + cx,
          y: margin.top + innerHeight * 0.35,
        });
      })
      .on('mouseleave', () => {
        crosshair.style('opacity', 0);
        focusDot1.style('opacity', 0);
        focusDot2.style('opacity', 0);
        setHoveredPoint(null);
        setTooltipPos(null);
      })
      .on('click', (event: MouseEvent) => {
        const [mx] = d3.pointer(event);
        const hoveredDate = xScale.invert(mx);
        const index = bisectDate(filteredData, hoveredDate);
        const d = filteredData[index];
        if (d && onSelectPoint) {
          onSelectPoint(d);
        }
      });
  }, [filteredData, chartMode, showThroughput, showFlagged, showAreaFill, selectedPoint, onSelectPoint, stats.peakFlagDay, containerWidth]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow space-y-4">
      {/* Chart Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-brand-700 text-white flex items-center justify-center font-bold shadow-xs">
              <span className="material-symbols-outlined text-lg">stacked_line_chart</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <span>Daily Verification Throughput &amp; Flagged Patterns</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
                  D3.js v7 Vector Engine
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Live surveillance comparing prescription volume vs regulatory anomaly spikes across licensed tele-pharmacists
              </p>
            </div>
          </div>
        </div>

        {/* View Controls & Time Range */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setChartMode('dual')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                chartMode === 'dual'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-xs">tune</span>
              <span>Volume &amp; Flags</span>
            </button>
            <button
              onClick={() => setChartMode('rate')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                chartMode === 'rate'
                  ? 'bg-white text-rose-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-xs">speed</span>
              <span>Anomaly Risk Rate %</span>
            </button>
          </div>

          {/* Time Window Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                onClick={() => onTimeWindowChange && onTimeWindowChange(days as 7 | 14 | 30)}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  timeWindow === days
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {days}D
              </button>
            ))}
          </div>

          {/* Series Toggles (Dual mode only) */}
          {chartMode === 'dual' && (
            <div className="flex items-center gap-1.5 text-[11px] font-semibold">
              <button
                onClick={() => setShowThroughput(!showThroughput)}
                className={`px-2 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                  showThroughput
                    ? 'bg-sky-50 text-sky-800 border-sky-300'
                    : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span>Throughput</span>
              </button>

              <button
                onClick={() => setShowFlagged(!showFlagged)}
                className={`px-2 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                  showFlagged
                    ? 'bg-rose-50 text-rose-800 border-rose-300'
                    : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Flagged Patterns</span>
              </button>
            </div>
          )}

          <button
            onClick={() => setShowAreaFill(!showAreaFill)}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              showAreaFill
                ? 'bg-slate-100 text-slate-800 border-slate-300 shadow-2xs'
                : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}
            title="Toggle area gradient shade"
          >
            <span className="material-symbols-outlined text-xs">gradient</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Highlights Strip with Connecting Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
        <div className="p-3 bg-gradient-to-b from-sky-50/70 to-white rounded-xl border border-sky-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-sky-800 tracking-wider">
              Total Throughput ({timeWindow}D)
            </span>
            <span className="material-symbols-outlined text-sm text-sky-600">show_chart</span>
          </div>
          <div className="text-base sm:text-lg font-headline font-extrabold text-sky-950 mt-1">
            {stats.total.toLocaleString()} Rx
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-0.5">
            <span>~{stats.avgThroughput.toLocaleString()}/day</span>
            <span className="text-emerald-700 font-semibold font-sans">99.2% SLA</span>
          </div>
        </div>

        <div className="p-3 bg-gradient-to-b from-emerald-50/70 to-white rounded-xl border border-emerald-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
              Approved &amp; Clean
            </span>
            <span className="material-symbols-outlined text-sm text-emerald-600">verified</span>
          </div>
          <div className="text-base sm:text-lg font-headline font-extrabold text-emerald-800 mt-1">
            {stats.approved.toLocaleString()} Rx
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
            {((stats.approved / (stats.total || 1)) * 100).toFixed(1)}% Dispense Pass
          </span>
        </div>

        <div className="p-3 bg-gradient-to-b from-rose-50/70 to-white rounded-xl border border-rose-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-rose-800 tracking-wider">
              Flagged Interceptions
            </span>
            <span className="material-symbols-outlined text-sm text-rose-600">gavel</span>
          </div>
          <div className="text-base sm:text-lg font-headline font-extrabold text-rose-700 mt-1">
            {stats.flagged.toLocaleString()} Flags
          </div>
          <span className="text-[10px] text-rose-700 font-semibold block mt-0.5">
            {stats.avgFlagRate}% Anomaly Ratio
          </span>
        </div>

        <div className="p-3 bg-gradient-to-b from-slate-50 to-white rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Peak Anomaly Spike
            </span>
            <span className="material-symbols-outlined text-sm text-rose-500">crisis_alert</span>
          </div>
          <div className="text-base sm:text-lg font-headline font-extrabold text-slate-800 mt-1 truncate">
            {stats.peakFlagDay?.flaggedCount ?? 0} Flags
          </div>
          <span className="text-[10px] text-slate-500 font-mono truncate block mt-0.5">
            {stats.peakFlagDay ? `${stats.peakFlagDay.displayDate} (${stats.peakFlagDay.primaryFlagPattern.split(' ')[0]})` : 'N/A'}
          </span>
        </div>
      </div>

      {/* D3 SVG Interactive Container */}
      <div ref={containerRef} className="relative w-full h-80 sm:h-96 select-none bg-slate-50/30 rounded-xl overflow-hidden">
        <svg ref={svgRef} className="w-full h-full block" />

        {/* Floating Custom HTML Tooltip */}
        {hoveredPoint && tooltipPos && (
          <div
            className="absolute pointer-events-none z-20 bg-slate-950/95 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 backdrop-blur-md text-xs space-y-1.5 w-68 transform -translate-x-1/2 transition-transform duration-75"
            style={{
              left: Math.min(
                Math.max(tooltipPos.x, 150),
                (containerRef.current?.clientWidth || 300) - 150
              ),
              top: Math.max(10, tooltipPos.y - 130),
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-bold text-slate-100">{hoveredPoint.fullDate}</span>
              </div>
              <span className="font-mono text-[10px] text-sky-400 bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-800">
                {hoveredPoint.telePharmacistActive} RPh on Duty
              </span>
            </div>

            <div className="space-y-1 text-[11px] pt-0.5">
              <div className="flex items-center justify-between">
                <span className="text-sky-300 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
                  <span>Total Throughput:</span>
                </span>
                <strong className="font-mono text-white text-xs">
                  {hoveredPoint.totalThroughput.toLocaleString()} Rx
                </strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-emerald-300 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  <span>Clean &amp; Approved:</span>
                </span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {hoveredPoint.approvedClean.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-rose-300 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
                  <span>Flagged Anomalies:</span>
                </span>
                <span className="font-mono text-rose-400 font-bold">
                  {hoveredPoint.flaggedCount} ({hoveredPoint.flaggedRatePercent}%)
                </span>
              </div>
            </div>

            <div className="pt-1.5 border-t border-slate-800 text-[10px] text-amber-200">
              <div className="font-semibold uppercase tracking-wider text-slate-400 text-[9px]">
                Primary Flag Pattern:
              </div>
              <div className="truncate font-medium text-amber-300">{hoveredPoint.primaryFlagPattern}</div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[9px] text-slate-400 font-mono">
              <span>Avg TAT: {hoveredPoint.avgVerificationTimeSeconds}s / Rx</span>
              <span className="text-emerald-400 font-bold">
                SLA: {hoveredPoint.complianceSlaPassRate}%
              </span>
            </div>

            <div className="pt-1 text-[9px] text-sky-300 text-center font-semibold bg-sky-950/60 rounded py-0.5 border border-sky-800/60">
              💡 Click to filter surveillance ledger to this day
            </div>
          </div>
        )}
      </div>

      {/* Chart Legend & Connection Note */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-4 flex-wrap">
          {chartMode === 'dual' ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-sky-600 rounded inline-block" />
                <span className="font-medium text-slate-700">Left Axis: Daily Throughput (Volume)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-rose-500 rounded inline-block" />
                <span className="font-medium text-slate-700">Right Axis: Flagged Anomaly Count</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Nominal Zone (&lt;4%)
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Elevated (4-5%)
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-rose-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Breach Threshold (&gt;5%)
              </span>
            </div>
          )}
        </div>

        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
          <span className="material-symbols-outlined text-xs text-sky-500">touch_app</span>
          <span>Click any day node or line coordinate to cross-filter the ledger below</span>
        </div>
      </div>
    </div>
  );
};
