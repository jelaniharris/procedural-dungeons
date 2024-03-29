import { Provision } from '@/components/types/GameTypes';

export const getProvisionDescription = (prov: Provision) => {
  const provDescription = prov.description
    .replaceAll('%NUM%', `${prov.numberValue}`)
    .replaceAll('%PERCENT%', `${prov.numberValue}%`);
  return provDescription;
};
