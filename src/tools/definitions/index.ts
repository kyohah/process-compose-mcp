import type { ToolSpec } from "../shared/types.js";
import { pcGetDependencyGraphTool } from "./pc_get_dependency_graph.js";
import { pcGetProcessTool } from "./pc_get_process.js";
import { pcGetProcessInfoTool } from "./pc_get_process_info.js";
import { pcGetProcessLogsTool } from "./pc_get_process_logs.js";
import { pcGetProcessPortsTool } from "./pc_get_process_ports.js";
import { pcGetProjectNameTool } from "./pc_get_project_name.js";
import { pcGetProjectStateTool } from "./pc_get_project_state.js";
import { pcHealthSummaryTool } from "./pc_health_summary.js";
import { pcIsAliveTool } from "./pc_is_alive.js";
import { pcListProcessesTool } from "./pc_list_processes.js";
import { pcLogsStreamWsTool } from "./pc_logs_stream_ws.js";
import { pcReloadProjectTool } from "./pc_reload_project.js";
import { pcRestartProcessTool } from "./pc_restart_process.js";
import { pcScaleProcessTool } from "./pc_scale_process.js";
import { pcShutdownProjectTool } from "./pc_shutdown_project.js";
import { pcStartProcessTool } from "./pc_start_process.js";
import { pcStopProcessTool } from "./pc_stop_process.js";
import { pcStopProcessesTool } from "./pc_stop_processes.js";
import { pcTailLogsTool } from "./pc_tail_logs.js";
import { pcTruncateProcessLogsTool } from "./pc_truncate_process_logs.js";
import { pcUpdateProcessConfigTool } from "./pc_update_process_config.js";
import { pcUpdateProjectTool } from "./pc_update_project.js";

export const toolSpecs: ToolSpec[] = [
  pcGetDependencyGraphTool,
  pcIsAliveTool,
  pcListProcessesTool,
  pcGetProcessTool,
  pcGetProcessInfoTool,
  pcGetProcessPortsTool,
  pcStartProcessTool,
  pcStopProcessTool,
  pcRestartProcessTool,
  pcScaleProcessTool,
  pcUpdateProcessConfigTool,
  pcTailLogsTool,
  pcGetProcessLogsTool,
  pcLogsStreamWsTool,
  pcTruncateProcessLogsTool,
  pcStopProcessesTool,
  pcUpdateProjectTool,
  pcReloadProjectTool,
  pcGetProjectNameTool,
  pcGetProjectStateTool,
  pcShutdownProjectTool,
  pcHealthSummaryTool,
];
