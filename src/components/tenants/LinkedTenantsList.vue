<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
import { VueFlow, MarkerType, Handle, Position } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { MiniMap } from "@vue-flow/minimap";
import { BaseButton, ToggleSwitch } from "@/components/base";
import CreateLinkedTenantModal from "./CreateLinkedTenantModal.vue";
import type { Tenant, LinkedTenant } from "@/types/tenant";

interface Props {
  tenantId: string;
  linkedTenants: LinkedTenant[];
  allTenants?: Tenant[];
  loading?: boolean;
  currentTenantName?: string;
}

interface Emits {
  (e: "toggle-realtime", linkedTenant: LinkedTenant): void;
  (e: "delete", linkedTenant: LinkedTenant): void;
  (e: "create", selectedTenant: Tenant, realtime: boolean): void;
  (e: "load-tenants"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isModalOpen = ref(false);
const availableTenants = ref<Tenant[]>([]);
const selectedNode = ref<string | null>(null);
const viewMode = ref<"graph" | "list">("graph");

// Handle new connection from drag
const onConnect = (params: any) => {
  const sourceNode = nodes.value.find(n => n.id === params.source);
  const targetNode = nodes.value.find(n => n.id === params.target);
  
  if (!sourceNode || !targetNode) return;
  
  const sourceName = sourceNode.data.label;
  const targetName = targetNode.data.label;
  
  // Show confirmation dialog
  const confirmed = confirm(
    `リンクを作成しますか？\n\n` +
    `元: ${sourceName}\n` +
    `先: ${targetName}\n\n` +
    `※ 現在はデモモードです。実際のリンクは作成されません。`
  );
  
  if (confirmed) {
    console.log('Creating connection:', {
      source: params.source,
      target: params.target,
      sourceNode: sourceName,
      targetNode: targetName,
    });
    
    // Here you would call API to create the link
    // emit("create-link", { sourceId: params.source, targetId: params.target });
    
    alert('✅ リンクが作成されました（デモモード）\n\n実際の実装では、ここでAPIを呼び出してリンクを保存します。');
  }
};

// Expanded nodes state - tracks which nodes have their children visible
// Initialize immediately with tenantId so first render shows 2 levels
const expandedNodes = ref<Set<string>>(new Set());

// Initialize with first 2 levels expanded
const initializeExpandedNodes = () => {
  expandedNodes.value = new Set([props.tenantId]);
  if (useFakeData.value) {
    // Expand level 1 nodes
    fakeTreeData.value.forEach(node => {
      if (node.level === 1) {
        expandedNodes.value.add(node.id);
      }
    });
  }
};

// Toggle expand/collapse for a node
const toggleNodeExpand = (nodeId: string) => {
  if (expandedNodes.value.has(nodeId)) {
    // Collapse: remove this node and all its descendants
    expandedNodes.value.delete(nodeId);
    const descendants = getDescendants(nodeId);
    descendants.forEach(id => expandedNodes.value.delete(id));
  } else {
    // Expand: add this node
    expandedNodes.value.add(nodeId);
  }
};

// Get all descendants of a node
const getDescendants = (nodeId: string): string[] => {
  const result: string[] = [];
  const children = fakeTreeData.value.filter(n => n.parentId === nodeId);
  children.forEach(child => {
    result.push(child.id);
    result.push(...getDescendants(child.id));
  });
  return result;
};

// Check if a node should be visible based on parent's expanded state
const isNodeVisible = (node: TreeNode): boolean => {
  if (node.parentId === 'root') {
    // Level 1 nodes - check if root is expanded
    const visible = expandedNodes.value.has(props.tenantId);
    console.log(`🔍 isNodeVisible(${node.id}): parentId='root', tenantId=${props.tenantId}, expanded=${visible}`);
    return visible;
  }
  // Other levels - check if parent is expanded
  if (!node.parentId) return false;
  return expandedNodes.value.has(node.parentId);
};

// Check if a node has children
const hasChildren = (nodeId: string): boolean => {
  // For root node, check if any node has parentId === 'root'
  if (nodeId === props.tenantId) {
    return fakeTreeData.value.some(n => n.parentId === 'root');
  }
  return fakeTreeData.value.some(n => n.parentId === nodeId);
};

// Expand all nodes
const expandAll = () => {
  expandedNodes.value = new Set([props.tenantId]);
  fakeTreeData.value.forEach(node => {
    expandedNodes.value.add(node.id);
  });
};

// Collapse all nodes (keep only first 2 levels)
const collapseAll = () => {
  initializeExpandedNodes();
};

// Fake data for development - Multi-level tree structure
const useFakeData = ref(true);

// Define tree structure with parent-child relationships
interface TreeNode {
  id: string;
  name: string;
  address: string;
  parentId: string | null;
  realtime: boolean;
  level: number;
}

const fakeTreeData = ref<TreeNode[]>([
  // Level 1 - Direct children of root
  { id: "tenant-001", name: "鈴木マリン", address: "東京都千代田区", parentId: "root", realtime: true, level: 1 },
  { id: "tenant-002", name: "宮崎フィッシング", address: "東京都港区", parentId: "root", realtime: false, level: 1 },
  { id: "tenant-003", name: "山田水産", address: "東京都渋谷区", parentId: "root", realtime: true, level: 1 },
  
  // Level 2 - Children of tenant-001
  { id: "tenant-001-1", name: "鈴木支部A", address: "千葉県船橋市", parentId: "tenant-001", realtime: true, level: 2 },
  { id: "tenant-001-2", name: "鈴木支部B", address: "埼玉県さいたま市", parentId: "tenant-001", realtime: false, level: 2 },
  { id: "tenant-001-3", name: "鈴木支部C", address: "神奈川県横浜市", parentId: "tenant-001", realtime: true, level: 2 },
  
  // Level 2 - Children of tenant-002
  { id: "tenant-002-1", name: "宮崎営業所1", address: "静岡県静岡市", parentId: "tenant-002", realtime: false, level: 2 },
  { id: "tenant-002-2", name: "宮崎営業所2", address: "愛知県名古屋市", parentId: "tenant-002", realtime: true, level: 2 },
  { id: "tenant-002-3", name: "宮崎営業所3", address: "三重県津市", parentId: "tenant-002", realtime: false, level: 2 },
  { id: "tenant-002-4", name: "宮崎営業所4", address: "岐阜県岐阜市", parentId: "tenant-002", realtime: true, level: 2 },
  
  // Level 2 - Children of tenant-003
  { id: "tenant-003-1", name: "山田支店1", address: "大阪府大阪市", parentId: "tenant-003", realtime: true, level: 2 },
  { id: "tenant-003-2", name: "山田支店2", address: "京都府京都市", parentId: "tenant-003", realtime: false, level: 2 },
  { id: "tenant-003-3", name: "山田支店3", address: "兵庫県神戸市", parentId: "tenant-003", realtime: true, level: 2 },
  
  // Level 3 - Children of tenant-001-1
  { id: "tenant-001-1-1", name: "鈴木A-1", address: "千葉市中央区", parentId: "tenant-001-1", realtime: true, level: 3 },
  { id: "tenant-001-1-2", name: "鈴木A-2", address: "千葉市花見川区", parentId: "tenant-001-1", realtime: false, level: 3 },
  { id: "tenant-001-1-3", name: "鈴木A-3", address: "千葉市稲毛区", parentId: "tenant-001-1", realtime: true, level: 3 },
  
  // Level 3 - Children of tenant-001-2
  { id: "tenant-001-2-1", name: "鈴木B-1", address: "さいたま市大宮区", parentId: "tenant-001-2", realtime: false, level: 3 },
  { id: "tenant-001-2-2", name: "鈴木B-2", address: "さいたま市浦和区", parentId: "tenant-001-2", realtime: true, level: 3 },
  
  // Level 3 - Children of tenant-002-1
  { id: "tenant-002-1-1", name: "宮崎1-A", address: "静岡市葵区", parentId: "tenant-002-1", realtime: true, level: 3 },
  { id: "tenant-002-1-2", name: "宮崎1-B", address: "静岡市駿河区", parentId: "tenant-002-1", realtime: false, level: 3 },
  { id: "tenant-002-1-3", name: "宮崎1-C", address: "静岡市清水区", parentId: "tenant-002-1", realtime: true, level: 3 },
  
  // Level 3 - Children of tenant-003-1
  { id: "tenant-003-1-1", name: "山田1-A", address: "大阪市北区", parentId: "tenant-003-1", realtime: false, level: 3 },
  { id: "tenant-003-1-2", name: "山田1-B", address: "大阪市中央区", parentId: "tenant-003-1", realtime: true, level: 3 },
  { id: "tenant-003-1-3", name: "山田1-C", address: "大阪市西区", parentId: "tenant-003-1", realtime: false, level: 3 },
  { id: "tenant-003-1-4", name: "山田1-D", address: "大阪市天王寺区", parentId: "tenant-003-1", realtime: true, level: 3 },
  
  // Level 4 - Children of tenant-001-1-1
  { id: "tenant-001-1-1-1", name: "鈴木A-1-α", address: "千葉市中央区本町", parentId: "tenant-001-1-1", realtime: true, level: 4 },
  { id: "tenant-001-1-1-2", name: "鈴木A-1-β", address: "千葉市中央区新町", parentId: "tenant-001-1-1", realtime: false, level: 4 },
  { id: "tenant-001-1-1-3", name: "鈴木A-1-γ", address: "千葉市中央区栄町", parentId: "tenant-001-1-1", realtime: true, level: 4 },
  
  // Level 4 - Children of tenant-002-1-1
  { id: "tenant-002-1-1-1", name: "宮崎A-α", address: "静岡市葵区呉服町", parentId: "tenant-002-1-1", realtime: false, level: 4 },
  { id: "tenant-002-1-1-2", name: "宮崎A-β", address: "静岡市葵区紺屋町", parentId: "tenant-002-1-1", realtime: true, level: 4 },
  
  // Level 4 - Children of tenant-003-1-2
  { id: "tenant-003-1-2-1", name: "山田B-α", address: "大阪市中央区本町", parentId: "tenant-003-1-2", realtime: true, level: 4 },
  { id: "tenant-003-1-2-2", name: "山田B-β", address: "大阪市中央区船場", parentId: "tenant-003-1-2", realtime: false, level: 4 },
  { id: "tenant-003-1-2-3", name: "山田B-γ", address: "大阪市中央区心斎橋", parentId: "tenant-003-1-2", realtime: true, level: 4 },
  { id: "tenant-003-1-2-4", name: "山田B-δ", address: "大阪市中央区難波", parentId: "tenant-003-1-2", realtime: false, level: 4 },
]);

// Convert tree data to LinkedTenant format for backward compatibility
const fakeLinkedTenants = computed(() => {
  return fakeTreeData.value.map((node, index) => ({
    id: `link-${index}`,
    tenantId: node.parentId === 'root' ? props.tenantId : (node.parentId || props.tenantId),
    linkedTenantId: node.id,
    realtime: node.realtime,
    createdAt: Date.now(),
    createdBy: "user-1",
    tenant: {
      id: node.id,
      name: node.name,
      address: node.address,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      topicArn: `arn:aws:sns:ap-northeast-1:123456789012:${node.id}`,
    },
  }));
});

// Create nodes and edges for the graph
const nodes = computed(() => {
  // Ensure expandedNodes is initialized on first render
  if (expandedNodes.value.size === 0 && useFakeData.value) {
    expandedNodes.value = new Set([props.tenantId]);
    fakeTreeData.value.forEach(node => {
      if (node.level === 1) {
        expandedNodes.value.add(node.id);
      }
    });
  }
  
  const result = [];
  
  // Use fake data if enabled, otherwise use real data
  const dataToUse = useFakeData.value ? fakeLinkedTenants.value : props.linkedTenants;
  
  // Tree layout configuration
  const NODE_WIDTH = 180;
  const HORIZONTAL_SPACING = 40;
  const VERTICAL_SPACING = 180; // Increased from 140 to 180 for better spacing
  
  // Build tree structure
  const nodeMap = new Map<string, TreeNode>();
  if (useFakeData.value) {
    fakeTreeData.value.forEach(node => nodeMap.set(node.id, node));
  }
  
  // Group nodes by level and parent
  const nodesByLevel = new Map<number, TreeNode[]>();
  const childrenByParent = new Map<string, TreeNode[]>();
  
  if (useFakeData.value) {
    fakeTreeData.value.forEach(node => {
      // Group by level
      if (!nodesByLevel.has(node.level)) {
        nodesByLevel.set(node.level, []);
      }
      nodesByLevel.get(node.level)!.push(node);
      
      // Group by parent
      const parentId = node.parentId === 'root' ? props.tenantId : (node.parentId || props.tenantId);
      if (!childrenByParent.has(parentId)) {
        childrenByParent.set(parentId, []);
      }
      childrenByParent.get(parentId)!.push(node);
    });
  }
  
  // Calculate positions recursively - only for visible nodes
  const positions = new Map<string, { x: number; y: number }>();
  let globalX = 50; // Starting X position
  
  const calculatePositions = (nodeId: string, level: number): number => {
    // Only process children that should be visible
    const allChildren = childrenByParent.get(nodeId) || [];
    const children = allChildren.filter(child => isNodeVisible(child));
    
    if (children.length === 0) {
      // Leaf node or collapsed node
      const x = globalX;
      const y = 50 + level * VERTICAL_SPACING;
      positions.set(nodeId, { x, y });
      globalX += NODE_WIDTH + HORIZONTAL_SPACING;
      return x;
    }
    
    // Calculate positions for children first
    let minX = Infinity;
    let maxX = -Infinity;
    
    children.forEach(child => {
      const childX = calculatePositions(child.id, level + 1);
      minX = Math.min(minX, childX);
      maxX = Math.max(maxX, childX);
    });
    
    // Position parent at the center of its children
    const x = (minX + maxX) / 2;
    const y = 50 + level * VERTICAL_SPACING;
    positions.set(nodeId, { x, y });
    
    return x;
  };
  
  // Calculate position for root
  if (useFakeData.value) {
    calculatePositions(props.tenantId, 0);
  }
  
  // Create root node
  const rootPos = positions.get(props.tenantId) || { x: 400, y: 50 };
  const rootHasChildren = false; // Root node should not show expand/collapse button
  const rootIsExpanded = expandedNodes.value.has(props.tenantId);
  
  result.push({
    id: props.tenantId,
    type: "custom",
    position: rootPos,
    data: {
      label: props.currentTenantName || "メインテナント",
      address: "",
      isCenter: true,
      tenantId: props.tenantId,
      level: 0,
      hasChildren: rootHasChildren,
      isExpanded: rootIsExpanded,
      onToggleExpand: () => toggleNodeExpand(props.tenantId),
    },
    // Enable connections
    connectable: true,
    sourcePosition: 'bottom' as any,
    targetPosition: 'top' as any,
    style: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      border: "3px solid #5a67d8",
      borderRadius: "12px",
      padding: "16px",
      width: `${NODE_WIDTH}px`,
      fontSize: "13px",
      fontWeight: "bold",
      boxShadow: "0 10px 25px rgba(102, 126, 234, 0.3)",
    },
  });

  // Create child nodes
  if (useFakeData.value) {
    fakeTreeData.value.forEach(node => {
      // Only show visible nodes
      if (!isNodeVisible(node)) return;
      
      const pos = positions.get(node.id) || { x: 0, y: 0 };
      const nodeHasChildren = hasChildren(node.id);
      const nodeIsExpanded = expandedNodes.value.has(node.id);
      
      // Color based on level
      const levelColors = [
        { bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", border: "#e91e63" }, // Level 1
        { bg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", border: "#03a9f4" }, // Level 2
        { bg: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", border: "#00bfa5" }, // Level 3
        { bg: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", border: "#ff6090" }, // Level 4
      ];
      
      const colorIndex = Math.min(node.level - 1, levelColors.length - 1);
      const colors = node.realtime 
        ? { bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", border: "#e91e63" }
        : (levelColors[colorIndex] || levelColors[0]);
      
      result.push({
        id: node.id,
        type: "custom",
        position: pos,
        data: {
          label: node.name,
          address: node.address,
          realtime: node.realtime,
          linkedTenant: dataToUse.find(lt => lt.linkedTenantId === node.id),
          isCenter: false,
          tenantId: node.id,
          level: node.level,
          hasChildren: nodeHasChildren,
          isExpanded: nodeIsExpanded,
          onToggleExpand: () => toggleNodeExpand(node.id),
        },
        // Enable connections for all nodes
        connectable: true,
        sourcePosition: 'bottom' as any,
        targetPosition: 'top' as any,
        style: {
          background: colors?.bg || "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          color: "white",
          border: `2px solid ${colors?.border || "#03a9f4"}`,
          borderRadius: "10px",
          padding: "12px",
          width: `${NODE_WIDTH}px`,
          fontSize: "12px",
          fontWeight: "600",
          boxShadow: "0 6px 16px rgba(0, 0, 0, 0.12)",
          cursor: "pointer",
        },
      });
    });
  } else {
    // Original simple layout for real data
    const linkedCount = dataToUse.length;
    const totalWidth = linkedCount * (NODE_WIDTH + HORIZONTAL_SPACING) - HORIZONTAL_SPACING;
    const startX = Math.max(50, (1000 - totalWidth) / 2);
    
    dataToUse.forEach((linkedTenant, index) => {
      const x = startX + index * (NODE_WIDTH + HORIZONTAL_SPACING);
      const y = 50 + VERTICAL_SPACING;

      result.push({
        id: linkedTenant.linkedTenantId,
        type: "custom",
        position: { x, y },
        data: {
          label: linkedTenant.tenant.name,
          address: linkedTenant.tenant.address,
          realtime: linkedTenant.realtime,
          linkedTenant: linkedTenant,
          isCenter: false,
          tenantId: linkedTenant.linkedTenantId,
          level: 1,
        },
        style: {
          background: linkedTenant.realtime
            ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            : "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          color: "white",
          border: `2px solid ${linkedTenant.realtime ? "#e91e63" : "#03a9f4"}`,
          borderRadius: "12px",
          padding: "16px",
          width: `${NODE_WIDTH}px`,
          fontSize: "13px",
          fontWeight: "600",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
          cursor: "pointer",
        },
      });
    });
  }

  return result;
});

const edges = computed(() => {
  const result: any[] = [];
  
  if (useFakeData.value) {
    // Create edges based on parent-child relationships
    // Only show edges for visible nodes
    fakeTreeData.value.forEach(node => {
      if (!isNodeVisible(node)) return; // Skip if node is not visible
      
      const sourceId = node.parentId === 'root' ? props.tenantId : (node.parentId || props.tenantId);
      const targetId = node.id;
      
      result.push({
        id: `${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
        type: 'default', // Use default (bezier) to avoid overlapping better than step
        animated: node.realtime,
        style: {
          stroke: node.realtime ? "#f5576c" : "#00f2fe",
          strokeWidth: 2.5,
        },
        label: node.realtime ? "⚡" : "",
        labelStyle: {
          fill: "#666",
          fontSize: "14px",
          fontWeight: "600",
        },
        labelBgStyle: {
          fill: "white",
          fillOpacity: 0.95,
          rx: 4,
          ry: 4,
        },
        labelBgPadding: [4, 4] as [number, number],
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: node.realtime ? "#f5576c" : "#00f2fe",
          width: 20,
          height: 20,
        },
      });
    });
  } else {
    // Original edges for real data
    const dataToUse = props.linkedTenants;
    dataToUse.forEach(linkedTenant => {
      result.push({
        id: `${props.tenantId}-${linkedTenant.linkedTenantId}`,
        source: props.tenantId,
        target: linkedTenant.linkedTenantId,
        type: 'smoothstep',
        animated: linkedTenant.realtime,
        style: {
          stroke: linkedTenant.realtime ? "#f5576c" : "#00f2fe",
          strokeWidth: 3,
        },
        label: linkedTenant.realtime ? "⚡ 即時通知" : "",
        labelStyle: {
          fill: "#666",
          fontSize: "11px",
          fontWeight: "600",
        },
        labelBgStyle: {
          fill: "white",
          fillOpacity: 0.9,
          rx: 4,
          ry: 4,
        },
        labelBgPadding: [8, 4] as [number, number],
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: linkedTenant.realtime ? "#f5576c" : "#00f2fe",
        },
      });
    });
  }
  
  return result;
});

const handleNodeClick = (event: any) => {
  const nodeId = event.node.id;
  if (nodeId !== props.tenantId) {
    selectedNode.value = nodeId;
  }
};

const getSelectedLinkedTenant = computed(() => {
  if (!selectedNode.value) return null;
  const dataToUse = useFakeData.value ? fakeLinkedTenants.value : props.linkedTenants;
  return dataToUse.find(
    (lt) => lt.linkedTenantId === selectedNode.value
  );
});

const handleToggleRealtime = (linkedTenant: LinkedTenant) => {
  emit("toggle-realtime", linkedTenant);
};

const handleDeleteLinkedTenant = (linkedTenant: LinkedTenant) => {
  emit("delete", linkedTenant);
  selectedNode.value = null;
};

const handleOpenCreateModal = () => {
  isModalOpen.value = true;

  if (props.allTenants && props.allTenants.length > 0) {
    availableTenants.value = props.allTenants;
  } else {
    availableTenants.value = [];
    emit("load-tenants");
  }
};

watch(
  () => props.allTenants,
  (newValue) => {
    if (newValue && newValue.length > 0) {
      availableTenants.value = newValue;
    }
  }
);

const handleCloseModal = () => {
  isModalOpen.value = false;
  availableTenants.value = [];
};

const handleCreateLinkedTenant = (
  selectedTenant: Tenant,
  realtime: boolean
) => {
  emit("create", selectedTenant, realtime);
  isModalOpen.value = false;
};

// Initialize expanded nodes on mount
onMounted(() => {
  initializeExpandedNodes();
  console.log('🔍 Mounted - expandedNodes:', Array.from(expandedNodes.value));
  console.log('🔍 Mounted - fakeTreeData level 1:', fakeTreeData.value.filter(n => n.level === 1).map(n => n.id));
});

// Watch useFakeData to reinitialize when toggled
watch(useFakeData, () => {
  initializeExpandedNodes();
});
</script>

<template>
  <div class="w-full bg-white rounded-lg shadow-md overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
      <div class="flex items-center gap-4">
        <h3 class="text-base sm:text-lg font-semibold text-gray-900">
          リンクテナント一覧
          <span class="text-sm font-normal text-gray-500 ml-2">
            ({{ useFakeData ? fakeTreeData.length : linkedTenants.length }}件)
          </span>
        </h3>
        
        <!-- View Mode Toggle -->
        <div class="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            @click="viewMode = 'graph'"
            :class="[
              'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
              viewMode === 'graph'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900',
            ]"
          >
            📊 グラフ
          </button>
          <button
            @click="viewMode = 'list'"
            :class="[
              'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
              viewMode === 'list'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900',
            ]"
          >
            📋 リスト
          </button>
        </div>
        
        <!-- Fake Data Toggle (for development) -->
        <div class="flex items-center gap-2 text-sm">
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              v-model="useFakeData"
              type="checkbox"
              class="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span class="text-gray-600">Fake Data</span>
          </label>
        </div>
      </div>
      
      <BaseButton variant="primary" size="sm" @click="handleOpenCreateModal">
        + 新規作成
      </BaseButton>
    </div>

    <!-- Graph View -->
    <div v-if="viewMode === 'graph'" class="relative" style="height: 600px">
      <!-- Empty State -->
      <div
        v-if="(useFakeData ? fakeTreeData : linkedTenants).length === 0"
        class="absolute inset-0 flex items-center justify-center text-gray-500"
      >
        <div class="text-center">
          <div class="text-5xl mb-4">🔗</div>
          <p class="text-lg font-medium">リンクテナントがありません</p>
          <p class="text-sm mt-2">「+ 新規作成」ボタンからリンクを追加できます</p>
        </div>
      </div>

      <!-- Vue Flow Graph -->
      <VueFlow
        v-else
        :nodes="nodes"
        :edges="edges"
        @node-click="handleNodeClick"
        @connect="onConnect"
        class="vue-flow-container"
        :default-viewport="{ zoom: 0.7, x: 50, y: 20 }"
        :min-zoom="0.1"
        :max-zoom="1.5"
        fit-view-on-init
        :connection-line-style="{ stroke: '#4facfe', strokeWidth: 2 }"
        :default-edge-options="{ 
          type: 'default',
          animated: false,
          style: { stroke: '#4facfe', strokeWidth: 2.5 }
        }"
      >
        <Background pattern-color="#e5e7eb" :gap="16" />
        <Controls />
        <MiniMap node-color="#94a3b8" mask-color="rgba(0, 0, 0, 0.1)" />
        
        <!-- Custom Node Template -->
        <template #node-custom="{ data }">
          <!-- Connection Handles -->
          <Handle 
            type="target" 
            :position="Position.Top" 
            :id="`${data.tenantId}-target`"
            class="connection-handle connection-handle-target"
          />
          
          <div class="relative group">
            <div class="text-center">
              <div class="font-bold mb-1 text-sm">{{ data.label }}</div>
              <div v-if="data.address" class="text-xs opacity-90 mb-2">
                {{ data.address }}
              </div>
              <div v-if="!data.isCenter && data.realtime" class="text-xs mb-1">
                ⚡ 即時通知有効
              </div>
              
              <!-- Expand/Collapse Button -->
              <div 
                v-if="data.hasChildren" 
                class="mt-2 pt-2 border-t border-white/30"
              >
                <button
                  @click.stop="data.onToggleExpand"
                  class="px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-semibold transition-all"
                >
                  {{ data.isExpanded ? '▼ 折りたたむ' : '▶ 展開' }}
                </button>
              </div>
            </div>
          </div>
          
          <Handle 
            type="source" 
            :position="Position.Bottom" 
            :id="`${data.tenantId}-source`"
            class="connection-handle connection-handle-source"
          />
        </template>
      </VueFlow>

      <!-- Controls Panel -->
      <div class="absolute left-4 top-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10">
        <div class="space-y-2">
          <button
            @click="expandAll"
            class="w-full px-3 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition-all"
          >
            🔽 すべて展開
          </button>
          <button
            @click="collapseAll"
            class="w-full px-3 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700 transition-all"
          >
            🔼 すべて折りたたむ
          </button>
        </div>
      </div>

      <!-- Node Details Panel (when node is selected) -->
      <div
        v-if="selectedNode && getSelectedLinkedTenant"
        class="absolute right-4 top-4 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 z-10"
      >
        <div class="flex items-start justify-between mb-3">
          <h4 class="text-base font-semibold text-gray-900">
            {{ getSelectedLinkedTenant.tenant.name }}
          </h4>
          <button
            @click="selectedNode = null"
            class="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div class="space-y-3 text-sm">
          <div>
            <span class="text-gray-600">住所:</span>
            <p class="text-gray-900 mt-1">
              {{ getSelectedLinkedTenant.tenant.address }}
            </p>
          </div>

          <div>
            <span class="text-gray-600">テナントID:</span>
            <p class="text-gray-900 mt-1 font-mono text-xs break-all">
              {{ getSelectedLinkedTenant.tenant.id }}
            </p>
          </div>

          <div class="pt-3 border-t border-gray-200">
            <div class="flex items-center justify-between mb-3">
              <span class="text-gray-700 font-medium">即時通知連携</span>
              <ToggleSwitch
                :model-value="getSelectedLinkedTenant.realtime"
                @update:model-value="handleToggleRealtime(getSelectedLinkedTenant)"
              />
            </div>

            <BaseButton
              variant="danger"
              size="sm"
              class="w-full"
              @click="handleDeleteLinkedTenant(getSelectedLinkedTenant)"
            >
              削除
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- List View -->
    <div v-else class="p-4 sm:p-6">
      <!-- Empty State -->
      <div
        v-if="(useFakeData ? fakeTreeData : linkedTenants).length === 0"
        class="text-center py-8 text-gray-500"
      >
        リンクテナントがありません
      </div>

      <!-- Linked Tenants List -->
      <div v-else class="space-y-4">
        <div
          v-for="linkedTenant in (useFakeData ? fakeLinkedTenants : linkedTenants)"
          :key="linkedTenant.id"
          class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <!-- Card Header -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <h4 class="text-start text-base font-semibold text-gray-900 mb-1">
                {{ linkedTenant.tenant.name }}
              </h4>
              <p class="text-start text-sm text-gray-600">
                {{ linkedTenant.tenant.address }}
              </p>
            </div>
          </div>

          <!-- Card Details -->
          <div class="space-y-2 mb-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div class="text-start">
                <span class="text-gray-600">テナントID:</span>
                <span class="ml-2 text-gray-900 font-mono text-xs break-all">
                  {{ linkedTenant.tenant.id }}
                </span>
              </div>
            </div>
          </div>

          <!-- Card Actions -->
          <div
            class="flex items-center justify-between pt-3 border-t border-gray-200"
          >
            <!-- Realtime Toggle -->
            <div class="flex items-center gap-x-3">
              <ToggleSwitch
                :model-value="linkedTenant.realtime"
                @update:model-value="handleToggleRealtime(linkedTenant)"
              />
              <span class="text-sm" v-if="linkedTenant.realtime">
                <span
                  :class="[
                    'ml-2',
                    linkedTenant.realtime ? 'text-primary' : 'text-gray-500',
                  ]"
                >
                  即時通知連携
                </span>
              </span>
            </div>

            <!-- Delete Button -->
            <BaseButton
              variant="danger"
              size="sm"
              @click="handleDeleteLinkedTenant(linkedTenant)"
            >
              削除
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Linked Tenant Modal -->
    <CreateLinkedTenantModal
      :is-open="isModalOpen"
      :tenants="availableTenants"
      :current-tenant-id="tenantId"
      :loading="loading || false"
      @close="handleCloseModal"
      @select="handleCreateLinkedTenant"
    />
  </div>
</template>

<style scoped>
.vue-flow-container {
  background: linear-gradient(to bottom, #f9fafb 0%, #f3f4f6 100%);
}

:deep(.vue-flow__node) {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

:deep(.vue-flow__node:hover) {
  transform: scale(1.05);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2) !important;
}

:deep(.vue-flow__edge-path) {
  stroke-width: 2;
}

:deep(.vue-flow__edge-path) {
  stroke-width: 2.5;
  transition: stroke-width 0.2s ease;
}

:deep(.vue-flow__edge:hover .vue-flow__edge-path) {
  stroke-width: 3.5;
}

:deep(.vue-flow__edge.animated .vue-flow__edge-path) {
  stroke-dasharray: 5;
  animation: dashdraw 0.5s linear infinite;
}

@keyframes dashdraw {
  to {
    stroke-dashoffset: -10;
  }
}

:deep(.vue-flow__controls) {
  button {
    background: white;
    border: 1px solid #e5e7eb;
    transition: all 0.2s;
  }
  
  button:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
  }
}

/* Connection Handles Styling */
:deep(.vue-flow__handle) {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #4facfe;
  border: 2px solid white;
  opacity: 0;
  transition: opacity 0.2s ease;
}

:deep(.vue-flow__node:hover .vue-flow__handle) {
  opacity: 1;
}

:deep(.vue-flow__handle.connecting) {
  opacity: 1;
  background: #f5576c;
  transform: scale(1.2);
}

:deep(.vue-flow__handle-top) {
  top: -6px;
}

:deep(.vue-flow__handle-bottom) {
  bottom: -6px;
}

/* Connection line styling */
:deep(.vue-flow__connection-path) {
  stroke: #4facfe;
  stroke-width: 2.5;
  stroke-dasharray: 5;
  animation: dashdraw 0.5s linear infinite;
}
</style>

