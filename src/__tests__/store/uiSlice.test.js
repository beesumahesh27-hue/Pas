import reducer, { setLoading, toggleSidebar } from '../../store/slices/uiSlice';

describe('uiSlice', () => {
  const initialState = { loading: false, sidebarOpen: true };

  it('returns the initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  describe('setLoading', () => {
    it('sets loading to true', () => {
      const state = reducer(initialState, setLoading(true));
      expect(state.loading).toBe(true);
    });

    it('sets loading to false', () => {
      const state = reducer({ ...initialState, loading: true }, setLoading(false));
      expect(state.loading).toBe(false);
    });
  });

  describe('toggleSidebar', () => {
    it('toggles sidebarOpen from true to false', () => {
      const state = reducer(initialState, toggleSidebar());
      expect(state.sidebarOpen).toBe(false);
    });

    it('toggles sidebarOpen from false to true', () => {
      const state = reducer({ ...initialState, sidebarOpen: false }, toggleSidebar());
      expect(state.sidebarOpen).toBe(true);
    });

    it('does not affect loading when toggling sidebar', () => {
      const state = reducer({ loading: true, sidebarOpen: true }, toggleSidebar());
      expect(state.loading).toBe(true);
    });
  });
});
