import nextConnect from 'next-connect';
import { deleteOneObject, findOneObject, findQueriedObjects, insertOneObject, updateOneObject } from './helper';
import { NextApiRequest, NextApiResponse } from 'next';
import { authenticatedFetch, getBaseUrl } from '../../libs';
import { GatekeeperRequestError, User } from '../../components/UserProvider';

const handler = nextConnect();

interface participantPassportDataInterface {
  authId: string;
  name: string;
  email: string;
  yearsAttended: Array<number>;
  diningAttended: Array<string>;
}
const defaultParticipantData: participantPassportDataInterface = {
  authId: '404',
  name: 'Participant Not Found',
  email: '404@tamudatathon.com',
  yearsAttended: [],
  diningAttended: []
};

const sendParticipantPassportData = async (req: NextApiRequest, res: NextApiResponse, user: User) => {
  const filteredVolunteers = await findQueriedObjects('volunteers', { userAuthId: user.authId });
  const userIsVolunteer = filteredVolunteers.length > 0;
  if (user.isAdmin || userIsVolunteer) {
    const participantAuthId = req.query.auth_id;
    const participantData = await findOneObject('users', { authId: participantAuthId });

    if (!participantData) {
      res.json({ passportData: defaultParticipantData, attendedEventsData: [] });
    } else {
      let participantName = 'Not Provided';
      if (participantData.firstName && participantData.lastName) participantName = `${participantData.firstName} ${participantData.lastName}`;

      const participantPassportData: participantPassportDataInterface = await findOneObject('passport', { authId: participantAuthId });
      const participantAttendedEventsData = await findQueriedObjects('attendedevents', { userAuthId: participantAuthId });
      const participantAttendedEventIds = participantAttendedEventsData.map((d) => d.eventId);

      // if participant passport doesn't exist yet, create one
      if (!participantPassportData) {
        await insertOneObject('passport', {
          authId: participantAuthId,
          yearsAttended: [],
          diningAttended: []
        });
        res.json({
          passportData: {
            authId: participantData.authId,
            name: participantName,
            email: participantData.email,
            yearsAttended: [],
            diningAttended: []
          },
          attendedEventsData: participantAttendedEventIds
        });
      } else {
        res.json({
          passportData: {
            authId: participantData.authId,
            name: participantName,
            email: participantData.email,
            yearsAttended: participantPassportData.yearsAttended,
            diningAttended: participantPassportData.diningAttended
          },
          attendedEventsData: participantAttendedEventIds
        });
      }
    }
  } else {
    res.json({ success: false, message: 'Need admin permissions.' });
  }
};

const updateParticipantPassportData = async (req: NextApiRequest, res: NextApiResponse, user: User) => {
  const filteredVolunteers = await findQueriedObjects('volunteers', { userAuthId: user.authId });
  const userIsVolunteer = filteredVolunteers.length > 0;
  if (user.isAdmin || userIsVolunteer) {
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

const addParticipantAttendedEvents = async (req: NextApiRequest, res: NextApiResponse, user: User) => {
  const filteredVolunteers = await findQueriedObjects('volunteers', { userAuthId: user.authId });
  const userIsVolunteer = filteredVolunteers.length > 0;
  if (user.isAdmin || userIsVolunteer) {
    const eventId = req.body.eventId;
    const userAuthId = req.body.userAuthId;
    console.log('eventId:', eventId, 'userAuthId:', userAuthId);
    try {
      await insertOneObject('attendedevents', { eventId, userAuthId, timeStamp: new Date() });
      res.json({ success: true });
    } catch (error) {
      console.log(error);
      res.json({ success: false });
    }
  } else {
    res.json({ success: false, message: 'Need admin permissions.' });
  }
};

const deleteParticipantAttendedEvents = async (req: NextApiRequest, res: NextApiResponse, user: User) => {
  const filteredVolunteers = await findQueriedObjects('volunteers', { userAuthId: user.authId });
  const userIsVolunteer = filteredVolunteers.length > 0;
  if (user.isAdmin || userIsVolunteer) {
    const eventId = req.body.eventId;
    const userAuthId = req.body.userAuthId;
    try {
      await deleteOneObject('attendedevents', { userAuthId, eventId });
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

handler.post(async (req: NextApiRequest, res: NextApiResponse) => {
  // const response: User | GatekeeperRequestError = await authenticatedFetch(`https://tamudatathon.com/auth/user`, req);
  const response: User | GatekeeperRequestError = await authenticatedFetch(`${getBaseUrl(req)}/auth/user`, req);
  if ((response as GatekeeperRequestError).statusCode === 401) {
    res.writeHead(302, { Location: `/auth/login?r=${req.url}` }).end();
  } else {
    addParticipantAttendedEvents(req, res, response as User);
  }
});

handler.delete(async (req: NextApiRequest, res: NextApiResponse) => {
  // const response: User | GatekeeperRequestError = await authenticatedFetch(`https://tamudatathon.com/auth/user`, req);
  const response: User | GatekeeperRequestError = await authenticatedFetch(`${getBaseUrl(req)}/auth/user`, req);
  if ((response as GatekeeperRequestError).statusCode === 401) {
    res.writeHead(302, { Location: `/auth/login?r=${req.url}` }).end();
  } else {
    deleteParticipantAttendedEvents(req, res, response as User);
  }
});

export default handler;
