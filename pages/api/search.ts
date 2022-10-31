import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const search = req.query["q"];

  if (!search) return res.status(401);

  try {
    const request = await fetch(`https://api.genius.com/search?q=${search}&access_token=${process.env.GENIUS_ACCESS_TOKEN}`, {
      method: "GET",
    });

    res.json(await request.json());
  } catch (err) {
    res.status(500);
    console.error(err);
  }
}
