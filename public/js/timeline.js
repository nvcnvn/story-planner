document.addEventListener('DOMContentLoaded', () => {
    const events = JSON.parse(document.getElementById('events-data').textContent);

    const width = document.getElementById('timeline-container').clientWidth;
    const height = document.getElementById('timeline-container').clientHeight;

    const svg = d3.select('#timeline')
        .attr('width', width)
        .attr('height', height);

    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleTime()
        .domain([
            new Date(events[0].timestamp),
            new Date(events[events.length - 1].timestamp)
        ])
        .range([margin.left, innerWidth]);

    const padding = 1000 * 60 * 60; // 1 hour padding in milliseconds
    xScale.domain([
        new Date(new Date(events[0].timestamp).getTime() - padding),
        new Date(new Date(events[events.length - 1].timestamp).getTime() + padding)
    ]);

    const zoom = d3.zoom()
        .scaleExtent([1, 10])
        .translateExtent([[-50, -50], [innerWidth + 50, innerHeight + 50]])
        .on('zoom', (event) => {
            svg.selectAll('g').attr('transform', event.transform);
        });

    svg.call(zoom);

    const timelineGroup = svg.append('g');

    const shapes = ['circle', 'rect', 'path'];
    const colors = ['blue', 'green', 'red'];

    timelineGroup.selectAll('circle')
        .data(events)
        .enter()
        .each(function(d, i) {
            const shape = shapes[i % shapes.length];
            const color = colors[i % colors.length];

            if (shape === 'circle') {
                d3.select(this)
                    .append('circle')
                    .attr('cx', xScale(new Date(d.timestamp)))
                    .attr('cy', innerHeight / 2)
                    .attr('r', 5)
                    .attr('fill', color)
                    .append('title')
                    .text(d.description);
            } else if (shape === 'rect') {
                d3.select(this)
                    .append('rect')
                    .attr('x', xScale(new Date(d.timestamp)) - 5)
                    .attr('y', innerHeight / 2 - 5)
                    .attr('width', 10)
                    .attr('height', 10)
                    .attr('fill', color)
                    .append('title')
                    .text(d.description);
            } else if (shape === 'path') {
                d3.select(this)
                    .append('path')
                    .attr('d', `M${xScale(new Date(d.timestamp))},${innerHeight / 2 - 5} l5,10 l-10,0 Z`)
                    .attr('fill', color)
                    .append('title')
                    .text(d.description);
            }
        });

    timelineGroup.selectAll('text')
        .data(events)
        .enter()
        .append('text')
        .attr('x', (d, i) => xScale(new Date(d.timestamp)) + (i % 2 === 0 ? -5 : 5)) // Adjust alignment based on position
        .attr('y', (d, i) => innerHeight / 2 + (i % 2 === 0 ? -30 : 30)) // Move text farther from icons
        .attr('text-anchor', (d, i) => i % 2 === 0 ? 'end' : 'start') // Align text end or start
        .attr('transform', (d, i) => `rotate(45, ${xScale(new Date(d.timestamp))}, ${innerHeight / 2 + (i % 2 === 0 ? -30 : 30)})`) // Tilt text at 45 degrees in the same direction
        .attr('fill', (d, i) => colors[i % colors.length]) // Match text color to shape color
        .text(d => d.id); // Display only the event ID or title

    // Add tooltip for event details
    const tooltip = d3.select('body').append('div')
        .style('position', 'absolute')
        .style('background', '#fff')
        .style('border', '1px solid #ccc')
        .style('padding', '10px')
        .style('border-radius', '5px')
        .style('box-shadow', '0 2px 5px rgba(0,0,0,0.1)')
        .style('visibility', 'hidden');

    timelineGroup.selectAll('circle')
        .on('mouseover', (event, d) => {
            tooltip.style('visibility', 'visible')
                .text(d.description);
        })
        .on('mousemove', (event) => {
            tooltip.style('top', `${event.pageY + 10}px`)
                .style('left', `${event.pageX + 10}px`);
        })
        .on('mouseout', () => {
            tooltip.style('visibility', 'hidden');
        });
});
