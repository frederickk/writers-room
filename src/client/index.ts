import {WritersRoom} from './ts/writers-room';
import './components/controller-button-debounce';
import './components/controller-button-toggle';
import './components/controller-input-text';
import './components/controller-summary-block';
import './components/controller-toggle-switch';

try {
  new WritersRoom([
    'Janet',
    'Marge',
    'Rita',
  ]);
} catch(err) {}
