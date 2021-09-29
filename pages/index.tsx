import { Text, Page, Divider, useToasts, Card, Link } from '@geist-ui/react';
import { useState, useEffect } from 'react';
import { orgName } from '../components/constants';
import { Navbar } from '../components/Navbar';
import { useActiveUser } from '../components/UserProvider';
import dynamic from 'next/dynamic';
const QrReader: any = dynamic(() => import('react-qr-reader'), { ssr: false });

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

export default function Home(): JSX.Element {
  const { user } = useActiveUser();
  const [, setToast] = useToasts();
  const [scannedCode, setScannedCode] = useState('5efc1b99a37c4300032acbd6');
  const [participantPassportData, setParticipantPassportData] = useState<participantPassportDataInterface>(defaultParticipantData);
  const eventList = ['Opening Ceremony'];
  const activityList = ['Talent Show'];
  const diningList = ['Lunch 1', 'Dinner 1', 'Breakfast 1', 'Lunch 2'];

  const handleQRScan = (data) => {
    if (data) {
      setScannedCode(data);
    }
  };
  const handleQRError = (err) => {
    console.log(err);
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
      eventsAttended: tempParticipantPassportData.eventsAttended,
      activitiesAttended: tempParticipantPassportData.activitiesAttended
    };
    updateDatabase(scannedCode, dbPassportData, setToast);
  };

  useEffect(() => {
    fetch(`/passport/api/${scannedCode}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setParticipantPassportData(data);
      });
  }, [scannedCode]);

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
        {!user?.isAdmin ? (
          <Card>
            <h4>Access Denied</h4>
            <p>Please login to an admin account to check people in.</p>
            <Card.Footer>
              <Link color block href="/auth/login?r=/mailing/">
                Login
              </Link>
            </Card.Footer>
          </Card>
        ) : (
          /* If user is admin, show everything normally */
          <>
            <Divider align="start">Check-in Participants</Divider>
            <QrReader
              delay={300}
              onError={handleQRError}
              onScan={handleQRScan}
              style={{ width: '100%' }}
            />
            <b>AuthID</b>: {scannedCode}
            <br />
            <br />
            <Divider align="start">Personal Data</Divider>
            <b>Name</b>: {participantPassportData.name} <br />
            <b>E-mail</b>: {participantPassportData.email} <br />
            <br />
            <Divider align="start">Attended Dining</Divider>
            <div className="flex-container">
              {diningList.map((e, i) => (
                <button onClick={() => attendDining(e)} className={`pill ${participantPassportData.diningAttended.includes(e) && 'dining'}`} key={`dining-${i}`}>
                  {e}
                </button>
              ))}
            </div>
            <br />
            <Divider align="start">Attended Events</Divider>
            <div className="flex-container">
              {eventList.map((e, i) => (
                <button className={`pill ${participantPassportData.eventsAttended.includes(e) && 'dining'}`} key={`dining-${i}`}>
                  {e}
                </button>
              ))}
            </div>
            <br />
            <Divider align="start">Attended Activities</Divider>
            <div className="flex-container">
              {activityList.map((e, i) => (
                <button className={`pill ${participantPassportData.activitiesAttended.includes(e) && 'dining'}`} key={`dining-${i}`}>
                  {e}
                </button>
              ))}
            </div>
          </>
        )}
      </Page>
    </>
  );
}
