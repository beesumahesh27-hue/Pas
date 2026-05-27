import api from './api';

/** Fetch aggregated metrics for the Insights home page. */
export const fetchInsightsSummary = async () => {
  const { data } = await api.get('/insights/summary');
  return data;
};
