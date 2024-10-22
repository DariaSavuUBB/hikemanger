import React, { useContext, useEffect, useState } from 'react';
import {
    IonAlert,
    IonButton,
    IonButtons,
    IonContent,
    IonDatetime,
    IonHeader,
    IonInput,
    IonLabel,
    IonLoading,
    IonPage,
    IonTitle,
    IonToggle,
    IonToolbar
} from '@ionic/react';
import { getLogger } from '../../core';
import { RouteComponentProps } from 'react-router';
import { ItemContext } from '../HikeProvider';
import { HikeProps } from '../HikeProps';
import './HikeEdit.css';
const log = getLogger('HikeEdit');

interface ItemEditProps extends RouteComponentProps<{
    id?: string;
}> { }

const emptyHike: HikeProps = {
    id: '',
    start: '',
    destination: '',
    distance: 0,
    date: new Date(),
    completed: false
};

const HikeEdit: React.FC<ItemEditProps> = ({ history, match }) => {
    const { hikes, saving, savingError, saveItem, deleting, deletingError, toDeleteItem } = useContext(ItemContext);
    const [item, setItem] = useState<HikeProps>(emptyHike);

    useEffect(() => {
        log('useEffect');
        const routeId = match.params.id || '';
        const hike = hikes?.find(it => it.id === routeId);
        if (hike) {
            hike.date = new Date(hike.date);
            setItem(hike);
        }
    }, [match.params.id, hikes]);

    const handleSave = () => {
        console.log(item.date);
        saveItem && saveItem(item!).then(() => history.goBack());
    };

    const handleDelete = () => {
        toDeleteItem && toDeleteItem(item!.id).then(() => history.goBack());
    }

    log('render');
    return (
        <IonPage >
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Edit</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleSave}>
                            Save
                        </IonButton>
                        {item.id &&
                            <>
                                <IonButton id="present-alert">Delete </IonButton>
                                <IonAlert
                                    header="Are you sure you want to delete this hike?"
                                    trigger="present-alert"
                                    buttons={[
                                        {
                                            text: 'Cancel',
                                            role: 'cancel',
                                            handler: () => {
                                                log('Delete canceled');
                                            },
                                        },
                                        {
                                            text: 'Yes',
                                            role: 'confirm',
                                            handler: () => {
                                                handleDelete();
                                                log('Delete confirmed');
                                            },
                                        },
                                    ]}
                                    onDidDismiss={({ detail }) => console.log(`Dismissed with role: ${detail.role}`)}
                                >
                                </IonAlert>
                            </>}
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className='container'>
                <IonInput className='custom-input' label="Start: " value={item ? item!.start : ""} onIonInput={e => setItem(prevItem => ({ ...prevItem!, start: e.detail.value || '' }))} />
                <IonInput className='custom-input' label='Destination:' value={item ? item!.destination : ""} onIonInput={e => setItem(prevItem => ({ ...prevItem!, destination: e.detail.value || '' }))} />
                <div className='date-input'>
                    <IonDatetime presentation='date' value={item && item.date ? item.date!.toISOString() : ""} onIonChange={e => setItem(prevItem => ({ ...prevItem!, date: e.detail.value ? new Date(e.detail.value as string) : new Date() }))} />
                </div>
                <IonInput className='custom-input' label='Distance:' value={item ? item!.distance : 0} onIonInput={e => setItem(prevItem => ({ ...prevItem!, distance: e.detail.value ? Number.parseInt(e.detail.value) : 0 }))} />
                <IonToggle className='custom-padding' checked={item ? item!.completed : false} onIonChange={e => setItem(prevItem => ({ ...prevItem!, completed: e.detail.checked }))}>Completed</IonToggle>
                <IonLoading isOpen={saving} />
                <IonLoading isOpen={deleting} />
                {savingError && (
                    <div>{savingError.message || 'Failed to save item'}</div>
                )}
                {deletingError && (
                    <div>{deletingError.message || 'Failed to delete item'}</div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default HikeEdit;