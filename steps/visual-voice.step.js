export const config = {
    name: 'CommandInput',
    type: 'noop', 
    description: "Captain's Voice Protocol / Dashboard Clicks",
    virtualEmits: ['mission.start', 'admin.override'], 
    virtualSubscribes: [],
    flows: ['prolepsis-main']
  };
  
  
  export const handler = async () => {};