/* ============================================================
   D3.js Visualizations — Creation Structure
   Dark theme, gold/steel accent palette
   ============================================================ */

// --- Diffusion S-Curves (for Diffusion page) ---
function drawDiffusionSCurves(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const width = container.clientWidth;
    const height = 420;
    const margin = { top: 30, right: 60, bottom: 50, left: 60 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const svg = d3.select(container)
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('role', 'img')
        .attr('aria-label', 'Technology diffusion S-curves: adoption rates for high, medium, low, and very low diffusion coefficients');

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleLinear().domain([0, 100]).range([0, innerW]);
    const y = d3.scaleLinear().domain([0, 1]).range([innerH, 0]);

    // Grid lines
    g.append('g')
        .attr('class', 'grid')
        .selectAll('line')
        .data(x.ticks(10))
        .enter().append('line')
        .attr('x1', d => x(d)).attr('x2', d => x(d))
        .attr('y1', 0).attr('y2', innerH)
        .attr('stroke', 'rgba(126,184,218,0.06)')
        .attr('stroke-width', 0.5);

    g.append('g')
        .attr('class', 'grid')
        .selectAll('line')
        .data(y.ticks(5))
        .enter().append('line')
        .attr('x1', 0).attr('x2', innerW)
        .attr('y1', d => y(d)).attr('y2', d => y(d))
        .attr('stroke', 'rgba(126,184,218,0.06)')
        .attr('stroke-width', 0.5);

    // Axes
    const xAxis = d3.axisBottom(x).ticks(10).tickFormat(d => d + '%');
    const yAxis = d3.axisLeft(y).ticks(5).tickFormat(d3.format('.0%'));

    g.append('g')
        .attr('transform', `translate(0,${innerH})`)
        .call(xAxis)
        .attr('color', '#6e7686')
        .selectAll('text')
        .attr('fill', '#6e7686')
        .attr('font-family', 'IBM Plex Sans')
        .attr('font-size', '11px');

    g.append('g')
        .call(yAxis)
        .attr('color', '#6e7686')
        .selectAll('text')
        .attr('fill', '#6e7686')
        .attr('font-family', 'IBM Plex Sans')
        .attr('font-size', '11px');

    // Axis labels
    g.append('text')
        .attr('x', innerW / 2)
        .attr('y', innerH + 40)
        .attr('text-anchor', 'middle')
        .attr('fill', '#6e7686')
        .attr('font-family', 'IBM Plex Sans')
        .attr('font-size', '11px')
        .text('Time / Cumulative Adoption');

    g.append('text')
        .attr('x', -innerH / 2)
        .attr('y', -45)
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('fill', '#6e7686')
        .attr('font-family', 'IBM Plex Sans')
        .attr('font-size', '11px')
        .text('Adoption Rate');

    // S-curve function (sigmoid)
    function sigmoid(t, D, offset) {
        return 1 / (1 + Math.exp(-D * (t - offset) / 10));
    }

    // Multiple S-curves with different diffusion coefficients (D)
    const curves = [
        { D: 0.8, offset: 45, label: 'High D (0.8)', color: '#c9a84c', dash: '' },
        { D: 0.5, offset: 50, label: 'Medium D (0.5)', color: '#7eb8da', dash: '' },
        { D: 0.3, offset: 55, label: 'Low D (0.3)', color: '#a0d0ec', dash: '6,3' },
        { D: 0.15, offset: 60, label: 'Very Low D (0.15)', color: '#5a6a7a', dash: '3,3' },
    ];

    const line = d3.line()
        .x(d => x(d.t))
        .y(d => y(d.v))
        .curve(d3.curveCardinal);

    curves.forEach(curve => {
        const points = [];
        for (let t = 0; t <= 100; t += 0.5) {
            points.push({ t, v: sigmoid(t, curve.D, curve.offset) });
        }

        g.append('path')
            .datum(points)
            .attr('d', line)
            .attr('fill', 'none')
            .attr('stroke', curve.color)
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', curve.dash)
            .attr('opacity', 0.9)
            .attr('stroke-linecap', 'round');

        // Label at end of curve
        const lastPoint = points[points.length - 1];
        g.append('text')
            .attr('x', x(lastPoint.t) + 8)
            .attr('y', y(lastPoint.v) + 4)
            .attr('fill', curve.color)
            .attr('font-family', 'IBM Plex Sans')
            .attr('font-size', '10px')
            .attr('font-weight', '500')
            .text(curve.label);
    });

    // Legend
    const legend = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top - 15})`);

    legend.append('text')
        .attr('fill', '#7eb8da')
        .attr('font-family', 'IBM Plex Sans')
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .attr('text-anchor', 'start')
        .text('D = Diffusion Coefficient (Absorptive Capacity)');
}

// --- Network Topology (for Structure page) ---
function drawNetworkTopology(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Fallback width — ensure we never get 0
    var width = container.clientWidth || container.parentElement.clientWidth || 800;
    if (width < 100) width = 800;
    var height = 440;

    var svg = d3.select(container)
        .append('svg')
        .attr('viewBox', '0 0 ' + width + ' ' + height)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('role', 'img')
        .attr('aria-label', 'Network topology: hub and peripheral nodes with animated diffusion pulses');

    var g = svg.append('g');

    // Generate nodes with deterministic seed for visual consistency
    var numNodes = 80;
    var hubIds = [0, 1, 2, 3];
    var nodes = [];

    function pseudoRandom(seed) {
        var x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    for (var i = 0; i < numNodes; i++) {
        var isHub = hubIds.indexOf(i) !== -1;
        nodes.push({
            id: i,
            x: width * (0.15 + pseudoRandom(i * 7 + 1) * 0.7),
            y: height * (0.15 + pseudoRandom(i * 7 + 2) * 0.7),
            isHub: isHub,
            r: isHub ? 6 + pseudoRandom(i + 10) * 4 : 2 + pseudoRandom(i + 20) * 2.5
        });
    }

    // Generate links with preferential attachment to hubs
    var links = [];
    for (var i = 0; i < numNodes; i++) {
        var numLinks = nodes[i].isHub ? 14 + Math.floor(pseudoRandom(i + 30) * 18) : 1 + Math.floor(pseudoRandom(i + 40) * 3);
        var targets = {};
        for (var j = 0; j < numLinks && Object.keys(targets).length < numNodes - 1; j++) {
            var preferHub = pseudoRandom(i * 13 + j * 17) < 0.7;
            var target;
            if (preferHub) {
                target = hubIds[Math.floor(pseudoRandom(i + j * 31) * hubIds.length)];
            } else {
                target = Math.floor(pseudoRandom(i * 19 + j * 23) * numNodes);
            }
            if (target !== i && !targets[target]) {
                targets[target] = true;
                links.push({ source: i, target: target });
            }
        }
    }

    // Force simulation
    var simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(function(d) { return d.id; }).distance(70))
        .force('charge', d3.forceManyBody().strength(function(d) { return d.isHub ? -180 : -35; }))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(function(d) { return d.r + 2; }));

    // Draw links (background)
    var link = g.selectAll('.bg-link')
        .data(links)
        .enter().append('line')
        .attr('class', 'bg-link')
        .attr('stroke', 'rgba(126,184,218,0.1)')
        .attr('stroke-width', 0.5);

    // Draw nodes
    var node = g.selectAll('.node')
        .data(nodes)
        .enter().append('circle')
        .attr('class', 'node')
        .attr('r', function(d) { return d.r; })
        .attr('fill', function(d) { return d.isHub ? '#c9a84c' : '#7eb8da'; })
        .attr('opacity', function(d) { return d.isHub ? 0.9 : 0.5; })
        .attr('stroke', function(d) { return d.isHub ? '#d4b860' : 'none'; })
        .attr('stroke-width', function(d) { return d.isHub ? 1.5 : 0; });

    // Hub labels
    var labels = g.selectAll('.hub-label')
        .data(nodes.filter(function(d) { return d.isHub; }))
        .enter().append('text')
        .attr('class', 'hub-label')
        .attr('text-anchor', 'middle')
        .attr('dy', -12)
        .attr('fill', '#c9a84c')
        .attr('font-family', 'IBM Plex Sans')
        .attr('font-size', '9px')
        .attr('font-weight', '600')
        .text(function(d) { return 'Hub ' + d.id; });

    // Tick
    simulation.on('tick', function() {
        link
            .attr('x1', function(d) { return d.source.x; })
            .attr('y1', function(d) { return d.source.y; })
            .attr('x2', function(d) { return d.target.x; })
            .attr('y2', function(d) { return d.target.y; });

        node
            .attr('cx', function(d) { return d.x; })
            .attr('cy', function(d) { return d.y; });

        labels
            .attr('x', function(d) { return d.x; })
            .attr('y', function(d) { return d.y; });
    });

    // Diffusion pulse animation — creates and removes temporary gold lines
    function pulseDiffusion() {
        // Pick a random hub and trace paths through connected nodes
        var hub = nodes[hubIds[Math.floor(Math.random() * hubIds.length)]];
        var connectedLinks = links.filter(function(l) {
            var srcId = l.source.id !== undefined ? l.source.id : l.source;
            var tgtId = l.target.id !== undefined ? l.target.id : l.target;
            return srcId === hub.id || tgtId === hub.id;
        }).slice(0, 8);

        var pulseLines = g.selectAll('.pulse')
            .data(connectedLinks)
            .enter().append('line')
            .attr('class', 'pulse')
            .attr('stroke', '#c9a84c')
            .attr('stroke-width', 1.5)
            .attr('stroke-dasharray', '4,4')
            .attr('opacity', 0);

        // Position them
        pulseLines
            .attr('x1', function(d) { return d.source.x; })
            .attr('y1', function(d) { return d.source.y; })
            .attr('x2', function(d) { return d.target.x; })
            .attr('y2', function(d) { return d.target.y; });

        // Animate in then out
        pulseLines.transition()
            .duration(1500)
            .attr('opacity', 0.8)
            .transition()
            .duration(1500)
            .attr('opacity', 0)
            .remove()
            .on('end', function() {
                // Small delay then next pulse
                setTimeout(pulseDiffusion, 400);
            });
    }

    // Start pulsing after simulation settles
    simulation.on('end', function() {
        setTimeout(pulseDiffusion, 500);
    });

    // Legend
    svg.append('text')
        .attr('x', 20)
        .attr('y', 25)
        .attr('fill', '#8892a0')
        .attr('font-family', 'IBM Plex Sans')
        .attr('font-size', '10px')
        .text('\u25CF Hub nodes  \u25CF Peripheral nodes  \u2014 Diffusion pulse');
}

// --- Percolation Threshold (for Transition page) ---
function drawPercolationThreshold(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const width = container.clientWidth;
    const height = 400;
    const margin = { top: 30, right: 40, bottom: 50, left: 60 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const svg = d3.select(container)
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('role', 'img')
        .attr('aria-label', 'Percolation threshold: network connectivity phase transition at critical coverage pc');

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleLinear().domain([0, 1]).range([0, innerW]);
    const y = d3.scaleLinear().domain([0, 1]).range([innerH, 0]);

    // Grid
    g.append('g')
        .selectAll('line')
        .data(x.ticks(10))
        .enter().append('line')
        .attr('x1', d => x(d)).attr('x2', d => x(d))
        .attr('y1', 0).attr('y2', innerH)
        .attr('stroke', 'rgba(126,184,218,0.06)')
        .attr('stroke-width', 0.5);

    g.append('g')
        .selectAll('line')
        .data(y.ticks(5))
        .enter().append('line')
        .attr('x1', 0).attr('x2', innerW)
        .attr('y1', d => y(d)).attr('y2', d => y(d))
        .attr('stroke', 'rgba(126,184,218,0.06)')
        .attr('stroke-width', 0.5);

    // Axes
    const xAxis = d3.axisBottom(x).ticks(10).tickFormat(d3.format('.0%'));
    const yAxis = d3.axisLeft(y).ticks(5).tickFormat(d3.format('.0%'));

    g.append('g').attr('transform', `translate(0,${innerH})`).call(xAxis)
        .attr('color', '#6e7686')
        .selectAll('text').attr('fill', '#6e7686').attr('font-family', 'IBM Plex Sans').attr('font-size', '11px');

    g.append('g').call(yAxis)
        .attr('color', '#6e7686')
        .selectAll('text').attr('fill', '#6e7686').attr('font-family', 'IBM Plex Sans').attr('font-size', '11px');

    // Labels
    g.append('text').attr('x', innerW / 2).attr('y', innerH + 38)
        .attr('text-anchor', 'middle').attr('fill', '#6e7686')
        .attr('font-family', 'IBM Plex Sans').attr('font-size', '11px')
        .text('Network Coverage (p)');

    g.append('text').attr('x', -innerH / 2).attr('y', -45)
        .attr('text-anchor', 'middle').attr('transform', 'rotate(-90)')
        .attr('fill', '#6e7686').attr('font-family', 'IBM Plex Sans').attr('font-size', '11px')
        .text('Giant Component Size');

    // Percolation curve: sharp phase transition at pc
    const pc = 0.35; // critical threshold
    const beta = 0.15; // sharpness

    const percolationPoints = [];
    for (let p = 0; p <= 1; p += 0.005) {
        let gc;
        if (p < pc) {
            gc = 0.02 * Math.exp((p - pc) / beta * 8);
        } else {
            gc = Math.pow((p - pc) / (1 - pc), 0.4) * 0.95;
        }
        percolationPoints.push({ p, gc: Math.min(gc, 0.98) });
    }

    const line = d3.line()
        .x(d => x(d.p))
        .y(d => y(d.gc))
        .curve(d3.curveMonotoneX);

    // Draw curve
    g.append('path')
        .datum(percolationPoints)
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', '#c9a84c')
        .attr('stroke-width', 2.5)
        .attr('stroke-linecap', 'round');

    // Critical threshold line
    g.append('line')
        .attr('x1', x(pc)).attr('x2', x(pc))
        .attr('y1', 0).attr('y2', innerH)
        .attr('stroke', '#7eb8da')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '6,4')
        .attr('opacity', 0.6);

    // Threshold label
    g.append('text')
        .attr('x', x(pc) + 10).attr('y', 20)
        .attr('fill', '#7eb8da')
        .attr('font-family', 'IBM Plex Sans')
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .text(`pc = ${(pc * 100).toFixed(0)}%`);

    // Region labels
    g.append('text')
        .attr('x', x(pc / 2)).attr('y', y(0.5))
        .attr('text-anchor', 'middle')
        .attr('fill', '#5a6a7a')
        .attr('font-family', 'IBM Plex Sans')
        .attr('font-size', '10px')
        .text('Fragmented');

    g.append('text')
        .attr('x', x((pc + 1) / 2)).attr('y', y(0.3))
        .attr('text-anchor', 'middle')
        .attr('fill', '#c9a84c')
        .attr('font-family', 'IBM Plex Sans')
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .text('Connected');
}

// --- Impact Decomposition (for Framework page) ---
function drawImpactDecomposition(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const width = container.clientWidth;
    const height = 420;
    const margin = { top: 20, right: 40, bottom: 30, left: 20 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const svg = d3.select(container)
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('role', 'img')
        .attr('aria-label', 'Impact decomposition: stacked area chart of Optimization, Diffusion, and Use over development trajectory');

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Three stacked area layers
    const layers = [
        { name: 'Optimization', key: 'opt', color: '#c9a84c', desc: 'Fractals → Scaling efficiency' },
        { name: 'Diffusion', key: 'diff', color: '#7eb8da', desc: 'Networks → Spread velocity' },
        { name: 'Use', key: 'use', color: '#5a8a6a', desc: 'Phase Transitions → Adoption regime' },
    ];

    // Generate data
    const data = [];
    for (let t = 0; t <= 100; t++) {
        const opt = 0.3 + 0.4 * (1 - Math.exp(-t / 25)) + 0.1 * Math.sin(t / 8);
        const diff = 0.2 + 0.35 * (1 - Math.exp(-t / 35)) + 0.08 * Math.sin(t / 6 + 1);
        const use = 0.1 + 0.3 * (1 - Math.exp(-t / 45)) + 0.05 * Math.sin(t / 7 + 2);
        data.push({ t, opt, diff, use });
    }

    // Stack
    const stack = d3.stack().keys(['opt', 'diff', 'use'])(data);

    const x = d3.scaleLinear().domain([0, 100]).range([0, innerW]);
    const y = d3.scaleLinear().domain([0, 1.1]).range([innerH, 0]);

    const area = d3.area()
        .x(d => x(d.data.t))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]))
        .curve(d3.curveBasis);

    // Draw areas
    const colors = ['#c9a84c', '#7eb8da', '#5a8a6a'];
    stack.forEach((layer, i) => {
        g.append('path')
            .datum(layer)
            .attr('d', area)
            .attr('fill', colors[i])
            .attr('opacity', 0.6);

        // Outline
        g.append('path')
            .datum(layer)
            .attr('d', d3.area()
                .x(d => x(d.data.t))
                .y0(d => y(d[1]))
                .y1(d => y(d[1]))
                .curve(d3.curveBasis)(layer))
            .attr('fill', 'none')
            .attr('stroke', colors[i])
            .attr('stroke-width', 1.5)
            .attr('opacity', 0.8);
    });

    // Y axis
    const yAxis = d3.axisLeft(y).ticks(5).tickFormat(d3.format('.0%'));
    g.append('g').call(yAxis)
        .attr('color', '#6e7686')
        .selectAll('text').attr('fill', '#6e7686').attr('font-family', 'IBM Plex Sans').attr('font-size', '10px');

    // X axis
    const xAxis = d3.axisBottom(x).ticks(10).tickFormat(d => d + '%');
    g.append('g').attr('transform', `translate(0,${innerH})`).call(xAxis)
        .attr('color', '#6e7686')
        .selectAll('text').attr('fill', '#6e7686').attr('font-family', 'IBM Plex Sans').attr('font-size', '10px');

    // Labels
    g.append('text').attr('x', innerW / 2).attr('y', innerH + 25)
        .attr('text-anchor', 'middle').attr('fill', '#6e7686')
        .attr('font-family', 'IBM Plex Sans').attr('font-size', '10px')
        .text('Development Trajectory →');

    // Legend
    const legendItems = [
        { label: 'Optimization', color: '#c9a84c' },
        { label: 'Diffusion', color: '#7eb8da' },
        { label: 'Use', color: '#5a8a6a' },
    ];

    const legend = svg.append('g')
        .attr('transform', `translate(${margin.left + innerW - 180}, ${margin.top})`);

    legendItems.forEach((item, i) => {
        const lg = legend.append('g').attr('transform', `translate(0, ${i * 20})`);
        lg.append('rect').attr('width', 12).attr('height', 12).attr('fill', item.color).attr('opacity', 0.7).attr('rx', 2);
        lg.append('text').attr('x', 18).attr('y', 10)
            .attr('fill', '#b0b8c4')
            .attr('font-family', 'IBM Plex Sans')
            .attr('font-size', '10px')
            .text(item.label);
    });
}

// --- Attractor Landscape (for Transition page) ---
function drawAttractorLandscape(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const width = container.clientWidth;
    const height = 380;
    const margin = { top: 20, right: 40, bottom: 40, left: 50 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const svg = d3.select(container)
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('role', 'img')
        .attr('aria-label', 'Attractor landscape: double-well potential showing poverty trap and convergence path basins');

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Potential landscape with two attractor basins
    const points = [];
    for (let xv = 0; xv <= 100; xv++) {
        // Double-well potential
        const xn = (xv - 50) / 15;
        const potential = 0.2 * Math.pow(xn, 4) - 0.8 * Math.pow(xn, 2) + 0.6 * xn + 1.2;
        points.push({ x: xv, v: potential });
    }

    const x = d3.scaleLinear().domain([0, 100]).range([0, innerW]);
    const y = d3.scaleLinear().domain([0, 2.2]).range([innerH, 0]);

    // Landscape area
    const area = d3.area()
        .x(d => x(d.x))
        .y0(innerH)
        .y1(d => y(d.v))
        .curve(d3.curveBasis);

    const grad = svg.append('defs')
        .append('linearGradient')
        .attr('id', 'landscapeGrad')
        .attr('x1', '0%').attr('y1', '0%')
        .attr('x2', '0%').attr('y2', '100%');

    grad.append('stop').attr('offset', '0%').attr('stop-color', '#c9a84c').attr('stop-opacity', 0.3);
    grad.append('stop').attr('offset', '100%').attr('stop-color', '#0a0e14').attr('stop-opacity', 0);

    g.append('path')
        .datum(points)
        .attr('d', area)
        .attr('fill', 'url(#landscapeGrad)');

    // Landscape line
    const line = d3.line()
        .x(d => x(d.x))
        .y(d => y(d.v))
        .curve(d3.curveBasis);

    g.append('path')
        .datum(points)
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', '#c9a84c')
        .attr('stroke-width', 2);

    // Attractor labels
    // Find local minima
    const minima = [];
    for (let i = 1; i < points.length - 1; i++) {
        if (points[i].v < points[i - 1].v && points[i].v < points[i + 1].v) {
            minima.push(points[i]);
        }
    }

    minima.forEach((m, i) => {
        const label = i === 0 ? 'Poverty Trap\n(Low Attractor)' : 'Convergence Path\n(High Attractor)';
        const color = i === 0 ? '#5a6a7a' : '#7eb8da';
        g.append('text')
            .attr('x', x(m.x))
            .attr('y', y(m.v) - 15)
            .attr('text-anchor', 'middle')
            .attr('fill', color)
            .attr('font-family', 'IBM Plex Sans')
            .attr('font-size', '10px')
            .attr('font-weight', '600')
            .text(label);
    });

    // Basin boundary highlight
    const saddle = points.reduce((a, b) => a.v > b.v ? a : b);
    g.append('line')
        .attr('x1', x(saddle.x)).attr('x2', x(saddle.x))
        .attr('y1', y(saddle.v)).attr('y2', innerH)
        .attr('stroke', '#c9a84c')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4,4')
        .attr('opacity', 0.4);

    g.append('text')
        .attr('x', x(saddle.x) + 8)
        .attr('y', innerH - 5)
        .attr('fill', '#c9a84c')
        .attr('font-family', 'IBM Plex Sans')
        .attr('font-size', '9px')
        .attr('font-weight', '500')
        .text('Basin Boundary');
}

// --- Economic Entropy Heatmap (for Home page) ---
function drawEconomicEntropy(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var width = container.clientWidth || 800;
    if (width < 100) width = 800;
    var height = 380;
    var margin = { top: 10, right: 30, bottom: 40, left: 50 };
    var innerW = width - margin.left - margin.right;
    var innerH = height - margin.top - margin.bottom;

    var svg = d3.select(container)
        .append('svg')
        .attr('viewBox', '0 0 ' + width + ' ' + height)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('role', 'img')
        .attr('aria-label', 'Economic entropy heatmap: transaction density across developmental equilibrium projections');

    var g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Generate heatmap data — transaction density
    var gridX = 40, gridY = 25;
    var data = [];
    for (var i = 0; i < gridX; i++) {
        for (var j = 0; j < gridY; j++) {
            var nx = i / gridX;
            var ny = j / gridY;
            // Create clusters of high density
            var d1 = Math.exp(-((nx - 0.25) * (nx - 0.25) + (ny - 0.3) * (ny - 0.3)) / 0.03);
            var d2 = Math.exp(-((nx - 0.6) * (nx - 0.6) + (ny - 0.55) * (ny - 0.55)) / 0.02);
            var d3 = Math.exp(-((nx - 0.8) * (nx - 0.8) + (ny - 0.7) * (ny - 0.7)) / 0.04);
            var d4 = Math.exp(-((nx - 0.4) * (nx - 0.4) + (ny - 0.75) * (ny - 0.75)) / 0.025);
            var val = d1 * 0.7 + d2 * 0.9 + d3 * 0.5 + d4 * 0.6 + 0.05 * Math.random();
            data.push({ x: i, y: j, v: Math.min(val, 1) });
        }
    }

    var cellW = innerW / gridX;
    var cellH = innerH / gridY;

    // Color scale: dark navy → steel → gold
    var colorScale = d3.scaleLinear()
        .domain([0, 0.3, 0.6, 0.9, 1])
        .range(['#0a0e14', '#162030', '#3a6080', '#7eb8da', '#c9a84c']);

    g.selectAll('rect')
        .data(data)
        .enter().append('rect')
        .attr('x', function(d) { return d.x * cellW; })
        .attr('y', function(d) { return d.y * cellH; })
        .attr('width', cellW + 0.5)
        .attr('height', cellH + 0.5)
        .attr('fill', function(d) { return colorScale(d.v); })
        .attr('opacity', 0.85);

    // Axis labels
    g.append('text')
        .attr('x', innerW / 2).attr('y', innerH + 30)
        .attr('text-anchor', 'middle')
        .attr('fill', '#8892a0')
        .attr('font-family', 'IBM Plex Sans').attr('font-size', '10px')
        .text('Developmental Equilibrium Axis');

    g.append('text')
        .attr('x', -innerH / 2).attr('y', -35)
        .attr('text-anchor', 'middle').attr('transform', 'rotate(-90)')
        .attr('fill', '#8892a0')
        .attr('font-family', 'IBM Plex Sans').attr('font-size', '10px')
        .text('Transaction Density');

    // Color legend
    var legendG = svg.append('g')
        .attr('transform', 'translate(' + (margin.left + innerW - 120) + ',' + (margin.top - 5) + ')');

    var legendData = [
        { label: 'High', val: 1 },
        { label: 'Med', val: 0.6 },
        { label: 'Low', val: 0.2 }
    ];

    legendData.forEach(function(d, i) {
        legendG.append('rect')
            .attr('x', i * 40).attr('y', 0)
            .attr('width', 12).attr('height', 12)
            .attr('fill', colorScale(d.val))
            .attr('rx', 2);

        legendG.append('text')
            .attr('x', i * 40 + 16).attr('y', 10)
            .attr('fill', '#8892a0')
            .attr('font-family', 'IBM Plex Sans').attr('font-size', '9px')
            .text(d.label);
    });
}

// --- Cross-Sector Diffusion S-Curves (updated with sector tabs) ---
var currentSector = 'ict';

function switchSectorTab(sector, el) {
    currentSector = sector;
    document.querySelectorAll('.sector-tab').forEach(function(t) { t.classList.remove('active'); });
    if (el) el.classList.add('active');
    // Redraw
    var container = document.getElementById('viz-diffusion-curves');
    if (container) {
        container.innerHTML = '';
        drawDiffusionSCurves('viz-diffusion-curves', sector);
    }
}

function drawDiffusionSCurves(containerId, sector) {
    var container = document.getElementById(containerId);
    if (!container) return;
    sector = sector || 'ict';

    var width = container.clientWidth || 800;
    if (width < 100) width = 800;
    var height = 400;
    var margin = { top: 30, right: 80, bottom: 50, left: 60 };
    var innerW = width - margin.left - margin.right;
    var innerH = height - margin.top - margin.bottom;

    var svg = d3.select(container)
        .append('svg')
        .attr('viewBox', '0 0 ' + width + ' ' + height)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('role', 'img')
        .attr('aria-label', 'Technology diffusion S-curves for ' + sector + ' sector');

    var g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var x = d3.scaleLinear().domain([0, 100]).range([0, innerW]);
    var y = d3.scaleLinear().domain([0, 1]).range([innerH, 0]);

    // Grid
    g.append('g').selectAll('line').data(x.ticks(10)).enter().append('line')
        .attr('x1', function(d) { return x(d); }).attr('x2', function(d) { return x(d); })
        .attr('y1', 0).attr('y2', innerH)
        .attr('stroke', 'rgba(126,184,218,0.05)').attr('stroke-width', 0.5);

    // Axes
    g.append('g').attr('transform', 'translate(0,' + innerH + ')')
        .call(d3.axisBottom(x).ticks(10).tickFormat(function(d) { return d + '%'; }))
        .attr('color', '#8892a0')
        .selectAll('text').attr('fill', '#8892a0').attr('font-family', 'IBM Plex Sans').attr('font-size', '10px');

    g.append('g')
        .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('.0%')))
        .attr('color', '#8892a0')
        .selectAll('text').attr('fill', '#8892a0').attr('font-family', 'IBM Plex Sans').attr('font-size', '10px');

    // Sector-specific curves
    var curves;
    if (sector === 'ict') {
        curves = [
            { label: 'Mobile Phones', D: 0.7, offset: 42, color: '#c9a84c' },
            { label: 'Internet', D: 0.55, offset: 48, color: '#7eb8da' },
            { label: 'Smartphones', D: 0.4, offset: 55, color: '#a0d0ec' },
        ];
    } else if (sector === 'energy') {
        curves = [
            { label: 'Solar PV', D: 0.65, offset: 40, color: '#c9a84c' },
            { label: 'Wind', D: 0.5, offset: 50, color: '#7eb8da' },
            { label: 'EV Adoption', D: 0.35, offset: 58, color: '#a0d0ec' },
        ];
    } else {
        curves = [
            { label: 'Mobile Money', D: 0.6, offset: 44, color: '#c9a84c' },
            { label: 'Digital Banking', D: 0.5, offset: 52, color: '#7eb8da' },
            { label: 'Insurance', D: 0.3, offset: 60, color: '#a0d0ec' },
        ];
    }

    function sigmoid(t, D, offset) {
        return 1 / (1 + Math.exp(-D * (t - offset) / 10));
    }

    var line = d3.line()
        .x(function(d) { return x(d.t); })
        .y(function(d) { return y(d.v); })
        .curve(d3.curveCardinal);

    curves.forEach(function(curve) {
        var points = [];
        for (var t = 0; t <= 100; t += 0.5) {
            points.push({ t: t, v: sigmoid(t, curve.D, curve.offset) });
        }

        g.append('path')
            .datum(points)
            .attr('d', line)
            .attr('fill', 'none')
            .attr('stroke', curve.color)
            .attr('stroke-width', 2.5)
            .attr('stroke-linecap', 'round');

        var last = points[points.length - 1];
        g.append('text')
            .attr('x', x(last.t) + 6).attr('y', y(last.v) + 4)
            .attr('fill', curve.color)
            .attr('font-family', 'IBM Plex Sans').attr('font-size', '10px').attr('font-weight', '600')
            .text(curve.label);
    });

    // Axis labels
    g.append('text').attr('x', innerW / 2).attr('y', innerH + 38)
        .attr('text-anchor', 'middle').attr('fill', '#8892a0')
        .attr('font-family', 'IBM Plex Sans').attr('font-size', '10px')
        .text('Cumulative Adoption →');

    g.append('text').attr('x', -innerH / 2).attr('y', -45)
        .attr('text-anchor', 'middle').attr('transform', 'rotate(-90)')
        .attr('fill', '#8892a0')
        .attr('font-family', 'IBM Plex Sans').attr('font-size', '10px')
        .text('Adoption Rate');
}

// --- Scaling Exponents Comparison (for Structure page) ---
function drawScalingExponents(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var width = container.clientWidth || 800;
    if (width < 100) width = 800;
    var height = 370;
    var margin = { top: 30, right: 50, bottom: 50, left: 60 };
    var innerW = width - margin.left - margin.right;
    var innerH = height - margin.top - margin.bottom;

    var svg = d3.select(container)
        .append('svg')
        .attr('viewBox', '0 0 ' + width + ' ' + height)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('role', 'img')
        .attr('aria-label', 'Scaling exponent comparison: advanced vs emerging economies across national, regional, and household levels');

    var g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Log-log scale data
    var levels = ['Household', 'Regional', 'National'];
    var advanced = [0.92, 0.87, 0.83];
    var emerging = [0.78, 0.65, 0.52];

    var x = d3.scaleBand().domain(levels).range([0, innerW]).padding(0.3);
    var y = d3.scaleLinear().domain([0, 1]).range([innerH, 0]);

    // Grid
    g.append('g').selectAll('line').data(y.ticks(5)).enter().append('line')
        .attr('x1', 0).attr('x2', innerW)
        .attr('y1', function(d) { return y(d); }).attr('y2', function(d) { return y(d); })
        .attr('stroke', 'rgba(126,184,218,0.06)').attr('stroke-width', 0.5);

    g.append('g')
        .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('.0%')))
        .attr('color', '#8892a0')
        .selectAll('text').attr('fill', '#8892a0').attr('font-family', 'IBM Plex Sans').attr('font-size', '10px');

    // X axis
    g.append('g').attr('transform', 'translate(0,' + innerH + ')')
        .call(d3.axisBottom(x))
        .attr('color', '#8892a0')
        .selectAll('text').attr('fill', '#8892a0').attr('font-family', 'IBM Plex Sans').attr('font-size', '11px');

    // Grouped bars
    var barWidth = x.bandwidth() / 2;

    // Advanced economies
    g.selectAll('.bar-adv')
        .data(advanced)
        .enter().append('rect')
        .attr('class', 'bar-adv')
        .attr('x', function(d, i) { return x(levels[i]); })
        .attr('y', function(d) { return y(d); })
        .attr('width', barWidth - 4)
        .attr('height', function(d) { return innerH - y(d); })
        .attr('fill', '#c9a84c')
        .attr('opacity', 0.85)
        .attr('rx', 2);

    // Emerging economies
    g.selectAll('.bar-emg')
        .data(emerging)
        .enter().append('rect')
        .attr('class', 'bar-emg')
        .attr('x', function(d, i) { return x(levels[i]) + barWidth; })
        .attr('y', function(d) { return y(d); })
        .attr('width', barWidth - 4)
        .attr('height', function(d) { return innerH - y(d); })
        .attr('fill', '#7eb8da')
        .attr('opacity', 0.7)
        .attr('rx', 2);

    // Value labels
    g.selectAll('.val-adv')
        .data(advanced)
        .enter().append('text')
        .attr('x', function(d, i) { return x(levels[i]) + barWidth / 2 - 2; })
        .attr('y', function(d) { return y(d) - 8; })
        .attr('text-anchor', 'middle')
        .attr('fill', '#c9a84c')
        .attr('font-family', 'IBM Plex Sans').attr('font-size', '10px').attr('font-weight', '600')
        .text(function(d) { return d.toFixed(2); });

    g.selectAll('.val-emg')
        .data(emerging)
        .enter().append('text')
        .attr('x', function(d, i) { return x(levels[i]) + barWidth * 1.5 - 2; })
        .attr('y', function(d) { return y(d) - 8; })
        .attr('text-anchor', 'middle')
        .attr('fill', '#7eb8da')
        .attr('font-family', 'IBM Plex Sans').attr('font-size', '10px').attr('font-weight', '600')
        .text(function(d) { return d.toFixed(2); });

    // Legend
    var leg = svg.append('g').attr('transform', 'translate(' + (margin.left + innerW - 200) + ',' + (margin.top - 5) + ')');
    leg.append('rect').attr('width', 12).attr('height', 12).attr('fill', '#c9a84c').attr('rx', 2);
    leg.append('text').attr('x', 18).attr('y', 10).attr('fill', '#b0b8c4').attr('font-family', 'IBM Plex Sans').attr('font-size', '10px').text('Advanced');
    leg.append('rect').attr('x', 100).attr('width', 12).attr('height', 12).attr('fill', '#7eb8da').attr('rx', 2);
    leg.append('text').attr('x', 118).attr('y', 10).attr('fill', '#b0b8c4').attr('font-family', 'IBM Plex Sans').attr('font-size', '10px').text('Emerging');

    g.append('text').attr('x', innerW / 2).attr('y', innerH + 36)
        .attr('text-anchor', 'middle').attr('fill', '#8892a0')
        .attr('font-family', 'IBM Plex Sans').attr('font-size', '10px')
        .text('Scale of Observation');
}

// --- GPT Historical Trajectory (for Framework page) ---
function drawGPTTrajectory(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var width = container.clientWidth || 800;
    if (width < 100) width = 800;
    var height = 200;
    var margin = { top: 30, right: 40, bottom: 30, left: 40 };

    var svg = d3.select(container)
        .append('svg')
        .attr('viewBox', '0 0 ' + width + ' ' + height)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('role', 'img')
        .attr('aria-label', 'GPT Historical Trajectory: Fire, Agriculture, Writing, Mechanical Power, Computing, AI on logarithmic complexity scale');

    var g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',0)');

    var innerW = width - margin.left - margin.right;

    var milestones = [
        { name: 'Fire', era: '~400k BCE', pos: 0.03, v: 0.15 },
        { name: 'Agriculture', era: '~10k BCE', pos: 0.12, v: 0.3 },
        { name: 'Writing', era: '~3k BCE', pos: 0.22, v: 0.42 },
        { name: 'Mechanical Power', era: '1760', pos: 0.45, v: 0.55 },
        { name: 'Computing', era: '1940', pos: 0.68, v: 0.72 },
        { name: 'AI', era: '2020', pos: 0.9, v: 0.95 },
    ];

    // Baseline
    var baseY = height - 50;
    g.append('line')
        .attr('x1', 0).attr('x2', innerW)
        .attr('y1', baseY).attr('y2', baseY)
        .attr('stroke', 'rgba(126,184,218,0.2)')
        .attr('stroke-width', 1);

    // Exponential curve
    var curvePoints = [];
    for (var t = 0; t <= 1; t += 0.01) {
        curvePoints.push({ x: t * innerW, y: baseY - Math.pow(t, 3) * 140 });
    }

    var curve = d3.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .curve(d3.curveMonotoneX);

    g.append('path')
        .datum(curvePoints)
        .attr('d', curve)
        .attr('fill', 'none')
        .attr('stroke', 'rgba(201,168,76,0.3)')
        .attr('stroke-width', 2);

    // Nodes
    milestones.forEach(function(m) {
        var cx = m.pos * innerW;
        var cy = baseY - Math.pow(m.pos, 3) * 140;

        // Pulse ring
        g.append('circle')
            .attr('cx', cx).attr('cy', cy).attr('r', 8)
            .attr('fill', 'none')
            .attr('stroke', '#c9a84c')
            .attr('stroke-width', 1)
            .attr('opacity', 0.3);

        // Dot
        g.append('circle')
            .attr('cx', cx).attr('cy', cy).attr('r', 4)
            .attr('fill', '#c9a84c');

        // Vertical line to baseline
        g.append('line')
            .attr('x1', cx).attr('x2', cx)
            .attr('y1', cy + 6).attr('y2', baseY)
            .attr('stroke', 'rgba(201,168,76,0.15)')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '2,4');

        // Name label
        g.append('text')
            .attr('x', cx).attr('y', cy - 14)
            .attr('text-anchor', 'middle')
            .attr('fill', '#e8ecf1')
            .attr('font-family', 'Space Grotesk').attr('font-size', '11px').attr('font-weight', '600')
            .text(m.name);

        // Era label
        g.append('text')
            .attr('x', cx).attr('y', baseY + 16)
            .attr('text-anchor', 'middle')
            .attr('fill', '#8892a0')
            .attr('font-family', 'IBM Plex Sans').attr('font-size', '9px')
            .text(m.era);
    });

    // Scale labels
    g.append('text').attr('x', 0).attr('y', baseY + 34)
        .attr('text-anchor', 'start').attr('fill', '#8892a0')
        .attr('font-family', 'IBM Plex Sans').attr('font-size', '9px')
        .text('-1,000,000 Years');

    g.append('text').attr('x', innerW).attr('y', baseY + 34)
        .attr('text-anchor', 'end').attr('fill', '#8892a0')
        .attr('font-family', 'IBM Plex Sans').attr('font-size', '9px')
        .text('Present Day');
}

// --- World Development Map (for Home page) ---
function drawWorldDevelopmentMap(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var width = container.clientWidth || container.parentElement.clientWidth || 900;
    if (width < 100) width = 900;
    var height = 480;

    // Show loading state
    container.innerHTML = '<div class="viz-loading"><span style="display:inline-block;width:8px;height:8px;background:#c9a84c;border-radius:50%;margin-right:8px;animation:pulse 1s infinite;"></span>Loading world map data&hellip;</div>';

    // Wait for topojson to be available
    function initMap() {
        if (typeof topojson === 'undefined') {
            setTimeout(initMap, 100);
            return;
        }

        var worldUrl = 'https://unpkg.com/world-atlas@2/land-110m.json';

        d3.json(worldUrl).then(function(world) {
            // Clear loading
            container.innerHTML = '';

            var svg = d3.select(container)
                .append('svg')
                .attr('viewBox', '0 0 ' + width + ' ' + height)
                .attr('preserveAspectRatio', 'xMidYMid meet')
                .attr('role', 'img')
                .attr('aria-label', 'World development map: economic complexity and diffusion capacity by country');

            var land = topojson.feature(world, world.objects.land);
            var countries = topojson.feature(world, world.objects.countries);

            var econData = {
                '840': 1.55, '826': 1.43, '276': 1.92, '392': 1.85, '124': 1.35,
                '250': 1.15, '380': 1.08, '410': 1.98, '036': 0.85, '156': 1.39,
                '356': 0.52, '484': 0.38, '076': 0.32, '170': 0.18, '218': -0.05,
                '404': 0.12, '566': -0.22, '710': 0.08, '716': -0.35, '144': 0.28,
                '360': 0.72, '458': 0.95, '608': 0.65, '702': 1.12, '764': 0.88,
                '643': 0.45, '804': 0.15, '051': 0.32, '112': -0.45, '231': -0.18,
                '288': -0.08, '324': -0.32, '384': -0.15, '430': -0.28, '450': -0.52,
                '454': -0.42, '466': -0.12, '478': -0.35, '508': -0.55, '516': -0.09,
                '562': -0.48, '646': -0.25, '686': -0.38, '694': -0.42, '706': -0.35,
                '728': -0.55, '748': -0.28, '768': -0.15, '788': 0.35, '800': -0.22,
                '834': -0.32, '854': -0.45, '894': -0.18, '232': -0.62
            };

            var projection = d3.geoNaturalEarth1()
                .fitSize([width, height], land);

            var path = d3.geoPath().projection(projection);

            // Ocean background
            svg.append('rect')
                .attr('width', width).attr('height', height)
                .attr('fill', '#080c12');

            var colorScale = d3.scaleSequential(d3.interpolateRgb('#162030', '#c9a84c'))
                .domain([-0.7, 2.0]);

            svg.append('g')
                .selectAll('path')
                .data(countries.features)
                .enter().append('path')
                .attr('d', path)
                .attr('fill', function(d) {
                    var val = econData[d.id] || -0.1;
                    return colorScale(val);
                })
                .attr('stroke', '#0a0e14')
                .attr('stroke-width', 0.5)
                .attr('opacity', 0.9);

            svg.append('path')
                .datum(land)
                .attr('d', path)
                .attr('fill', 'none')
                .attr('stroke', 'rgba(126,184,218,0.15)')
                .attr('stroke-width', 0.5);

            var hubs = [
                { name: 'Silicon Valley', lon: -122, lat: 37, r: 7 },
                { name: 'London', lon: -0.1, lat: 51.5, r: 6 },
                { name: 'Shenzhen', lon: 114, lat: 22.5, r: 6.5 },
                { name: 'Seoul', lon: 127, lat: 37.5, r: 5.5 },
                { name: 'Bangalore', lon: 77.6, lat: 12.9, r: 4.5 },
                { name: 'Tel Aviv', lon: 34.8, lat: 32.1, r: 4 },
                { name: 'Singapore', lon: 103.8, lat: 1.3, r: 5 },
                { name: 'Sao Paulo', lon: -46.6, lat: -23.5, r: 4 },
                { name: 'Nairobi', lon: 36.8, lat: -1.3, r: 3.5 },
            ];

            var hubG = svg.append('g');

            hubs.forEach(function(h) {
                var pos = projection([h.lon, h.lat]);
                if (!pos) return;
                hubG.append('circle')
                    .attr('cx', pos[0]).attr('cy', pos[1])
                    .attr('r', h.r + 6)
                    .attr('fill', 'none')
                    .attr('stroke', '#c9a84c')
                    .attr('stroke-width', 1)
                    .attr('opacity', 0.4);
                hubG.append('circle')
                    .attr('cx', pos[0]).attr('cy', pos[1])
                    .attr('r', h.r / 2)
                    .attr('fill', '#c9a84c')
                    .attr('opacity', 0.95);
                hubG.append('text')
                    .attr('x', pos[0] + h.r + 3).attr('y', pos[1] + 3)
                    .attr('fill', '#c9a84c')
                    .attr('font-family', 'IBM Plex Sans').attr('font-size', '8px').attr('font-weight', '500')
                    .text(h.name);
            });

            // Legend
            var legendW = 200, legendH = 12;
            var legendX = width - legendW - 20;
            var legendY = height - 40;

            var defs = svg.append('defs');
            var gradient = defs.append('linearGradient')
                .attr('id', 'map-legend-grad')
                .attr('x1', '0%').attr('y1', '0%')
                .attr('x2', '100%').attr('y2', '0%');
            gradient.append('stop').attr('offset', '0%').attr('stop-color', '#162030');
            gradient.append('stop').attr('offset', '50%').attr('stop-color', '#7eb8da');
            gradient.append('stop').attr('offset', '100%').attr('stop-color', '#c9a84c');

            svg.append('rect')
                .attr('x', legendX).attr('y', legendY)
                .attr('width', legendW).attr('height', legendH)
                .attr('fill', 'url(#map-legend-grad)')
                .attr('rx', 2);

            svg.append('text')
                .attr('x', legendX).attr('y', legendY - 6)
                .attr('fill', '#8892a0')
                .attr('font-family', 'IBM Plex Sans').attr('font-size', '9px')
                .text('Low');
            svg.append('text')
                .attr('x', legendX + legendW).attr('y', legendY - 6)
                .attr('text-anchor', 'end')
                .attr('fill', '#8892a0')
                .attr('font-family', 'IBM Plex Sans').attr('font-size', '9px')
                .text('High');
            svg.append('text')
                .attr('x', legendX + legendW / 2).attr('y', legendY + 26)
                .attr('text-anchor', 'middle')
                .attr('fill', '#8892a0')
                .attr('font-family', 'IBM Plex Sans').attr('font-size', '9px')
                .text('Economic Complexity & Diffusion Capacity');
        }).catch(function(err) {
            container.innerHTML = '<div class="viz-loading">World map data unavailable. Please refresh.</div>';
            console.error('World map load error:', err);
        });
    }

    initMap();
}
