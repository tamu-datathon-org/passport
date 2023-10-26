import { Text, Page, Divider, useToasts, Card, Link, Input } from '@geist-ui/react';
import { useState, useEffect } from 'react';
import { orgName } from '../components/constants';
import { Navbar } from '../components/Navbar';
import { useActiveUser } from '../components/UserProvider';
import moment from 'moment';
import { QrScanner } from '@yudiel/react-qr-scanner';

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

const updateDatabase = (email: string, updatedObject, setToast) => {
  fetch(`/passport/api/${email}`, {
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

const updateAttendedEvents = (email: string, eventId: string, setToast) => {
  fetch(`/passport/api/${email}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ eventId, email: email })
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

const removeAttendedEvents = (email: string, eventId: string, setToast) => {
  fetch(`/passport/api/${email}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ eventId, email: email })
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

const currentTDYear = 2023;

export default function Home(): JSX.Element {
  const { user } = useActiveUser();
  const [, setToast] = useToasts();
  const [scannedCode, setScannedCode] = useState('404');
  const [isParticipantVolunteer, setIsParticipantVolunteer] = useState(false);
  const [isUserVolunteer, setIsUserVolunteer] = useState(false);
  const [participantPassportData, setParticipantPassportData] = useState<participantPassportDataInterface>(defaultParticipantData);
  const [participantAttendedEvents, setParticipantAttendedEvents] = useState([]);
  const [eventList, setEventList] = useState([]);
  const diningList = ['Lunch 1', 'Dinner 1', 'Breakfast 1', 'Lunch 2'];

  const handleQRScan = (data) => {
    if (data) {
      setScannedCode(encodeURI(JSON.parse(data).email));
    }
  };
  const handleQRError = (err) => {
    console.log(err);
  };

  const addVolunteer = () => {
    setIsParticipantVolunteer(true);
    fetch(`/passport/api/volunteer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: scannedCode })
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
    setIsParticipantVolunteer(false);
    fetch(`/passport/api/volunteer?email=${scannedCode}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
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

  const attendTDEvent = () => {
    const tempParticipantPassportData: participantPassportDataInterface = JSON.parse(JSON.stringify(participantPassportData));
    tempParticipantPassportData.yearsAttended.push(currentTDYear);
    setParticipantPassportData(tempParticipantPassportData);

    const dbPassportData = {
      authId: tempParticipantPassportData.authId,
      diningAttended: tempParticipantPassportData.diningAttended,
      yearsAttended: tempParticipantPassportData.yearsAttended
    };
    updateDatabase(scannedCode, dbPassportData, setToast);
  };

  const unattendTDEvent = () => {
    const tempParticipantPassportData: participantPassportDataInterface = JSON.parse(JSON.stringify(participantPassportData));
    const i = tempParticipantPassportData.yearsAttended.indexOf(currentTDYear);
    if (i > -1) {
      tempParticipantPassportData.yearsAttended.splice(i, 1);
    }
    setParticipantPassportData(tempParticipantPassportData);

    const dbPassportData = {
      authId: tempParticipantPassportData.authId,
      diningAttended: tempParticipantPassportData.diningAttended,
      yearsAttended: tempParticipantPassportData.yearsAttended
    };
    updateDatabase(scannedCode, dbPassportData, setToast);
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
      diningAttended: tempParticipantPassportData.diningAttended,
      yearsAttended: tempParticipantPassportData.yearsAttended
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
    fetchParticipantData();
  }, [scannedCode]);

  const fetchParticipantData = () => {
    fetch(`/passport/api/${scannedCode}`)
      .then((res) => res.json())
      .then((data) => {
        setParticipantPassportData(data.passportData);
        setParticipantAttendedEvents(data.attendedEventsData);
      });
    fetch(`/passport/api/volunteer?email=${scannedCode}`)
      .then((res) => res.json())
      .then((data) => {
        setIsParticipantVolunteer(data.isVolunteer);
      });
  };

  useEffect(() => {
    fetch(`/events/api/json`)
      .then((res) => res.json())
      .then((data) => {
        const filteredEvents = data.filter((e) => {
          const tdStartDay = new Date('October 15, 2021 00:00:00-500');
          const momentTest = moment(e.startTime, 'YYYY-MM-DD hh:mm A');
          const eventStartTime = momentTest.isValid() ? momentTest.toDate() : new Date(e.startTime);
          return eventStartTime > tdStartDay;
        });
        setEventList(filteredEvents);
      });
  }, []);

  useEffect(() => {
    if (user?.authId) {
      fetch(`/passport/api/volunteer?email=${user.email}`)
        .then((res) => res.json())
        .then((data) => {
          setIsUserVolunteer(data['isVolunteer']);
        });
    }
  }, [user]);

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
        {!user?.isAdmin && !isUserVolunteer ? (
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
          /* If user is admin or volunteer, show everything normally */
          <>
            <Divider align="start">Check-in Participants</Divider>
            <br />
            <div style={{ width: '80%' }}>
              <QrScanner onError={handleQRError} onDecode={handleQRScan} />
            </div>
            <b>Manually enter email</b>: <Input placeholder="E-mail" onChange={(e) => setScannedCode(encodeURI(e.target.value))} crossOrigin={undefined} />
            <b>AuthID</b>: {scannedCode}
            <br />
            <div className="flex-container">
              <button onClick={fetchParticipantData} className={`pill`}>
                Resubmit
              </button>
            </div>
            <br />
            <br />
            <Divider align="start">Personal Data</Divider>
            <br />
            <b>Name</b>: {participantPassportData?.name} <br />
            <b>E-mail</b>: {participantPassportData?.email} <br />
            <br />
            <Divider align="start">Event Check-in</Divider>
            <br />
            <div className="flex-container">
              {participantPassportData?.yearsAttended.includes(currentTDYear) ? (
                <button onClick={unattendTDEvent} className={`pill event`}>
                  Unattend TD {currentTDYear}
                </button>
              ) : (
                <button onClick={attendTDEvent} className={`pill`}>
                  Attend {currentTDYear}
                </button>
              )}
            </div>
            <br />
            <Divider align="start">Attended Dining</Divider>
            <br />
            <div className="flex-container">
              {diningList.map((e, i) => (
                <button onClick={() => attendDining(e)} className={`pill ${participantPassportData?.diningAttended.includes(e) && 'dining'}`} key={`dining-${i}`}>
                  {e}
                </button>
              ))}
            </div>
            <br />
            {/* attended events support has been dropped, if need be, then the addEvents API in portal needs to be called
            to generate unique eventIds and manually populated in the markdowns.. ._. *, fetching does work however/}    
            {/* <Divider align="start">Attended Events</Divider>
            <br />
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
            </div> */}
            {user?.isAdmin ? (
              <>
                <br />
                <Divider align="start">Admin Priviledges</Divider>
                <br />
                <div className="flex-container">
                  {isParticipantVolunteer ? (
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
