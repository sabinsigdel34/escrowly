export function shortAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function sameAddress(a, b) {
  return a && b && a.toLowerCase() === b.toLowerCase();
}

export function formatDate(timestamp) {
  const value = Number(timestamp);
  if (!value) return "Open";
  return new Date(value * 1000).toLocaleString();
}

export function getErrorMessage(error) {
  return (
    error?.shortMessage ||
    error?.reason ||
    error?.info?.error?.message ||
    error?.message ||
    "Transaction failed"
  );
}

