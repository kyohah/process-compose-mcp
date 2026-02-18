import { z } from "zod";

export const NameSchema = z.string().min(1, "name is required");

export const NameInputSchema = z.object({ name: NameSchema });

export const TailLogsSchema = z.object({
  name: NameSchema,
  lines: z.number().int().positive().max(5000).optional(),
  sinceSeconds: z.number().int().positive().max(86400).optional(),
  replica: z.number().int().nonnegative().optional(),
});

export const ProcessConfigInputSchema = z.object({
  process: z.record(z.string(), z.unknown()),
});

export const LogsStreamSchema = z.object({
  names: z.array(NameSchema).min(1, "names is required"),
  offset: z.number().int().min(0).optional(),
  follow: z.boolean().optional(),
});

export const GetProcessLogsSchema = z.object({
  name: NameSchema,
  endOffset: z.number().int().min(0).optional(),
  limit: z.number().int().positive().max(5000).optional(),
});

export const ScaleProcessSchema = z.object({
  name: NameSchema,
  scale: z.number().int().min(0).max(1000),
});

export const StopProcessesSchema = z.object({
  names: z.array(NameSchema).min(1, "names is required"),
  confirm: z.literal(true),
});

export const ShutdownProjectSchema = z.object({
  confirm: z.literal(true),
});

export const jsonSchemaEmptyObject = {
  type: "object",
  properties: {},
  additionalProperties: false,
};

export const jsonSchemaName = {
  type: "object",
  properties: { name: { type: "string", minLength: 1 } },
  required: ["name"],
  additionalProperties: false,
};

export const jsonSchemaTail = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 1 },
    lines: { type: "integer", minimum: 1, maximum: 5000 },
    sinceSeconds: { type: "integer", minimum: 1, maximum: 86400 },
    replica: { type: "integer", minimum: 0 },
  },
  required: ["name"],
  additionalProperties: false,
};

export const jsonSchemaProcessConfig = {
  type: "object",
  properties: { process: { type: "object", additionalProperties: true } },
  required: ["process"],
  additionalProperties: false,
};

export const jsonSchemaLogsStream = {
  type: "object",
  properties: {
    names: { type: "array", items: { type: "string", minLength: 1 }, minItems: 1 },
    offset: { type: "integer", minimum: 0 },
    follow: { type: "boolean" },
  },
  required: ["names"],
  additionalProperties: false,
};

export const jsonSchemaGetProcessLogs = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 1 },
    endOffset: { type: "integer", minimum: 0 },
    limit: { type: "integer", minimum: 1, maximum: 5000 },
  },
  required: ["name"],
  additionalProperties: false,
};

export const jsonSchemaScaleProcess = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 1 },
    scale: { type: "integer", minimum: 0, maximum: 1000 },
  },
  required: ["name", "scale"],
  additionalProperties: false,
};

export const jsonSchemaStopProcesses = {
  type: "object",
  properties: {
    names: { type: "array", items: { type: "string", minLength: 1 }, minItems: 1 },
    confirm: { const: true },
  },
  required: ["names", "confirm"],
  additionalProperties: false,
};

export const jsonSchemaShutdownProject = {
  type: "object",
  properties: {
    confirm: { const: true },
  },
  required: ["confirm"],
  additionalProperties: false,
};
