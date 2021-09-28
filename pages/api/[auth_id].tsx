import nextConnect from 'next-connect';
import { findOneObject, insertOneObject, updateOneObject } from './helper';
import { NextApiRequest, NextApiResponse } from 'next';
import { authenticatedFetch, getBaseUrl } from '../../libs';
import { GatekeeperRequestError, User } from '../../components/UserProvider';

const handler = nextConnect();

interface participantPassportDataInterface {
  authId: string;
  name: string;
  email: string;
  eventsAttended: Array<string>;
  diningAttended: Array<string>;
  activitiesAttended: Array<string>;
}
const defaultParticipantData: participantPassportDataInterface = {
  authId: '404',
  name: 'Participant Not Found',
  email: '404@tamudatathon.com',
  eventsAttended: [],
  diningAttended: [],
  activitiesAttended: []
};

const sendParticipantPassportData = async (req: NextApiRequest, res: NextApiResponse, user: User) => {
  if (user.isAdmin) {
    const participantAuthId = req.query.auth_id;
    const participantData = await findOneObject('users', { authId: participantAuthId });

    if (!participantData) {
      res.json(defaultParticipantData);
    } else {
      let participantName = 'Not Provided';
      if (participantData.firstName && participantData.lastName) participantName = `${participantData.firstName} ${participantData.lastName}`;

      const participantPassportData: participantPassportDataInterface = await findOneObject('passport', { authId: participantAuthId });

      // if participant passport doesn't exist yet, create one
      if (!participantPassportData) {
        await insertOneObject('passport', {
          authId: participantAuthId,
          eventsAttended: [],
          diningAttended: [],
          activitiesAttended: []
        });
        res.json({
          authId: participantData.authId,
          name: participantName,
          email: participantData.email,
          eventsAttended: [],
          diningAttended: [],
          activitiesAttended: []
        });
      } else {
        res.json({
          authId: participantData.authId,
          name: participantName,
          email: participantData.email,
          eventsAttended: participantPassportData.eventsAttended,
          diningAttended: participantPassportData.diningAttended,
          activitiesAttended: participantPassportData.activitiesAttended
        });
      }
    }
  } else {
    res.json({ success: false, message: 'Need admin permissions.' });
  }
};

const updateParticipantPassportData = async (req: NextApiRequest, res: NextApiResponse, user: User) => {
  if (user.isAdmin) {
    const updatedObject = req.body.updatedObject;
    try {
      await updateOneObject('passport', { authId: updatedObject.authId }, updatedObject);
      res.json({ success: true });
    } catch (error) {
      console.log(error);
      res.json({ success: false });
    }
  } else {
    res.json({ success: false, message: 'Need admin permissions.' });
  }
};

handler.get(async (req: NextApiRequest, res: NextApiResponse) => {
  // const response: User | GatekeeperRequestError = await authenticatedFetch(`https://tamudatathon.com/auth/user`, req);
  const response: User | GatekeeperRequestError = await authenticatedFetch(`${getBaseUrl(req)}/auth/user`, req);
  if ((response as GatekeeperRequestError).statusCode === 401) {
    res.writeHead(302, { Location: `/auth/login?r=${req.url}` }).end();
  } else {
    sendParticipantPassportData(req, res, response as User);
  }
});

handler.put(async (req: NextApiRequest, res: NextApiResponse) => {
  // const response: User | GatekeeperRequestError = await authenticatedFetch(`https://tamudatathon.com/auth/user`, req);
  const response: User | GatekeeperRequestError = await authenticatedFetch(`${getBaseUrl(req)}/auth/user`, req);
  if ((response as GatekeeperRequestError).statusCode === 401) {
    res.writeHead(302, { Location: `/auth/login?r=${req.url}` }).end();
  } else {
    updateParticipantPassportData(req, res, response as User);
  }
});

export default handler;
