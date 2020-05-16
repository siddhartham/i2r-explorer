import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import {
  saveSettings
} from '../actions/general';
import SettingsPage from '../components/Settings';

const mapStateToProps = (state: any) => {
  return { ...state.general };
};

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(
    {
      saveSettings
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPage);
