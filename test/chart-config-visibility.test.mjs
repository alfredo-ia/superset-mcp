import test from "node:test";
import assert from "node:assert/strict";
import { initializeSupersetClient } from "../build/client/index.js";
import { handleChartTool } from "../build/handlers/chart-handlers.js";

test("get_current_chart_config exibe parâmetros em texto aberto por padrão", async () => {
  const client = initializeSupersetClient();
  client.charts.getChart = async () => ({
    id: 42,
    slice_name: "Pedidos por status",
    viz_type: "table",
    description: "Visão operacional",
    url: "https://superset.example.com/explore/?slice_id=42",
    thumbnail_url: "https://superset.example.com/thumb/42",
    changed_on_delta_humanized: "3 days ago",
    is_managed_externally: false,
    cache_timeout: 60,
    params: JSON.stringify({
      viz_type: "table",
      datasource: "7__table",
      row_limit: 50,
      metrics: ["count"],
      filters: [{ col: "status", op: "IN", val: ["paid"] }],
    }),
    query_context: undefined,
    dashboards: [],
    owners: [],
    tags: [],
    certified_by: undefined,
  });

  const result = await handleChartTool("get_current_chart_config", {
    chart_id: 42,
  });
  const text = result.content?.[0]?.text ?? "";

  assert.match(text, /VISUALIZATION PARAMETERS/);
  assert.match(text, /Complete Parameters JSON:/);
  assert.doesNotMatch(text, /details hidden/i);
});
