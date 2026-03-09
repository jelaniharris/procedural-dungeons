export const getProvisionDescription = (prov: {
  description: string;
  numberValue: number;
  numberValue2?: number;
  cost?: number;
}) => {
  return prov.description
    .replaceAll('%NUM%',      `<strong class="text-green-400">${prov.numberValue}</strong>`)
    .replaceAll('%PERCENT%',  `<strong class="text-green-400">${prov.numberValue}%</strong>`)
    .replaceAll('%NUM2%',     `<strong class="text-green-400">${prov.numberValue2 ?? 0}</strong>`)
    .replaceAll('%PERCENT2%', `<strong class="text-green-400">${prov.numberValue2 ?? 0}%</strong>`)
    .replaceAll('%COST%',     `<strong class="text-yellow-400">${prov.cost ?? 0}%</strong>`);
};
