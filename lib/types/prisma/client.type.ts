import { Prisma } from "@prisma/client";
import {
  DynamicClientExtensionThis,
  InternalArgs,
} from "@prisma/client/runtime/library";

export type PrismaClient = DynamicClientExtensionThis<
  Prisma.TypeMap<
    InternalArgs & {
      result: any;
      model: any;
      query: any;
      client: any;
    },
    {}
  >,
  Prisma.TypeMapCb<{
    log: ("query" | "warn" | "error")[];
    datasources: {
      db: {
        url: string | undefined;
      };
    };
  }>,
  {
    result: any;
    model: any;
    query: any;
    client: any;
  }
>;
