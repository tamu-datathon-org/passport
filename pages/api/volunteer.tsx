import nextConnect from 'next-connect';
import { deleteOneObject, findOneObject, findQueriedObjects, insertOneObject, updateOneObject } from './helper';
import { NextApiRequest, NextApiResponse } from 'next';
import { authenticatedFetch, getBaseUrl } from '../../libs';
import { GatekeeperRequestError, User } from '../../components/UserProvider';

const handler = nextConnect();

export const sendUserVolunteerStatus = async (req: NextApiRequest, res: NextApiResponse, user: User) => {
  const userAuthId = req.query.userAuthId;
  const filteredVolunteers = await findQueriedObjects('volunteers', { userAuthId });
  console.log('isVolunteer response:', { isVolunteer: filteredVolunteers.length > 0 });
  res.json({ isVolunteer: filteredVolunteers.length > 0 });
};

const addUserAsVolunteer = async (req: NextApiRequest, res: NextApiResponse, user: User) => {
  if (user.isAdmin) {
    const userAuthId = req.body.userAuthId;
    try {
      await insertOneObject('volunteers', { userAuthId });
      res.json({ success: true });
    } catch (error) {
      console.log(error);
      res.json({ success: false });
    }
  } else {
    res.json({ success: false, message: 'Need admin permissions.' });
  }
};

const removeUserAsVolunteer = async (req: NextApiRequest, res: NextApiResponse, user: User) => {
  if (user.isAdmin) {
    const userAuthId = req.body.userAuthId;
    try {
      await deleteOneObject('volunteers', { userAuthId });
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
    sendUserVolunteerStatus(req, res, response as User);
  }
});

handler.post(async (req: NextApiRequest, res: NextApiResponse) => {
  // const response: User | GatekeeperRequestError = await authenticatedFetch(`https://tamudatathon.com/auth/user`, req);
  const response: User | GatekeeperRequestError = await authenticatedFetch(`${getBaseUrl(req)}/auth/user`, req);
  if ((response as GatekeeperRequestError).statusCode === 401) {
    res.writeHead(302, { Location: `/auth/login?r=${req.url}` }).end();
  } else {
    addUserAsVolunteer(req, res, response as User);
  }
});

handler.delete(async (req: NextApiRequest, res: NextApiResponse) => {
  // const response: User | GatekeeperRequestError = await authenticatedFetch(`https://tamudatathon.com/auth/user`, req);
  const response: User | GatekeeperRequestError = await authenticatedFetch(`${getBaseUrl(req)}/auth/user`, req);
  if ((response as GatekeeperRequestError).statusCode === 401) {
    res.writeHead(302, { Location: `/auth/login?r=${req.url}` }).end();
  } else {
    removeUserAsVolunteer(req, res, response as User);
  }
});

export default handler;
