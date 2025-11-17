<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
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

const svgWidth = 1600;
const svgHeight = 1200;
const nodeRadius = 20;

const tenants = ref<Tenant[]>([]);
const connections = ref<Connection[]>([]);

// Pan and Zoom state
const zoom = ref(1);
const panX = ref(0);
const panY = ref(0);
const isPanning = ref(false);
const panStartX = ref(0);
const panStartY = ref(0);

// Drag state
const draggedNode = ref<Tenant | null>(null);
const dragOffsetX = ref(0);
const dragOffsetY = ref(0);

// Selection state
const selectedNode = ref<Tenant | null>(null);

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
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;

  // Initialize random positions
  tenants.value.forEach((tenant, i) => {
    const angle = (i / tenants.value.length) * 2 * Math.PI + Math.random() * 0.5;
    const radius = 250 + Math.random() * 200;
    tenant.x = centerX + radius * Math.cos(angle);
    tenant.y = centerY + radius * Math.sin(angle);
  });

  // Force-directed layout parameters
  const iterations = 300;
  const repulsionStrength = 12000;
  const attractionStrength = 0.004;
  const dampening = 0.8;
  const minDistance = 80;

  // Velocity for each node
  const velocities = tenants.value.map(() => ({ vx: 0, vy: 0 }));

  // Run simulation
  for (let iter = 0; iter < iterations; iter++) {
    // Reset forces
    const forces = tenants.value.map(() => ({ fx: 0, fy: 0 }));

    // Repulsion between all nodes
    for (let i = 0; i < tenants.value.length; i++) {
      for (let j = i + 1; j < tenants.value.length; j++) {
        const dx = tenants.value[j].x - tenants.value[i].x;
        const dy = tenants.value[j].y - tenants.value[i].y;
        const distSq = Math.max(dx * dx + dy * dy, 1);
        const dist = Math.sqrt(distSq);

        if (dist < 0.01) continue; // Skip if too close

        const force = repulsionStrength / distSq;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        forces[i].fx -= fx;
        forces[i].fy -= fy;
        forces[j].fx += fx;
        forces[j].fy += fy;
      }
    }

    // Attraction along edges
    connections.value.forEach((conn) => {
      const fromIdx = tenants.value.findIndex((t) => t.id === conn.from);
      const toIdx = tenants.value.findIndex((t) => t.id === conn.to);

      if (fromIdx !== -1 && toIdx !== -1) {
        const dx = tenants.value[toIdx].x - tenants.value[fromIdx].x;
        const dy = tenants.value[toIdx].y - tenants.value[fromIdx].y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(Math.max(distSq, 0.01));

        if (dist < 0.01) return; // Skip if too close

        const idealDistance = 250;
        const force = (dist - idealDistance) * attractionStrength;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        forces[fromIdx].fx += fx;
        forces[fromIdx].fy += fy;
        forces[toIdx].fx -= fx;
        forces[toIdx].fy -= fy;
      }
    });

    // Gravity towards center (weak)
    tenants.value.forEach((tenant, i) => {
      const dx = centerX - tenant.x;
      const dy = centerY - tenant.y;
      forces[i].fx += dx * 0.002;
      forces[i].fy += dy * 0.002;
    });

    // Update velocities and positions
    tenants.value.forEach((tenant, i) => {
      velocities[i].vx = (velocities[i].vx + forces[i].fx) * dampening;
      velocities[i].vy = (velocities[i].vy + forces[i].fy) * dampening;

      // Limit velocity
      const maxVelocity = 10;
      const velocityMag = Math.sqrt(velocities[i].vx * velocities[i].vx + velocities[i].vy * velocities[i].vy);
      if (velocityMag > maxVelocity) {
        velocities[i].vx = (velocities[i].vx / velocityMag) * maxVelocity;
        velocities[i].vy = (velocities[i].vy / velocityMag) * maxVelocity;
      }

      tenant.x += velocities[i].vx;
      tenant.y += velocities[i].vy;

      // Keep nodes within bounds with padding
      tenant.x = Math.max(100, Math.min(svgWidth - 100, tenant.x));
      tenant.y = Math.max(100, Math.min(svgHeight - 100, tenant.y));

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
  bidirectional: boolean,
  curveDirection: "up" | "down" | "straight"
): string => {
  const fromNode = tenants.value.find((t) => t.id === fromId);
  const toNode = tenants.value.find((t) => t.id === toId);

  if (!fromNode || !toNode) return "";

  const dx = toNode.x - fromNode.x;
  const dy = toNode.y - fromNode.y;
  const angle = Math.atan2(dy, dx);
  const distance = Math.sqrt(dx * dx + dy * dy);

  const fromX = fromNode.x + nodeRadius * Math.cos(angle);
  const fromY = fromNode.y + nodeRadius * Math.sin(angle);
  const toX = toNode.x - (nodeRadius + 5) * Math.cos(angle);
  const toY = toNode.y - (nodeRadius + 5) * Math.sin(angle);

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

// Zoom handlers
const handleWheel = (event: WheelEvent) => {
  event.preventDefault();
  const delta = event.deltaY > 0 ? 0.9 : 1.1;
  const newZoom = Math.max(0.1, Math.min(5, zoom.value * delta));
  zoom.value = newZoom;
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
  } else if (draggedNode.value && svgRef.value) {
    const svgRect = svgRef.value.getBoundingClientRect();
    const x = (event.clientX - svgRect.left - panX.value) / zoom.value;
    const y = (event.clientY - svgRect.top - panY.value) / zoom.value;
    draggedNode.value.x = x - dragOffsetX.value;
    draggedNode.value.y = y - dragOffsetY.value;
  }
};

const handleMouseUp = () => {
  isPanning.value = false;
  draggedNode.value = null;
};

// Node drag handlers
const startNodeDrag = (event: MouseEvent, tenant: Tenant) => {
  event.stopPropagation();
  draggedNode.value = tenant;

  if (svgRef.value) {
    const svgRect = svgRef.value.getBoundingClientRect();
    const x = (event.clientX - svgRect.left - panX.value) / zoom.value;
    const y = (event.clientY - svgRect.top - panY.value) / zoom.value;
    dragOffsetX.value = x - tenant.x;
    dragOffsetY.value = y - tenant.y;
  }
};

// Node click handler for selection
const handleNodeClick = (event: MouseEvent, tenant: Tenant) => {
  event.stopPropagation();
  // Only select if we didn't drag
  if (!draggedNode.value) {
    selectedNode.value = selectedNode.value?.id === tenant.id ? null : tenant;
  }
};

// Reset view
const resetView = () => {
  zoom.value = 1;
  panX.value = 0;
  panY.value = 0;
};

// Reorganize layout
const reorganizeLayout = () => {
  calculateNodePositions();
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

onMounted(() => {
  loadTenantData();
  calculateNodePositions();

  // Add global mouse event listeners
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);
});
</script>

<template>
  <div class="tenant-relationship-graph">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-semibold text-gray-800">テナント関係ネットワーク</h3>

      <!-- Stats -->
      <div class="flex gap-4 text-sm">
        <div class="flex items-center gap-2">
          <span class="font-medium text-gray-600">テナント数:</span>
          <span class="font-bold text-gray-900">{{ stats.totalTenants }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-medium text-gray-600">接続数:</span>
          <span class="font-bold text-gray-900">{{ stats.totalConnections }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-medium text-gray-600">ズーム:</span>
          <span class="font-bold text-gray-900">{{ (zoom * 100).toFixed(0) }}%</span>
        </div>
      </div>
    </div>

    <!-- Search and Legend -->
    <div class="flex justify-between items-center mb-4 gap-4">
      <!-- Search Input -->
      <div class="flex-1 max-w-md">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="テナント名で検索..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div v-if="searchQuery.trim() && searchMatchedTenants.length > 0" class="mt-1 text-xs text-gray-600">
          {{ searchMatchedTenants.length }}件のテナントが見つかりました
        </div>
        <div v-else-if="searchQuery.trim() && searchMatchedTenants.length === 0" class="mt-1 text-xs text-red-600">
          該当するテナントが見つかりません
        </div>
      </div>

      <!-- Legend -->
      <div class="flex gap-6 text-sm">
        <div class="flex items-center gap-2">
          <div class="w-8 h-0.5 bg-red-500"></div>
          <span class="text-gray-700">リアルタイム ({{ stats.realtimeConnections }})</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-8 h-0.5 bg-blue-500 border-dashed" style="border-top: 1px dashed #3b82f6; background: none;"></div>
          <span class="text-gray-700">通常 ({{ stats.normalConnections }})</span>
        </div>
      </div>
    </div>

    <!-- Instructions -->
    <div class="text-gray-500 text-xs italic mb-4">
      💡 スクロールでズーム • 背景をドラッグで移動 • ノードをドラッグで再配置 • ノードをクリックで関係をハイライト
    </div>

    <div class="graph-container bg-white rounded-lg shadow-sm p-6 overflow-hidden relative">
      <!-- Node Information Panel -->
      <div
        v-if="selectedNode"
        class="node-info-panel absolute top-4 left-4 bg-white rounded-lg shadow-lg border-2 border-blue-500 p-4 max-w-sm z-10"
      >
        <div class="flex justify-between items-start mb-3">
          <h4 class="text-base font-bold text-gray-900">{{ selectedNode.label }}</h4>
          <button
            @click="selectedNode = null"
            class="text-gray-400 hover:text-gray-600 transition-colors"
            title="閉じる"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Realtime Connections -->
        <div v-if="selectedNodeConnections.realtime.length > 0" class="mb-3">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-4 h-0.5 bg-red-500"></div>
            <span class="text-sm font-semibold text-red-700">即時通知</span>
            <span class="text-xs text-gray-500">({{ selectedNodeConnections.realtime.length }})</span>
          </div>
          <ul class="space-y-1 ml-6">
            <li
              v-for="(conn, idx) in selectedNodeConnections.realtime"
              :key="`realtime-${idx}`"
              class="text-sm text-gray-700 flex items-start gap-1"
            >
              <span class="text-red-500 text-xs mt-0.5">{{ conn.direction === 'outgoing' ? '→' : '←' }}</span>
              <span>{{ conn.target }}</span>
            </li>
          </ul>
        </div>

        <!-- Normal Connections -->
        <div v-if="selectedNodeConnections.normal.length > 0">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-4 h-0.5 bg-blue-500 border-dashed" style="border-top: 1px dashed #3b82f6; background: none;"></div>
            <span class="text-sm font-semibold text-blue-700">他船通知</span>
            <span class="text-xs text-gray-500">({{ selectedNodeConnections.normal.length }})</span>
          </div>
          <ul class="space-y-1 ml-6">
            <li
              v-for="(conn, idx) in selectedNodeConnections.normal"
              :key="`normal-${idx}`"
              class="text-sm text-gray-700 flex items-start gap-1"
            >
              <span class="text-blue-500 text-xs mt-0.5">{{ conn.direction === 'outgoing' ? '→' : '←' }}</span>
              <span>{{ conn.target }}</span>
            </li>
          </ul>
        </div>

        <!-- No connections message -->
        <div v-if="selectedNodeConnections.realtime.length === 0 && selectedNodeConnections.normal.length === 0" class="text-sm text-gray-500 italic">
          接続がありません
        </div>
      </div>

      <svg
        ref="svgRef"
        :width="svgWidth"
        :height="svgHeight"
        class="mx-auto cursor-grab"
        :class="{ 'cursor-grabbing': isPanning }"
        @wheel="handleWheel"
        @mousedown="handleMouseDown"
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
              @mousedown="startNodeDrag($event, tenant)"
              @click="handleNodeClick($event, tenant)"
            >
              <circle
                :r="nodeRadius"
                fill="#ffffff"
                stroke="#4b5563"
                stroke-width="2"
                class="cursor-move"
              />
              <text
                text-anchor="middle"
                dominant-baseline="middle"
                font-size="8"
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

svg {
  display: block;
  user-select: none;
}

.node {
  transition: all 0.3s ease;
}

.node circle {
  cursor: move;
  transition: all 0.2s ease;
}

.node:hover circle {
  fill: #eff6ff;
  stroke: #3b82f6;
  stroke-width: 3;
}

.node:hover text {
  font-size: 10px;
  font-weight: 700;
  fill: #1e40af;
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
  font-size: 9px;
  fill: #92400e;
}

.node.connected circle {
  fill: #dbeafe;
  stroke: #2563eb;
  stroke-width: 2.5;
}

.node.connected text {
  font-weight: 600;
  font-size: 8px;
  fill: #1e40af;
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
  font-size: 9px;
  fill: #166534;
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

.cursor-move {
  cursor: move;
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
</style>
