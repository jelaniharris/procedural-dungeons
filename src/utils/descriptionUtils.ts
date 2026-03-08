export const getProvisionDescription = (prov: {
  description: string;
  numberValue: number;
}) => {
  const provDescription = prov.description
    .replaceAll('%NUM%', `<strong class="text-green-400">${prov.numberValue}</strong>`)
    .replaceAll('%PERCENT%', `<strong class="text-green-400">${prov.numberValue}%</strong>`);
  return provDescription;
};
