import { ProvisionData } from '@/components/types/GameData';
import { ProvisionType } from '@/components/types/GameTypes';

export const findProvisionData = (provisionType: ProvisionType) => {
  return ProvisionData.find((prov) => prov.provisionType === provisionType);
};
