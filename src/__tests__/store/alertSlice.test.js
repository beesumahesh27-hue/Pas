import reducer, { showAlert, hideAlert } from '../../store/slices/alertSlice';

describe('alertSlice', () => {
  const initialState = { open: false, message: '', severity: 'info' };

  it('returns the initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  describe('showAlert', () => {
    it('sets open to true', () => {
      const state = reducer(initialState, showAlert({ message: 'Done', severity: 'success' }));
      expect(state.open).toBe(true);
    });

    it('sets the message', () => {
      const state = reducer(initialState, showAlert({ message: 'Something failed', severity: 'error' }));
      expect(state.message).toBe('Something failed');
    });

    it('sets the severity', () => {
      const state = reducer(initialState, showAlert({ message: 'Heads up', severity: 'warning' }));
      expect(state.severity).toBe('warning');
    });

    it('defaults severity to info when not provided', () => {
      const state = reducer(initialState, showAlert({ message: 'FYI' }));
      expect(state.severity).toBe('info');
    });
  });

  describe('hideAlert', () => {
    it('sets open to false', () => {
      const openState = { open: true, message: 'Hello', severity: 'success' };
      const state = reducer(openState, hideAlert());
      expect(state.open).toBe(false);
    });

    it('preserves message and severity after hiding', () => {
      const openState = { open: true, message: 'Hello', severity: 'success' };
      const state = reducer(openState, hideAlert());
      expect(state.message).toBe('Hello');
      expect(state.severity).toBe('success');
    });
  });
});
