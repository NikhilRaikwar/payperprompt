import {
  ServiceRegistered,
  CallAttested,
} from '../generated/APIRegistry/APIRegistry';
import {
  ServiceRegisteredEntity,
  CallAttestedEntity,
  ServiceStatsEntity,
} from '../generated/schema';

export function handleServiceRegistered(event: ServiceRegistered): void {
  const id = event.params.id.toString();

  let entity = new ServiceRegisteredEntity(id);
  entity.serviceId   = event.params.id;
  entity.provider    = event.params.provider.toHexString();
  entity.name        = event.params.name;
  entity.price       = event.params.price;
  entity.blockNumber = event.block.number;
  entity.timestamp   = event.block.timestamp;
  entity.save();
}

export function handleCallAttested(event: CallAttested): void {
  const id = event.transaction.hash.toHexString() + '-' + event.logIndex.toString();

  let entity = new CallAttestedEntity(id);
  entity.serviceId   = event.params.serviceId;
  entity.caller      = event.params.caller.toHexString();
  entity.txHash      = event.params.txHash.toHexString();
  entity.timestamp   = event.params.timestamp;
  entity.blockNumber = event.block.number;
  entity.save();

  // Update global stats
  let stats = ServiceStatsEntity.load('global');
  if (!stats) {
    stats              = new ServiceStatsEntity('global');
    stats.totalCalls   = BigInt.fromI32(0);
    stats.totalRevenue = BigInt.fromI32(0);
  }
  stats.totalCalls   = stats.totalCalls.plus(BigInt.fromI32(1));
  stats.lastUpdated  = event.block.timestamp;
  stats.save();
}
