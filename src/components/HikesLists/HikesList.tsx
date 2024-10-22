import { IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonLabel, IonList, IonListHeader, IonLoading, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { add } from 'ionicons/icons';
import { useContext } from 'react';
import { RouteComponentProps } from 'react-router';
import { getLogger } from '../../core';
import Hike from '../Hike/Hike';
import { ItemContext } from '../HikeProvider';
import './HikesListStyles.css';

const log = getLogger('HikeList');

const HikesList: React.FC<RouteComponentProps> = ({ history }) => {
  const { hikes, fetching, fetchingError } = useContext(ItemContext);
  log('render', fetching);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Ready for more hiking?</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonLoading isOpen={fetching} message="Fetching items" />
        {hikes && (
          <IonList>
            <IonListHeader lines='full' className='custom-font'>
              <IonLabel color='primary'>Start</IonLabel>
              <IonLabel className='secondary-lable' color='primary'>Destination</IonLabel>
            </IonListHeader>
            {hikes.map(({ id, start, destination, distance, completed, date }) =>
              <Hike key={id} id={id} start={start} destination={destination} distance={distance} date={date} completed={completed} onEdit={id => history.push(`/hike/${id}`)} />)}
          </IonList>
        )}
        {fetchingError && (
          <div>{fetchingError.message || 'Failed to fetch items'}</div>
        )}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => history.push('/hike')}>
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default HikesList;
