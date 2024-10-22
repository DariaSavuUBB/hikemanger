import React from 'react';
import { IonItem, IonLabel } from '@ionic/react';
import { HikeProps } from '../HikeProps';

interface HikePropsExt extends HikeProps {
  onEdit: (id?: string) => void;
}

const Hike: React.FC<HikePropsExt> = ({ id, start,destination, onEdit }) => {
  return (
    <IonItem onClick={() => onEdit(id)}>
      <IonLabel>{start}</IonLabel>
      <IonLabel>{destination}</IonLabel>
    </IonItem>
  );
};

export default Hike;