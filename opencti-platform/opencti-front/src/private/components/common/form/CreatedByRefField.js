import React, { Component } from 'react';
import {
  compose, pathOr, pipe, map, union,
} from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import { fetchQuery } from '../../../../relay/environment';
import Autocomplete from '../../../../components/Autocomplete';
import inject18n from '../../../../components/i18n';
import IdentityCreation, {
  identityCreationIdentitiesSearchQuery,
} from '../identities/IdentityCreation';
import ItemIcon from '../../../../components/ItemIcon';

const styles = (theme) => ({
  icon: {
    paddingTop: 4,
    display: 'inline-block',
    color: theme.palette.primary.main,
  },
  text: {
    display: 'inline-block',
    flexGrow: 1,
    marginLeft: 10,
  },
  autoCompleteIndicator: {
    display: 'none',
  },
});

class CreatedByRefField extends Component {
  constructor(props) {
    super(props);
    this.state = { identityCreation: false, identityInput: '', identities: [] };
  }

  handleOpenIdentityCreation() {
    this.setState({ identityCreation: true });
  }

  handleCloseIdentityCreation() {
    this.setState({ identityCreation: false });
  }

  searchIdentities(event) {
    this.setState({
      identityInput: event && event.target.value !== 0 ? event.target.value : '',
    });
    fetchQuery(identityCreationIdentitiesSearchQuery, {
      search: event && event.target.value !== 0 ? event.target.value : '',
      first: 10,
    }).then((data) => {
      const identities = pipe(
        pathOr([], ['identities', 'edges']),
        map((n) => ({
          label: n.node.name,
          value: n.node.id,
          type: n.node.entity_type,
        })),
      )(data);
      this.setState({ identities: union(this.state.identities, identities) });
    });
  }

  render() {
    const {
      t, name, style, classes, setFieldValue, onChange, helpertext
    } = this.props;
    return (
      <div>
        <Autocomplete
          style={style}
          name={name}
          textfieldprops={{ label: t('Author'), helperText: helpertext }}
          noOptionsText={t('No available options')}
          options={this.state.identities}
          onInputChange={this.searchIdentities.bind(this)}
          openCreate={this.handleOpenIdentityCreation.bind(this)}
          onChange={typeof onChange === 'function' ? onChange.bind(this) : null}
          renderOption={(option) => (
            <React.Fragment>
              <div className={classes.icon}>
                <ItemIcon type={option.type} />
              </div>
              <div className={classes.text}>{option.label}</div>
            </React.Fragment>
          )}
          classes={{ clearIndicator: classes.autoCompleteIndicator }}
        />
        <IdentityCreation
          contextual={true}
          inputValue={this.state.identityInput}
          open={this.state.identityCreation}
          handleClose={this.handleCloseIdentityCreation.bind(this)}
          creationCallback={(data) => {
            setFieldValue(name, {
              label: data.identityAdd.name,
              value: data.identityAdd.id,
            });
          }}
        />
      </div>
    );
  }
}

export default compose(inject18n, withStyles(styles))(CreatedByRefField);
