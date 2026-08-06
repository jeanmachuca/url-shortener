/// <reference types="astro/client" />

interface Env {
  LINKS_KV: KVNamespace;
}

declare namespace App {
  interface Locals {
    runtime: {
      env: Env;
      ctx: ExecutionContext;
      cf: Record<string, unknown>;
    };
  }
}
