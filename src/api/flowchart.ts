import { api } from './client'
import type { ContentFlowchart, FlowNodePriority, FlowNodeStatus } from '../types'

export function generateFlowchart(strategyId: string): Promise<ContentFlowchart> {
  return api.post<{ flowchart: ContentFlowchart }>(`/strategies/${strategyId}/flowchart`).then((r) => r.flowchart)
}

export function getFlowchartByStrategy(strategyId: string): Promise<ContentFlowchart> {
  return api.get<{ flowchart: ContentFlowchart }>(`/strategies/${strategyId}/flowchart`).then((r) => r.flowchart)
}

export function getFlowchart(id: string): Promise<ContentFlowchart> {
  return api.get<{ flowchart: ContentFlowchart }>(`/flowcharts/${id}`).then((r) => r.flowchart)
}

export function updateFlowchartNode(
  flowchartId: string,
  nodeId: string,
  input: { status?: FlowNodeStatus; priority?: FlowNodePriority; effort?: 'low' | 'medium' | 'high' },
): Promise<ContentFlowchart> {
  return api.patch<{ flowchart: ContentFlowchart }>(`/flowcharts/${flowchartId}/nodes/${nodeId}`, input).then((r) => r.flowchart)
}

export function approveFlowchart(id: string): Promise<ContentFlowchart> {
  return api.post<{ flowchart: ContentFlowchart }>(`/flowcharts/${id}/approve`).then((r) => r.flowchart)
}
