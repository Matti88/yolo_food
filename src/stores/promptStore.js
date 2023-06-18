import create from 'zustand';

const useAppStateStore = create((set) => ({
  loading: { loading: true, progress: 0 },
  model: { net: null, inputShape: [1, 0, 0, 3] },

  setPrompt: (newLoading) => set({ loading: newLoading }),
  setModel: (newModel) => set({ model: newModel }),
}));

export default useAppStateStore;