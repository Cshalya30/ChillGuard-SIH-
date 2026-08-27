import { create } from 'zustand';
import { Shipment, Alert, AnalyticsSummary } from '../types';

interface AppState {
  shipments: Shipment[];
  alerts: Alert[];
  summary: AnalyticsSummary | null;
  selectedShipmentId: string | null;
  statusFilter: string;
  typeFilter: string;
  searchQuery: string;
  setShipments: (shipments: Shipment[]) => void;
  updateShipment: (updated: Partial<Shipment> & { id: string }) => void;
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (alertId: number, acknowledgedBy: string) => void;
  setSummary: (summary: AnalyticsSummary) => void;
  setSelectedShipmentId: (id: string | null) => void;
  setStatusFilter: (filter: string) => void;
  setTypeFilter: (filter: string) => void;
  setSearchQuery: (query: string) => void;
}

export const useStore = create<AppState>((set) => ({
  shipments: [],
  alerts: [],
  summary: null,
  selectedShipmentId: null,
  statusFilter: 'all',
  typeFilter: 'all',
  searchQuery: '',

  setShipments: (shipments) => set({ shipments }),

  updateShipment: (updated) =>
    set((state) => ({
      shipments: state.shipments.map((s) => (s.id === updated.id ? { ...s, ...updated } : s))
    })),

  setAlerts: (alerts) => set({ alerts }),

  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts.filter((a) => a.id !== alert.id)]
    })),

  acknowledgeAlert: (alertId, acknowledgedBy) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, acknowledged: 1, acknowledged_by: acknowledgedBy } : a
      )
    })),

  setSummary: (summary) => set({ summary }),

  setSelectedShipmentId: (selectedShipmentId) => set({ selectedShipmentId }),

  setStatusFilter: (statusFilter) => set({ statusFilter }),

  setTypeFilter: (typeFilter) => set({ typeFilter }),

  setSearchQuery: (searchQuery) => set({ searchQuery })
}));
