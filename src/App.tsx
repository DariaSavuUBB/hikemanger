import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './components/HikesLists/HikesList';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import HikesList from './components/HikesLists/HikesList';
import { ItemProvider } from './components/HikeProvider';
import HikeEdit from './components/HikeEdit/HikeEdit';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <ItemProvider>
          <Route exact path="/" render={() => <Redirect to="/hikes" />}></Route>
          <Route path="/hikes" component={HikesList}></Route>
          <Route path="/hike" component={HikeEdit} exact={true}/>
          <Route path="/hike/:id" component={HikeEdit} exact={true}/>
        </ItemProvider>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
