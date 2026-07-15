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

    const width = container.clientWidth;
    const height = 450;

    const svg = d3.select(container)
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('role', 'img')
        .attr('aria-label', 'Network topology: hub and peripheral nodes with animated diffusion pulses');

    const g = svg.append('g');

    // Generate random nodes
    const numNodes = 80;
    const nodes = [];
    const hubNodes = [0, 1, 2, 3]; // hub indices

    for (let i = 0; i < numNodes; i++) {
        if (hubNodes.includes(i)) {
            nodes.push({
                id: i,
                x: width * (0.2 + Math.random() * 0.6),
                y: height * (0.2 + Math.random() * 0.6),
                isHub: true,
                r: 6 + Math.random() * 4
            });
        } else {
            nodes.push({
                id: i,
                x: width * (0.05 + Math.random() * 0.9),
                y: height * (0.05 + Math.random() * 0.9),
                isHub: false,
                r: 2 + Math.random() * 2
            });
        }
    }

    // Generate links — preferential attachment to hubs
    const links = [];
    for (let i = 0; i < numNodes; i++) {
        const numLinks = nodes[i].isHub ? 15 + Math.floor(Math.random() * 20) : 1 + Math.floor(Math.random() * 3);
        const targets = new Set();
        for (let j = 0; j < numLinks && targets.size < numNodes - 1; j++) {
            // Prefer connecting to hubs
            const targetPool = Math.random() < 0.7 ? hubNodes : d3.range(numNodes).filter(k => k !== i);
            const target = targetPool[Math.floor(Math.random() * targetPool.length)];
            if (target !== i && !targets.has(target)) {
                targets.add(target);
                links.push({ source: i, target });
            }
        }
    }

    // Force simulation
    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(d => {
            return (nodes[d.source.id || d.source].isHub || nodes[d.target.id || d.target].isHub) ? 60 : 120;
        }))
        .force('charge', d3.forceManyBody().strength(d => d.isHub ? -200 : -30))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(d => d.r + 3));

    // Draw links
    const link = g.append('g')
        .selectAll('line')
        .data(links)
        .enter().append('line')
        .attr('stroke', 'rgba(126,184,218,0.12)')
        .attr('stroke-width', 0.5);

    // Highlighted diffusion links (animate a few)
    const diffusionLinks = links.slice(0, 20);
    const diffusionLine = g.append('g')
        .selectAll('line')
        .data(diffusionLinks)
        .enter().append('line')
        .attr('stroke', '#c9a84c')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4,4')
        .attr('opacity', 0);

    // Draw nodes
    const node = g.append('g')
        .selectAll('circle')
        .data(nodes)
        .enter().append('circle')
        .attr('r', d => d.r)
        .attr('fill', d => d.isHub ? '#c9a84c' : '#7eb8da')
        .attr('opacity', d => d.isHub ? 0.9 : 0.6)
        .attr('stroke', d => d.isHub ? '#d4b860' : 'none')
        .attr('stroke-width', d => d.isHub ? 2 : 0);

    // Hub labels
    const labels = g.append('g')
        .selectAll('text')
        .data(nodes.filter(d => d.isHub))
        .enter().append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', -12)
        .attr('fill', '#c9a84c')
        .attr('font-family', 'IBM Plex Sans')
        .attr('font-size', '9px')
        .attr('font-weight', '600')
        .text(d => `Hub ${d.id}`);

    // Tick
    simulation.on('tick', () => {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

        diffusionLine
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

        node
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);

        labels
            .attr('x', d => d.x)
            .attr('y', d => d.y);
    });

    // Animate diffusion through network
    function animateDiffusion() {
        diffusionLine
            .attr('opacity', 0)
            .transition()
            .duration(2000)
            .attr('opacity', 0.7)
            .transition()
            .duration(2000)
            .attr('opacity', 0)
            .on('end', () => {
                // Pick new random set
                const shuffled = [...links].sort(() => Math.random() - 0.5).slice(0, 20);
                diffusionLine.data(shuffled);
                animateDiffusion();
            });
    }

    animateDiffusion();

    // Legend
    svg.append('text')
        .attr('x', 20)
        .attr('y', 25)
        .attr('fill', '#6e7686')
        .attr('font-family', 'IBM Plex Sans')
        .attr('font-size', '10px')
        .text('● Hub nodes  ● Peripheral nodes  — Diffusion pulse');
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
