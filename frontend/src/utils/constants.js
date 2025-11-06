export const AGGREGATOR_TYPES = {
  UBER: 'uber',
  RAPPI: 'rappi',
  PEDIDOSYA: 'pedidosya',
};

export const AGGREGATOR_NAMES = {
  uber: 'Uber Eats',
  rappi: 'Rappi',
  pedidosya: 'PedidosYa',
};

export const AGGREGATOR_COLORS = {
  uber: 'bg-black',
  rappi: 'bg-orange-500',
  pedidosya: 'bg-red-500',
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  SYNCED: 'synced',
  ERROR: 'error',
};

export const ORDER_STATUS_LABELS = {
  pending: 'Pendiente',
  synced: 'Sincronizada',
  error: 'Error',
};

export const ORDER_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  synced: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
};

export const SYNC_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  PARTIAL: 'partial',
};

export const SYNC_STATUS_LABELS = {
  success: 'Exitosa',
  error: 'Error',
  partial: 'Parcial',
};
