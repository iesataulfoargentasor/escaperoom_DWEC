import { Component, type ReactNode } from 'react';
export class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <main className="shell"><h1>No se pudo mostrar el laboratorio</h1><p>Recarga la página. El último guardado local puede recuperarse.</p><button onClick={() => location.reload()}>Recargar</button></main>;
    return this.props.children;
  }
}
