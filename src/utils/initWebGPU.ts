const initializeGPUAdapter = async () => {
  if (!navigator.gpu) throw new Error("your browser does not support webGPU.");
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) throw new Error("No appropriate GPUAdapter found.");
  return adapter;
};

export default initializeGPUAdapter;
