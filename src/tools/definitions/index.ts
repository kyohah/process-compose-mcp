import type { ToolSpec } from "../shared/types.js";
import { pcGetDependencyGraphTool } from "./process_compose_get_dependency_graph.js";
import { pcGetProcessTool } from "./process_compose_get_process.js";
import { pcGetProcessInfoTool } from "./process_compose_get_process_info.js";
import { pcGetProcessLogsTool } from "./process_compose_get_process_logs.js";
import { pcGetProcessPortsTool } from "./process_compose_get_process_ports.js";
import { pcGetProjectNameTool } from "./process_compose_get_project_name.js";
import { pcGetProjectStateTool } from "./process_compose_get_project_state.js";
import { pcHealthSummaryTool } from "./process_compose_health_summary.js";
import { pcIsAliveTool } from "./process_compose_is_alive.js";
import { pcListProcessesTool } from "./process_compose_list_processes.js";
import { pcLogsStreamWsTool } from "./process_compose_logs_stream_ws.js";
import { pcReloadProjectTool } from "./process_compose_reload_project.js";
import { pcRestartProcessTool } from "./process_compose_restart_process.js";
import { pcScaleProcessTool } from "./process_compose_scale_process.js";
import { pcShutdownProjectTool } from "./process_compose_shutdown_project.js";
import { pcStartProcessTool } from "./process_compose_start_process.js";
import { pcStopProcessTool } from "./process_compose_stop_process.js";
import { pcStopProcessesTool } from "./process_compose_stop_processes.js";
import { pcTailLogsTool } from "./process_compose_tail_logs.js";
import { pcTruncateProcessLogsTool } from "./process_compose_truncate_process_logs.js";
import { pcUpdateProcessConfigTool } from "./process_compose_update_process_config.js";
import { pcUpdateProjectTool } from "./process_compose_update_project.js";

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
