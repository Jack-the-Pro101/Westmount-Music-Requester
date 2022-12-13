const PERMISSIONS = [
  "USE_REQUESTER", 
  "ACCEPT_REQUESTS", 
  "REJECT_REQUESTS", 
  "BLANK_ONE", 
  "BLANK_TWO", 
  "BLANK_THREE", 
  "ADMINISTRATOR"
] as const;
type Permission = typeof PERMISSIONS[number];

let bitOffset = 2;
const FLAGS: {
  [key in Permission]: number;
} = PERMISSIONS.reduce((acc, cur, i) => {
  if (i === 0) {
    acc[cur] = bitOffset;
  } else {
    acc[cur] = bitOffset += bitOffset;
  }
  return acc;
}, {} as {
  [key in Permission]: number;
});

export function generateBitfield(permissions: Permission | "EVERYTHING" | Permission[], inherit = false) {
  if (typeof permissions === "string" && !inherit) {
    switch (permissions) {
      case "EVERYTHING": {
        return Object.keys(FLAGS).reduce((prev, key) => prev + (FLAGS as { [key: string]: number; })[key], 0);
      }

      default: {
        console.warn(`WARNING: Permission ${permissions} does not exist! Typo?`);
        return 0;
      }
    }
  } else if (typeof permissions === "string" && inherit) {
    if (permissions === "EVERYTHING") return 0;

    let accumulator = 0;

    for (const key in FLAGS) {
      const bitfield = (FLAGS as { [key: string]: number; })[key];
      accumulator += bitfield;

      const flagBits = FLAGS[permissions];

      if (flagBits == null) console.warn(`WARNING: Permission ${permissions} does not exist! Typo?`);

      if (bitfield === flagBits) break;
    }

    return FLAGS;
  } else if (Array.isArray(permissions)) {
    return permissions.reduce((prev, current) => prev + FLAGS[current], 0);
  }
}

export function bitfieldToArray(bits: number): string[] {
  const array = [];

  for (const key in FLAGS) {
    if (Object.hasOwnProperty.call(FLAGS, key)) {
      const bit = (FLAGS as { [key: string]: number; })[key];

      if (bits < bit) break;
      if (bits & bit) array.push(key);
    }
  }

  return array;
}

export function check(permissions: string[], bits: number): boolean {
  return permissions.every((permission) => {
    const flagBits = (FLAGS as { [key: string]: number; })[permission];
    if (flagBits == null) console.warn(`WARNING: Permission ${permission} does not exist! Typo?`);
    return (bits & flagBits) !== 0;
  });
}

export { FLAGS };
