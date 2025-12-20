export const config = {
    name: 'HoloDeck_UI',
    type: 'noop',
    description: "Leaflet Map & Comms Overlay",
    virtualSubscribes: ['system.state_updated', 'ui.comms_log'],
    virtualEmits: [],
    flows: ['prolepsis-main']
  };
  
  export const handler = async () => {};