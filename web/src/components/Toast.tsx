import { useApp } from '../mocks/store';

export function Toast() {
  const { toastMessage } = useApp();
  if (!toastMessage) return null;
  return <div className="toast">{toastMessage}</div>;
}
