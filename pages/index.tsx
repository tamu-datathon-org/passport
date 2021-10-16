import { Text, Page, Divider, useToasts, Card, Link } from '@geist-ui/react';
import { useState, useEffect } from 'react';
import { orgName } from '../components/constants';
import { Navbar } from '../components/Navbar';
import { useActiveUser } from '../components/UserProvider';
import dynamic from 'next/dynamic';
import moment from 'moment';
const QrReader: any = dynamic(() => import('react-qr-reader'), { ssr: false });

interface participantPassportDataInterface {
  authId: string;
  name: string;
  email: string;
  diningAttended: Array<string>;
}
const defaultParticipantData: participantPassportDataInterface = {
  authId: '404',
  name: 'Participant Not Found',
  email: '404@tamudatathon.com',
  diningAttended: []
};

const updateDatabase = (authId: string, updatedObject, setToast) => {
  fetch(`/passport/api/${authId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ updatedObject: updatedObject })
  })
    .then((response) => response.json())
    .then(() => {
      setToast({ text: 'Participant data updated!', type: 'warning', delay: 3000 });
    })
    .catch((error) => {
      console.error('Error:', error);
      setToast({ text: 'Could not update participant data.', type: 'error', delay: 3000 });
    });
};

const updateAttendedEvents = (authId: string, eventId: string, setToast) => {
  fetch(`/passport/api/${authId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ eventId, userAuthId: authId })
  })
    .then((response) => response.json())
    .then(() => {
      setToast({ text: 'Participant data updated!', type: 'warning', delay: 3000 });
    })
    .catch((error) => {
      console.error('Error:', error);
      setToast({ text: 'Could not update participant data.', type: 'error', delay: 3000 });
    });
};

const removeAttendedEvents = (authId: string, eventId: string, setToast) => {
  fetch(`/passport/api/${authId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ eventId, userAuthId: authId })
  })
    .then((response) => response.json())
    .then(() => {
      setToast({ text: 'Participant data updated!', type: 'warning', delay: 3000 });
    })
    .catch((error) => {
      console.error('Error:', error);
      setToast({ text: 'Could not update participant data.', type: 'error', delay: 3000 });
    });
};

export default function Home(): JSX.Element {
  const { user } = useActiveUser();
  const [, setToast] = useToasts();
  const [scannedCode, setScannedCode] = useState('404');
  const [isVolunteer, setIsVolunteer] = useState(false);
  const [participantPassportData, setParticipantPassportData] = useState<participantPassportDataInterface>(defaultParticipantData);
  const [participantAttendedEvents, setParticipantAttendedEvents] = useState([]);
  const [eventList, setEventList] = useState([]);
  const diningList = ['Lunch 1', 'Dinner 1', 'Breakfast 1', 'Lunch 2'];

  const handleQRScan = (data) => {
    if (data) {
      setScannedCode(data);
    }
  };
  const handleQRError = (err) => {
    console.log(err);
  };

  const addVolunteer = () => {
    setIsVolunteer(true);
    fetch(`/passport/api/volunteer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userAuthId: scannedCode })
    })
      .then((response) => response.json())
      .then(() => {
        setToast({ text: 'User data updated!', type: 'warning', delay: 3000 });
      })
      .catch((error) => {
        console.error('Error:', error);
        setToast({ text: 'Could not update user data.', type: 'error', delay: 3000 });
      });
  };

  const removeVolunteer = () => {
    setIsVolunteer(false);
    fetch(`/passport/api/volunteer`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userAuthId: scannedCode })
    })
      .then((response) => response.json())
      .then(() => {
        setToast({ text: 'User data updated!', type: 'warning', delay: 3000 });
      })
      .catch((error) => {
        console.error('Error:', error);
        setToast({ text: 'Could not update user data.', type: 'error', delay: 3000 });
      });
  };

  const attendDining = (e) => {
    const tempParticipantPassportData: participantPassportDataInterface = JSON.parse(JSON.stringify(participantPassportData));
    if (tempParticipantPassportData.diningAttended.includes(e)) {
      tempParticipantPassportData.diningAttended.splice(tempParticipantPassportData.diningAttended.indexOf(e), 1);
    } else {
      tempParticipantPassportData.diningAttended.push(e);
    }
    setParticipantPassportData(tempParticipantPassportData);
    const dbPassportData = {
      authId: tempParticipantPassportData.authId,
      diningAttended: tempParticipantPassportData.diningAttended
    };
    updateDatabase(scannedCode, dbPassportData, setToast);
  };

  const attendEvent = (e) => {
    const tempParticipantEventsAttended = JSON.parse(JSON.stringify(participantAttendedEvents));
    tempParticipantEventsAttended.push(e.eventId);
    setParticipantAttendedEvents(tempParticipantEventsAttended);
    updateAttendedEvents(scannedCode, e.eventId, setToast);
  };
  const unattendEvent = (e) => {
    const tempParticipantEventsAttended = JSON.parse(JSON.stringify(participantAttendedEvents));
    const i = tempParticipantEventsAttended.indexOf(e.eventId);
    if (i > -1) {
      tempParticipantEventsAttended.splice(i, 1);
    }
    setParticipantAttendedEvents(tempParticipantEventsAttended);
    removeAttendedEvents(scannedCode, e.eventId, setToast);
  };

  useEffect(() => {
    fetch(`/passport/api/${scannedCode}`)
      .then((res) => res.json())
      .then((data) => {
        setParticipantPassportData(data.passportData);
        setParticipantAttendedEvents(data.attendedEventsData);
      });
    fetch(`/passport/api/volunteer?userAuthId=${scannedCode}`)
      .then((res) => res.json())
      .then((data) => {
        setIsVolunteer(data.isVolunteer);
      });
  }, [scannedCode]);

  useEffect(() => {
    fetch(`/events/api/json`)
      .then((res) => res.json())
      .then((data) => {
        const filteredEvents = data.filter((e) => {
          const tdStartDay = new Date('October 16, 2021 00:00:00-500');
          const momentTest = moment(e.startTime, 'YYYY-MM-DD hh:mm A');
          const eventStartTime = momentTest.isValid() ? momentTest.toDate() : new Date(e.startTime);
          return eventStartTime > tdStartDay;
        });
        setEventList(filteredEvents);
      });
  }, []);

  return (
    <>
      <Navbar />
      <Page className="homepage-container">
        <Text h2 style={{ marginBottom: '5px' }}>
          Passport
        </Text>
        <Text className="sub-heading">{orgName} Check-in System</Text>
        <br />
        {/* If user is not admin, deny access and prompt them to login */}
        {!user?.isAdmin && !isVolunteer ? (
          <Card>
            <h4>Access Denied</h4>
            <p>Please login to an admin account to check people in.</p>
            <Card.Footer>
              <Link color block href="/auth/login?r=/passport/">
                Login
              </Link>
            </Card.Footer>
          </Card>
        ) : (
          /* If user is admin, show everything normally */
          <>
            <Divider align="start">Check-in Participants</Divider>
            <QrReader delay={300} onError={handleQRError} onScan={handleQRScan} style={{ width: '100%' }} />
            <b>AuthID</b>: {scannedCode}
            <br />
            <br />
            <Divider align="start">Personal Data</Divider>
            <b>Name</b>: {participantPassportData?.name} <br />
            <b>E-mail</b>: {participantPassportData?.email} <br />
            <br />
            <Divider align="start">Attended Dining</Divider>
            <div className="flex-container">
              {diningList.map((e, i) => (
                <button onClick={() => attendDining(e)} className={`pill ${participantPassportData?.diningAttended.includes(e) && 'dining'}`} key={`dining-${i}`}>
                  {e}
                </button>
              ))}
            </div>
            <br />
            <Divider align="start">Attended Events</Divider>
            <div className="flex-container">
              {eventList.map((e, i) => {
                if (participantAttendedEvents?.includes(e['eventId'])) {
                  return (
                    <button onClick={() => unattendEvent(e)} className={`pill event`} key={`event-${i}`}>
                      {e['name']}
                    </button>
                  );
                } else {
                  return (
                    <button onClick={() => attendEvent(e)} className={`pill`} key={`event-${i}`}>
                      {e['name']}
                    </button>
                  );
                }
              })}
            </div>
            {user?.isAdmin ? (
              <>
                <br />
                <Divider align="start">Admin Priviledges</Divider>
                <div className="flex-container">
                  {isVolunteer ? (
                    <button onClick={removeVolunteer} className="pill dining">
                      Remove Volunteer
                    </button>
                  ) : (
                    <button onClick={addVolunteer} className="pill">
                      Add Volunteer
                    </button>
                  )}
                </div>
              </>
            ) : (
              <></>
            )}
          </>
        )}
      </Page>
    </>
  );
}
