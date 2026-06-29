import { SheriffConfig } from '@softarc/sheriff-core';

export const sheriffConfig: SheriffConfig = {
  version: 1,
  enableBarrelLess: true,
  excludeRoot: true,
  modules: {
    'src/utils': ['type:util'],
    'src/components/<component>': ['type:schematic'],
    'src/<schematic>': ['type:schematic'],
  },
  depRules: {
    'type:schematic': ['type:util'],
    'type:util': [],
  },
};
