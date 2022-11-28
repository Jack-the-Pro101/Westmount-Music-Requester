import * as permissionsJson from "./permissions.json";

const FLAGS = {};

let bitOffset = 2;
permissionsJson.forEach((permission, i) => {
  if (i === 0) {
    FLAGS[permission] = bitOffset;
  } else {
    FLAGS[permission] = bitOffset += bitOffset;
  }
});

export function generateBitfield(permissions: any, inherit = false) {
  const type = typeof permissions;
  if (type === "string" && !inherit) {
    switch (permissions.toLowerCase()) {
      case "everything": {
        return Object.keys(FLAGS).reduce((prev, key) => prev + FLAGS[key], 0);
      }

      default: {
        console.warn(`WARNING: Permission ${permissions} does not exist! Typo?`);
        return 0;
      }
    }
  } else if (type === "string" && inherit) {
    let accumulator = 0;

    for (const key in FLAGS) {
      if (Object.hasOwnProperty.call(FLAGS, key)) {
        const bitfield = FLAGS[key];
        accumulator += bitfield;

        const flagBits = FLAGS[permissions];

        if (flagBits == null) console.warn(`WARNING: Permission ${permissions} does not exist! Typo?`);

        if (bitfield === flagBits) break;
      }
    }

    return accumulator;
  } else if (Array.isArray(permissions)) {
    return permissions.reduce((prev, current) => prev + FLAGS[current], 0);
  }
}

export function bitfieldToArray(bits: number): string[] {
  const array = [];

  for (const key in FLAGS) {
    if (Object.hasOwnProperty.call(FLAGS, key)) {
      const bit = FLAGS[key];

      if (bits < bit) break;
      if (bits & bit) array.push(key);
    }
  }

  return array;
}

export function check(permissions: string[], bits: number): boolean {
  return permissions.every((permission) => {
    const flagBits = FLAGS[permission];
    if (flagBits == null) console.warn(`WARNING: Permission ${permission} does not exist! Typo?`);
    return (bits & flagBits) !== 0;
  });
}

export { FLAGS };
