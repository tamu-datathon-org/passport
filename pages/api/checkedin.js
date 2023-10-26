import { connectToDatabase } from '../../util/mongodb';

/*eslint-disable*/
export default async(req, res) => {
    const { db } = await connectToDatabase();
    const returnObj = await db.collection('passport').count();
    res.status(200).json( returnObj );
  };