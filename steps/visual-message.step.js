export const config = {
    name: 'SMSUplink',
    type: 'noop',
    description: "Satellite Uplink to Real-World Admin",
    virtualSubscribes: ['notify.message'], 
    virtualEmits: [],
    flows: ['prolepsis-main']
  };
  
  export const handler = async () => {};