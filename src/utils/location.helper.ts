import { Location } from 'src/locations/entities/location.entity';

export function buildLocationTree(location: Location | null): any {
  if (!location) return null;

  return {
    id: location.id,
    name: location.name,
    type: location.type,
    parent: buildLocationTree(location.parent),
  };
}
