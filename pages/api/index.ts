import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const Error1 = Error;
  // @ts-ignore
  global.Error = class extends Error1 {
    // @ts-ignore
    constructor(...args) {
      super(...args);
      console.log(...args);
    }
  };

  res.send("Good");
}
