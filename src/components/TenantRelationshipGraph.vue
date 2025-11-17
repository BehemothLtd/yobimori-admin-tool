<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import tenantRelationshipsData from "@/data/tenantRelationships.json";

interface Tenant {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface Connection {
  from: string;
  to: string;
  type: "realtime" | "normal";
}

interface TenantRelationships {
  [tenantId: string]: {
    realtime: string[];
    normal: string[];
  };
}

const svgWidth = ref(1600);
const svgHeight = ref(1200);
const nodeRadius = ref(20);

const tenants = ref<Tenant[]>([]);
const connections = ref<Connection[]>([]);
const containerRef = ref<HTMLElement | null>(null);

// Pan and Zoom state
const zoom = ref(1);
const panX = ref(0);
const panY = ref(0);
const isPanning = ref(false);
const panStartX = ref(0);
const panStartY = ref(0);

// Touch state
const touchStartDistance = ref(0);
const touchStartZoom = ref(1);

// Selection state
const selectedNode = ref<Tenant | null>(null);

// Minimap dimensions
const minimapWidth = 200;
const minimapHeight = 150;

// Search state
const searchQuery = ref("");

// SVG ref
const svgRef = ref<SVGSVGElement | null>(null);

// Load data from JSON
const loadTenantData = () => {
  const data = tenantRelationshipsData as TenantRelationships;
  const tenantIds = Object.keys(data);

  // Create tenant nodes
  tenants.value = tenantIds.map((id) => ({
    id,
    label: id, // Use full name instead of ID
    x: 0,
    y: 0,
  }));

  // Create connections
  const allConnections: Connection[] = [];
  Object.entries(data).forEach(([tenantId, relations]) => {
    // Add realtime connections
    relations.realtime.forEach((targetId) => {
      allConnections.push({
        from: tenantId,
        to: targetId,
        type: "realtime",
      });
    });

    // Add normal connections
    relations.normal.forEach((targetId) => {
      allConnections.push({
        from: tenantId,
        to: targetId,
        type: "normal",
      });
    });
  });

  connections.value = allConnections;
};

// Calculate node positions using force-directed layout
const calculateNodePositions = () => {
  const centerX = svgWidth.value / 2;
  const centerY = svgHeight.value / 2;

  // Check if mobile
  const isMobile = window.innerWidth < 640;

  // Initialize random positions with much larger spread on mobile
  tenants.value.forEach((tenant, i) => {
    const angle = (i / tenants.value.length) * 2 * Math.PI + Math.random() * 0.5;
    const radius = isMobile ? 500 + Math.random() * 500 : 250 + Math.random() * 200;
    tenant.x = centerX + radius * Math.cos(angle);
    tenant.y = centerY + radius * Math.sin(angle);
  });

  // Force-directed layout parameters
  const iterations = 300;
  const repulsionStrength = isMobile ? 50000 : 12000; // Much stronger repulsion on mobile
  const attractionStrength = isMobile ? 0.002 : 0.004; // Weaker attraction on mobile
  const dampening = 0.8;

  // Velocity for each node
  const velocities = tenants.value.map(() => ({ vx: 0, vy: 0 }));

  // Run simulation
  for (let iter = 0; iter < iterations; iter++) {
    // Reset forces
    const forces = tenants.value.map(() => ({ fx: 0, fy: 0 }));

    // Repulsion between all nodes
    for (let i = 0; i < tenants.value.length; i++) {
      for (let j = i + 1; j < tenants.value.length; j++) {
        const tenantI = tenants.value[i];
        const tenantJ = tenants.value[j];
        const forceI = forces[i];
        const forceJ = forces[j];

        if (!tenantI || !tenantJ || !forceI || !forceJ) continue;

        const dx = tenantJ.x - tenantI.x;
        const dy = tenantJ.y - tenantI.y;
        const distSq = Math.max(dx * dx + dy * dy, 1);
        const dist = Math.sqrt(distSq);

        if (dist < 0.01) continue; // Skip if too close

        const force = repulsionStrength / distSq;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        forceI.fx -= fx;
        forceI.fy -= fy;
        forceJ.fx += fx;
        forceJ.fy += fy;
      }
    }

    // Attraction along edges
    connections.value.forEach((conn) => {
      const fromIdx = tenants.value.findIndex((t) => t.id === conn.from);
      const toIdx = tenants.value.findIndex((t) => t.id === conn.to);

      if (fromIdx !== -1 && toIdx !== -1) {
        const fromTenant = tenants.value[fromIdx];
        const toTenant = tenants.value[toIdx];
        const forceFrom = forces[fromIdx];
        const forceTo = forces[toIdx];

        if (!fromTenant || !toTenant || !forceFrom || !forceTo) return;

        const dx = toTenant.x - fromTenant.x;
        const dy = toTenant.y - fromTenant.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(Math.max(distSq, 0.01));

        if (dist < 0.01) return; // Skip if too close

        const isMobileCheck = window.innerWidth < 640;
        const idealDistance = isMobileCheck ? 600 : 250; // Much larger distance on mobile
        const force = (dist - idealDistance) * attractionStrength;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        forceFrom.fx += fx;
        forceFrom.fy += fy;
        forceTo.fx -= fx;
        forceTo.fy -= fy;
      }
    });

    // Gravity towards center (weak)
    tenants.value.forEach((tenant, i) => {
      const force = forces[i];
      if (!force) return;

      const dx = centerX - tenant.x;
      const dy = centerY - tenant.y;
      force.fx += dx * 0.002;
      force.fy += dy * 0.002;
    });

    // Update velocities and positions
    tenants.value.forEach((tenant, i) => {
      const velocity = velocities[i];
      const force = forces[i];
      if (!velocity || !force) return;

      velocity.vx = (velocity.vx + force.fx) * dampening;
      velocity.vy = (velocity.vy + force.fy) * dampening;

      // Limit velocity
      const maxVelocity = 10;
      const velocityMag = Math.sqrt(velocity.vx * velocity.vx + velocity.vy * velocity.vy);
      if (velocityMag > maxVelocity) {
        velocity.vx = (velocity.vx / velocityMag) * maxVelocity;
        velocity.vy = (velocity.vy / velocityMag) * maxVelocity;
      }

      tenant.x += velocity.vx;
      tenant.y += velocity.vy;

      // Keep nodes within bounds with padding
      tenant.x = Math.max(100, Math.min(svgWidth.value - 100, tenant.x));
      tenant.y = Math.max(100, Math.min(svgHeight.value - 100, tenant.y));

      // Ensure no NaN values
      if (isNaN(tenant.x) || isNaN(tenant.y)) {
        tenant.x = centerX + (Math.random() - 0.5) * 600;
        tenant.y = centerY + (Math.random() - 0.5) * 600;
      }
    });
  }
};

// Check if a connection is bidirectional
const isBidirectional = (from: string, to: string, type: "realtime" | "normal"): boolean => {
  return connections.value.some(
    (conn) => conn.from === to && conn.to === from && conn.type === type
  );
};

// Get unique connections (for rendering)
const uniqueConnections = computed(() => {
  const seen = new Set<string>();
  const result: {
    from: string;
    to: string;
    type: "realtime" | "normal";
    bidirectional: boolean;
  }[] = [];

  connections.value.forEach((conn) => {
    const key1 = `${conn.from}-${conn.to}-${conn.type}`;
    const key2 = `${conn.to}-${conn.from}-${conn.type}`;

    if (!seen.has(key1) && !seen.has(key2)) {
      const bidirectional = isBidirectional(conn.from, conn.to, conn.type);
      result.push({
        from: conn.from,
        to: conn.to,
        type: conn.type,
        bidirectional,
      });
      seen.add(key1);
      if (bidirectional) {
        seen.add(key2);
      }
    }
  });

  return result;
});

// Get connection style based on type
const getConnectionStyle = (type: "realtime" | "normal") => {
  if (type === "realtime") {
    return {
      stroke: "#ef4444",
      strokeWidth: "2",
      strokeDasharray: "none",
      marker: "url(#arrowhead-realtime)",
    };
  } else {
    return {
      stroke: "#3b82f6",
      strokeWidth: "1",
      strokeDasharray: "4,2",
      marker: "url(#arrowhead-normal)",
    };
  }
};

// Generate SVG path for arrows
const getArrowPath = (
  fromId: string,
  toId: string,
  _bidirectional: boolean,
  curveDirection: "up" | "down" | "straight"
): string => {
  const fromNode = tenants.value.find((t) => t.id === fromId);
  const toNode = tenants.value.find((t) => t.id === toId);

  if (!fromNode || !toNode) return "";

  const dx = toNode.x - fromNode.x;
  const dy = toNode.y - fromNode.y;
  const angle = Math.atan2(dy, dx);
  const distance = Math.sqrt(dx * dx + dy * dy);

  const fromX = fromNode.x + nodeRadius.value * Math.cos(angle);
  const fromY = fromNode.y + nodeRadius.value * Math.sin(angle);
  const toX = toNode.x - (nodeRadius.value + 5) * Math.cos(angle);
  const toY = toNode.y - (nodeRadius.value + 5) * Math.sin(angle);

  if (curveDirection === "straight") {
    return `M ${fromX} ${fromY} L ${toX} ${toY}`;
  } else {
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;
    const curveHeight = distance * 0.15;
    const perpAngle = angle + Math.PI / 2;
    const offsetMultiplier = curveDirection === "up" ? 1 : -1;
    const controlX = midX + curveHeight * Math.cos(perpAngle) * offsetMultiplier;
    const controlY = midY + curveHeight * Math.sin(perpAngle) * offsetMultiplier;
    return `M ${fromX} ${fromY} Q ${controlX} ${controlY} ${toX} ${toY}`;
  }
};

// Transform string for pan and zoom
const transform = computed(() => {
  return `translate(${panX.value}, ${panY.value}) scale(${zoom.value})`;
});

// Find tenants matching search query
const searchMatchedTenants = computed(() => {
  if (!searchQuery.value.trim()) return [];
  const query = searchQuery.value.toLowerCase();
  return tenants.value.filter((tenant) =>
    tenant.label.toLowerCase().includes(query)
  );
});

// Focus on node when exactly 1 search result
const focusOnNode = (tenant: Tenant) => {
  // Center the view on the tenant
  panX.value = (svgWidth.value / 2 - tenant.x * zoom.value);
  panY.value = (svgHeight.value / 2 - tenant.y * zoom.value);
};

// Check if a tenant matches search
const isSearchMatched = (tenantId: string): boolean => {
  if (!searchQuery.value.trim()) return false;
  return searchMatchedTenants.value.some((t) => t.id === tenantId);
};

// Check if a tenant is connected to any search-matched tenant
const isConnectedToSearchMatched = (tenantId: string): boolean => {
  if (!searchQuery.value.trim()) return false;
  if (isSearchMatched(tenantId)) return true; // The matched node itself

  return connections.value.some((conn) => {
    const matchedFrom = isSearchMatched(conn.from);
    const matchedTo = isSearchMatched(conn.to);
    return (matchedFrom && conn.to === tenantId) || (matchedTo && conn.from === tenantId);
  });
};

// Check if a node is connected to the selected node
const isConnectedToSelected = (tenantId: string): boolean => {
  if (!selectedNode.value) return false;
  if (tenantId === selectedNode.value.id) return true;

  return connections.value.some(
    (conn) =>
      (conn.from === selectedNode.value!.id && conn.to === tenantId) ||
      (conn.to === selectedNode.value!.id && conn.from === tenantId)
  );
};

// Check if a connection involves the selected node
const isConnectionHighlighted = (from: string, to: string): boolean => {
  if (!selectedNode.value) return false;
  return from === selectedNode.value.id || to === selectedNode.value.id;
};

// Check if a connection involves a search-matched node
const isConnectionSearchMatched = (from: string, to: string): boolean => {
  if (!searchQuery.value.trim()) return false;
  return isSearchMatched(from) || isSearchMatched(to);
};

// Get node opacity based on selection or search
const getNodeOpacity = (tenant: Tenant): number => {
  // Search has priority
  if (searchQuery.value.trim()) {
    return isConnectedToSearchMatched(tenant.id) ? 1 : 0.2;
  }
  // Then selection
  if (!selectedNode.value) return 1;
  return isConnectedToSelected(tenant.id) ? 1 : 0.2;
};

// Get connection opacity based on selection or search
const getConnectionOpacity = (from: string, to: string, baseOpacity: number): number => {
  // Search highlighting - show connections involving matched nodes
  if (searchQuery.value.trim()) {
    return isConnectionSearchMatched(from, to) ? baseOpacity : 0.1;
  }
  // Selection highlighting
  if (!selectedNode.value) return baseOpacity;
  return isConnectionHighlighted(from, to) ? baseOpacity : 0.1;
};

// Get node highlight class
const getNodeClass = (tenant: Tenant): string => {
  // Search highlighting
  if (searchQuery.value.trim()) {
    if (isSearchMatched(tenant.id)) return 'search-matched';
    if (isConnectedToSearchMatched(tenant.id)) return 'connected';
    return 'dimmed';
  }
  // Selection highlighting
  if (!selectedNode.value) return '';
  if (tenant.id === selectedNode.value.id) return 'selected';
  if (isConnectedToSelected(tenant.id)) return 'connected';
  return 'dimmed';
};

// Zoom control functions
const zoomIn = () => {
  zoom.value = Math.min(5, zoom.value * 1.2);
};

const zoomOut = () => {
  zoom.value = Math.max(0.1, zoom.value / 1.2);
};

const resetZoom = () => {
  fitGraphToView();
};

// Pan handlers
const handleMouseDown = (event: MouseEvent) => {
  if (event.target === svgRef.value || (event.target as SVGElement).classList.contains('background')) {
    isPanning.value = true;
    panStartX.value = event.clientX - panX.value;
    panStartY.value = event.clientY - panY.value;
    // Deselect node when clicking on background
    selectedNode.value = null;
  }
};

const handleMouseMove = (event: MouseEvent) => {
  if (isPanning.value) {
    panX.value = event.clientX - panStartX.value;
    panY.value = event.clientY - panStartY.value;
  }
};

const handleMouseUp = () => {
  isPanning.value = false;
};

// Node click handler for selection
const handleNodeClick = (event: MouseEvent, tenant: Tenant) => {
  event.stopPropagation();
  selectedNode.value = selectedNode.value?.id === tenant.id ? null : tenant;
};

// Touch event handlers for mobile
const getTouchDistance = (touch1: Touch, touch2: Touch): number => {
  const dx = touch2.clientX - touch1.clientX;
  const dy = touch2.clientY - touch1.clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

const handleTouchStart = (event: TouchEvent) => {
  if (event.touches.length === 2) {
    // Two-finger pinch to zoom
    event.preventDefault();
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    if (touch1 && touch2) {
      touchStartDistance.value = getTouchDistance(touch1, touch2);
      touchStartZoom.value = zoom.value;
    }
  } else if (event.touches.length === 1) {
    // Single finger pan
    const touch = event.touches[0];
    if (touch && (event.target === svgRef.value || (event.target as SVGElement).classList.contains('background'))) {
      isPanning.value = true;
      panStartX.value = touch.clientX - panX.value;
      panStartY.value = touch.clientY - panY.value;
      // Deselect node when touching background
      selectedNode.value = null;
    }
  }
};

const handleTouchMove = (event: TouchEvent) => {
  if (event.touches.length === 2) {
    // Two-finger pinch to zoom
    event.preventDefault();
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    if (touch1 && touch2 && touchStartDistance.value > 0) {
      const currentDistance = getTouchDistance(touch1, touch2);
      const scale = currentDistance / touchStartDistance.value;
      zoom.value = Math.max(0.1, Math.min(5, touchStartZoom.value * scale));
    }
  } else if (event.touches.length === 1 && isPanning.value) {
    // Single finger pan
    const touch = event.touches[0];
    if (touch) {
      panX.value = touch.clientX - panStartX.value;
      panY.value = touch.clientY - panStartY.value;
    }
  }
};

const handleTouchEnd = () => {
  isPanning.value = false;
  touchStartDistance.value = 0;
};

// Get connections for selected node
const selectedNodeConnections = computed(() => {
  if (!selectedNode.value) return { realtime: [], normal: [] };

  const nodeId = selectedNode.value.id;
  const realtimeConns: { target: string; direction: 'outgoing' | 'incoming' }[] = [];
  const normalConns: { target: string; direction: 'outgoing' | 'incoming' }[] = [];

  connections.value.forEach((conn) => {
    if (conn.from === nodeId) {
      if (conn.type === 'realtime') {
        realtimeConns.push({ target: conn.to, direction: 'outgoing' });
      } else {
        normalConns.push({ target: conn.to, direction: 'outgoing' });
      }
    } else if (conn.to === nodeId) {
      if (conn.type === 'realtime') {
        realtimeConns.push({ target: conn.from, direction: 'incoming' });
      } else {
        normalConns.push({ target: conn.from, direction: 'incoming' });
      }
    }
  });

  return { realtime: realtimeConns, normal: normalConns };
});

// Calculate statistics
const stats = computed(() => {
  const realtimeCount = connections.value.filter((c) => c.type === "realtime").length;
  const normalCount = connections.value.filter((c) => c.type === "normal").length;
  return {
    totalTenants: tenants.value.length,
    realtimeConnections: realtimeCount,
    normalConnections: normalCount,
    totalConnections: realtimeCount + normalCount,
  };
});

// Minimap scale factor
const minimapScale = computed(() => {
  const scaleX = minimapWidth / svgWidth.value;
  const scaleY = minimapHeight / svgHeight.value;
  return Math.min(scaleX, scaleY);
});

// Minimap viewport rectangle
const minimapViewport = computed(() => {
  const scale = minimapScale.value;
  const viewportWidth = svgWidth.value * scale / zoom.value;
  const viewportHeight = svgHeight.value * scale / zoom.value;
  const viewportX = -panX.value * scale / zoom.value;
  const viewportY = -panY.value * scale / zoom.value;

  return {
    x: viewportX,
    y: viewportY,
    width: viewportWidth,
    height: viewportHeight,
  };
});

// Handle minimap click to navigate
const handleMinimapClick = (event: MouseEvent) => {
  const minimapSvg = event.currentTarget as SVGSVGElement;
  const rect = minimapSvg.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;

  const scale = minimapScale.value;

  // Convert minimap coordinates to main canvas coordinates
  const mainX = clickX / scale;
  const mainY = clickY / scale;

  // Center the view on the clicked position
  panX.value = -(mainX - svgWidth.value / 2) * zoom.value;
  panY.value = -(mainY - svgHeight.value / 2) * zoom.value;
};

// Fit the entire graph into view
const fitGraphToView = () => {
  if (tenants.value.length === 0) return;

  // Calculate bounding box of all nodes
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  tenants.value.forEach((tenant) => {
    minX = Math.min(minX, tenant.x);
    minY = Math.min(minY, tenant.y);
    maxX = Math.max(maxX, tenant.x);
    maxY = Math.max(maxY, tenant.y);
  });

  // Add padding around the graph
  const padding = 100;
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;

  // Calculate the width and height of the bounding box
  const graphWidth = maxX - minX;
  const graphHeight = maxY - minY;

  // Calculate the zoom level to fit the graph
  const zoomX = svgWidth.value / graphWidth;
  const zoomY = svgHeight.value / graphHeight;
  const fitZoom = Math.min(zoomX, zoomY); // Use the calculated zoom to fit

  // Calculate the center of the graph
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  // Set zoom and pan to center the graph
  zoom.value = fitZoom;
  panX.value = (svgWidth.value / 2 - centerX * fitZoom);
  panY.value = (svgHeight.value / 2 - centerY * fitZoom);
};

// Update SVG dimensions based on container size
const updateDimensions = () => {
  if (containerRef.value) {
    const containerWidth = containerRef.value.clientWidth - 48; // Subtract padding
    const containerHeight = Math.max(600, Math.min(1200, window.innerHeight - 400));

    // Maintain aspect ratio but adapt to screen size
    svgWidth.value = Math.max(800, containerWidth);
    svgHeight.value = Math.max(600, containerHeight);

    // Adjust node size for mobile
    if (window.innerWidth < 640) {
      nodeRadius.value = 30; // Larger nodes on mobile
    } else {
      nodeRadius.value = 20; // Normal size on desktop
    }
  }
};

onMounted(() => {
  loadTenantData();
  updateDimensions();
  calculateNodePositions();

  // Small delay to ensure dimensions are set before fitting
  setTimeout(() => {
    fitGraphToView();
  }, 100);

  // Add global mouse event listeners
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);
  window.addEventListener('resize', () => {
    updateDimensions();
    // Re-fit graph when window is resized
    setTimeout(() => {
      fitGraphToView();
    }, 100);
  });
});

// Watch for search results - if exactly 1 match, focus on it
watch(searchMatchedTenants, (newMatches) => {
  if (newMatches.length === 1) {
    const matchedNode = newMatches[0];
    if (matchedNode) {
      // Small delay to ensure the search highlighting is rendered
      setTimeout(() => {
        focusOnNode(matchedNode);
      }, 100);
    }
  }
});
</script>

<template>
  <div ref="containerRef" class="tenant-relationship-graph">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
      <h3 class="text-lg sm:text-xl font-semibold text-gray-800">テナント関係ネットワーク</h3>

      <!-- Stats -->
      <div class="flex gap-2 sm:gap-4 text-xs sm:text-sm flex-wrap">
        <div class="flex items-center gap-1 sm:gap-2">
          <span class="font-medium text-gray-600">テナント数:</span>
          <span class="font-bold text-gray-900">{{ stats.totalTenants }}</span>
        </div>
        <div class="flex items-center gap-1 sm:gap-2">
          <span class="font-medium text-gray-600">接続数:</span>
          <span class="font-bold text-gray-900">{{ stats.totalConnections }}</span>
        </div>
        <div class="flex items-center gap-1 sm:gap-2">
          <span class="font-medium text-gray-600">ズーム:</span>
          <span class="font-bold text-gray-900">{{ (zoom * 100).toFixed(0) }}%</span>
        </div>
      </div>
    </div>

    <!-- Search and Legend -->
    <div class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-4 gap-3 sm:gap-4">
      <!-- Search Input -->
      <div class="flex-1 max-w-full sm:max-w-md">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="テナント名で検索..."
          class="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div v-if="searchQuery.trim() && searchMatchedTenants.length > 0" class="mt-1 text-xs text-gray-600">
          {{ searchMatchedTenants.length }}件のテナントが見つかりました
        </div>
        <div v-else-if="searchQuery.trim() && searchMatchedTenants.length === 0" class="mt-1 text-xs text-red-600">
          該当するテナントが見つかりません
        </div>
      </div>

      <!-- Legend -->
      <div class="flex gap-4 sm:gap-6 text-xs sm:text-sm">
        <div class="flex items-center gap-2">
          <div class="w-6 sm:w-8 h-0.5 bg-red-500"></div>
          <span class="text-gray-700 whitespace-nowrap">リアルタイム ({{ stats.realtimeConnections }})</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-6 sm:w-8 h-0.5 bg-blue-500 border-dashed" style="border-top: 1px dashed #3b82f6; background: none;"></div>
          <span class="text-gray-700 whitespace-nowrap">通常 ({{ stats.normalConnections }})</span>
        </div>
      </div>
    </div>

    <!-- Instructions -->
    <div class="text-gray-500 text-xs italic mb-4 hidden sm:block">
      💡 ズームボタンでズーム • 背景をドラッグで移動 • ノードをクリックで関係をハイライト
    </div>
    <div class="text-gray-500 text-xs italic mb-4 sm:hidden">
      💡 ピンチでズーム • ドラッグで移動 • タップで詳細表示
    </div>

    <div class="graph-container bg-white rounded-lg shadow-sm p-3 sm:p-6 overflow-hidden relative">
      <!-- Zoom Controls -->
      <div class="absolute top-2 sm:top-4 right-2 sm:right-4 flex flex-col gap-1.5 sm:gap-2 z-20">
        <button
          @click="zoomIn"
          class="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg shadow-md hover:shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all font-bold text-base sm:text-lg"
          title="ズームイン"
        >
          +
        </button>
        <button
          @click="zoomOut"
          class="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg shadow-md hover:shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all font-bold text-base sm:text-lg"
          title="ズームアウト"
        >
          −
        </button>
        <button
          @click="resetZoom"
          class="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg shadow-md hover:shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all font-bold text-base sm:text-lg"
          title="リセット"
        >
          ⟲
        </button>
      </div>

      <!-- Node Information Panel -->
      <div
        v-if="selectedNode"
        class="node-info-panel absolute top-2 left-2 sm:top-4 sm:left-4 bg-white rounded-lg shadow-lg border-2 border-blue-500 p-3 sm:p-4 max-w-[calc(100%-1rem)] sm:max-w-sm z-10"
      >
        <div class="flex justify-between items-start mb-2 sm:mb-3">
          <h4 class="text-sm sm:text-base font-bold text-gray-900 break-all pr-2">{{ selectedNode.label }}</h4>
          <button
            @click="selectedNode = null"
            class="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            title="閉じる"
          >
            <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Realtime Connections -->
        <div v-if="selectedNodeConnections.realtime.length > 0" class="mb-2 sm:mb-3">
          <div class="flex items-center gap-2 mb-1.5 sm:mb-2">
            <div class="w-3 sm:w-4 h-0.5 bg-red-500"></div>
            <span class="text-xs sm:text-sm font-semibold text-red-700">即時通知</span>
            <span class="text-[10px] sm:text-xs text-gray-500">({{ selectedNodeConnections.realtime.length }})</span>
          </div>
          <ul class="space-y-1 ml-4 sm:ml-6">
            <li
              v-for="(conn, idx) in selectedNodeConnections.realtime"
              :key="`realtime-${idx}`"
              class="text-xs sm:text-sm text-gray-700 flex items-start gap-1 break-all"
            >
              <span class="text-red-500 text-xs mt-0.5 flex-shrink-0">{{ conn.direction === 'outgoing' ? '→' : '←' }}</span>
              <span class="break-all">{{ conn.target }}</span>
            </li>
          </ul>
        </div>

        <!-- Normal Connections -->
        <div v-if="selectedNodeConnections.normal.length > 0">
          <div class="flex items-center gap-2 mb-1.5 sm:mb-2">
            <div class="w-3 sm:w-4 h-0.5 bg-blue-500 border-dashed" style="border-top: 1px dashed #3b82f6; background: none;"></div>
            <span class="text-xs sm:text-sm font-semibold text-blue-700">他船通知</span>
            <span class="text-[10px] sm:text-xs text-gray-500">({{ selectedNodeConnections.normal.length }})</span>
          </div>
          <ul class="space-y-1 ml-4 sm:ml-6">
            <li
              v-for="(conn, idx) in selectedNodeConnections.normal"
              :key="`normal-${idx}`"
              class="text-xs sm:text-sm text-gray-700 flex items-start gap-1 break-all"
            >
              <span class="text-blue-500 text-xs mt-0.5 flex-shrink-0">{{ conn.direction === 'outgoing' ? '→' : '←' }}</span>
              <span class="break-all">{{ conn.target }}</span>
            </li>
          </ul>
        </div>

        <!-- No connections message -->
        <div v-if="selectedNodeConnections.realtime.length === 0 && selectedNodeConnections.normal.length === 0" class="text-xs sm:text-sm text-gray-500 italic">
          接続がありません
        </div>
      </div>

      <svg
        ref="svgRef"
        :width="svgWidth"
        :height="svgHeight"
        class="mx-auto cursor-grab touch-none"
        :class="{ 'cursor-grabbing': isPanning }"
        @mousedown="handleMouseDown"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <!-- Background rect for pan detection -->
        <rect
          class="background"
          x="0"
          y="0"
          :width="svgWidth"
          :height="svgHeight"
          fill="transparent"
        />

        <!-- Define arrow markers -->
        <defs>
          <marker
            id="arrowhead-realtime"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#ef4444" />
          </marker>

          <marker
            id="arrowhead-normal"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
          </marker>
        </defs>

        <!-- Main group with transform for pan/zoom -->
        <g :transform="transform">
          <!-- Draw connections -->
          <g class="connections">
            <template
              v-for="conn in uniqueConnections"
              :key="`${conn.from}-${conn.to}-${conn.type}`"
            >
              <template v-if="conn.bidirectional">
                <path
                  :d="getArrowPath(conn.from, conn.to, true, 'up')"
                  :stroke="getConnectionStyle(conn.type).stroke"
                  :stroke-width="getConnectionStyle(conn.type).strokeWidth"
                  :stroke-dasharray="getConnectionStyle(conn.type).strokeDasharray"
                  fill="none"
                  :marker-end="getConnectionStyle(conn.type).marker"
                  :opacity="getConnectionOpacity(conn.from, conn.to, 0.6)"
                />
                <path
                  :d="getArrowPath(conn.to, conn.from, true, 'down')"
                  :stroke="getConnectionStyle(conn.type).stroke"
                  :stroke-width="getConnectionStyle(conn.type).strokeWidth"
                  :stroke-dasharray="getConnectionStyle(conn.type).strokeDasharray"
                  fill="none"
                  :marker-end="getConnectionStyle(conn.type).marker"
                  :opacity="getConnectionOpacity(conn.from, conn.to, 0.6)"
                />
              </template>
              <template v-else>
                <path
                  :d="getArrowPath(conn.from, conn.to, false, 'straight')"
                  :stroke="getConnectionStyle(conn.type).stroke"
                  :stroke-width="getConnectionStyle(conn.type).strokeWidth"
                  :stroke-dasharray="getConnectionStyle(conn.type).strokeDasharray"
                  fill="none"
                  :marker-end="getConnectionStyle(conn.type).marker"
                  :opacity="getConnectionOpacity(conn.from, conn.to, 0.5)"
                />
              </template>
            </template>
          </g>

          <!-- Draw nodes -->
          <g class="nodes">
            <g
              v-for="tenant in tenants"
              :key="tenant.id"
              :transform="`translate(${tenant.x}, ${tenant.y})`"
              :class="['node', getNodeClass(tenant)]"
              :opacity="getNodeOpacity(tenant)"
              @click="handleNodeClick($event, tenant)"
            >
              <circle
                :r="nodeRadius"
                fill="#ffffff"
                stroke="#4b5563"
                :stroke-width="nodeRadius > 25 ? 3 : 2"
                class="cursor-pointer"
              />
              <text
                text-anchor="middle"
                dominant-baseline="middle"
                :font-size="nodeRadius > 25 ? 12 : 8"
                font-weight="600"
                fill="#1e3a8a"
                class="pointer-events-none select-none node-label"
              >
                {{ tenant.label }}
              </text>
            </g>
          </g>
        </g>
      </svg>

      <!-- Minimap - Desktop only -->
      <div class="hidden sm:block absolute bottom-4 right-4 bg-white rounded-lg shadow-lg border-2 border-gray-300 overflow-hidden z-10">
        <svg
          :width="minimapWidth"
          :height="minimapHeight"
          class="minimap cursor-pointer"
          @click="handleMinimapClick"
        >
          <!-- Background -->
          <rect
            x="0"
            y="0"
            :width="minimapWidth"
            :height="minimapHeight"
            fill="#f9fafb"
          />

          <!-- Minimap content -->
          <g :transform="`scale(${minimapScale})`">
            <!-- Draw connections in minimap -->
            <g class="minimap-connections">
              <line
                v-for="(conn, idx) in uniqueConnections"
                :key="`minimap-conn-${idx}`"
                :x1="tenants.find(t => t.id === conn.from)?.x || 0"
                :y1="tenants.find(t => t.id === conn.from)?.y || 0"
                :x2="tenants.find(t => t.id === conn.to)?.x || 0"
                :y2="tenants.find(t => t.id === conn.to)?.y || 0"
                :stroke="conn.type === 'realtime' ? '#ef4444' : '#3b82f6'"
                stroke-width="1"
                opacity="0.3"
              />
            </g>

            <!-- Draw nodes in minimap -->
            <g class="minimap-nodes">
              <circle
                v-for="tenant in tenants"
                :key="`minimap-node-${tenant.id}`"
                :cx="tenant.x"
                :cy="tenant.y"
                r="4"
                fill="#4b5563"
                opacity="0.6"
              />
            </g>
          </g>

          <!-- Viewport indicator -->
          <rect
            :x="minimapViewport.x"
            :y="minimapViewport.y"
            :width="minimapViewport.width"
            :height="minimapViewport.height"
            fill="rgba(59, 130, 246, 0.1)"
            stroke="#3b82f6"
            stroke-width="2"
            pointer-events="none"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tenant-relationship-graph {
  margin: 0 auto;
  max-width: 100%;
}

.graph-container {
  border: 1px solid #e5e7eb;
  max-height: 1000px;
}

@media (max-width: 640px) {
  .graph-container {
    max-height: 600px;
  }
}

svg {
  display: block;
  user-select: none;
}

.node {
  transition: all 0.3s ease;
}

.node circle {
  cursor: pointer;
  transition: all 0.2s ease;
}

.node:hover circle {
  fill: #eff6ff;
  stroke: #3b82f6;
  stroke-width: 3;
}

.node:hover text {
  font-weight: 700;
  fill: #1e40af;
}

@media (min-width: 640px) {
  .node:hover text {
    font-size: 10px;
  }
}

.node-label {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Sans", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif;
}

/* Selection states */
.node.selected circle {
  fill: #fef3c7;
  stroke: #f59e0b;
  stroke-width: 3;
  filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.6));
}

.node.selected text {
  font-weight: 700;
  fill: #92400e;
}

@media (min-width: 640px) {
  .node.selected text {
    font-size: 9px;
  }
}

.node.connected circle {
  fill: #dbeafe;
  stroke: #2563eb;
  stroke-width: 2.5;
}

.node.connected text {
  font-weight: 600;
  fill: #1e40af;
}

@media (min-width: 640px) {
  .node.connected text {
    font-size: 8px;
  }
}

/* Search matched state */
.node.search-matched circle {
  fill: #dcfce7;
  stroke: #16a34a;
  stroke-width: 3;
  filter: drop-shadow(0 0 10px rgba(22, 163, 74, 0.7));
  animation: pulse-green 1.5s ease-in-out infinite;
}

.node.search-matched text {
  font-weight: 700;
  fill: #166534;
}

@media (min-width: 640px) {
  .node.search-matched text {
    font-size: 9px;
  }
}

@keyframes pulse-green {
  0%, 100% {
    filter: drop-shadow(0 0 10px rgba(22, 163, 74, 0.7));
  }
  50% {
    filter: drop-shadow(0 0 20px rgba(22, 163, 74, 1));
  }
}

.node.dimmed {
  transition: all 0.3s ease;
}

.cursor-grab {
  cursor: grab;
}

.cursor-grabbing {
  cursor: grabbing;
}

.pointer-events-none {
  pointer-events: none;
}

.select-none {
  user-select: none;
}

/* Node Information Panel */
.node-info-panel {
  animation: slideInFromLeft 0.3s ease-out;
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.98);
  max-height: 600px;
  overflow-y: auto;
}

.node-info-panel::-webkit-scrollbar {
  width: 6px;
}

.node-info-panel::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.node-info-panel::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.node-info-panel::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

@keyframes slideInFromLeft {
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Minimap */
.minimap {
  display: block;
}

.minimap:hover {
  opacity: 0.9;
}

</style>
