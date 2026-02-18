module.exports = {
  processCompose: {
    input: {
      target: "./openapi/process-compose/swagger-doc.latest.yaml",
    },
    output: {
      mode: "single",
      target: "./src/generated/processCompose.ts",
      client: "fetch",
      clean: true,
      prettier: true,
      override: {
        mutator: {
          path: "./src/orval/pcMutator.ts",
          name: "pcFetch",
        },
      },
    },
  },
};
