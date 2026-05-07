export type IntegrationId = "teams" | "outlook" | "beam";

export const INTEGRATION_STORAGE_KEY = (id: IntegrationId) =>
  `mofa:integration:${id}`;

export type IntegrationClientState = {
  status: "connected";
  connectedAt: string;
  /** e.g. simulated vs oauth — optional */
  source?: "demo" | "oauth";
};

export function getIntegrationState(
  id: IntegrationId,
): IntegrationClientState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(INTEGRATION_STORAGE_KEY(id));
    if (!raw) return null;
    const v = JSON.parse(raw) as IntegrationClientState;
    return v?.status === "connected" ? v : null;
  } catch {
    return null;
  }
}

export function setIntegrationConnected(
  id: IntegrationId,
  opts?: { source?: IntegrationClientState["source"] },
) {
  const payload: IntegrationClientState = {
    status: "connected",
    connectedAt: new Date().toISOString(),
    source: opts?.source,
  };
  localStorage.setItem(INTEGRATION_STORAGE_KEY(id), JSON.stringify(payload));
}

export function clearIntegrationState(id: IntegrationId) {
  localStorage.removeItem(INTEGRATION_STORAGE_KEY(id));
}

const PENDING_KEY = "mofa:integration:pending";

export function setPendingIntegration(id: IntegrationId) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PENDING_KEY, id);
}

export function getPendingIntegration(): IntegrationId | null {
  if (typeof window === "undefined") return null;
  const v = sessionStorage.getItem(PENDING_KEY) as IntegrationId | null;
  if (v === "teams" || v === "outlook" || v === "beam") return v;
  return null;
}

export function clearPendingIntegration() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PENDING_KEY);
}
