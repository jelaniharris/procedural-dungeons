export const getProvisionDescription = (prov: { description: string; numberValue: number }) => {
  const provDescription = prov.description
    .replaceAll('%NUM%', `${prov.numberValue}`)
    .replaceAll('%PERCENT%', `${prov.numberValue}%`);
  return provDescription;
};
