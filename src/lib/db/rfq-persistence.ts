import { getLocalRfqRepository } from "@/lib/repositories/local-rfq-repository";
import { getMongodbRfqRepository } from "@/lib/repositories/mongodb-rfq-repository";
import {
  RfqRepositoryError,
  type RfqRepository,
} from "@/lib/repositories/rfq-repository";

const localDriverNames = new Set(["local"]);
const mongodbDriverNames = new Set(["cosmos", "mongodb", "mongo", "mongoose"]);

export function getRfqRepository(): RfqRepository {
  const configuredDriver = process.env.RFQ_STORE_DRIVER?.trim().toLowerCase();
  const allowLocalFallback = process.env.RFQ_ALLOW_LOCAL_FALLBACK === "true";
  const requireConfiguredStore = process.env.RFQ_REQUIRE_CONFIGURED_STORE === "true";
  const hasMongoConnection = Boolean(process.env.COSMOS_MONGODB_URI || process.env.MONGODB_URI);

  if (!configuredDriver) {
    if (hasMongoConnection) {
      return getMongodbRfqRepository();
    }

    if (!requireConfiguredStore || allowLocalFallback) {
      return getLocalRfqRepository();
    }

    throw new RfqRepositoryError(
      "RFQ persistence is not configured for this runtime.",
      503,
      "RFQ_STORE_NOT_CONFIGURED",
    );
  }

  if (localDriverNames.has(configuredDriver)) {
    return getLocalRfqRepository();
  }

  if (mongodbDriverNames.has(configuredDriver)) {
    return getMongodbRfqRepository();
  }

  if (allowLocalFallback) {
    return getLocalRfqRepository();
  }

  throw new RfqRepositoryError(
    "The configured RFQ persistence driver is not registered in this build.",
    503,
    "RFQ_STORE_DRIVER_UNAVAILABLE",
  );
}
